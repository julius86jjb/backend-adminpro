// Requires

var express = require('express');
var cors = require('cors')
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
require('dotenv').config();
// var fileUpload = require('express-fileupload');


var app = express();


// MIDDLEWARES

// app.use(fileUpload({ useTempFiles: true }));
app.use(cors())

// Hablilitando el CORS

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});



//  BodyParser

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// importar rutas

var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var loginRoutes = require('./routes/login');
var uploadRoutes = require('./routes/upload');
var busquedaRoutes = require('./routes/busqueda');
var imagenesRoutes = require('./routes/imagenes');





// Conexion DB

// DEV

// try {
//     mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
//     if (err) throw err;
//     console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'online');
//     });
// } catch (error) {
//     console.log(error);
//     throw new Error('Error a la hora de iniciar la BD ver logs');
// }

// PROD

try {
    mongoose.connection.openUri(process.env.MONGO_URI, {dbName: process.env.MONGO_DB_NAME}, (err, res) => {
    if (err) throw err;
    console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'online');
    });
} catch (error) {
    console.log(error);
    throw new Error('Error a la hora de iniciar la BD ver logs');
}

// Server index config - VER IMAGENES EN EL NAVEGADOR CON FS

// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));



// Rutas

app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);

app.use('/', appRoutes);





// Escuchar Peticiones

app.listen(process.env.PORT ?? 3000, () => {
    
    console.log('Express Server escuchando en puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});