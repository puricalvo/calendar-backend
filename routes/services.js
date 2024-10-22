/* 
    Rutas de Services 
    host: localhost:4000/api/services
*/
const { Router } = require('express');

const { validarJWT } = require('../middlewares/validar-jwt' );
const { getServicios, crearServicio, actualizarServicio, eliminarServicio } = require('../controllers/services');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { isDateWithoutTime } = require('../helpers/isDateWithoutTime');



const router = Router();

// Todas tienen que pasar por la validacion JWT
router.use( validarJWT );


// Obtener mensages
router.get('/', getServicios );


// Crear un nuevo evento
router.post('/',[ // Middelwares
    check('start','Fecha de inicio es obligatoria ').custom( isDateWithoutTime ),
    check('end','Fecha de finalizacion es obligatoria ').custom( isDateWithoutTime ),
    validarCampos 
 ], crearServicio,  );


// Actualizar Evento
router.put('/:id', actualizarServicio );

// Borrar Evento
router.delete('/:id', eliminarServicio );


module.exports = router; 