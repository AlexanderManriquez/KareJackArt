const User = require('./user.model');
const Artwork = require('./artwork.model');
const Comment = require('./comment.model');

const applyAssociations = () => {
  User.hasMany(Artwork, {
    foreignKey: 'createdBy',
    onDelete: 'SET NULL',
  });

  Artwork.belongsTo(User, {
    foreignKey: 'createdBy',
  });

  Artwork.hasMany(Comment, {
    foreignKey: 'artworkId',
    onDelete: 'CASCADE',
  });

  Comment.belongsTo(Artwork, {
    foreignKey: 'artworkId',
  });
};

module.exports = applyAssociations;