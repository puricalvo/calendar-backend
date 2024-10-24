const jwt = require('jsonwebtoken');

const generarJWT = ( uid, name ) => {

    return new Promise( (resolve, reject) => {

       const payload = { uid, name };
       
       jwt.sign( payload, process.env.SECRET_JWT_SEED, {
            expiresIn: '120h' // hay que poner las horas en las que quieres que caduque el token.
       }, (err, token ) => {

            if ( err ) {
                console.log(err);
                reject('No se pudo generar el token')
            }

            resolve( token );
       })
        
    })
}


module.exports = {
    generarJWT,
}