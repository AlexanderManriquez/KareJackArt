"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add a non-nullable category column with a default so existing rows get a value
    const table = await queryInterface.describeTable('Artworks');
    if (!table || !table.category) {
      await queryInterface.addColumn('Artworks', 'category', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Sin categoría',
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('Artworks');
    if (table && table.category) {
      await queryInterface.removeColumn('Artworks', 'category');
    }
  },
};
