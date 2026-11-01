// Entry point: starts the HTTP server. All setup lives in src/app.js.
const app = require('./src/app');
const { port, host } = require('./src/config');

app.listen(port, host, () => console.log(`CS2 Movement Guide running at http://${host}:${port}`));
