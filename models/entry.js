'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Entry extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Entry.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    guid: DataTypes.STRING,
    title: DataTypes.STRING,
    creator: DataTypes.STRING,
    link: DataTypes.STRING,
    pubDate: DataTypes.STRING,
    description: DataTypes.STRING,
    image: DataTypes.STRING,
    content: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Entry',
  });
  return Entry;
};