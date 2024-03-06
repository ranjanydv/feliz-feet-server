module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define(
    'cart',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {}
  );

  Cart.associate = function (models) {
    Cart.belongsTo(models.user, {
      foreignKey: "user_id",
      as: "user",
    });
    Cart.belongsTo(models.product, {
      foreignKey: "product_id",
      as: "product",
    });

    // Cart.hasMany(models.product, {
    //   foreignKey: {
    //     name: "product_id",
    //     allowNull: false,
    //   },
    //   onDelete: "RESTRICT",
    //   as: "products",
    // });
  };

  Cart.findById = (id) =>
    Cart.findOne({
      where: { id },
    });

  Cart.deleteById = (id) =>
    Cart.destroy({
      where: { id },
    });

  return Cart;
};
