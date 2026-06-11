/** @type {import('next').NextConfig} */
const nextConfig = {
  // OffscreenCanvas transfer is one-way; StrictMode's dev double-invoke of effects
  // would attempt to transfer the canvas twice and throw. Disable it.
  reactStrictMode: false,
  // Allow LAN access in dev (e.g. testing on a phone) without the cross-origin warning.
  allowedDevOrigins: ["192.168.1.44"],

  // COOP/COEP headers are NOT active here — they will be added in Phase 3
  // (OffscreenCanvas Worker) when SharedArrayBuffer is actually needed.
  // They were removed because COEP: require-corp on static assets caused
  // createImageBitmap() to fail silently in cross-origin isolated context,
  // preventing frame loads. Add back when implementing the Worker path.
};

export default nextConfig;
