const { response, request } = require("express");
const Evento = require('../models/Evento');


const getEventos = async( req, res = response ) => {

    const eventos = await Evento.find()
                                .populate('user', 'name');
    res.json({
        ok: true,
        eventos
    });
}


const crearEvento = async( req, res = response ) => {

    const evento = new Evento( req.body ); // Esta es la instancia del modelo

    try {

        evento.user = req.uid;

        // Grabar evento
        const eventoGuardado = await evento.save();

        res.json({
            ok: true,
            evento: eventoGuardado
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }

}


const actualizarEvento = async( req = request, res = response ) => {

    const eventoId = req.params.id;
    const uid = req.uid;

    try {

        const evento = await Evento.findById( eventoId );

        if ( !evento ) {
            return res.status(404).json({
                ok: false,
                msg: 'Evento no existe por ese id'
            });
        }
        
        if ( evento.user.toString() !== uid ) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene autorización de editar este evento'
            });
        }

        // crear el nuevo evento
        const nuevoEvento = {
            ...req.body,
            user: uid
        }

        const eventoActualizado = await Evento.findByIdAndUpdate( eventoId, nuevoEvento, { new: true } );

        res.json({
            ok: true,
            evento: eventoActualizado
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });   
    }

}


const eliminarEvento = async( req, res = response ) => {

    const eventoId = req.params.id;
    const uid = req.uid;

    try {

        const evento = await Evento.findById( eventoId );

        if ( !evento ) {
            return res.status(404).json({
                ok: false,
                msg: 'Evento no existe por ese id'
            });
        }
        
        if ( evento.user.toString() !== uid ) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene autorización para eliminar este evento'
            });
        }

       
            // Sepone el token del usuario y el Id del evento para borrarlos...
         await Evento.findByIdAndDelete( eventoId ); 

        res.json({
            ok: true,
            msg: 'Evento Borrado'
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
    getEventos,
    crearEvento,
    actualizarEvento,
    eliminarEvento,
}