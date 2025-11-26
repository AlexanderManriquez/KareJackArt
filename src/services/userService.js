const { User } = require('../models');

module.exports = {
  async createUser(data) {
    try {
      const user = await User.create(data);
      return user;
    } catch (error) {
      throw new Error('Error creating user:' + error.message);
    }
  },

  async getAllUsers() {
    try {
      return await User.findAll();
    } catch (error) {
      throw new Error('Error fetching users:' + error.message);
    }
  },

  async getUser
}