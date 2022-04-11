
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    console.log("app", app)
    app.use(
        createProxyMiddleware('/items/websocket', {
            target: 'http://localhost:4000',
            ws: true,
        })
    );
};
