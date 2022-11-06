const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
const { createProxyMiddleware } = require("http-proxy-middleware");
const authServer = "http://localhost:3000";
const cookieParser = require("cookie-parser");

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
app.use(cookieParser());
app.get(
  "^/(|about|secret)$",
  createProxyMiddleware({
    target: authServer + "/auth",
    ignorePath: true,
    onProxyReq,
    onProxyRes: (proxyRes, req, res) => {
      if (proxyRes.statusCode === 401) res.redirect("/login");
      else {
        res.redirect(req.headers.host + req.url);
      }
    },
  })

  //   res.redirect("/auth");
  //   console.log(req.cookies);
  //   axios
  //     .get(`${authServer}/auth`, { withCredentials: true })
  //     .then((data) => console.log(data.statusCode))
  //     .catch((err) => res.redirect("/login"));
);

app.use(
  "/auth",
  createProxyMiddleware({
    target: authServer,
    onProxyReq,
    onProxyRes: (proxyRes, req, res) => {
      if (proxyRes.statusCode === 401) res.redirect("/login");
      else {
        res.redirect("/" + req.url);
      }
    },
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
