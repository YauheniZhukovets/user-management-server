const Router = require('express')
const router = new Router()
const userRouter = require('./UserRoute')

router.use('/user', userRouter)

module.exports = router