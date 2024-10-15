const { Schema, model } = require('mongoose');

const MensageSchema = Schema({
 
    
    
    notes: {
        type: String,
        
    },
   
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
 
    
   

});

MensageSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});


module.exports = model('Mensage', MensageSchema );