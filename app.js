const express     = require('express');
const app         = express();
const bodyParser  = require('body-parser');
const mongoose    = require('mongoose');
const path        = require('path');
const exphbs      = require('express-handlebars');
const dGraph      = require('node-dijkstra');
const _           = require('lodash');
const airport     = require('./models/airport.js');
const route       = require('./models/route.js');
const recreatedb  = false;
const port        = 8080;

app.use(express.static(path.join(__dirname, 'public')));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); //To extended char(UNICODE)

app.listen(port,function(){
  console.log('app ready');
});

mongoose.connect('mongodb://localhost/airport');
mongoose.Promise = require('q').Promise;

//Creating db from 0
if(recreatedb){
  //load airports to the DB
  var fs = require('fs');
  var error = false;
  var array = fs.readFileSync('airports.txt').toString().split("\n");
  for(i in array) {
    var dataarray = array[i].split(',');

    if(dataarray[0] != null && dataarray[0] != '' && dataarray[1] != '' && dataarray[2] != '' && dataarray[3] != '' && dataarray[4] != '' && dataarray[5] != '' && dataarray[6] != ''){
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
        destinationAirportId  : parseInt(dataarray[2])
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

function getAirportId(name){
  return airport.find({city: {$regex : name, $options:"i"}});
}

function getAirportName(id){
  return airport.find({id: id}).select('airportName');
}

function getAirportRoutes(airport){
  return route.find({sourceAirportId: airport});
}

app.get('/',function(req, res){
  res.render('graph');
});

app.get('/getAllAirports',function (req,res){
  airport.find({}).select('id').select('airportName').limit(100)
  .then(function (airports){
    if(airports){
      airports.forEach(function(aiport, index, array){
        route.find({sourceAirportId:aiport.id}).select('sourceAirportId').select('destinationAirportId')
        .then(function (routes){
          if(routes){
            routes.forEach(function(destinationRoutes, index, array){
              route.find({sourceAirportId:destinationRoutes.destinationAirportId}).select('sourceAirportId').select('destinationAirportId')
              .then(function (resDestinationRoutes){
                if(resDestinationRoutes){
                  res.json({"airports": airports,"routes":routes.concat(resDestinationRoutes)});
                }else{
                  console.log("No routes found")
                  res.json({"success":false,"error":"No routes found"})
                }
              },function(error){
                console.log(error)
              })
              .catch(function (err){
                console.log(err);
              })
            });
          }else{
            console.log("No routes found")
            res.json({"success":false,"error":"No routes found"})
          }
        },function(error){
          console.log(error)
        })
        .catch(function (err){
          console.log(err);
        })
      });
    }else{
      console.log("No airports found")
      res.json({"success":false,"error":"No airports found"})
    }
  },function(error){
    console.log(error)
  })
});


// app.post('/getRoutes',function(req, res){
//   var sourceAirportName = req.body.sourceAirport;
//   var destinationAirportName = req.body.destinationAirport;
//
//   var dGraphA = new dGraph();
//   getAirportId(sourceAirportName)
//   .then(function(resSourceAirport){
//     var sourceAiportId = resSourceAirport[0].id;
//     // graphA.addVertex(sourceAiportId);
//
//     getAirportId(destinationAirportName)
//     .then(function(resDestinnationAirport){
//       var destinationAirportId = resDestinnationAirport[0].id;
//       // graphA.addVertex(destinationAirportId);
//
//       //Get routes origin
//       getAirportRoutes(sourceAiportId)
//       .then(function(resSourceAirportRoutes){
//         var routesAirportSource = {};
//         var queue = [];
//         var visited = [];
//         resSourceAirportRoutes.forEach(function(routeSource){
//           routesAirportSource[routeSource.destinationAirportId.toString()] = 1;
//           //add routes to queue
//           // dGraphA.addNode(sourceAiportId.toString(), {[routeSource.destinationAirportId]:1});
//           queue.push(routeSource.destinationAirportId);
//         });
//         dGraphA.addNode(sourceAiportId.toString(),routesAirportSource);
//         //While the queue is empty
//         var i , j;
//         queue.forEach(function(airportToDequeue){
//           resRoutes = [];
//           getAirportRoutes(airportToDequeue)
//           .then(function(resSourceAirportRoutes){
//             queue.shift(airportToDequeue);
//             visited.push(airportToDequeue);
//             routesAirportSource = {};
//             var bool = false;
//             resSourceAirportRoutes.forEach(function(routeSource){
//               routesAirportSource[routeSource.destinationAirportId.toString()] = 1;
//               queue.forEach(function(airportidqueue){
//                 //if airport already on queue
//                 if(routeSource.destinationAirportId != airportidqueue){
//                   bool = true;
//                 }
//               })
//               //airport already visited
//               visited.forEach(function(airportvisited){
//                 if(routeSource.destinationAirportId == airportvisited){
//                   bool = true;
//                 }
//               })
//               if(!bool)
//               queue.push(routeSource.destinationAirportId);
//             });
//             dGraphA.addNode(airportToDequeue.toString(), routesAirportSource);
//             var route = dGraphA.path(sourceAiportId.toString(), destinationAirportId.toString());
//             var routeString = [];
//             if(route){
//               route.forEach(function(resultRoutes){
//                 getAirportName(resultRoutes)
//                 .then(function(resultAirports){
//                   routeString.push(resultAiports[0].airportName);
//                 })
//               })
//               console.log("Path: " + route);
//             }
//             res.json(route.path(sourceAiportId, destinationAirportId));
//           },
//           function(err){
//             console.log(err)
//           })
//         })
//       },
//       function(err){
//         console.log(err)
//       })
//     },
//     function(err){
//       console.log(err)
//     })
//   },
//   function(err){
//     console.log(err)
//   })
// });

app.post('/getRoutes',function(req, res){
  var sourceAirportName = req.body.sourceAirport;
  var destinationAirportName = req.body.destinationAirport;

  var sourceAiportId;
  var destinationAirportId;
  var dourceAirportRoutes;
  var dGraphA = new dGraph();
  getAirportId(sourceAirportName)
  .then(function(resSourceAirport){
    sourceAiportId = resSourceAirport[0].id;
    return getAirportId(destinationAirportName)
  })
  .then(function (resDestinnationAirport){
    destinationAirportId = resDestinnationAirport[0].id;
    return getAirportRoutes(sourceAiportId)
  })
  .then(function(resSourceAirportRoutes){
    sourceAirportRoutes = resSourceAirportRoutes;
    var routesAirportSource = {};
    var queue = [];
    var visited = [];
    resSourceAirportRoutes.forEach(function(routeSource){
      routesAirportSource[routeSource.destinationAirportId.toString()] = 1;
      //add routes to queue
      queue.push(routeSource.destinationAirportId);
    });
    dGraphA.addNode(sourceAiportId.toString(),routesAirportSource);
    var routesArray = [];
    queue.forEach(function(airportToDequeue){
      getAirportRoutes(airportToDequeue)
      .then(function(resSourceAirportRoutes){
        queue.shift(airportToDequeue);
        visited.push(airportToDequeue);
        routesAirportSource = {};
        var bool = false;
        resSourceAirportRoutes.forEach(function(routeSource){
          routesAirportSource[routeSource.destinationAirportId.toString()] = 1;
          queue.forEach(function(airportidqueue){
            //if airport already on queue
            if(routeSource.destinationAirportId != airportidqueue){
              bool = true;
            }
          })
          //airport already visited
          visited.forEach(function(airportvisited){
            if(routeSource.destinationAirportId == airportvisited){
              bool = true;
            }
          })
          if(!bool)
            queue.push(routeSource.destinationAirportId);
        });
        dGraphA.addNode(airportToDequeue.toString(), routesAirportSource);
        var route = dGraphA.path(sourceAiportId.toString(), destinationAirportId.toString());
        if(route){
          if(routesArray.length == 0){
            routesArray.push(route);
            console.log(route);
            console.log('-------------------------');
          }
          else{
            var pushRoute = false;
            routesArray.forEach(function(routeInArray){
              // console.log("routeInArray: " + routeInArray + " route: " + route  + " diference: "+  _.difference(routeInArray,route) );
              if(_.difference(routeInArray,route).length > 0){
                pushRoute = true;
              }
              else{
                pushRoute = false;
              }
            })
            if(pushRoute){
              routesArray.push(route);
              console.log(route);
              console.log('-------------------------');
              pushRoute = false;
            }
          }
        }
        else{
          console.log("Looking for routes!");
        }
      })
      .catch(function(err){
        console.log(err);
      })
    })
  })
  .catch(function(err){
    console.log(err);
  })
});
