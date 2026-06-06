/** @type {import('next').NextConfig} */
const nextConfig = {
  // OffscreenCanvas transfer is one-way; StrictMode's dev double-invoke of effects
  // would attempt to transfer the canvas twice and throw. Disable it.
  reactStrictMode: false,
  // Allow LAN access in dev (e.g. testing on a phone) without the cross-origin warning.
  allowedDevOrigins: ["192.168.1.44"],
};

export default nextConfig;
