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

    // generate a verification token but store only its SHA256 hash in DB
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

    const user = await User.create({
      name,
      email,
      password,
      verificationToken: verificationTokenHash,
      isVerified: false,
    });

    // Return only the user object; the raw token is intended for email delivery.
    return { user, verificationToken };
  }

  static async verifyEmail(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ where: { verificationToken: tokenHash } });
    if (!user) throw new Error('Token inválido o expirado');

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    return user;
  }

  static async login(email, password) {
    // Avoid user enumeration: respond with a generic error for missing user or bad password
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('Credenciales inválidas');

    const valid = await user.verifyPassword(password);
    if (!valid) throw new Error('Credenciales inválidas');

    if (!user.isVerified) {
      throw new Error('Debes verificar tu email antes de iniciar sesión');
    }

    const token = this.generateToken({ id: user.id, role: user.role });

    return { user, token };
  }

  static async requestPasswordReset(email) {
    const user = await User.findOne({ where: { email } });

    // Always respond the same to avoid disclosing whether an email exists.
    if (!user) return null;

    // Generate plaintext token to email, but store only its hash in DB
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    return resetToken;
  }

  static async resetPassword (token, newPassword) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ where: { resetPasswordToken: tokenHash } });

    if (!user) throw new Error('Token inválido o expirado');

    if (new Date() > user.resetPasswordExpires) {
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