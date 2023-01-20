const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING},
    email: {type: DataTypes.STRING, unique: true, require: true},
    password: {type: DataTypes.STRING, require: true},
    isBanned: {type: DataTypes.BOOLEAN, defaultValue: false},
    lastVisit:{type: DataTypes.DATE}
})

module.exports = {
    User
}