const mongoose    = require('mongoose');
const airport    = require('./models/airport.js');
const route      = require('./models/route.js');
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
      var airport = new airport({
        id          :dataarray[0],
        airportName :dataarray[1],
        city        :dataarray[2],
        country     :dataarray[3],
        lat         :dataarray[4],
        lng         :dataarray[5]
      });
      airport.save(function(err)){
        if(err){
          console.log(err);
          return;
        }
      }
    }
  }
  console.log("Airports saved!");

  //load routes to the DB
  var fs = require('fs');
  var array = fs.readFileSync('routes.txt').toString().split("\n");
  for(i in array) {
    var dataarray = array[i].split(',');

    if(dataarray[0] != null && dataarray[0] != '' && dataarray[0] != '' && dataarray[1] != '' && dataarray[2] != '' && dataarray[3] != ''){
      var route = new route({
        airlineId             :dataarray[0],
        sourceAirportId       :dataarray[1],
        destinationAirportId  :dataarray[2],
        stops                 :dataarray[3]
      });
      route.save(function(err)){
        if(err){
          console.log(err);
          return;
        }
      }
    }
  }
  console.log("Routes saved!");
}
