const app = require('./app');
const db = require('../models'); // Loads Sequelize models

const PORT = process.env.PORT || 3000;

// Test Database Connection
db.sequelize.authenticate()
  .then(() => {
    console.log('✔ Database connection has been established successfully.');
    
    // Start Server
    app.listen(PORT, () => {
      console.log(`✔ Server is running on http://localhost:${PORT}`);
      console.log(`✔ API Version: v1`);
    });
  })
  .catch(err => {
    console.error('✘ Unable to connect to the database:', err);
    process.exit(1); // Stop the app if DB fails
  });