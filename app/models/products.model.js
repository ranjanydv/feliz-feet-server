module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'product',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
        type: DataTypes.FLOAT,
        allowNull: false,
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
      foreignKey: "user_id",
      as: "merchant",
    });
    Product.belongsTo(models.product_image, {
      foreignKey: "image_id",
      as: "image",
    });
    // Product.hasMany(models.product_image, {
    //   foreignKey: {
    //     name: "product_id",
    //     allowNull: false,
    //   },
    //   onDelete: "RESTRICT",
    //   as: "images",
    // });
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
