const AuthService = require('../../services/auth.service');
const UserService = require('../../services/user.service');
const mailer = require('../../utils/mailer');

class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password } =  req.body;

      const { user, verificationToken } = await AuthService.register({ name, email, password });

      // Attempt to send verification email (uses Ethereal by default in dev)
      try {
        await mailer.sendVerificationEmail(user.email, verificationToken, user.name);
      } catch (mailErr) {
        console.error('Failed to send verification email:', mailErr);
      }

      // If AJAX/JSON client, return JSON. Otherwise render a confirmation page.
      const isAjax = req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest' || (req.get('Accept') && req.get('Accept').includes('application/json'));
      if (isAjax) {
        return res.status(201).json({
          message: 'Usuario registrado. Revisa tu correo electrónico para verificar tu cuenta.',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        });
      }

      return res.status(201).render('auth/verification-sent', { email: user.email });
    } catch (error) {
      // avoid leaking internal errors structure; return generic 400 with message
      return res.status(400).json({ error: error.message || 'Error en el registro' });
    }
  }

  static async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const user = await AuthService.verifyEmail(token);

      const isAjax = req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest' || (req.get('Accept') && req.get('Accept').includes('application/json'));
      if (isAjax) {
        return res.json({
          message: 'Email verificado correctamente',
          user: { id: user.id, email: user.email },
        });
      }

      return res.render('auth/verification-success', { user });
    } catch (error) {
      const isAjax = req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest' || (req.get('Accept') && req.get('Accept').includes('application/json'));
      if (isAjax) return res.status(400).json({ error: error.message });
      return res.status(400).render('auth/verification-failed', { error: error.message });
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
      const redirectUrl = (user.role === 'admin') ? '/admin/dashboard' : '/profile';

      // If request is AJAX/JSON, return JSON payload; otherwise perform server-side redirect
      const isAjax = req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest' || (req.get('Accept') && req.get('Accept').includes('application/json'));

      if (isAjax) {
        // Return minimal info; do NOT include the JWT in the JSON response to avoid client-side leakage.
        return res.json({
          message: 'Inicio de sesión exitoso',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          redirect: redirectUrl,
        });
      }

      // For non-AJAX render a small confirmation page that redirects
      return res.render('auth/login-success', { user: { name: user.name }, redirect: redirectUrl });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
  
  static async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      const resetToken = await AuthService.requestPasswordReset(email);

      // Log the token only in development; in production the token should be sent via email only
      try {
        if (resetToken) await mailer.sendResetEmail(email, resetToken);
      } catch (mailErr) {
        console.error('Failed to send reset email:', mailErr);
      }

      if (resetToken && process.env.NODE_ENV !== 'production') {
        console.info('RESET TOKEN (dev only):', resetToken);
      }

      const isAjax = req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest' || (req.get('Accept') && req.get('Accept').includes('application/json'));
      if (isAjax) return res.json({ message: 'Si existe una cuenta asociada, se han enviado instrucciones para restablecer la contraseña.' });
      return res.render('auth/reset-request-sent');
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      const user = await AuthService.resetPassword(token, newPassword);

      // Do not return user object; only return a success message
      return res.json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async logout(req, res) {
    try {
      // Clear cookie
      res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
      // If AJAX expect JSON, otherwise render a small logout confirmation and redirect
      const isAjax = req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest' || (req.get('Accept') && req.get('Accept').includes('application/json'));
      if (isAjax) return res.json({ message: 'Sesión cerrada' });
      return res.render('auth/logout-success');
    } catch (error) {
      return res.status(500).json({ error: 'No se pudo cerrar la sesión' });
    }
  }
}

module.exports = AuthController;