const mongoose    = require('mongoose');
const airport     = require('./models/airport.js');
const route       = require('./models/route.js');
const recreatedb  = false;

mongoose.connect('mongodb://localhost/airport');

//Creating db from 0
if(recreatedb){
  //load airports to the DB
  var fs = require('fs');
  var array = fs.readFileSync('airports.txt').toString().split("\n");
  for(i in array) {
    var dataarray = array[i].split(',');

    if(dataarray[0] != null && dataarray[0] != '' && dataarray[1] != '' && dataarray[2] != '' && dataarray[3] != '' && dataarray[4] != '' && dataarray[5] != ''){
      var object = new airport({
        id          : parseInt(dataarray[0]),
        airportName : dataarray[1],
        city        : dataarray[2],
        country     : dataarray[3],
        lat         : parseFloat(dataarray[4]),
        lng         : parseFloat(dataarray[5])
      });
      object.save(function(err){
        if(err){
          console.log(err);
          return;
        }
      });
    }
  }
  console.log("Airports saved!");

  //load routes to the DB
  var fs = require('fs');
  var array = fs.readFileSync('routes.txt').toString().split("\n");
  for(i in array) {
    var dataarray = array[i].split(',');

    if(dataarray[0] != null && dataarray[0] != '\N' && dataarray[0] != '\N' && dataarray[1] != '\N' && dataarray[2] != '\N' && dataarray[3] != '\N' && dataarray[1] != '' && dataarray[2] != '' && dataarray[3] != ''){
      var object = new route({
        airlineId             : parseInt(dataarray[0]),
        sourceAirportId       : parseInt(dataarray[1]),
        destinationAirportId  : parseInt(dataarray[2]),
        stops                 : parseInt(dataarray[3])
      });
      object.save(function(err){
        if(err){
          console.log(err);
          return;
        }
      });
    }
  }
  console.log("Routes saved!");
}
