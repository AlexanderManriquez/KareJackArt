const UserService = require('../../services/user.service');
const jwt = require('jsonwebtoken');

class UserController {
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;
      
      const user = await UserService.createUser({ name, email, password });

      res.status(201).json({
        message: 'Usuario registrado correctamente',
        user,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await UserService.findByEmail(email);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado'});

      const isValid = await user.verifyPassword(password);
      if (!isValid) return res.status(401).json({ error: 'Credenciales inválidas' });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({
        message: 'Inicio de sesión exitoso',
        token,
        user
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await UserService.getUserById(req.user.id);
      res.json({ user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  static async updateProfile(req, res) {
    try {
      const updates = Object.assign({}, req.body || {});
      // Respect avatar choice: if user asked to use Gravatar, clear avatarUrl
      if (updates.avatarChoice === 'gravatar') {
        updates.avatarUrl = null;
      }

      // If a file was uploaded, validate type then upload to Cloudinary and set avatarUrl
      if (req.file && req.file.buffer) {
        const allowed = ['image/webp', 'image/jpeg', 'image/png'];
        if (!allowed.includes(req.file.mimetype)) {
          return res.status(400).json({ error: 'Formato de imagen no permitido. Usa webp, jpg o png.' });
        }
        const { uploadBuffer } = require('../../config/cloudinary');
        try {
          const uploadRes = await uploadBuffer(req.file.buffer, 'avatars', { folder: 'karejackart/avatars', transformation: [{ width: 400, height: 400, crop: 'limit' }] });
          if (uploadRes && uploadRes.secure_url) {
            updates.avatarUrl = uploadRes.secure_url;
          }
        } catch (uErr) {
          console.error('Avatar upload failed', uErr);
        }
      }

      const updated = await UserService.updateUser(req.user.id, updates);
      res.json({
        message: 'Perfil actualizado correctamente',
        updated
      });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await UserService.getAll();
      res.json({ users });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await UserService.deleteUser(id);
      res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
  }
}

module.exports = UserController;