const { response, request } = require("express");
const Servicio = require('../models/Servicio');
const { format } = require('date-fns');

const getServicios = async (req, res = response) => {
    try {
        // Filtrar los mensajes por el UID del usuario autenticado
        const uid = req.uid;
        const servicios = await Servicio.find({ user: uid })  // Filtrar por el usuario autenticado
                                      .populate('user', 'name');

                                      
         // Formatear las horas antes de enviarlas
         const serviciosFormateados = servicios.map(servicio => {
            // Convertir hInicio y hFinal a objetos Date
            const hInicioDate = new Date(`1970-01-01T${String(servicio.hInicio).padStart(4, '0').slice(0, 2)}:${String(servicio.hInicio).padStart(4, '0').slice(2)}:00Z`);
            const hFinalDate = new Date(`1970-01-01T${String(servicio.hFinal).padStart(4, '0').slice(0, 2)}:${String(servicio.hFinal).padStart(4, '0').slice(2)}:00Z`);

            return {
                ...servicio._doc,
                hInicio: format(hInicioDate, 'HH:mm'),
                hFinal: format(hFinalDate, 'HH:mm'),
            };
        });
        

        res.json({
            ok: true,
            servicios: serviciosFormateados
        });
    } catch (error) {
        console.error('Error al obtener los sevicios:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener los servicios'
        });
    }
}

const crearServicio = async (req, res = response) => {
    const servicio = new Servicio(req.body); // Instancia del modelo Servicio
        console.log(req.body);
    try {
        // Asociar el servicio con el usuario autenticado
        servicio.user = req.uid;

        // Guardar el servicio en la base de datos
        const servicioGuardado = await servicio.save();

        // Convertir hInicio y hFinal a objetos Date
        const hInicioDate = new Date(`1970-01-01T${String(servicioGuardado.hInicio).padStart(4, '0').slice(0, 2)}:${String(servicioGuardado.hInicio).padStart(4, '0').slice(2)}:00Z`);
        const hFinalDate = new Date(`1970-01-01T${String(servicioGuardado.hFinal).padStart(4, '0').slice(0, 2)}:${String(servicioGuardado.hFinal).padStart(4, '0').slice(2)}:00Z`);

        const servicioFormateado = {
            ...servicioGuardado._doc,
            hInicio: format(hInicioDate, 'HH:mm'),
            hFinal: format(hFinalDate, 'HH:mm'),
        };

        res.json({
            ok: true,
            servicio: servicioFormateado
        });

        

    } catch (error) {
        console.error('Error al crear el servicio:', error); // Mostrar detalles del error en la consola
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