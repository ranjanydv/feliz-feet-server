const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");

const createTokenUser = (user) => {
  const tokenUser = jwt.sign(
    {
      user_id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      state: user.state,
      role: user.role,
      phone: user.phone,
      street_address: user.street_address,
      city: user.city,
      province: user.province,
      zip_code: user.zip_code,
    },
    config.secret,
    { expiresIn: config.tokenTTL }
  );
  return tokenUser;
};
module.exports = createTokenUser;
