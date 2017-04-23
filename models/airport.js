const mongoose  = require('mongoose');
const Schema   = mongoose.Schema;

const AirportsSchema = new Schema({
    id          :{
    	type: Number,
      unique: true
    },
    airportName :{
      type: String
    },
    city        :{
      type: String
    },
    country     :{
      type: String
    },
    lat         :{
      type: Number
    },
    lng         :{
      type: Number
    }
});

module.exports =  mongoose.model('airports', AirportsSchema);
