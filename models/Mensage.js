
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
    date: {
        type: Date,
        default: Date.now
    }
 
    
   

});

MensageSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});


module.exports = model('Mensage', MensageSchema );