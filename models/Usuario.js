const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
       type: String,
       required: true,  
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    }
});

module.exports = model('Usuario', UsuarioSchema );