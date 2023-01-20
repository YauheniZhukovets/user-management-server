const ApiError = require('../error/ApiError')
const {User} = require("../models/models");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {Op} = require("sequelize")


const generateJwt = (id, email) => {
    return jwt.sign({id, email}, process.env.SECRET_KEY, {expiresIn: '24h'})
}

class UserController {
    async registration(req, res, next) {
        const {email, password, name} = req.body

        if (!email || !password) {
            return next(ApiError.badRequest('Некоректный email или password'))
        }
        const candidate = await User.findOne({where: {email}})

        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким email уже существует'))
        }

        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({email, name, password: hashPassword})
        const token = generateJwt(user.id, email)
        return res.json({token})
    }

    async login(req, res, next) {
        const {email, password, date} = req.body

        const user = await User.findOne({where: {email}})

        if (user) {
            user.set({lastVisit: date})
            await user.save()
        }

        if (user && user.isBanned) {
            return next(ApiError.badRequest('Пользователь забанен'))
        }

        if (!user) {
            return next(ApiError.badRequest('Пользователь не найден'))
        }

        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.badRequest('Указан неверный пороль'))
        }
        const token = generateJwt(user.id, email)
        return res.json({token})
    }

    async check(req, res) {
        const token = generateJwt(req.user.id, req.user.email)
        return res.json({token})
    }

    async logout(req, res) {
        const token = null
        return res.json({token})
    }

    async get(req, res) {
        const users = await User.findAll()
        return res.json({users})
    }

    async update(req, res, next) {
        const {id} = req.body

        if (id.length === 0) {
            return next(ApiError.badRequest('Пользователь не выбран'))
        }
        const users = await User.findAll({
            where: {
                id: {
                    [Op.or]: [id]
                }
            }
        })

        if (users) {
            users.map(async (u) => {
                let banned = u.dataValues.isBanned
                u.set({isBanned: !banned})
                return await u.save()
            })
        }

        return res.json('Готово!')
    }

    async delete(req, res, next) {
        const {id} = req.body

        if (id.length === 0) {
            return next(ApiError.badRequest({message: 'Пользователь не выбран'}))
        }

        const users = await User.findAll({
            where: {
                id: {
                    [Op.or]: [id]
                }
            }
        })

        if (users) {
            users.map(async (u) => {
                return await u.destroy()
            })
        }

        return res.json({message: 'Готово'})
    }
}

module.exports = new UserController()