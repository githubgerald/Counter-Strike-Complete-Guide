// Security event log: one JSON line per event on stdout. Never log passwords, codes or tokens.
function securityEvent(type, req, extra = {}) {
  console.log(JSON.stringify({ time: new Date().toISOString(), event: type, ip: req.ip, ...extra }));
}
module.exports = { securityEvent };
