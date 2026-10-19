
const { Schema, model } = require('mongoose');

const MensageSchema = Schema({
 
    text: {
        type: String,
        required: true
        
    },
   
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    date: {
        type: Date,
        default: Date.now
    },
    readAt: {
        type: Date,
        default: null
    }
 
    
   

});

MensageSchema.index({ recipient: 1, date: -1, _id: -1 });
MensageSchema.index({ user: 1, date: -1, _id: -1 });

MensageSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});


module.exports = model('Mensage', MensageSchema );