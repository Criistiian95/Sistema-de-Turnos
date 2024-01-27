const sequelize = require("sequelize")
const db = require("../../database/models")
const { validationResult } = require("express-validator")

const Patient= db.Patient
const Doctor= db.Doctor


const controller = {
  processCreate: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors)
      return res.render("createProduct", { errors: errors.mapped(), oldData: req.body });
    }
    const newObject = {
      tuition: req.body.tuition,
      name: req.body.name,
      lastname: req.body.lastname,
      specialties_id: req.body.specialty
    }
    try {
      await db.Doctor.create(newObject);
      res.status(201).json({ message: 'Paciente registrado con éxito' });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error al registrar el paciente' });
    }
  },
  processDoctor: async (req, res) => {
    try {
      const doctor = await db.Doctor.findOne({

        where: {
          tuition: req.body.matricula
        },
        include: [{ model: Specialty, as: 'specialty' }]

      });

      if (!doctor) {
        return res.status(400).send("Medico Inexistente");
      }

      const specialtyName = doctor.specialty ? doctor.specialty.name : null;

        return res.status(200).json({
          tuition: doctor.tuition,
          name: doctor.name,
          lastname: doctor.lastname,
          specialty: specialtyName
        });
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).send("Error during login");
    }
  },
  userDoctor: async (req, res) => {
    try {
      // Obtiene el ID del usuario desde los parámetros de la ruta (por ejemplo, '/profile/:userId')
      userTuition= req.query.tuition

      // Busca el usuario en la base de datos por su ID
      const doctor = await Doctor.findByPk(userTuition, {
        
        include: ['specialty']
      });
     
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor no encontrado' });
      } else {
       
        return res.status(200).json({ message: 'Doctor obtenido correctamente', doctor });
      }
    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
}

module.exports = controller;