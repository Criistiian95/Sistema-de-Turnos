const express = require("express");
//const createRoles= require("./services/initialSetup")
const Sequelize= require("sequelize")
const expressSession= require("express-session")
const path = require("path");
const methodOverride =  require('method-override');
const cookieParser = require("cookie-parser");
const morgan = require("morgan")
const bodyParser = require('body-parser');
const mainRoutes= require("../backend/src/routes/main")
const patientRoutes= require("../backend/src/routes/patient")
const doctorRoutes = require("../backend/src/routes/doctor")
const ShiftRoutes = require("../backend/src/routes/shift")

const cors= require("cors")
const app = express();

var corsOptions = {
  origin: ["http://localhost:3000","https://fontend-sistu-production.up.railway.app"],
  credentials: true, 
};


  app.use(cors(corsOptions));



//app.use(createRoles());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressSession({
  secret: "SECRET",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(methodOverride('_method'));
app.use(morgan("dev"))


app.use((req, res, next) => {
  app.locals.user = req.session.user; // Asigna los datos del usuario a app.locals.user
  next();
});








app.use(express.static(path.resolve(__dirname, "./public")));
console.log(path.resolve(__dirname, "./public"));




app.use("/api/user", mainRoutes)
app.use("/api/patient", patientRoutes)
app.use("/api/doctor", doctorRoutes)
app.use("/api/shift", ShiftRoutes)


app.use((req, res, next) => {
  res.send("Error 404! File Not Found");
  next()
});





// Server Init
const port = process.env.PORT || 3003;
app.listen(port, () => console.log('Server escuchando en puerto http://localhost:3003'));