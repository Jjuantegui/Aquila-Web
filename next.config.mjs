/** @type {import('next').NextConfig} */
const nextConfig = {
  // Los PDF de /private/dossiers no están en /public: se leen con fs desde la
  // ruta /d/[dossier]/[recipient]. Esto obliga a Vercel a incluirlos en el bundle.
  outputFileTracingIncludes: {
    '/d/**': ['./private/dossiers/**'],
  },
  async redirects() {
    // English is the default locale and lives at the root: /en/* -> /*
    return [
      { source: '/en', destination: '/', permanent: true },
      { source: '/en/:path+', destination: '/:path+', permanent: true },
    ];
  },
  async rewrites() {
    // Internally serve root paths from the [lang]=en tree, leaving /es/* untouched.
    // /d/* (dossieres), /admin/* y /api/* viven fuera de [lang] y no se reescriben.
    return {
      beforeFiles: [
        { source: '/', destination: '/en' },
        {
          source: '/:path((?!en(?:/|$)|es(?:/|$)|d(?:/|$)|admin(?:/|$)|_next|assets|favicon\\.ico|sitemap\\.xml|robots\\.txt|api(?:/|$)).*)',
          destination: '/en/:path',
        },
      ],
    };
  },
};

export default nextConfig;
