const { response, request } = require("express");
const mongoose = require('mongoose');
const Mensage = require('../models/Mensage');
const Usuario = require('../models/Usuario');

const DEFAULT_PAGE_SIZE = 10;

const getPaginatedMessages = async (req, res, filter, errorMessage) => {
    try {
        const limit = Number(req.query.limit || DEFAULT_PAGE_SIZE);
        const hasDateCursor = Boolean(req.query.beforeDate);
        const hasIdCursor = Boolean(req.query.beforeId);

        if (hasDateCursor !== hasIdCursor) {
            return res.status(400).json({
                ok: false,
                msg: 'El cursor de paginación no es válido'
            });
        }

        const filters = [filter];
        if (hasDateCursor) {
            filters.push({
                $or: [
                    { date: { $lt: new Date(req.query.beforeDate) } },
                    {
                        date: new Date(req.query.beforeDate),
                        _id: { $lt: new mongoose.Types.ObjectId(req.query.beforeId) }
                    }
                ]
            });
        }

        const query = filters.length === 1 ? filter : { $and: filters };
        const [page, total] = await Promise.all([
            Mensage.find(query)
                .populate('user', 'name email')
                .populate('recipient', 'name email')
                .sort({ date: -1, _id: -1 })
                .limit(limit + 1),
            Mensage.countDocuments(filter)
        ]);

        const hasMore = page.length > limit;
        const mensages = hasMore ? page.slice(0, limit) : page;
        const oldestMessage = mensages[mensages.length - 1];

        res.json({
            ok: true,
            mensages,
            total,
            hasMore,
            nextCursor: hasMore ? {
                beforeDate: oldestMessage.date.toISOString(),
                beforeId: oldestMessage.id
            } : null
        });
    } catch (error) {
        console.error(errorMessage, error);
        res.status(500).json({
            ok: false,
            msg: errorMessage
        });
    }
};

const getMensages = async (req, res = response) => {
    return getPaginatedMessages(
        req,
        res,
        {
            $or: [
                { recipient: req.uid },
                { user: req.uid }
            ]
        },
        'Error al obtener los mensajes'
    );
};

const getMensagesAdmin = async (req, res = response) => {
    return getPaginatedMessages(
        req,
        res,
        {
            $or: [
                { recipient: req.uid },
                { user: req.uid }
            ]
        },
        'No se pudieron obtener los mensajes de empleados'
    );
};

const responderMensage = async (req, res = response) => {
    try {
        const recipient = await Usuario.findOne({
            _id: req.body.recipientId,
            role: 'user'
        }).select('_id');

        if (!recipient) {
            return res.status(404).json({
                ok: false,
                msg: 'El empleado seleccionado no existe'
            });
        }

        const mensage = await new Mensage({
            text: req.body.text.trim(),
            user: req.uid,
            recipient: recipient._id
        }).save();
        await mensage.populate([
            { path: 'user', select: 'name email' },
            { path: 'recipient', select: 'name email' }
        ]);

        res.status(201).json({
            ok: true,
            mensage
        });
    } catch (error) {
        console.error('Error al responder al empleado:', error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo enviar la respuesta'
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
        await mensageGuardado.populate([
            { path: 'user', select: 'name email' },
            { path: 'recipient', select: 'name email' }
        ]);

        res.json({
            ok: true,
            mensage: mensageGuardado
        });

    } catch (error) {
        console.error('Error al crear el mensaje:', error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo enviar el mensaje al administrador'
        });
    }
};

const marcarMensageLeido = async (req = request, res = response) => {
    try {
        const criteria = {
            _id: req.params.id,
            recipient: req.uid,
            $or: [
                { readAt: { $exists: false } },
                { readAt: null }
            ]
        };
        const updatedMessage = await Mensage.findOneAndUpdate(
            criteria,
            { $set: { readAt: new Date() } },
            { new: true }
        );

        if (updatedMessage) {
            return res.json({
                ok: true,
                readAt: updatedMessage.readAt
            });
        }

        const existingMessage = await Mensage.findOne({
            _id: req.params.id,
            recipient: req.uid
        }).select('readAt');

        if (!existingMessage) {
            return res.status(404).json({
                ok: false,
                msg: 'El mensaje no existe o no eres su destinatario'
            });
        }

        res.json({
            ok: true,
            readAt: existingMessage.readAt
        });
    } catch (error) {
        console.error('Error al registrar la lectura del mensaje:', error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo registrar la lectura del mensaje'
        });
    }
};

module.exports = {
    getMensages,
    getMensagesAdmin,
    responderMensage,
    crearMensage,
    marcarMensageLeido,
};
