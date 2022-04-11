
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        createProxyMiddleware('/items/websocket', {
            target: 'http://localhost:4000',
            ws: true,
        })
    );
};
