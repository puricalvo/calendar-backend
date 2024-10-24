const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { dbConnection } = require('./database/config' );
const cron = require('node-cron');  // Importar node-cron
const Servicio = require('./models/Servicio'); // Importar tu modelo de servicio
const moment = require('moment');  // Importar moment para manejar fechas



// Crear el servidor de Express
const app = express();



// Base de datos
dbConnection();

// CORS habilitado
app.use(cors());

// Middleware para gestionar el idioma en cada solicitud
// app.use(middleware.handle(i18next));

// Directorio publico
// app.use(express.static(path.join(__dirname, '../calendar/public')));
app.use( express.static('public2') );

// Lectura y parseo del body
app.use( express.json() );


// Ruta
app.use('/api/auth', require('./routes/auth') ); 
// Ruta Eventos
app.use('/api/events', require('./routes/events') ); 
// Ruta Mensages
app.use('/api/messages', require('./routes/messages'));
// Ruta Services
app.use('/api/services', require('./routes/services'));
 
// Tarea cron para eliminar servicios antiguos a medianoche
cron.schedule('0 0 * * *', async () => {
    console.log('Ejecutando tarea de eliminación de servicios...');

    const startOfToday = moment().startOf('day').toDate();

    try {
        // Eliminar servicios cuya fecha 'start' sea anterior al inicio del día actual
        const result = await Servicio.deleteMany({
            start: { $lt: startOfToday }
        });
        console.log(`Servicios antiguos eliminados: ${result.deletedCount}`);
    } catch (error) {
        console.error('Error al eliminar servicios antiguos:', error);
    }
});


// Escuchar peticiones
app.listen( process.env.PORT, () => {
    console.log(`Servidor corriendo en puerto ${ process.env.PORT }`);
});



