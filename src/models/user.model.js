const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user',
  },
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
      if (user.password) {
        const hash = await bcrypt.hash(user.password, saltRounds);
        user.password = hash;
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const hash = await bcrypt.hash(user.password, saltRounds);
        user.password = hash;
      }
    },
  },    
});

User.prototype.verifyPassword = async function (plainText) {
  return bcrypt.compare(plainText, this.password);
}

module.exports = User;