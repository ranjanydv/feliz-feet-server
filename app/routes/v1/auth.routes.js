const app = require("express").Router();
const controller = require("../../controllers/auth.controller");

app.post("/register", controller.signUp);
app.post("/login", controller.signIn);
app.post("/verify", controller.verifyToken);

module.exports = app;
