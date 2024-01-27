const db = require("../database/models")





const isAdmin = (req, res, next) => {

    console.log(req.session.user)
    try {
      const role = req.session.user ? req.session.user.role : null;
      console.log()
      if (role === 'Administrador') {
        console.log('Usuario autenticado como administrador');
        next();
      } else {
        console.log('Usuario no autorizado como administrador');
        res.sendStatus("Usuario no autorizado"); // Forbidden
      }
    } catch (error) {
      console.log('Error al verificar el rol del usuario:', error);
      res.sendStatus(500); // Internal Server Error
    }
  };
  
  const isClient = (req, res, next) => {
    try {
      const role = req.session.user ? req.session.user.role : null;
      if (role === 'Cliente') {
        console.log('Usuario autenticado como cliente');
        next();
      } else {
        console.log('Usuario no autorizado como cliente');
        res.sendStatus("Debe loguearse"); // Forbidden
      }
    } catch (error) {
      console.log('Error al verificar el rol del usuario:', error);
      res.sendStatus(500); // Internal Server Error
    }
  };
  
  module.exports = { isAdmin, isClient };