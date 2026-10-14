const { response, request } = require("express");
const Servicio = require('../models/Servicio');
const Usuario = require('../models/Usuario');
const moment = require('moment');

const getServicios = async (req, res = response) => {
    try {
        const uid = req.uid;
        const requestedWeek = req.query.week
            ? moment.utc(req.query.week, 'YYYY-MM-DD', true)
            : moment.utc(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD', true);

        if (!requestedWeek.isValid()) {
            return res.status(400).json({
                ok: false,
                msg: 'La fecha de la semana no es válida'
            });
        }

        const startOfWeek = requestedWeek.startOf('isoWeek').startOf('day');
        const startOfNextWeek = startOfWeek.clone().add(1, 'week');
        const servicios = await Servicio.find({
            $or: [
                { assignedTo: uid },
                { assignedTo: { $exists: false }, user: uid }
            ],
            start: { $gte: startOfWeek.toDate(), $lt: startOfNextWeek.toDate() }
        }).populate('assignedTo', 'name').sort({ start: 1, hInicio: 1 });

        const serviciosFormateados = servicios.map(servicio => ({
            ...servicio.toObject(),
            dayType: servicio.dayType || 'service',
            ...(servicio.dayType === 'rest' ? {} : {
                hInicio: servicio.hInicio || 'Hora no disponible',
                hFinal: servicio.hFinal || 'Hora no disponible',
            })
        }));

        res.json({
            ok: true,
            servicios: serviciosFormateados
        });
    } catch (error) {
        console.error('Error al obtener los servicios:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener los servicios'
        });
    }
};

const getServiciosAdmin = async (req, res = response) => {
    try {
        const { assignedTo, week } = req.query;
        if (!assignedTo || !/^[a-f\d]{24}$/i.test(assignedTo)) {
            return res.status(400).json({
                ok: false,
                msg: 'Selecciona un empleado válido'
            });
        }

        const requestedWeek = week
            ? moment.utc(week, 'YYYY-MM-DD', true)
            : moment.utc(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD', true);
        if (!requestedWeek.isValid()) {
            return res.status(400).json({
                ok: false,
                msg: 'La fecha de la semana no es válida'
            });
        }

        const empleado = await Usuario.findOne({ _id: assignedTo, role: 'user' }).select('_id');
        if (!empleado) {
            return res.status(404).json({
                ok: false,
                msg: 'El empleado seleccionado no existe'
            });
        }

        const startOfWeek = requestedWeek.startOf('isoWeek').startOf('day');
        const startOfNextWeek = startOfWeek.clone().add(1, 'week');
        const servicios = await Servicio.find({
            $or: [
                { assignedTo },
                { assignedTo: { $exists: false }, user: assignedTo }
            ],
            start: { $gte: startOfWeek.toDate(), $lt: startOfNextWeek.toDate() }
        }).populate('assignedTo', 'name email').sort({ start: 1, hInicio: 1 });

        res.json({
            ok: true,
            servicios: servicios.map((servicio) => ({
                ...servicio.toObject(),
                dayType: servicio.dayType || 'service',
                ...(servicio.dayType === 'rest' ? {} : {
                    hInicio: servicio.hInicio || 'Hora no disponible',
                    hFinal: servicio.hFinal || 'Hora no disponible',
                })
            }))
        });
    } catch (error) {
        console.error('Error al obtener los servicios del empleado:', error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudieron obtener los servicios del empleado'
        });
    }
};

const getTodosServiciosAdmin = async (req, res = response) => {
    try {
        const requestedWeek = req.query.week
            ? moment.utc(req.query.week, 'YYYY-MM-DD', true)
            : moment.utc(moment().format('YYYY-MM-DD'), 'YYYY-MM-DD', true);

        if (!requestedWeek.isValid()) {
            return res.status(400).json({
                ok: false,
                msg: 'La fecha de la semana no es válida'
            });
        }

        const startOfWeek = requestedWeek.startOf('isoWeek').startOf('day');
        const startOfNextWeek = startOfWeek.clone().add(1, 'week');
        const servicios = await Servicio.find({
            start: { $gte: startOfWeek.toDate(), $lt: startOfNextWeek.toDate() }
        })
            .populate('assignedTo', 'name email role')
            .populate('user', 'name email role')
            .sort({ start: 1, hInicio: 1 });

        res.json({
            ok: true,
            servicios: servicios.map((servicio) => {
                const service = servicio.toObject();
                return {
                    ...service,
                    assignedTo: service.assignedTo || (
                        service.user?.role === 'user' ? service.user : null
                    ),
                    dayType: service.dayType || 'service',
                    ...(service.dayType === 'rest' ? {} : {
                        hInicio: service.hInicio || 'Hora no disponible',
                        hFinal: service.hFinal || 'Hora no disponible',
                    })
                };
            })
        });
    } catch (error) {
        console.error('Error al obtener los servicios semanales:', error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudieron obtener los servicios semanales'
        });
    }
};

