const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")
const sequelize = require("sequelize")
const db = require("../../database/models")

const Shift= db.Shift
const Patient=db.Patient
const Doctor= db.Doctor


const controller = {
    processRegister: async (req, res) => {
      try {
        // Verificar que los campos requeridos no sean nulos
        const { paciente_id, doctor_id, fecha, hora, especialidad, estado_turno } = req.body;
        if (!paciente_id || !doctor_id || !fecha ||fecha=== estado_turno===true || !hora || !especialidad || estado_turno === null || estado_turno === undefined) {
          return res.status(400).json({ error: "Datos de turno incompletos o inválidos" });
        }

        const turnoExistente= await Shift.findOne({
          where:{
            fecha:fecha,
            hora: hora,
            estado_turno: true,
          }
        })
      if (turnoExistente){
        console.error({error:"Horario ya reservado"})
        return res.status(500).json({ error: "Este horario ya esta reservado"})
        
      }

      const newShift = {
        paciente_id,
        doctor_id,
        fecha,
        hora,
        especialidad,
        estado_turno,
        observaciones: req.body.observaciones
      };
      await Shift.create(newShift);
      res.status(201).json({ message: 'Turno registrado con éxito' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error al guardar el turno' });
    }
  },
  userShift: async(req, res) => {
    try {
      const horariosOcupados = await Shift.findAll({
        where: { estado_turno: true },
        attributes: ["id","fecha", "paciente_id", "doctor_id", "hora", "especialidad", "observaciones"],
        include: [
          "patient",
          "doctor",
          "specialty"
        ],
        raw: true,
      });
      res.json(horariosOcupados);
    } catch (error) {
      console.error("Error al obtener los horarios ocupados", error);
      res.status(500).json({ error: "Error al obtener los horarios ocupados" });
    }
  },
  eliminarTurno: async (req, res) => {
    try {
      const { id } = req.params;
      const turno = await Shift.findByPk(id);
  
      if (!turno) {
        return res.status(404).json({ error: "Turno no encontrado" });
      }
  
      // Eliminar físicamente el turno
      await turno.destroy();
  
      res.json({ message: 'Turno eliminado con éxito' });
    } catch (error) {
      console.error("Error al eliminar el turno", error);
      res.status(500).json({ error: "Error al eliminar el turno" });
    }
  },
  cambiarEstadoTurno: async (req, res) => {
    try {
      const { id } = req.params;
      const turno = await Shift.findByPk(id);
  
      if (!turno) {
        return res.status(404).json({ error: "Turno no encontrado" });
      }
  
      // Cambiar el estado del turno
      turno.estado_turno = !turno.estado_turno;
      await turno.save();
  
      res.json({ message: `Estado del turno cambiado con éxito` });
    } catch (error) {
      console.error("Error al cambiar el estado del turno", error);
      res.status(500).json({ error: "Error al cambiar el estado del turno" });
    }
  },
  turnsPatient: async(req,res) => {
      try {
        const { paciente_id } = req.params;
        console.log(paciente_id);
      
  
        // Verificar si se proporcionó el ID del paciente
        if (!paciente_id) {
          return res.status(400).json({ error: "Se requiere el ID del paciente" });
        }
  
        // Buscar los turnos del paciente
        const patientShifts = await Shift.findAll({
          where: {
            paciente_id,
            estado_turno: true,
          },
          attributes: ["id", "fecha", "paciente_id", "doctor_id", "hora", "especialidad", "observaciones"],
          include: [
            "patient",
            "doctor",
            "specialty"
          ],
          raw: true,
        });
        console.log(patientShifts)
        res.json(patientShifts);
        
      } catch (error) {
        console.error("Error al obtener los turnos del paciente", error);
        res.status(500).json({ error: "Error al obtener los turnos del paciente" });
      }
    }
  }


module.exports= controller