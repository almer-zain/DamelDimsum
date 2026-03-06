module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      categoryId: {
        type: Sequelize.INTEGER,
        references: { model: 'Categories', key: 'id' }, // Relationship!
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, unique: true }, // For SEO/Live Preview URLs
      description: { type: Sequelize.TEXT },
      price: { type: Sequelize.INTEGER, defaultValue: 0 },
      resellerPrice: { type: Sequelize.INTEGER, defaultValue: 0 },
      images: { type: Sequelize.TEXT }, // We will store JSON.stringify(['url1', 'url2'])
      status: { 
        type: Sequelize.ENUM('active', 'inactive'), 
        defaultValue: 'active' 
      },
      // INVISIBLE METADATA
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
      deletedAt: { type: Sequelize.DATE } // For Soft Deletes
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Products');
  }
};