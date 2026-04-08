module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    orderId: { type: DataTypes.STRING, primaryKey: true }, // The DML-XXXX Key
    customerName: DataTypes.STRING,
    customerWhatsapp: DataTypes.STRING,
    customerAddress: DataTypes.TEXT,
    totalAmount: DataTypes.INTEGER,
    items: DataTypes.TEXT, // Store cart as JSON string
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'expired', 'failed'),
      defaultValue: 'pending'
    }
  });
  return Order;
};