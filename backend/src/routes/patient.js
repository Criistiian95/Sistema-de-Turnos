const express = require("express");
const router = express.Router();
const patientController= require("../controllers/patientController")






//router.get("/", mainController.home);


router.post("/patient", patientController.processPatient)
router.get("/search",patientController.userPatient)
router.post("/createPatient", patientController.processCreate)


module.exports = router;