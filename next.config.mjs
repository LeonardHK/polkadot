/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Sanity Studio 호환: styled-components SSR 지원
  compiler: {
    styledComponents: true,
  },
}

export default nextConfig
