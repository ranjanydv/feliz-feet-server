const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
const basename = path.basename(module.filename);
const config = require("../config/db.config.js");

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  port: config.PORT,
  dialect: config.dialect,
  dialectOptions: {
    decimalNumbers: true,
  },
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
  hooks: {
    beforeDefine: function (columns, model) {
      model.tableName = model.name.plural;
    },
  },
  define: {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
});

const db = {};
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    // const model = sequelize.import(path.join(__dirname, file));
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });


db.sequelize = sequelize;
db.Sequelize = Sequelize;
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
