const app = require("express").Router();
const controller = require("../../controllers/user.controller");
const { authenticateUser } = require('../../middleware');

app.get("/", controller.userList);
app.get("/showme",authenticateUser, controller.showCurrentUser);
app.get("/:id", controller.getUser);
app.get("/me/:id",authenticateUser, controller.getUser);
app.patch("/:id",authenticateUser ,controller.upgradeToSeller)

module.exports = app;
