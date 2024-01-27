const {body} = require('express-validator');

const registerValidations = [
    body('nombre').notEmpty().isLength({ min: 2}).withMessage('Debe escribir un nombre'),
    body('apellido').notEmpty().isLength({ min: 2}).withMessage('Debe escribir un apellido'),
    body('password').notEmpty().isLength({ min: 8}).withMessage('Escriba una contraseña')
]

module.exports = registerValidations;