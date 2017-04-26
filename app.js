const express     = require('express');
const app         = express();
const bodyParser  = require('body-parser');
const mongoose    = require('mongoose');
const async       = require('async');
const graph       = require('directed-graph');
const airport     = require('./models/airport.js');
const route       = require('./models/route.js');
const recreatedb  = false;
const port        = 8080;

app.listen(port,function(){
  console.log('app ready');
});

mongoose.connect('mongodb://localhost/airport');
mongoose.Promise = require('bluebird');

//Creating db from 0
if(recreatedb){
  //load airports to the DB
  var fs = require('fs');
  var error = false;
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
          error = true;
        }
      });
      if(error){
        console.log(dataarray);
        break;
      }
    }
  }
  console.log("Airports saved!");

  //load routes to the DB
  var array = fs.readFileSync('routes.txt').toString().split("\n");
  for(i in array) {
    var dataarray = array[i].split(',');

    if((dataarray[0] != '\\N' && dataarray[1] != '\\N' && dataarray[2] != '\\N' && dataarray[3] != '\\N') && (dataarray[0] != '' && dataarray[1] != '' && dataarray[2] != '' && dataarray[3] != '')){
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


// function getAirportId(name,callback){
//   airport.find({city: {$regex : name, $options:"i"}},function(err, result){
//     if(err){
//       console.log(err);
//       return;
//     }
//     else if(airport.length <= 1){
//       console.log(result);
//       console.log(result[0].id);
//       callback(null, result);
//     }
//     else{
//       for(airportid in result){
//         console.log(result[airportid]);
//       }
//       return result[0].id;
//     }
//   });
// }

var getAirportId = function (name, cb){
  var promise = airport.find({city: {$regex : name, $options:"i"}});

  promise.exec(function (err, airport){
    if(err){
      console.log(err);
    }
    else{
      console.log(airport);
      cb(null, airport[0].id);
    }
  });
}



function getAirportRoutes(airport){
  route.find({sourceAirportId: airport})
    .exec(function(err, routes){
    if(err){
      console.log(err);
      return;
    }
    console.log(routes);
    return routes;
  });
}

function appendRoutesToAirport(aiport, routes){
  airport.push()
}

function getRoutes(sourceAirportName,destinationAirportName){

  var graphA = new graph();

  var sourceAiportId = getAirportId(sourceAirportName,function(err, airportid){
    console.log(airportid);
    getAirportId(sourceAirportName,function(err, airportid){
      console.log(airportid);
    })
    graphA.addVertex(airportid);
    console.log(graphA);
  });


  // var sourceAiportId = getAirportId(sourceAirportName);



  // async.parallel([
  //     function(callback) {
  //       airport.find({city: {$regex : name, $options:"i"}},function(err,result){
  //         console.log(result)
  //         if(result){
  //           return result;
  //         }
  //         else{
  //           return false;
  //         }
  //       }
  //     }
  // ],
  // // optional callback
  // function(err, results) {
  //     console.log(results);
  // });


  // airport.find({city: {$regex : sourceAirportName, $options:"i"}},function(err,result){
  //   // console.log(result)
  //   if(result){
  //     graphA.addVertex(result['0'].id);
  //     airport.find({city: {$regex : destinationAirportName, $options:"i"}},function(err,result2){
  //         if(result2){
  //           // return result2;
  //           graphA.addVertex(result2['0'].id);
  //           console.log(graphA);
  //         }
  //         else{
  //           return false;
  //         }
  //       })
  //   }
  //   else{
  //     return false;
  //   }
  // })

  console.log(graphA);

  //
  // var destinationAirportId  = getAirportId(destinationAirportName);
  // console.log(sourceAirportId)
  // graphA.addVertex(destinationAirportId);
  //
  // var sourceAirportRoutes   = getAirportRoutes(sourceAirportId);
  //
  // console.log("destinationAirportId" + destinationAirportId);
  //
  // for(route in sourceAirportRoutes){
  //   graphA.addVertex(route.destinationAirportId);
  //   graphA.addEdge(route.sourceAirportId);
  //   // if(destinationAirportId == route.destinationAirportId){
  //   //   console.log("Route finded!");
  //   // }
  //   // else{
  //   //   routes = getAirportRoutes(sourceAirportId);
  //   // }
  //
  // }

}

getRoutes('guadalajara','mexico city');
// getAirportRoutes(1804);
