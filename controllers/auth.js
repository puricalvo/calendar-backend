const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { generarJWT } = require('../helpers/jwt');

const getConfiguredRole = (email) => {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    return adminEmail && email.trim().toLowerCase() === adminEmail ? 'admin' : 'user';
};

const crearUsuario = async( req, res = response ) => {

    const { name, password } = req.body;
    const email = req.body.email.trim().toLowerCase();

    try {

        let usuario = await Usuario.findOne({ email });
        
        if ( usuario ) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya existe'
            });
        }

        usuario = new Usuario({
            name,
            email,
            password,
            role: getConfiguredRole(email)
        });

        // Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync( password, salt );

        // Grabar en la base de datos
        await usuario.save();

        // Generar nuestro JWT
        const token = await generarJWT( usuario.id, usuario.name, usuario.role);

        res.status(201).json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            role: usuario.role,
            token
        });
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }
    
}

const loginUsuario = async( req, res = response ) => {

    const { password } = req.body;
    const email = req.body.email.trim().toLowerCase();

    try {

        const usuario = await Usuario.findOne({ email });
        
        if ( !usuario ) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe con ese email'
            });
        }

        // Confirmar los password
        const validPassword = bcrypt.compareSync( password, usuario.password );

        if ( !validPassword ) {
            return res.status(400).json({
                ok: false,
                msg: 'Password incorrecto'
            });
        }

        const role = getConfiguredRole(usuario.email);
        if (usuario.role !== role) {
            usuario.role = role;
            await usuario.save();
        }

        // Generar nuestro JWT
        const token = await generarJWT( usuario.id, usuario.name, role);

        res.json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            role,
            token
        })

        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
        
    }
}

const revalidarToken = async( req, res = response ) => {
    try {
        const usuario = await Usuario.findById(req.uid);
        if (!usuario) {
            return res.status(401).json({
                ok: false,
                msg: 'La cuenta ya no existe'
            });
        }

        const role = getConfiguredRole(usuario.email);
        if (usuario.role !== role) {
            usuario.role = role;
            await usuario.save();
        }

        const token = await generarJWT(usuario.id, usuario.name, role);
        res.json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            role,
            token
        });
    } catch (error) {
        console.error('Error al renovar la sesión:', error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo renovar la sesión'
        });
    }
}

const getUsers = async (req, res = response) => {
    try {
        const usuarios = await Usuario.find({ role: 'user' })
            .select('name email')
            .sort({ name: 1 });

        res.json({
            ok: true,
            usuarios: usuarios.map(({ id, name, email }) => ({ id, name, email }))
        });
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudieron obtener los usuarios'
        });
    }
};

module.exports = {
    crearUsuario,
    loginUsuario,
    revalidarToken,
    getUsers,
}