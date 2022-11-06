const path = require("path");
const express = require("express");
const app = express();
const proxy = require("express-http-proxy");
const { createProxyMiddleware } = require("http-proxy-middleware");
// const httpProxy = require("http-proxy");
// const authProxy = httpProxy.createProxyServer();
const authServer = "http://localhost:3000";

// authProxy.on("proxyReq", function (proxyReq, req, res) {
//   proxyReq.setHeader("X-Original-URI", req.url);
//   proxyReq.setHeader("X-Original-Host", req.headers.host);
// });

// authProxy.on("proxyRes", function (proxyRes, req, res) {
//   if (proxyRes.statusCode === 401) res.redirect("/login");
// });
const onProxyReq = (proxyReq, req, res) => {
  proxyReq.setHeader("X-Original-URI", req.url);
  proxyReq.setHeader("X-Original-Host", req.headers.host);
};

const proxyReqOptDecorator = function (proxyReqOpts, srcReq) {
  proxyReqOpts.headers["X-Original-URI"] = srcReq.url;
  proxyReqOpts.headers["X-Original-Host"] = srcReq.headers.host;
  return proxyReqOpts;
};

app.all("*", (req, res, next) => {
  let origin = req.get("origin");
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Proxy to Auth endpoint
app.get(
  "/auth",
  proxy(authServer, {
    proxyReqOptDecorator,
    userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
      if (proxyRes.statusCode === 401) {
        return userRes.redirect("/login");
      }

      return proxyResData;
    },
  })
);

app.get(
  "/login",
  proxy(`${authServer}`, {
    proxyReqOptDecorator,
  })
);

// app.post("/login", (req, res) => {
//   authProxy.web(req, res, { target: `${authServer}` });
// });

app.get("^/(|about|secret)$", (req, res) => {
  res.redirect("/auth");
});

// app.use(express.static(path.join(__dirname, "build")));

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

app.listen(5000, () => {
  console.log("Server is listening on port 5000");
});
