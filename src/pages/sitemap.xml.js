export async function get() {
  // URL base do site
  const siteUrl = 'https://copycash.netlify.app';
  
  // Data atual para lastmod
  const today = new Date().toISOString().split('T')[0];
  
  // Lista de páginas do site
  const pages = [
    {
      url: '/',
      lastmod: today,
      changefreq: 'daily',
      priority: '1.0'
    },
    // Adicione outras páginas conforme necessário
  ];
  
  // Gerar o XML do sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
  `).join('')}
</urlset>`;
  
  // Retornar o sitemap como XML
  return {
    body: sitemap,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  };
} 