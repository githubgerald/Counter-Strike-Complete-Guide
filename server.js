// Entry point: starts the HTTP server with request timeouts and clean shutdown.
const http = require('http');
const app = require('./src/app');
const config = require('./src/config');
const sessions = require('./src/services/sessions');
const db = require('./src/db');

const server = http.createServer(app);
// Timeouts protect against slow-connection attacks that hold sockets open.
server.headersTimeout = 15 * 1000;
server.requestTimeout = 30 * 1000;
server.keepAliveTimeout = 5 * 1000;
server.maxHeadersCount = 60;
server.maxRequestsPerSocket = 200;

server.listen(config.port, config.host, () => console.log(`CS2 Movement Guide running at http://${config.host}:${config.port}`));

// Remove expired sessions every hour.
const cleanup = setInterval(() => { try { sessions.purgeExpired(); } catch (err) { console.error(err); } }, 60 * 60 * 1000);
cleanup.unref();

function shutdown() {
  clearInterval(cleanup);
  server.close(() => { db.close(); process.exit(0); });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
