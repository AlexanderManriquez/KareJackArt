require('dotenv').config();
const readline = require('readline');
const { testConnection, sequelize } = require('../config/database');
const UserService = require('../services/user.service');

async function createAdminInteractive() {
  await testConnection();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (q) => new Promise((res) => rl.question(q, res));

  try {
    const name = (process.env.ADMIN_NAME) ? process.env.ADMIN_NAME : await question('Nombre del admin: ');
    const email = (process.env.ADMIN_EMAIL) ? process.env.ADMIN_EMAIL : await question('Email del admin: ');
    const password = (process.env.ADMIN_PASSWORD) ? process.env.ADMIN_PASSWORD : await question('Password del admin: ');

    rl.close();

    // Ensure models are synced (will alter tables to match models; safe for development)
    // Prefer using explicit migrations in production. Here usamos `alter: true` para crear
    // columnas faltantes como `isVerified` si aún no existen.
    await sequelize.sync({ alter: true });

    const existing = await UserService.findByEmail(email);
    if (existing) {
      console.log('Ya existe un usuario con ese email. Actualizando a admin...');
      const updated = await UserService.updateUser(existing.id, { role: 'admin', isVerified: true });
      console.log('Usuario actualizado a admin:', { id: updated.id, email: updated.email, role: updated.role });
      process.exit(0);
    }

    const user = await UserService.createUser({
      name,
      email,
      password,
      role: 'admin',
      isVerified: true,
    });

    console.log('Admin creado correctamente: ', { id: user.id, email: user.email });
    process.exit(0);
  } catch (err) {
    console.error('Error creando admin:', err.message || err);
    process.exit(1);
  }
}

if (require.main === module) createAdminInteractive();
