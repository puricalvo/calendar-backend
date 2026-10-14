const { Schema, model } = require('mongoose');

const ServicioSchema = Schema({

    dayType: {
        type: String,
        enum: ['service', 'rest'],
        default: 'service'
    },
    salCoche: {
        type: String,
        // required: true
    }, 
    hInicio: {
        type: String,
        // required: true
    }, 
    hFinal: {
        type: String,
        // required: true
    }, 
    entCoche: {
        type: String,
        // required: true
    }, 
    autobus: {
        type: Number,
        // required: true
    }, 
    matricula: {
        type: String,
        // required: true
    }, 
    tipoServicio: {
        type: String,
        // required: true
    }, 
    codigo: {
        type: String,
        // required: true
    }, 
    lInicio: {
        type: String,
        // required: true
    }, 
    lFinal: {
        type: String,
        // required: true
    }, 
    observaciones: {
        type: String,
        // required: true
    },
    incidentComment: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    completed: {
        type: Boolean,
        default: false
    },
    start: { 
        type: Date, 
        required: true 
    },
    end: {
        type: Date, 
        required: true 
    },
  
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    date: {
        type: Date,
        default: Date.now
    }

});

ServicioSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

module.exports = model('Servicio', ServicioSchema );