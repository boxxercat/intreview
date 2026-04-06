/** @type {import('next').NextConfig} */
const backendOrigin =
  process.env.BACKEND_ORIGIN?.replace(/\/$/, "") ?? "http://localhost:8080"

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
