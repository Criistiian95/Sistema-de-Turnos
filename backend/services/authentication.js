const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  // Obtén el token del encabezado de autorización
  const token = req.headers.authorization;

  if (!token) {
    // Si no hay token, el usuario no está autenticado
    return res.status(401).json({ message: 'Acceso no autorizado' });
  }

  try {
    // Verifica el token
    const decoded = jwt.verify(token, 'SECRET'); // Reemplaza 'your-secret-key' con tu clave secreta

    // Agrega la información del usuario a la solicitud
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token no válido' });
  }
};

module.exports = authenticateUser 