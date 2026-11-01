// Central configuration. Change values here, not in the code that uses them.
const path = require('path');

const root = path.join(__dirname, '..');

module.exports = {
  root,
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '127.0.0.1',
  isProd: process.env.NODE_ENV === 'production',
  contentFile: path.join(root, 'content', 'guide.json'),
  rateLimit: { windowMs: 60 * 1000, max: 120 },
};
