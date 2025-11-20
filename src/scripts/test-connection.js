async function run() {
  const { sequelize, testConnection } = require('../config/database');
  const models = require('../models');

  try {
    await testConnection();

    await sequelize.sync({ alter: true });
    console.log('Models loaded:', Object.keys(models).filter(k => k !== 'sequelize' && k !== 'Sequelize'));
    process.exit(0);
  } catch (error) {
    console.error('Error during test connection or model synchronization:', error);
    process.exit(1);
  }
}

if (require.main === module) run();