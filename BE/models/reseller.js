'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reseller extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Reseller.init({
    nameOwner: DataTypes.STRING,
    nameShop: DataTypes.STRING,
    whatsapp: DataTypes.STRING,
    city: DataTypes.STRING,
    address: DataTypes.TEXT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Reseller',
  });
  return Reseller;
};