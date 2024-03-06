module.exports = (sequelize, DataTypes) => {
  const CartProducts = sequelize.define(
    'cart_products',
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
      },
      cart_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      product_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      product_quantity: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      product_rate: {
        allowNull: false,
        type: DataTypes.DECIMAL(10, 2),
      },
      product_amount: {
        allowNull: false,
        type: DataTypes.DECIMAL(10, 2),
      },
    },
    {}
  );

  CartProducts.associate = function (models) {
    CartProducts.belongsTo(models.user, {
      foreignKey: 'user_id',
      as: 'user',
    });
    CartProducts.belongsTo(models.cart, {
      foreignKey: 'cart_id',
      as: 'cart_products',
    });
    CartProducts.belongsTo(models.product, {
      foreignKey: {
        name: 'product_id',
        allowNull: false
      },
      as: 'product',
    });

  };

  CartProducts.findById = (id) =>
    CartProducts.findOne({
      where: { id },
    });

  CartProducts.deleteById = (id) =>
    CartProducts.destroy({
      where: { id },
    });

  return CartProducts;
};
