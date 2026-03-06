const Password = require('../src/utils/Password');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await Password.hash('admin123'); // Put your real password here
    await queryInterface.bulkInsert('Admins', [{
      username: 'admin',
      password: hashedPassword,
      name: 'Ibu Ani',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('Admins', null, {});
  }
};