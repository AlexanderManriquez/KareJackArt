const { sequelize } = require('../src/config/database');

async function run() {
  const qi = sequelize.getQueryInterface();
  try {
    await sequelize.authenticate();
    console.log('Conectado a la base de datos. Comprobando tablas Artworks/artworks...');

    // Try both possible table names used in migrations/repos
    for (const tbl of ['Artworks', 'artworks']) {
      try {
        const table = await qi.describeTable(tbl);
        if (table && table.category) {
          console.log(`La columna "category" ya existe en ${tbl}.`);
          continue;
        }
        console.log(`Agregando columna "category" a ${tbl}...`);
        await qi.addColumn(tbl, 'category', {
          type: sequelize.Sequelize.STRING,
          allowNull: false,
          defaultValue: 'Sin categoría',
        });
        console.log(`Columna "category" agregada correctamente a ${tbl}.`);
      } catch (innerErr) {
        // describeTable throws if table doesn't exist; ignore and continue
        if (String(innerErr).includes('does not exist') || String(innerErr).toLowerCase().includes('no existe')) {
          console.log(`Tabla ${tbl} no existe, omitiendo.`);
          continue;
        }
        throw innerErr;
      }
    }
  } catch (err) {
    console.error('Error al aplicar la migración:', err);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
