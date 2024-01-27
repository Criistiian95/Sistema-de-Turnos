const express = require("express");
const router = express.Router();
const mainController = require('../controllers/mainController')
const registerValidations= require("../../validators/registerValidators");
const loginValidations = require("../../validators/loginValidators");
const {authorization, notAuthorization}= require("../../services/authorization");
const authentication = require("../../services/authentication");
const {isAdmin, isClient}= require("../../validators/admin")




//router.get("/", mainController.home);

router.post("/Registro-usuario",registerValidations, mainController.processRegister);
router.post("/login",loginValidations, mainController.processLogin)
router.get(`/:userId`,mainController.userProfile)

router.post('/logout', mainController.logout);



module.exports = router;