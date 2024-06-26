module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'product',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
      },
      offer_price:{
        type: DataTypes.DECIMAL(10,2),
        allowNull: true,
      },
      state: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        comment: '0 - INACTIVE, 1 - ACTIVE',
      },

    },
    {}
  );

  Product.associate = function (models) {
    Product.belongsTo(models.user, {
      foreignKey: 'user_id',
      as: 'merchant',
    });
    Product.belongsTo(models.product_image, {
      foreignKey: 'image_id',
      as: 'image',
    });
    Product.hasMany(models.order_products, {
      foreignKey: {
        name: "product_id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
      as: "order_products",
    });
    Product.hasMany(models.cart_products, {
      foreignKey: {
        name: "product_id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
      as: "cart_products",
    });

  };

  Product.findById = (id) =>
    Product.findOne({
      where: { id },
    });

  Product.deleteById = (id) =>
    Product.destroy({
      where: { id },
    });

  return Product;
};
