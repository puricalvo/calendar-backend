/* 
    Rutas de Messages 
    host: localhost:4000/api/messages
*/
const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt' );
const { validarAdmin } = require('../middlewares/validar-admin');
const {
    getMensages,
    getMensagesAdmin,
    crearMensage,
    actualizarMensage,
    eliminarMensage,
    eliminarMensageAdmin
} = require('../controllers/messages');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');


const router = Router();

// Todas tienen que pasar por la validacion JWT
router.use( validarJWT );


// Obtener mensages
router.get('/', getMensages );
router.get('/admin/inbox', validarAdmin, getMensagesAdmin);
router.delete('/admin/inbox/:id', validarAdmin, check('id', 'El mensaje no es válido').isMongoId(), validarCampos, eliminarMensageAdmin);


// Crear un nuevo evento
router.post(
    '/',
    check('text', 'El mensaje es obligatorio y no puede superar los 2000 caracteres').isString().trim().notEmpty().isLength({ max: 2000 }),
    validarCampos,
    crearMensage
);


// Actualizar Evento
router.put('/:id', actualizarMensage );

// Borrar Evento
router.delete('/:id', eliminarMensage );


module.exports = router; 