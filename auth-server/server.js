const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const checkAuth = require("./authentication.js");
const app = express();

app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

// Rate limiter used on auth attempts
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 requests per windowMs
  message: {
    status: "Fail",
    message: "Too many requests, please try again later",
  },
});

dotenv.config();

const port = process.env.AUTH_PORT || 3000;
const expiryDays = 1;
const cookieSecure =
  "AUTH_COOKIE_SECURE" in process.env
    ? process.env.AUTH_COOKIE_SECURE === "true"
    : true;

const tokenSecret = process.env.AUTH_TOKEN_SECRET;
if (!tokenSecret) {
  console.error("Environment variable AUTH_TOKEN_SECRET is not found");
  process.exit(1);
}

// Middleware to check auth status
const jwtVerify = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) return next();

  jwt.verify(token, tokenSecret, (err, decoded) => {
    if (err) {
      // e.g malformed token, bad signature etc - clear the cookie
      console.log(err);
      res.clearCookie("authToken");
      res.clearCookie("authUser");
      return res.status(403).send(err);
    }

    req.user = decoded.user || null;
    next();
  });
};

// Check for JWT cookie from requestor, if there is a valid JWT, req.user is assigned
app.use(jwtVerify);

app.get("/", (req, res) => {
  console.log("Entering /, redirecting to /login");
  res.redirect("/login");
});

// Expect JWT in cookie 'authToken'
app.get("/auth", (req, res, next) => {
  console.log("Entering /auth");

  if (req.user) {
    // User is already authenticated, refresh cookie
    const token = jwt.sign({ user: req.user }, tokenSecret, {
      expiresIn: `${expiryDays}d`,
    });

    // Set JWT as cookie
    res.cookie("authToken", token, {
      // httpOnly: true,
      maxAge: 1000 * 86400 * expiryDays,
      secure: cookieSecure,
    });

    // Parameters from original client request
    const requestUri = req.headers["x-original-uri"];
    const host = req.headers["x-original-host"];
    const referer = `${host}${requestUri}`;

    console.log("User is authenticated");
    return res.redirect(referer);
  } else {
    console.log("User is unauthenticated");
    return res.redirect("/login");
  }
});

app.get("/logged-in", (req, res) => {
  console.log("Entering /logged-in");

  if (!req.user) {
    console.log("User is unauthenticated, redirecting to /login");
    return res.redirect("/login");
  }

  return res.render("logged-in", { user: req.user || null });
});

app.get("/login", (req, res) => {
  console.log("Entering /login");

  // Parameters from original client request
  const requestUri = req.headers["x-original-uri"];
  const host = req.headers["x-original-host"];

  if (req.user) {
    console.log("User is already authenticated, redirecting to /logged-in");
    return res.redirect("/logged-in");
  }

  return res.render("login", {
    referer: requestUri ? `${host}${requestUri}` : "/",
  });
});

app.post("/login", apiLimiter, (req, res) => {
  console.log("Attempting to login");

  const { user, password } = req.body;

  if (checkAuth(user, password)) {
    const token = jwt.sign({ user }, tokenSecret, {
      expiresIn: `${expiryDays}d`,
    });

    // Set JWT as cookie, 7 day age
    res.cookie("authToken", token, {
      // httpOnly: true,
      maxAge: 1000 * 86400 * expiryDays,
      secure: cookieSecure,
    });

    res.cookie("authUser", user, {
      // httpOnly: true,
      maxAge: 1000 * 86400 * expiryDays,
      secure: cookieSecure,
    });

    console.log("Login successful");

    return res.send({ status: "ok" });
  }

  console.log("Login unsuccessful");
  res.sendStatus(401);
});

app.get("/logout", (req, res) => {
  console.log("Entering /logout");
  res.clearCookie("authToken");
  res.clearCookie("authUser");
  res.redirect("/login");
});

app.post("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.clearCookie("authUser");
  res.sendStatus(200);
});

// Default 404
app.use((req, res, next) => {
  res.status(404).send("404 -No such page");
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
