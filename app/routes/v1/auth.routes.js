const app = require("express").Router();
const controller = require("../../controllers/auth.controller");

app.post("/register", controller.signUp);
app.post("/login", controller.signIn);
// app.post("/checkpwd", controller.checkPassword);
// app.post("/resetpwd", controller.resetPassword);
// app.post("/forgotpwd", controller.forgotPassword);
// app.post("/activateaccount", controller.activateAccount);
// app.post("/activateSetPwd", controller.activateSetPassword);
// app.post("/timezone", controller.browserTimezone);
// app.post("/weburl", controller.webUrl);
// app.post("/lockscreen", controller.createLockInUser);
// app.get("/islocked/:user_id", controller.checkIsUserLocked);

module.exports = app;
