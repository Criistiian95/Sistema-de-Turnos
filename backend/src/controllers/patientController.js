const sequelize = require("sequelize")
const db = require("../../database/models")
const { validationResult } = require("express-validator")

const Patient= db.Patient


const controller = {
  processCreate: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors)
      return res.render("createProduct", { errors: errors.mapped(), oldData: req.body });
    }
    const newObject = {
      DNI: req.body.dni,
      name: req.body.name,
      lastname: req.body.lastname,
      phone: req.body.phone,
      street: req.body.street,
      location: req.body.location
    }
    try {
      await Patient.create(newObject);
      res.status(201).json({ message: 'Paciente registrado con éxito' });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error al registrar el paciente' });
    }
  },
processPatient: async (req, res) => {
    try {
      const patient = await db.Patient.findOne({

        where: {
          DNI: req.body.dni
        },
      });

      if (!patient) {
        return res.status(400).send("Paciente Incorrecto");
      }
        
      return res.status(200).json({
        DNI: patient.dni,
        name: patient.name,
        lastname: patient.lastname,
        phone: patient.phone,
        street: patient.street,
        location: patient.location
      });

    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).send("Error during login");
    }
  },
  userPatient: async (req, res) => {
    try {
      // Obtiene el ID del usuario desde los parámetros de la ruta (por ejemplo, '/profile/:userId')
      userDni= req.query.dni

      // Busca el usuario en la base de datos por su ID
      const patient = await Patient.findByPk(userDni);
     
      if (!patient) {
        return res.status(404).json({ message: 'Paciente no encontrado' });
      } else {
       
        return res.status(200).json({ message: 'Paciente obtenido correctamente', patient });
      }
    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
}

module.exports = controller;