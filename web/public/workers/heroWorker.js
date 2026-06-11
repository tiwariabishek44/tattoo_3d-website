// heroWorker.js — OffscreenCanvas + WebGL renderer for hero-v2.
// Runs entirely on its own thread. Owns the asset pipeline (fetch + decode +
// GPU upload) and the render loop. Main thread only sends frame index.
//
// Message protocol:
//   Main → Worker:  { type: 'init',    data: { canvas, config } }
//                   { type: 'frame',   data: { index: float }   }
//                   { type: 'resize',  data: { width, height }  }
//                   { type: 'destroy'                           }
//   Worker → Main:  { type: 'initOk'                           }
//                   { type: 'progress', data: { loaded: int }   }
//                   { type: 'ready'                             }
//                   { type: 'error',    data: { msg: string }   }

'use strict';

// ── rAF polyfill (DedicatedWorkerGlobalScope has rAF when canvas is transferred)

var RAF = typeof requestAnimationFrame !== 'undefined'
  ? requestAnimationFrame.bind(self)
  : function(cb) { return setTimeout(function() { cb(performance.now()); }, 16); };
var CAF = typeof cancelAnimationFrame !== 'undefined'
  ? cancelAnimationFrame.bind(self)
  : clearTimeout;

// ── State ──────────────────────────────────────────────────────────────────────

var gl           = null;
var program      = null;
var texPool      = new Map();   // frameIndex(int) → WebGLTexture
var inflight     = new Set();   // frameIndex(int) in-flight
var frameIndex   = 0;           // current target, fractional, from physics
var frameCount   = 240;
var frameBase    = '/frames';
var preloadAhead = 20;
var interpolation = false;
var readyAhead   = 12;
var rafId        = 0;
var canvasW      = 0;
var canvasH      = 0;
var readySent    = false;

// WebGL uniform locations
var uTexA, uTexB, uBlend, uResolution;
var placeholderTex = null;

// ── GLSL shaders ───────────────────────────────────────────────────────────────
// Vertex: fullscreen quad. UV (0,0)=top-left, (1,1)=bottom-right — matches CSS.
// Fragment: sub-frame blend → contrast/saturation grade → corner mask → vignette.

var VERT_SRC = [
  'attribute vec2 a_pos;',
  'varying vec2 v_uv;',
  'void main() {',
  '  v_uv = vec2(a_pos.x * 0.5 + 0.5, 1.0 - (a_pos.y * 0.5 + 0.5));',
  '  gl_Position = vec4(a_pos, 0.0, 1.0);',
  '}',
].join('\n');

var FRAG_SRC = [
  'precision mediump float;',
  'varying vec2 v_uv;',
  'uniform sampler2D u_texA;',
  'uniform sampler2D u_texB;',
  'uniform float u_blend;',
  'uniform vec2 u_resolution;',
  '',
  'vec3 grade(vec3 c) {',
  '  // Contrast 1.06',
  '  c = (c - 0.5) * 1.06 + 0.5;',
  '  // Saturation 1.04',
  '  float luma = dot(c, vec3(0.299, 0.587, 0.114));',
  '  c = mix(vec3(luma), c, 1.04);',
  '  return clamp(c, 0.0, 1.0);',
  '}',
  '',
  'void main() {',
  '  vec4 a = texture2D(u_texA, v_uv);',
  '  vec4 b = texture2D(u_texB, v_uv);',
  '  vec3 rgb = mix(a.rgb, b.rgb, u_blend);',
  '',
  '  // Color grade (replaces canvas.style.filter)',
  '  rgb = grade(rgb);',
  '',
  '  // 5% dark overlay (replaces the rgba(0,0,0,0.05) div)',
  '  rgb *= 0.95;',
  '',
  '  // Corner sparkle mask: ellipse at CSS 94% 85%, radii 6%×8%.',
  '  // Replicates: radial-gradient(ellipse 12% 16% at 94% 85%, black 0%, black 38%, transparent 100%)',
  '  vec2 cc = v_uv - vec2(0.94, 0.85);',
  '  cc = cc / vec2(0.06, 0.08);',
  '  float cd = length(cc);',
  '  float cmask = smoothstep(0.38, 1.0, cd);',
  '  rgb *= cmask;',
  '',
  '  // Edge vignette (subtle)',
  '  vec2 vn = v_uv * 2.0 - 1.0;',
  '  float vign = 1.0 - 0.25 * dot(vn, vn);',
  '  rgb *= clamp(vign, 0.0, 1.0);',
  '',
  '  gl_FragColor = vec4(rgb, 1.0);',
  '}',
].join('\n');

// ── WebGL setup ────────────────────────────────────────────────────────────────

function compileShader(type, src) {
  var s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    var log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error('[heroWorker] Shader compile: ' + log);
  }
  return s;
}

