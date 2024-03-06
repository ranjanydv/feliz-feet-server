module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define(
    'product_image',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      file: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {}
  );

  ProductImage.associate = function (models) {
    // ProductImage.belongsTo(models.product, {
    //   foreignKey: 'product_id',
    //   as: 'product',
    // });
    ProductImage.hasOne(models.product, {
      foreignKey: "image_id",
      as: "image",
    });
  };

  ProductImage.findById = (id) =>
    ProductImage.findOne({
      where: { id },
    });

  ProductImage.deleteById = (id) =>
    ProductImage.destroy({
      where: { id },
    });

  return ProductImage;
};
