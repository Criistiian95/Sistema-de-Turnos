const express = require("express");
const router = express.Router();
const doctorController= require("../controllers/doctorController")






//router.get("/", mainController.home);


router.post("/doctor", doctorController.processDoctor)
router.get("/search",doctorController.userDoctor)
router.post("/createDoctor", doctorController.processCreate)


module.exports = router;