'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // add avatarUrl column to users table
    await queryInterface.addColumn('Users', 'avatarUrl', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'avatarUrl');
  }
};
