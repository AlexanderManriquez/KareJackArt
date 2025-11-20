const User = require('./user.model');
const Artwork = require('./artwork.model');
const Comment = require('./comment.model');
const applyAssociations = require('./associations');

applyAssociations();

module.exports = {
  User,
  Artwork,
  Comment,
};