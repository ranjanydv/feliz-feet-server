const app = require("express").Router();
const controller = require("../../controllers/user.controller");
const { authenticateUser } = require('../../middleware');

app.get("/",authenticateUser, controller.userList);
app.get("/showme",authenticateUser, controller.showCurrentUser);
app.get("/:id", controller.getUser);
app.get("/me/:id",authenticateUser, controller.getUser);
app.patch("/updateMe/:id",authenticateUser ,controller.updateUser)
app.patch("/changePassword/:id",authenticateUser ,controller.updateUserPassword)
app.patch("/seller/:id",authenticateUser ,controller.upgradeToSeller)
app.patch("/banUser/:id",authenticateUser ,controller.banUser)

module.exports = app;
