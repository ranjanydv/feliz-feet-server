module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'order',
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
      total_amount: {
        allowNull: false,
        type: DataTypes.DECIMAL(10,2),
      },
      state: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        comment: '0 - PLACED, 1 - IN-PROGRESS, 2 - COMPLETED, 3 - CANCELLED',
      },
    },
    {}
  );

  Order.associate = function (models) {
    Order.belongsTo(models.user, {
      foreignKey: 'user_id',
      as: 'user',
    });
    // Order.belongsTo(models.product, {
    //   foreignKey: 'product_id',
    //   as: 'product',
    // });
    Order.hasMany(models.order_products, {
      foreignKey: {
        name: 'product_id',
        allowNull: false,
      },
      onDelete: 'RESTRICT',
      as: 'order_products',
    });
  };

  Order.findById = (id) =>
    Order.findOne({
      where: { id },
    });

  Order.deleteById = (id) =>
    Order.destroy({
      where: { id },
    });

  return Order;
};
