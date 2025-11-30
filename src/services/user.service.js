const { User } = require('../models');

class UserService {
  static async createUser(data) {
    return User.create(data);
  }

  static async getUserById(id) {
    return User.findByPk(id);
  }

  static async findByEmail(email) {
    return await User.findOne({where: { email }});
  }

  // Alias to keep API consistent
  static async getUserByEmail(email) {
    return this.findByEmail(email);
  }

  static async getAll() {
    return await User.findAll({ order: [['createdAt', 'DESC']] });
  }

  static async updateUser(id, updates) {
    await User.update(updates, {
      where: { id },
    });
    return await User.findByPk(id);
  }
  
  static async deleteUser(id) {
    return await User.destroy({ where: { id } });
  }

  static async validatePassword(user, password) {
    return await user.verifyPassword(password);
  }

  static async authenticate(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValid = await user.verifyPassword(password);
    if (!isValid) return null;

    return user;
  }
}

module.exports = UserService;