const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { dbConnection } = require('./database/config' );
const path = require('path');
// const i18next = require('i18next');
// const Backend = require('i18next-fs-backend');
// const middleware = require('i18next-http-middleware');


// Crear el servidor de Express
const app = express();

// // Configurar i18next en el backend
// i18next
//   .use(Backend)  // Cargar traducciones desde archivos locales
//   .use(middleware.LanguageDetector)  // Detectar idioma automáticamente
//   .init({
//     fallbackLng: 'es',  // Idioma por defecto
//     preload: ['es', 'en', 'fr', 'ca'],  // Idiomas soportados
//     backend: {
//       loadPath: './locales/{{lng}}/translation.json',  // Ruta a los archivos de traducción
//     }
//   });

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
 



// Escuchar peticiones
app.listen( process.env.PORT, () => {
    console.log(`Servidor corriendo en puerto ${ process.env.PORT }`);
});



