const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://host.docker.internal:8000',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
      // onProxyReq: function(proxyReq, req, res) {
      //   // Optional: You can customize the proxy request headers here if needed
      //   // For example, to add authentication headers:
      //   // proxyReq.setHeader('Authorization', 'Bearer your-access-token');
      // },
    })
  );
};
