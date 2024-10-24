const { response, request } = require("express");
const Servicio = require('../models/Servicio');
const moment = require('moment');

const { format } = require('date-fns'); // Asegúrate de importar format correctamente


const getServicios = async (req, res = response) => {
    try {
        const uid = req.uid;

        // Obtener la fecha actual y establecer los límites
        const startOfToday = moment().startOf('day').toDate();
        const endOfToday = moment().endOf('day').toDate();

        // Filtrar los servicios por el UID del usuario autenticado y la fecha
        const servicios = await Servicio.find({
            user: uid,
            start: { $gte: startOfToday, $lte: endOfToday } // Solo los servicios de hoy
        }).populate('user', 'name');

        // No necesitas formatear las horas porque ya están almacenadas como cadenas
        const serviciosFormateados = servicios.map(servicio => ({
            ...servicio._doc,
            hInicio: servicio.hInicio || 'Hora no disponible',
            hFinal: servicio.hFinal || 'Hora no disponible',
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


const crearServicio = async (req, res = response) => {
    const { start, end, hInicio, hFinal, ...restoDelServicio } = req.body; 

    const servicio = new Servicio({
        ...restoDelServicio,
        user: req.uid,
        start,  // Guardar 'start' como Date
        end,    // Guardar 'end' como Date
        hInicio,  // Ya es un string con formato "HH:mm"
        hFinal   // Ya es un string con formato "HH:mm"
    });

    try {
        const servicioGuardado = await servicio.save();

        res.json({
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

        if (servicio.user.toString() !== uid) {
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

        if (servicio.user.toString() !== uid) {
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
    crearServicio,
    actualizarServicio,
    eliminarServicio,
}