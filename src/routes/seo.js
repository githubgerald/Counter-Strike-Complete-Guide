// robots.txt, sitemap.xml and security.txt. They help search engines and security researchers.
const fs = require('fs');
const router = require('express').Router();
const config = require('../config');

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
});

router.get('/sitemap.xml', (req, res) => {
  let lastmod = new Date();
  try { lastmod = fs.statSync(config.contentFile).mtime; } catch (_) { /* use today */ }
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${config.siteUrl}/</loc>\n    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>\n  </url>\n</urlset>\n`
  );
});

// Only served when SECURITY_CONTACT is set (for example mailto:you@example.com).
router.get('/.well-known/security.txt', (req, res) => {
  if (!config.securityContact) return res.status(404).type('text/plain').send('Not found');
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  return res.type('text/plain').send(`Contact: ${config.securityContact}\nExpires: ${expires}\nPreferred-Languages: en\nCanonical: ${config.siteUrl}/.well-known/security.txt\n`);
});

module.exports = router;
