/* 
    Rutas de Services 
    host: localhost:4000/api/services
*/
const { Router } = require('express');

const { validarJWT } = require('../middlewares/validar-jwt' );
const { validarAdmin } = require('../middlewares/validar-admin');
const {
    getServicios,
    getServiciosAdmin,
    getTodosServiciosAdmin,
    actualizarComentarioIncidencia,
    actualizarEstadoServicio,
    crearServicio,
    actualizarServicio,
    eliminarServicio
} = require('../controllers/services');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { isDateWithoutTime } = require('../helpers/isDateWithoutTime');



const router = Router();

// Todas tienen que pasar por la validacion JWT
router.use( validarJWT );


// Obtener mensages
router.get('/', getServicios );
router.get('/admin/all', validarAdmin, getTodosServiciosAdmin);
router.get('/admin', validarAdmin, getServiciosAdmin);
router.patch(
    '/admin/:id/incident',
    validarAdmin,
    check('id', 'El servicio no es válido').isMongoId(),
    check('incidentComment', 'El comentario debe ser texto y tener como máximo 1000 caracteres')
        .isString()
        .isLength({ max: 1000 })
        .trim(),
    validarCampos,
    actualizarComentarioIncidencia
);
router.patch(
    '/admin/:id/completed',
    validarAdmin,
    check('id', 'El servicio no es válido').isMongoId(),
    check('completed', 'El estado debe ser verdadero o falso').isBoolean(),
    validarCampos,
    actualizarEstadoServicio
);


// Crear un nuevo evento
router.post('/',[ // Middelwares
    validarAdmin,
    check('start','Fecha de inicio es obligatoria ').custom( isDateWithoutTime ),
    check('end','Fecha de finalizacion es obligatoria ').custom( isDateWithoutTime ),
    check('dayType', 'Tipo de día no válido').optional().isIn(['service', 'rest']),
    check('assignedTo', 'El empleado es obligatorio').isMongoId(),
    validarCampos 
 ], crearServicio,  );


// Actualizar Evento
router.put('/:id', validarAdmin, actualizarServicio );

// Borrar Evento
router.delete('/:id', validarAdmin, eliminarServicio );


module.exports = router; 