const { response, request } = require("express");
const Mensage = require('../models/Mensage');


const getMensages = async( req, res = response ) => {

    const mensages = await Mensage.find()
                                .populate('user', 'name');
    res.json({
        ok: true,
        mensages
    });
}


const crearMensage = async( req, res = response ) => {

    const mensage = new Mensage( req.body ); // Esta es la instancia del modelo

    try {

        mensage.user = req.uid;

        // Grabar evento
        const mensageGuardado = await mensage.save();

        res.json({
            ok: true,
            mensage: mensageGuardado
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }

}


const actualizarMensage = async( req = request, res = response ) => {

    const mensageId = req.params.id;
    const uid = req.uid;

    try {

        const mensage = await Mensage.findById( mensageId );

        if ( !mensage ) {
            return res.status(404).json({
                ok: false,
                msg: 'Mensage no existe por ese id'
            });
        }
        
        if ( mensage.user.toString() !== uid ) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene autorización de editar este mensage'
            });
        }

        // crear el nuevo evento
        const nuevoMensage = {
            ...req.body,
            user: uid
        }

        const mensageActualizado = await Mensage.findByIdAndUpdate( mensageId, nuevoMensage, { new: true } );

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


const eliminarMensage = async( req, res = response ) => {

    const mensageId = req.params.id;
    const uid = req.uid;

    try {

        const mensage = await Mensage.findById( mensageId );

        if ( !mensage ) {
            return res.status(404).json({
                ok: false,
                msg: 'Mensage no existe por ese id'
            });
        }
        
        if ( mensage.user.toString() !== uid ) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene autorización para eliminar este evento'
            });
        }

       
            // Sepone el token del usuario y el Id del evento para borrarlos...
         await Mensage.findByIdAndDelete( mensageId ); 

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
    crearMensage,
    actualizarMensage,
    eliminarMensage,
}