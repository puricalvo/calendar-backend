/* 
    Rutas de Messages 
    host: localhost:4000/api/messages
*/
const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt' );
const { getMensages, crearMensage, actualizarMensage, eliminarMensage } = require('../controllers/messages');


const router = Router();

// Todas tienen que pasar por la validacion JWT
router.use( validarJWT );


// Obtener mensages
router.get('/', getMensages );


// Crear un nuevo evento
router.post('/', crearMensage );


// Actualizar Evento
router.put('/:id', actualizarMensage );

// Borrar Evento
router.delete('/:id', eliminarMensage );


module.exports = router; 