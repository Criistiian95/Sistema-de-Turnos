const express = require("express");
const router = express.Router();
const shiftController= require("../controllers/shiftController");
const { isAdmin } = require("../../validators/admin");







router.post("/create",shiftController. processRegister)
router.get("/estado-turnos",shiftController.userShift)
router.put("/cambiar-estado/:id",shiftController.cambiarEstadoTurno)
router.delete("/eliminar-turno/:id",shiftController.eliminarTurno)
router.get(`/patient/:paciente_id`,shiftController.turnsPatient)



module.exports = router;