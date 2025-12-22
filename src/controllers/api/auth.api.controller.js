const AuthService = require('../../services/auth.service');
const UserService = require('../../services/user.service');

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

      // Set HttpOnly cookie for server-side session (JWT)
      const cookieOptions = {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000, // 1 hour
      };
      res.cookie('token', token, cookieOptions);

      // Determine redirect target based on role
      const redirectUrl = (user.role === 'admin') ? '/admin/artworks' : '/profile';

      // If request is AJAX/JSON, return JSON payload; otherwise perform server-side redirect
      const isAjax = req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest' || (req.get('Accept') && req.get('Accept').includes('application/json'));

      if (isAjax) {
        return res.json({
          message: 'Inicio de sesión exitoso',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          redirect: redirectUrl,
        });
      }

      return res.redirect(redirectUrl);
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

  static async logout(req, res) {
    try {
      // Clear cookie
      res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
      // If AJAX expect JSON, otherwise redirect home
      const isAjax = req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest' || (req.get('Accept') && req.get('Accept').includes('application/json'));
      if (isAjax) return res.json({ message: 'Sesión cerrada' });
      return res.redirect('/');
    } catch (error) {
      return res.status(500).json({ error: 'No se pudo cerrar la sesión' });
    }
  }
}

module.exports = AuthController;