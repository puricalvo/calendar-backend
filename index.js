const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { dbConnection } = require('./database/config' );
const path = require('path');


// Crear el servidor de Express
const app = express();

// Base de datos
dbConnection();

// CORS habilitado
app.use(cors());

// Directorio publico
app.use(express.static(path.join(__dirname, '../calendar/public')));
// app.use( express.static('public2') );

// Lectura y parseo del body
app.use( express.json() );


// Ruta
app.use('/api/auth', require('./routes/auth') ); 
// Ruta Eventos
app.use('/api/events', require('./routes/events') ); 
// Ruta Mensages
app.use('/api/messages', require('./routes/messages'));
 



// Escuchar peticiones
app.listen( process.env.PORT, () => {
    console.log(`Servidor corriendo en puerto ${ process.env.PORT }`);
});



