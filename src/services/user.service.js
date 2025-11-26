const { User } = require('../models');

class UserService {
  static async createUser(data) {
    return User.create(data);
  }

  static async getUserById(id) {
    return User.findByPk(id);
  }

  static async getUserByEmail(email) {
    return await User.findOne({where: { email }});
  }

  static async updateUser(id, updates) {
    return await User.update(updates, {
      where: { id },
      returning: true,
    });
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