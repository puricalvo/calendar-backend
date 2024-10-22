const { response, request } = require("express");
const Servicio = require('../models/Servicio');
const { format } = require('date-fns');
const moment = require('moment');

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

        // Formatear el resultado antes de enviarlo
        const serviciosFormateados = servicios.map(servicio => ({
            ...servicio._doc,
            hInicio: format(new Date(servicio.hInicio), 'HH:mm'),
            hFinal: format(new Date(servicio.hFinal), 'HH:mm'),
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
}


const crearServicio = async (req, res = response) => {
    // Extrae las fechas y horas del cuerpo de la solicitud
    const { start, end, hInicio, hFinal, ...restoDelServicio } = req.body; 

    const servicio = new Servicio({
        ...restoDelServicio,
        user: req.uid,
        start, // Asegúrate de que estés almacenando el campo 'start' como un Date
        end,   // Almacena 'end' como un Date también
        hInicio, // Almacena hInicio y hFinal si es necesario
        hFinal
    });

    try {
        // Guardar el servicio en la base de datos
        const servicioGuardado = await servicio.save();

        // Formatear el servicio guardado antes de enviarlo de vuelta
        const servicioFormateado = {
            ...servicioGuardado._doc,
            hInicio: format(new Date(servicioGuardado.hInicio), 'HH:mm'),
            hFinal: format(new Date(servicioGuardado.hFinal), 'HH:mm'),
        };

        res.json({
            ok: true,
            servicio: servicioFormateado
        });

    } catch (error) {
        console.error('Error al crear el servicio:', error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
}

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