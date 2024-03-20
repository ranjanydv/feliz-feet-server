module.exports = {
  HOST: "dpg-cnt94un79t8c73acalj0-a",
  USER: "feliz_feet_4mxn_user",
  PASSWORD: "AbsnWVt5Iv73ZXWD8UZ5e1fDcyAf7AIl",
  DB: "feliz_feet_4mxn",
  dialect: "postgres",
  port:5432,
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
