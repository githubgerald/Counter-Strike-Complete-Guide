// Express app: security middleware, static files, routes, error handling.
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const indexRoute = require('./routes/index');

const app = express();

// --- Security (OWASP): hide stack, strict CSP, rate limit, read-only methods ---
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'script-src': ["'self'"],
        'style-src': ["'self'"],
        'img-src': ["'self'", 'data:'],
        'font-src': ["'self'"],
        'upgrade-insecure-requests': config.isProd ? [] : null,
      },
    },
  })
);
app.use(rateLimit({ ...config.rateLimit, standardHeaders: true, legacyHeaders: false }));
app.use((req, res, next) => (['GET', 'HEAD'].includes(req.method) ? next() : res.sendStatus(405)));

// --- Views and static files ---
app.set('view engine', 'ejs');
app.set('views', path.join(config.root, 'views'));
const staticOptions = { maxAge: config.isProd ? '7d' : 0, index: false };
app.use('/fonts', express.static(path.join(config.root, 'node_modules/@fontsource-variable/inter/files'), staticOptions));
app.use(express.static(path.join(config.root, 'public'), staticOptions));

// --- Routes ---
app.use('/', indexRoute);

// --- Errors: never leak internals to the client ---
app.use((req, res) => res.status(404).send('Not found'));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something went wrong');
});

module.exports = app;
