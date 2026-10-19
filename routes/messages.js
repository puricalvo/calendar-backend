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
    responderMensage,
    crearMensage,
    marcarMensageLeido
} = require('../controllers/messages');
const { check, query } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');


const router = Router();

// Todas tienen que pasar por la validacion JWT
router.use( validarJWT );


// Obtener mensages
const validatePagination = [
    query('limit', 'El tamaño de página no es válido').optional().isInt({ min: 1, max: 10 }),
    query('beforeDate', 'La fecha del cursor no es válida').optional().isISO8601(),
    query('beforeId', 'El identificador del cursor no es válido').optional().isMongoId(),
    validarCampos
];

router.get('/', validatePagination, getMensages);
router.get('/admin/inbox', validarAdmin, validatePagination, getMensagesAdmin);
router.post(
    '/admin/reply',
    validarAdmin,
    check('recipientId', 'Selecciona un empleado válido').isMongoId(),
    check('text', 'La respuesta es obligatoria y no puede superar los 2000 caracteres')
        .isString()
        .trim()
        .notEmpty()
        .isLength({ max: 2000 }),
    validarCampos,
    responderMensage
);

router.post(
    '/:id/read',
    check('id', 'El mensaje no es válido').isMongoId(),
    validarCampos,
    marcarMensageLeido
);

router.post(
    '/',
    check('text', 'El mensaje es obligatorio y no puede superar los 2000 caracteres').isString().trim().notEmpty().isLength({ max: 2000 }),
    validarCampos,
    crearMensage
);

module.exports = router; 