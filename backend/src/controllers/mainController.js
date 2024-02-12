const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")
const sequelize = require("sequelize")
const db= require("../../database/models")
const session = require("express-session");


const User = db.User
const Rol = db.Role
const Patient = db.Patients



const controller = {
  processRegister: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.render("login", { errors: errors.mapped(), oldData: req.body }
      )
    }
    const newUser = {
      name: req.body.nombre,
      lastname: req.body.apellido,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      role_id: req.body.role
    };
    console.log(newUser)
    try {
      console.log(newUser);
      await db.User.create(newUser);
      console.log(newUser);
      res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
    }
  },

  processLogin: async (req, res) => {
    try {
      const user = await db.User.findOne({

        where: {
          email: req.body.email
        },
        include: [{ model: Rol, as: 'role' }]

      });

      if (!user) {
        return res.status(400).send("Usuario Incorrecto", { errors: { unauthorize: { msg: 'Usuario y/o contraseña invalidos' } } });
      }

      const passwordMatch = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordMatch) {

        return res.status(400).send("Contraseña Incorrecta", { errors: { unauthorize: { msg: 'Usuario y/o contraseña invalidos' } } });

      }

      const roleName = user.role ? user.role.name : null;

      const token = jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        lastname: user.lastname,
        role: roleName
      }, "SECRET", { expiresIn: 86400 });

      res.cookie('token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 });

      req.session.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        lastname: user.lastname,
        role: roleName
      };

      if (req.body.recordarme) {
        res.cookie('email', req.session.user.email, { maxAge: 1000 * 60 * 60 * 24 });
      }

      req.session.save((err) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Error guardado login");
        }
        console.log(token)
        return res.status(200).json({
          id: user.id,
          email: user.email,
          name: user.name,
          lastname: user.lastname,
          role: roleName,
          token: token
        });
      });
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).send("Error during login");
    }
  },
  userProfile: async (req, res) => {
    try {
      // Obtiene el ID del usuario desde los parámetros de la ruta (por ejemplo, '/profile/:userId')
      const userId = req.params.userId;

      // Busca el usuario en la base de datos por su ID
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }, // Excluye la contraseña en la respuesta
        include: ['role']
      });
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      } else {
        return res.status(200).json({ message: 'Perfil de usuario obtenido correctamente', user });
      }
    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },


  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error al cerrar la sesión:', err);
        res.status(500).json({ message: 'Error al cerrar la sesión' });
      } else {
        // Limpia la cookie del token al establecerla con un tiempo de expiración pasado
        res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  
        res.status(200).json({ message: 'Cierre de sesión exitoso' });
      }
    })
  }
}





module.exports = controller;
