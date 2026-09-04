/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // English is the default locale and lives at the root: /en/* -> /*
    return [
      { source: '/en', destination: '/', permanent: true },
      { source: '/en/:path+', destination: '/:path+', permanent: true },
    ];
  },
  async rewrites() {
    // Internally serve root paths from the [lang]=en tree, leaving /es/* untouched.
    return {
      beforeFiles: [
        { source: '/', destination: '/en' },
        {
          source: '/:path((?!en(?:/|$)|es(?:/|$)|_next|assets|favicon\\.ico|sitemap\\.xml|robots\\.txt|api(?:/|$)).*)',
          destination: '/en/:path',
        },
      ],
    };
  },
};

export default nextConfig;
