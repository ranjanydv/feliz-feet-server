const app = require('express').Router();

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to api service."});
});

//routes
app.use('/v1', require("./v1"));

module.exports = app;