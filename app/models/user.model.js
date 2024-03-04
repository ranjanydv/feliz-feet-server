module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "user",
    {
      first_name:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      last_name:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "Username already exist",
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        comment: "0 - INACTIVE, 1 - ACTIVE",
      },
      role: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        comment: "0 - USER, 1 - SELLER, 2 - ADMIN",
      },
      phone: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {}
  );

  User.associate = function (models) {
    // User.belongsTo(models.role, {
    //   foreignKey: "role_id",
    //   as: "role",
    // });
    // User.hasOne(models.profile, {
    //   foreignKey: "user_id",
    //   as: "profile",
    // });
  };

  User.findById = (id) =>
    User.findOne({
      where: { id },
    });

  User.deleteById = (id) =>
    User.destroy({
      where: { id },
    });

  return User;
};
