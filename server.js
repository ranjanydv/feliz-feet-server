const express = require("express");
// var helmet = require('helmet');
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const axios = require("axios");

const khaltiConfig = require("./app/config/khalti.config");

const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

app.use(morgan("dev"));
app.disable("x-powered-by");
app.enable("trust proxy");

app.options("*", cors());

//CORS Middleware
app.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization, x-access-token,"
  );
  // Handle preflight requests
  // if (req.method === 'OPTIONS') {
  //     res.sendStatus(200);
  // } else {
  //     next();
  // }
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Feliz Feet Hub API." });
});

// app.use(userAuthorization);
// app.use((req, res, next) => {
//     //TODO: get login User role ID
//     req.header(
//       "x-access-token,"
//     );
//     global.loginUser = getAccessPermissionByRole([1]);
//     next();
// });

// routes
//require("./app/routes/index");
app.use("/api", require("./app/routes/index"));

app.use("/api/v1/khalti/pay", async (req, res, next) => {
  const payload = req.body;
  const khaltiResponse = await axios.post(
    "https://a.khalti.com/api/v2/epayment/initiate/",
    payload,
    {
      headers: {
        Authorization: `Key ${khaltiConfig.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (khaltiResponse) {
    return res.json({ success: true, data: khaltiResponse?.data });
  }
  return res
    .status(400)
    .json({ success: false, message: "Error processing payment" });
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

//unhandled system error
// app.use((err, req, res, next) => {
//     console.log("Unhandled error caught at filter", err.stack);
//     res.status(500).send({
//         message: err.message || "Server Error",
//     });
// });
