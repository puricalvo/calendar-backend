const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { dbConnection } = require('./database/config' );



// Crear el servidor de Express
const app = express();

// Base de datos
dbConnection();

// CORS habilitado
app.use(cors());

// Directorio publico
app.use( express.static('public') );

// Lectura y parseo del body
app.use( express.json() );


// Ruta
app.use('/api/auth', require('./routes/auth') ); 
// Ruta Eventos
app.use('/api/events', require('./routes/events') ); 
 



// Escuchar peticiones
app.listen( process.env.PORT, () => {
    console.log(`Servidor corriendo en puerto ${ process.env.PORT }`);
});



