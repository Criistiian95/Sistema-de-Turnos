const db = require("../database/models");

const Role = db.Role;
const User = db.User;


const checkUserRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      // Verificar si el usuario tiene un rol asignado
      if (req.User && req.User.roles_id) {
        const userRole = await Role.findOne({
          where: { id: req.user.roles_id },
        });

        // Verificar si el rol del usuario coincide con el rol requerido
        if (userRole && userRole.name === requiredRole) {
          // El usuario tiene el rol adecuado, permitir el acceso
          next();
        } else {
          // El usuario no tiene el rol adecuado, denegar el acceso
          res.status(403).send("Acceso denegado. Permiso insuficiente.");
        }
      } else {
        // El usuario no tiene un rol asignado, denegar el acceso
        res.status(403).send("Acceso denegado. Permiso insuficiente.");
      }
    } catch (error) {
      // Ocurrió un error al verificar el rol
      res.status(500).send("Error al verificar el rol del usuario.");
    }
  };
}


module.exports = checkUserRole;