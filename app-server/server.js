const path = require("path");
const express = require("express");
const app = express();
const { createProxyMiddleware } = require("http-proxy-middleware");
const authServer = "http://localhost:3000";

const onProxyReq = (proxyReq, req, res) => {
  proxyReq.setHeader("X-Original-URI", req.url);
  proxyReq.setHeader("X-Original-Host", req.headers.host);
};

app.all("*", (req, res, next) => {
  let origin = req.get("origin");
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.static(path.join(__dirname, "build")));

app.get("^/(|about)$", (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "build") });
});

app.get(
  "^/(|secret)$",
  createProxyMiddleware({
    target: authServer + "/auth",
    ignorePath: true,
    onProxyReq,
  })
);

app.use(
  "*",
  createProxyMiddleware({
    target: authServer,
    onProxyReq,
  })
);

app.listen(5000, () => {
  console.log("Server is listening on port 5000");
});
