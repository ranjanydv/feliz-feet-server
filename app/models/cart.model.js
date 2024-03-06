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
      user_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        unique: true,
      },
    },
    {}
  );

  Cart.associate = function (models) {
    Cart.belongsTo(models.user, {
      foreignKey: "user_id",
      as: "user",
    });
    // Cart.belongsTo(models.product, {
    //   foreignKey: "product_id",
    //   as: "product",
    // });

    Cart.hasMany(models.cart_products, {
      foreignKey: {
        name: 'cart_id',
        allowNull: false,
      },
      onDelete: 'RESTRICT',
      as: 'cart_products',
    });
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