function initWebGL(canvas) {
  gl = canvas.getContext('webgl', {
    alpha: false, antialias: false, depth: false, stencil: false,
    preserveDrawingBuffer: false,
  });
  if (!gl) throw new Error('[heroWorker] WebGL not available');

  var vs = compileShader(gl.VERTEX_SHADER,   VERT_SRC);
  var fs = compileShader(gl.FRAGMENT_SHADER, FRAG_SRC);
  program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('[heroWorker] Shader link: ' + gl.getProgramInfoLog(program));
  }
  gl.useProgram(program);

  // Fullscreen quad (two triangles)
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,   1, -1,  -1,  1,
    -1,  1,   1, -1,   1,  1,
  ]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  // Uniforms
  uTexA       = gl.getUniformLocation(program, 'u_texA');
  uTexB       = gl.getUniformLocation(program, 'u_texB');
  uBlend      = gl.getUniformLocation(program, 'u_blend');
  uResolution = gl.getUniformLocation(program, 'u_resolution');
  gl.uniform1i(uTexA, 0);
  gl.uniform1i(uTexB, 1);
  gl.uniform1f(uBlend, 0.0);

  // 1×1 black placeholder (used while frames are loading)
  placeholderTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, placeholderTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}

// ── Asset pipeline ─────────────────────────────────────────────────────────────
// The Worker fetches, decodes, and uploads frames to GPU VRAM.
// No main-thread involvement in the asset path after init.

function framePath(i) {
  return frameBase + '/frame_' + String(i + 1).padStart(6, '0') + '.webp';
}

function uploadBitmap(bitmap) {
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  bitmap.close(); // release CPU-side memory; GPU now owns it
  return tex;
}

function loadFrame(i) {
  if (texPool.has(i) || inflight.has(i)) return;
  inflight.add(i);
  fetch(framePath(i))
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.blob();
    })
    .then(function(blob) { return createImageBitmap(blob); })
    .then(function(bitmap) {
      inflight.delete(i);
      if (!gl) { bitmap.close(); return; }
      var tex = uploadBitmap(bitmap);
      texPool.set(i, tex);
      self.postMessage({ type: 'progress', data: { loaded: texPool.size } });
      if (!readySent && texPool.size >= readyAhead) {
        readySent = true;
        self.postMessage({ type: 'ready' });
      }
    })
    .catch(function(err) {
      inflight.delete(i);
      console.warn('[heroWorker] frame ' + i + ' failed:', err);
    });
}

var lastCenter = -999;

function ensureWindow(center) {
  if (Math.abs(center - lastCenter) < 4) return;
  lastCenter = center;

  var half = preloadAhead;
  var lo = Math.max(0, center - half);
  var hi = Math.min(frameCount - 1, center + half);

  // Kick off loads in priority order: closest first
  for (var d = 0; d <= half; d++) {
    if (center + d <= hi)  loadFrame(center + d);
    if (center - d >= lo)  loadFrame(center - d);
  }

  // Evict frames outside the keep zone (window + 5 buffer)
  var keepLo = Math.max(0, lo - 5);
  var keepHi = Math.min(frameCount - 1, hi + 5);
  texPool.forEach(function(tex, idx) {
    if (idx < keepLo || idx > keepHi) {
      gl.deleteTexture(tex);
      texPool.delete(idx);
    }
  });
  inflight.forEach(function(idx) {
    if (idx < keepLo || idx > keepHi) inflight.delete(idx);
  });
}

// ── Render ─────────────────────────────────────────────────────────────────────

function nearestReady(idx) {
  if (texPool.has(idx)) return texPool.get(idx);
  for (var d = 1; d <= 10; d++) {
    if (texPool.has(idx - d)) return texPool.get(idx - d);
    if (texPool.has(idx + d)) return texPool.get(idx + d);
  }
  return placeholderTex;
}

function render() {
  if (!gl) return;

  var fi = frameIndex;
  var a  = Math.max(0, Math.min(frameCount - 1, Math.floor(fi)));
  var b  = Math.max(0, Math.min(frameCount - 1, a + 1));
  var blend = interpolation ? (fi - a) : 0.0;

  ensureWindow(Math.round(fi));

  var texA = nearestReady(a);
  var texB = blend > 0 ? nearestReady(b) : texA;

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texA);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texB);
  gl.uniform1f(uBlend, blend);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function tick() {
  render();
  rafId = RAF(tick);
}

// ── Message handler ────────────────────────────────────────────────────────────

self.onmessage = function(e) {
  var msg  = e.data;
  var type = msg.type;
  var data = msg.data;

  if (type === 'init') {
    var canvas = data.canvas;
    var cfg    = data.config;
    frameCount   = cfg.frameCount;
    frameBase    = cfg.frameBase;
    preloadAhead = cfg.preloadAhead;
    readyAhead   = cfg.readyAhead;
    interpolation = cfg.interpolation;
    canvasW      = canvas.width;
    canvasH      = canvas.height;

    try {
      initWebGL(canvas);
    } catch (err) {
      self.postMessage({ type: 'error', data: { msg: String(err) } });
      return;
    }

    gl.viewport(0, 0, canvasW, canvasH);
    gl.uniform2f(uResolution, canvasW, canvasH);

    // Start loading from frame 0
    ensureWindow(0);

    // Start render loop
    rafId = RAF(tick);
    self.postMessage({ type: 'initOk' });
  }

  else if (type === 'frame') {
    frameIndex = data.index;
  }

  else if (type === 'resize') {
    canvasW = data.width;
    canvasH = data.height;
    if (gl) {
      gl.viewport(0, 0, canvasW, canvasH);
      gl.uniform2f(uResolution, canvasW, canvasH);
    }
  }

  else if (type === 'destroy') {
    CAF(rafId);
    rafId = 0;
    texPool.forEach(function(tex) { if (gl) gl.deleteTexture(tex); });
    texPool.clear();
    inflight.clear();
    gl = null;
  }
};
