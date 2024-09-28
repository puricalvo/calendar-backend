/* 
    Rutas de usuarios / Auth
    host: localhost:4000/api/auth
 */
const { Router } = require('express');
const { check } = require('express-validator')
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt' );
const { crearUsuario, loginUsuario, revalidarToken, } = require('../controllers/auth');

const router = Router();



router.post('/new', 
    [ // middelwares
        check('name', 'El nombre es obligatorio').not().isEmpty(),
        check('email', 'El email es obligatorio').isEmail(),
        check('password', 'El password debe de ser de 6 caracteres').isLength({ min: 6 }),
        validarCampos
    ] , 
    crearUsuario );

router.post('/', 
    [ // middelwares
        check('email', 'El email es obligatorio').isEmail(),
        check('password', 'El password debe de ser de 6 caracteres').isLength({ min: 6 }),
        validarCampos
    ], 
    loginUsuario );

router.get('/renew', validarJWT, revalidarToken );


module.exports = router;