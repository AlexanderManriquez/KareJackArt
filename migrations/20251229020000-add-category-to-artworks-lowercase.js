"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ensure the lowercase 'artworks' table gets the category column used by the model
    const table = await queryInterface.describeTable('artworks');
    if (!table || !table.category) {
      await queryInterface.addColumn('artworks', 'category', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Sin categoría',
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('artworks');
    if (table && table.category) {
      await queryInterface.removeColumn('artworks', 'category');
    }
  },
};
