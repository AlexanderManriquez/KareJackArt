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
      const updated = await UserService.updateUser(req.user.id, req.body);
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