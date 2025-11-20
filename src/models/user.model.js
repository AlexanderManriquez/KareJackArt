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
    validate: { notEmpty: true },
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
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    },
    beforeUpdate: async (user) => {
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, saltRounds);
    }
    },
  },    
});

User.prototype.verifyPassword = async function (plainText) {
  return bcrypt.compare(plainText, this.password);
}

module.exports = User;