const app = require("express").Router();
const controller = require("../../controllers/auth.controller");

app.post("/register", controller.signUp);
app.post("/login", controller.signIn);

module.exports = app;
