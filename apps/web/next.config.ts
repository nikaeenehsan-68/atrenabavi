// apps/web/next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // سایر ریرایت‌ها…
      {
        source: '/api/student-enrollments/:path*',
        destination: 'http://localhost:3001/api/student-enrollments/:path*',
      },
      {
        source: '/api/classes/:path*',
        destination: 'http://localhost:3001/api/classes/:path*',
      },
      {
        source: '/api/academic-years/:path*',
        destination: 'http://localhost:3001/api/academic-years/:path*',
      },
      {
        source: '/api/students/:path*',
        destination: 'http://localhost:3001/api/students/:path*',
      },
    ];
  },
};
export default nextConfig;
