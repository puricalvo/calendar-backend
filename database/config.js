const mongoose = require('mongoose');



const dbConnection = async() => {

    try {

        await mongoose.connect( process.env.DB_CNN);
        mongoose.set('strictQuery', true);
        console.log('DB Online');
        
    } catch (error) {
       console.log(error);
       throw new Error('Error a la hoar de inicializar base de datos'); 
    }



}  


module.exports = {
    dbConnection,
}
