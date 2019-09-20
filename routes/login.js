// Requires

var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
const Usuario = require('../models/usuario');

// GOOGLE SIGN-IN
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


// ============================================== //
// Auntenticacion Google
// ============================================== //

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}

app.post('/google', async(req, res) => {

    var token = req.body.token;
    console.log(token);

    var googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            })

        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (usuarioDB) {
            //exsite en nuestra DB pero se registro sin google
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticacion normal',
                });
            } else {
                let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 })

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id
                        // token: token
                })
            }
        } else {
            // el usuario no existe en nuestra DB
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ';)';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al crear usuario',
                        errors: err
                    });
                }

                let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 })

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                })
            })
        }
    })

})




// ============================================== //
// Auntenticacion Normal
// ============================================== //


app.post('/', (req, res) => {


    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, UsuarioDB) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!UsuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas1',
                errors: err
            })
        }
        if (!bcrypt.compareSync(body.password, UsuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas2',
                errors: err
            })
        }

        UsuarioDB.password = ':)';
        // let token = jwt.sign({ usuario: UsuarioDB }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })
        let token = jwt.sign({ usuario: UsuarioDB }, SEED, { expiresIn: 14400 })

        res.json({
            ok: true,
            usuario: UsuarioDB,
            token: token,
            id: UsuarioDB._id
                // token: token
        })
    })



})


module.exports = app;