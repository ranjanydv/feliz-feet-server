module.exports = (sequelize, DataTypes) => {
  const OrderProducts = sequelize.define(
    'order_products',
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

  OrderProducts.associate = function (models) {
    OrderProducts.belongsTo(models.user, {
      foreignKey: 'user_id',
      as: 'user',
    });
    OrderProducts.belongsTo(models.product, {
      foreignKey: {
        name: 'product_id',
        allowNull: false
      },
      as: 'product',
    });

  };

  OrderProducts.findById = (id) =>
    OrderProducts.findOne({
      where: { id },
    });

  OrderProducts.deleteById = (id) =>
    OrderProducts.destroy({
      where: { id },
    });

  return OrderProducts;
};
