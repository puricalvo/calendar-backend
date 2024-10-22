const moment = require('moment');

const isDateWithoutTime = (value) => {
    if (!value) {
        return false;
    }

    const fecha = moment(value, 'YYYY-MM-DD', true); // El segundo parámetro asegura que solo acepte el formato 'YYYY-MM-DD'
    return fecha.isValid(); // Retorna true si la fecha es válida
};

module.exports = {
    isDateWithoutTime,
};