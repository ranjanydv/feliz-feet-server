module.exports = {
  HOST: "localhost",
  USER: "Ranjan",
  PASSWORD: "Ranjan@123",
  DB: "feliz_feet",
  dialect: "mysql",
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
