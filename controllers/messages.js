const { response, request } = require("express");
const Mensage = require('../models/Mensage');
const Usuario = require('../models/Usuario');


const getMensages = async (req, res = response) => {
    try {
        const uid = req.uid;
        const mensages = await Mensage.find({
            user: uid,
            recipient: { $exists: false }
        }).populate('user', 'name');
        res.json({
            ok: true,
            mensages
        });
    } catch (error) {
        console.error('Error al obtener los mensajes:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener los mensajes'
        });
    }
}

const getMensagesAdmin = async (req, res = response) => {
    try {
        const mensages = await Mensage.find({ recipient: req.uid })
            .populate('user', 'name email')
            .sort({ date: -1 });

        res.json({
            ok: true,
            mensages
        });
    } catch (error) {
        console.error('Error al obtener los mensajes de empleados:', error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudieron obtener los mensajes de empleados'
        });
    }
};

const crearMensage = async (req, res = response) => {
    try {
        const text = req.body.text.trim();
        if (!text) {
            return res.status(400).json({
                ok: false,
                msg: 'El mensaje no puede estar vacío'
            });
        }

        const sender = await Usuario.findById(req.uid).select('role');
        if (!sender || sender.role !== 'user') {
            return res.status(403).json({
                ok: false,
                msg: 'Solo los empleados pueden enviar mensajes al administrador'
            });
        }

        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        if (!adminEmail) {
            return res.status(503).json({
                ok: false,
                msg: 'El administrador no está configurado en el servidor'
            });
        }

        const admin = await Usuario.findOne({ role: 'admin', email: adminEmail }).select('_id');
        if (!admin) {
            return res.status(503).json({
                ok: false,
                msg: 'No se encontró la cuenta administradora'
            });
        }

        const mensageGuardado = await new Mensage({
            text,
            user: req.uid,
            recipient: admin._id
        }).save();

        res.json({
            ok: true,
            mensage: mensageGuardado
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

const eliminarMensageAdmin = async (req, res = response) => {
    try {
        const mensage = await Mensage.findOneAndDelete({
            _id: req.params.id,
            recipient: req.uid
        });

        if (!mensage) {
            return res.status(404).json({
                ok: false,
                msg: 'El mensaje no existe en el buzón del administrador'
            });
        }

        res.json({
            ok: true,
            msg: 'Mensaje eliminado'
        });
    } catch (error) {
        console.error('Error al eliminar el mensaje recibido:', error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo eliminar el mensaje'
        });
    }
};

const actualizarMensage = async (req = request, res = response) => {
    const mensageId = req.params.id;
    const uid = req.uid;

    try {
        const mensage = await Mensage.findById(mensageId);

        if (!mensage) {
            return res.status(404).json({
                ok: false,
                msg: 'Mensage no existe por ese id'
            });
        }

        if (mensage.user.toString() !== uid) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene autorización de editar este mensage'
            });
        }

        // Crear el nuevo mensaje
        const mensageActualizado = await Mensage.findByIdAndUpdate(
            mensageId,
            { text: req.body.text },
            { new: true, runValidators: true }
        );

        res.json({
            ok: true,
            mensage: mensageActualizado
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

const eliminarMensage = async (req, res = response) => {
    const mensageId = req.params.id;
    const uid = req.uid;

    try {
        const mensage = await Mensage.findById(mensageId);

        if (!mensage) {
            return res.status(404).json({
                ok: false,
                msg: 'Mensage no existe por ese id'
            });
        }

        if (mensage.user.toString() !== uid) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene autorización para eliminar este evento'
            });
        }

        // Borrar el mensaje
        await Mensage.findByIdAndDelete(mensageId);

        res.json({
            ok: true,
            msg: 'Mensage Borrado'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

module.exports = {
    getMensages,
    getMensagesAdmin,
    crearMensage,
    actualizarMensage,
    eliminarMensage,
    eliminarMensageAdmin,
}