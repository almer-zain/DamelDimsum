'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Product.init({
    categoryId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    resellerPrice: DataTypes.INTEGER,
    images: DataTypes.TEXT,
    status: DataTypes.STRING
  }, // Inside the Product.init()
  {
    sequelize,
    modelName: 'Product',
    paranoid: true, // This enables SOFT DELETE (deletedAt)
    timestamps: true, // This enables createdAt and updatedAt
  },

  // Associations (Tell Sequelize that Product belongs to Category)
  Product.associate = (models) => {
    Product.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
  });
  return Product;
};
