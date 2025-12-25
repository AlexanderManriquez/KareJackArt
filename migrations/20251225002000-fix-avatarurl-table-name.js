'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const candidates = ['users', 'Users'];
    for (const table of candidates) {
      try {
        const desc = await queryInterface.describeTable(table);
        if (!desc || desc.avatarUrl) continue;
        await queryInterface.addColumn(table, 'avatarUrl', {
          type: Sequelize.STRING(500),
          allowNull: true,
        });
        // added to existing table — stop
        return;
      } catch (err) {
        // table doesn't exist — try next
        continue;
      }
    }
    // If no table found, attempt to add to 'users' as default (will fail and be logged by CLI)
    await queryInterface.addColumn('users', 'avatarUrl', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    const candidates = ['users', 'Users'];
    for (const table of candidates) {
      try {
        const desc = await queryInterface.describeTable(table);
        if (desc && desc.avatarUrl) {
          await queryInterface.removeColumn(table, 'avatarUrl');
          return;
        }
      } catch (err) {
        continue;
      }
    }
  }
};
