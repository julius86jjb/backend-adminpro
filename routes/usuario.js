// Requires

var express = require('express');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
// var SEED = require('../config/config').SEED;
var mdAuteticacion = require('../middlewares/autenticacion');
const Usuario = require('../models/usuario');

var app = express();


// Rutas


// =========================================================
// Obtener listado de usuarios
// =========================================================


app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0; //parametro opcional, si viene algo en el query, lo asignamos, sino, 0
    desde = Number(desde);

    Usuario.find({}, 'nombre email role img google')
        .skip(desde)
        .limit(10)
        .exec(
            (err, usuarios) => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error get usuarios',
                        errors: err
                    });
                }

                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        usuarios: usuarios

                    });
                });


            }
        )
})



// =========================================================
// Verificar Token // forma 1 "las operaciones debajo de esta funcion requieren token"
// =========================================================


// app.use('/', (req, res, next) => {

//     var token = req.query.token;

//     jwt.verify(token, SEED, (err, decoded) => {

//         if (err) {
//             res.status(401).json({
//                 ok: false,
//                 mensaje: 'No autorizado - Token incorrecto',
//                 errors: err
//             });
//         }

//         next();

//     })

// })



// =========================================================
// Crear un nuevo usuario
// =========================================================


app.post('/', function(req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role,
        img: body.img
    })

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Usuario',
                errors: err
            })
        }

        usuarioDB.password = ':)';

        res.status(201).json({
            ok: true,
            usuario: usuarioDB,
            usuarioQueHizoPeticion: req.usuario
        })
    })

})

module.exports = app;


// =========================================================
// Actualizar un usuario
// =========================================================


app.put('/:id', [mdAuteticacion.verificaToken, mdAuteticacion.verificaADMIN_o_MismoUsuario], (req, res) => {
    let id = req.params.id;
    // let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado'])
    let body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            })
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: ' No existe un usuario con ese ID' }
            })
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                })
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        })

    })

})


// =========================================================
// Borrar un usuario
// =========================================================


app.delete('/:id', mdAuteticacion.verificaToken, function(req, res) {

    let id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            })
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID',
                errors: {
                    message: 'No existe un usuario con ese ID'
                }
            })
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    })
})



module.exports = app;