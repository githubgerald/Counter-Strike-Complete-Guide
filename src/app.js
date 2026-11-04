// Express app: security middleware, static files, API, routes, error handling.
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const config = require('./config');
const limits = require('./middleware/limits');
const { methods, permissions } = require('./middleware/security');
const indexRoute = require('./routes/index');

const app = express();

// --- Security (OWASP) ---
app.disable('x-powered-by');
app.set('trust proxy', config.trustProxy);
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'"],
        'img-src': ["'self'", 'data:'],
        'font-src': ["'self'"],
        'connect-src': ["'self'"],
        'frame-ancestors': ["'none'"],
        'form-action': ["'self'"],
        'base-uri': ["'self'"],
        'object-src': ["'none'"],
        'upgrade-insecure-requests': config.isProd ? [] : null,
      },
    },
    strictTransportSecurity: config.isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
  })
);
app.use(permissions);
app.use(limits.everything);
app.use(methods);
app.use(compression());

// --- Views and static files ---
app.set('view engine', 'ejs');
app.set('views', path.join(config.root, 'views'));
const hour = config.isProd ? '1h' : 0;
app.use('/fonts', express.static(path.join(config.root, 'node_modules/@fontsource-variable/inter/files'), { maxAge: config.isProd ? '30d' : 0, immutable: config.isProd, index: false, dotfiles: 'ignore' }));
app.use(express.static(path.join(config.root, 'public'), { maxAge: hour, index: false, dotfiles: 'ignore' }));

// --- Routes ---
app.use(require('./routes/seo'));
app.use('/api', require('./routes/api'));
app.use('/', indexRoute);

// --- Errors: never leak internals to the client ---
app.use((req, res) => res.status(404).type('text/plain').send('Not found'));
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).type('text/plain').send('Something went wrong');
});

module.exports = app;
