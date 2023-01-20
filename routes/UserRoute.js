const Router = require('express')
const router = new Router
const userController = require('../contollers/userController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleware, userController.check)
router.delete('/logout', userController.logout )

router.get('/', authMiddleware, userController.get)
router.post('/delete', userController.delete)
router.post('/update', userController.update)

module.exports = router