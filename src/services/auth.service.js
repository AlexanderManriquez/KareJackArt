const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthService {
  static generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  }

  static async register({ name, email, password }) {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw new Error('El email ya está registrado');

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      isVerified: false,
    });

    return { user, verificationToken };
  }

  static async verifyEmail(token) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('Token inválido');

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    return user;
  }

  static async login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('Usuario no encontrado');

    const valid = await user.verifyPaddword(password);
    if (!valid) throw new Error('Credenciales inválidas');

    if (!user.isVerified) {
      throw new Error('Debes verificar tu email antes de iniciar sesión');
    }

    const token = this.generateToken({ id: user.id, role: user.role });

    return { user, token };
  }

  static async requestPasswordReset(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('Usuario no encontrado');

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; //1 Hora
    await user.save();

    return resetToken;
  }

  static async resetPassword (token, newPassword) {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
      }
    });

    if (!user) throw new Error('Token inválido');

    if (Date.now() > user.reserPasswordExpires) {
      throw new Error('Token de restablecimiento de contraseña expirado');
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return user;
  }
}

module.exports = AuthService;