'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    attachment: DataTypes.STRING,
    likes: DataTypes.INTEGER
  }, {});
  Message.associate = function(models) {
    // associations can be defined here
    models.Message.belongsTo(models.User, {
      foreignKey: {
        allowNull: false,
      }
    });
  };
  return Message;
};