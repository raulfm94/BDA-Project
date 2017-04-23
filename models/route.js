const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;

const RouteSchema = new Schema({
    airlineId             :{
      type: Number
    },
    sourceAirportId       :{
      type: Number
    },
    destinationAirportId  :{
      type: Number
    },
    stops                 :{
      type: Number
    }
});

module.exports =  mongoose.model('route',RouteSchema);
