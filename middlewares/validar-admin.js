const { response } = require('express');
const Usuario = require('../models/Usuario');

const validarAdmin = async (req, res = response, next) => {
    const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (!configuredAdminEmail) {
        return res.status(503).json({
            ok: false,
            msg: 'El administrador no está configurado en el servidor'
        });
    }

    try {
        const usuario = await Usuario.findById(req.uid).select('email role');
        if (
            !usuario
            || usuario.role !== 'admin'
            || usuario.email.toLowerCase() !== configuredAdminEmail
        ) {
            return res.status(403).json({
                ok: false,
                msg: 'Solo el administrador puede realizar esta acción'
            });
        }

        req.role = 'admin';
        next();
    } catch (error) {
        console.error('Error al validar los permisos del administrador:', error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudieron validar los permisos'
        });
    }
};

module.exports = { validarAdmin };
