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

const corsOptions = {
  origin: ["http://localhost:3001", "http://localhost:3003", "https://fontend-sistu-production.up.railway.app"],
  credentials: true, 
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", "OPTIONS, POST, GET, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});



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

app.get("/", (req,res)=>{
  res.status(200).send({msg: "Hola Mundo!"})
})
app.use((req, res, next) => {
  res.send("Hola mundo");
  next()
});







// Server Init
const port = process.env.PORT || 3003;
app.listen(port, () => console.log('Server escuchando en puerto http://localhost:', port));