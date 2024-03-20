module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "",
  DB: "feliz_feet",
  dialect: "mariadb",
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
