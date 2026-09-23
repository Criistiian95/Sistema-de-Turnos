const jwt = require("jsonwebtoken");
module.exports = function authentication(db, secret) {
  return async (req, res, next) => {
    const match = /^Bearer (.+)$/.exec(req.headers.authorization || "");
    if (!match)
      return res.status(401).json({ message: "Iniciá sesión para continuar." });
    try {
      const decoded = jwt.verify(match[1], secret, {
        algorithms: ["HS256"],
        issuer: "sismed",
        audience: "sismed-web",
      });
      const session = await db.Session.findByPk(decoded.jti);
      if (
        !session ||
        Number(session.user_id) !== Number(decoded.sub) ||
        new Date(session.expires_at) <= new Date()
      )
        return res.status(401).json({ message: "La sesión venció." });
      const user = await db.User.findByPk(decoded.sub, {
        attributes: { exclude: ["password"] },
        include: ["role"],
      });
      if (!user)
        return res
          .status(401)
          .json({ message: "La cuenta no está disponible." });
      req.user = user;
      req.sessionId = decoded.jti;
      next();
    } catch (error) {
      if (
        ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(
          error.name,
        )
      )
        return res
          .status(401)
          .json({ message: "La sesión venció. Volvé a ingresar." });
      next(error);
    }
  };
};