const actualizarComentarioIncidencia = async (req, res = response) => {
    try {
        const servicio = await Servicio.findByIdAndUpdate(
            req.params.id,
            { incidentComment: req.body.incidentComment },
            { new: true, runValidators: true }
        );

        if (!servicio) {
            return res.status(404).json({
                ok: false,
                msg: 'El servicio no existe'
            });
        }

        res.json({
            ok: true,
            servicio
        });
    } catch (error) {
        console.error('Error al guardar el comentario de incidencia:', error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo guardar el comentario'
        });
    }
};

const actualizarEstadoServicio = async (req, res = response) => {
    try {
        const servicio = await Servicio.findByIdAndUpdate(
            req.params.id,
            { completed: req.body.completed },
            { new: true, runValidators: true }
        );

        if (!servicio) {
            return res.status(404).json({
                ok: false,
                msg: 'El servicio no existe'
            });
        }

        res.json({ ok: true, servicio });
    } catch (error) {
        console.error('Error al actualizar el estado del servicio:', error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudo actualizar el estado del servicio'
        });
    }
};


const crearServicio = async (req, res = response) => {
    const { start, end, dayType = 'service', assignedTo, ...restoDelServicio } = req.body;

    try {
        const empleado = await Usuario.findOne({ _id: assignedTo, role: 'user' }).select('_id');
        if (!empleado) {
            return res.status(400).json({
                ok: false,
                msg: 'El empleado seleccionado no existe'
            });
        }

        const startOfDay = moment.utc(start, 'YYYY-MM-DD', true).startOf('day');
        const startOfNextDay = startOfDay.clone().add(1, 'day');
        const sameDayRecords = await Servicio.find({
            $or: [
                { assignedTo },
                { assignedTo: { $exists: false }, user: assignedTo }
            ],
            start: { $gte: startOfDay.toDate(), $lt: startOfNextDay.toDate() }
        });

        if (dayType === 'rest' && sameDayRecords.length > 0) {
            return res.status(409).json({
                ok: false,
                msg: 'Ya hay un servicio o descanso registrado para esa fecha'
            });
        }

        if (dayType === 'service' && sameDayRecords.some(record => record.dayType === 'rest')) {
            return res.status(409).json({
                ok: false,
                msg: 'El día está marcado como descanso; elimina ese registro antes de añadir un servicio'
            });
        }

        const servicio = new Servicio({
            ...restoDelServicio,
            dayType,
            user: req.uid,
            assignedTo,
            start: startOfDay.toDate(),
            end: moment.utc(end, 'YYYY-MM-DD', true).startOf('day').toDate()
        });

        const servicioGuardado = await servicio.save();

        res.status(201).json({
            ok: true,
            servicio: servicioGuardado
        });
    } catch (error) {
        console.error('Error al crear el servicio:', error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
};

const actualizarServicio = async (req = request, res = response) => {
    const servicioId = req.params.id;
    const uid = req.uid;

    try {
        const servicio = await Servicio.findById(servicioId);

        if (!servicio) {
            return res.status(404).json({
                ok: false,
                msg: 'el servicio no existe por ese id'
            });
        }

        if (servicio.user.toString() !== uid && req.role !== 'admin') {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene autorización de editar este servicio'
            });
        }

        // Crear el nuevo servicio
        const nuevoServicio = {
            ...req.body,
            user: uid
        }

        const servicioActualizado = await Servicio.findByIdAndUpdate(servicioId, nuevoServicio, { new: true });

        res.json({
            ok: true,
            servicio: servicioActualizado
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

const eliminarServicio = async (req, res = response) => {
    const servicioId = req.params.id;
    const uid = req.uid;

    try {
        const servicio = await Servicio.findById(servicioId);

        if (!servicio) {
            return res.status(404).json({
                ok: false,
                msg: 'el servicio no existe por ese id'
            });
        }

        if (servicio.dayType !== 'rest' && !servicio.completed) {
            return res.status(409).json({
                ok: false,
                msg: 'Marca el servicio como completado antes de eliminarlo'
            });
        }

        if (servicio.user.toString() !== uid && req.role !== 'admin') {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene autorización para eliminar este evento'
            });
        }

        // Borrar el mensaje
        await Servicio.findByIdAndDelete(servicioId);

        res.json({
            ok: true,
            msg: 'Servicio Borrado'
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
    getServicios,
    getServiciosAdmin,
    getTodosServiciosAdmin,
    actualizarComentarioIncidencia,
    actualizarEstadoServicio,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
}