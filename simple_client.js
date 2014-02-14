

var opcua = require("node-opcua");
var async = require("async");

var client = new opcua.OPCUAClient();

var endpointUrl = "opc.tcp://" + require("os").hostname() + ":4841";

var the_session = null;
async.series([
    // step 1 : connect to
    function(callback)  {
        client.connect(endpointUrl,function (err) {
            if(err) {
                console.log(" cannot connect to endpoint :" , endpointUrl );
            } else {
                console.log("connected !");
            }
            callback(err);
        });
    },
    // step 2 : createSession
    function(callback) {
        client.createSession( function(err,session) {
            if(!err) {
                the_session = session;
            }
            callback(err);
        });

    },
    // step 3 : browse
    function(callback) {

        the_session.browse("RootFolder", function(err,browse_result,diagnostics){
            if(!err) {
                browse_result[0].references.forEach(function(reference) {
                    console.log( reference.browseName);
                });
            }
            callback(err);
        });
    },
    // step 4 : read a variable
    function(callback) {
        the_session.read("ns=2;s=Furnace_1.Temperature", function(err,dataValues,diagnostics) {
            if (!err) {
                console.log(" temperature = " , dataValues[0].value.value);
            }
            callback(err);
        })
    },
],
    function(err) {
        if (err) {
            console.log(" failure ",err);
        } else {
            console.log("done!")
        }
        client.disconnect(function(){});
    }) ;

