const AuthService = require('../services/auth.service');
const UserService = require('../services/user.service');

class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password } =  req.body;

      const { user, verificationToken } = await AuthService.register({
        name,
        email,
        password,
      });

      // Queda pendiente el envío del correo de verificación (SMTP o Nodemailer)
      console.log(`Token de verificación para envío por email: ${verificationToken}`);

      res.status(201).json({
        message: 'Usuario registrado. Revisa tu correo electrónico para verificar tu cuenta.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const user = await AuthService.verifyEmail(token);

      return res.json({
        message: 'Email verificado correctamente',
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async login (req, res) {
    try {
      const { email, password } = req.body;

      const { user, token } = await AuthService.login(email, password);

      return res.json({
        message: 'Inicio de sesión exitoso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
  
  static async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      const resetToken = await AuthService.requestPasswordReset(email);

        // Queda pendiente el envío del correo de restablecimiento (SMTP o Nodemailer)
      console.log(`Token de restablecimiento para envío por email: ${resetToken}`);

      return res.json({
        message: 'Se ha enviado un correo con instrucciones para restablecer la contraseña.',
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      const user = await AuthService.resetPassword(token, newPassword);

      return res.json({
        message: 'Contraseña restablecida exitosamente',
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = AuthController;