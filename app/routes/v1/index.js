const app = require("express").Router();
const bcrypt = require("bcryptjs");

// database
const db = require("../../models");

db.sequelize.sync({force:true}).then(() => {});
// db.sequelize.sync({alter:true}).then(() => {});
// db.sequelize.sync({}).then(() => {});


app.get("/", (req, res) => {
  res.json({
    message: "Welcome to api service V1.",
  });
});


// auth routes
app.use("/auth", require("./auth.routes"));

// user routes
app.use("/users", require("./user.routes"));

// product routes
app.use("/products", require("./product.routes"));


module.exports = app;