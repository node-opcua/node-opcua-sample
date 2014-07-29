

var opcua = require("node-opcua");
var async = require("async");

var client = new opcua.OPCUAClient();

var endpointUrl = "opc.tcp://" + require("os").hostname() + ":1234";

var the_session = null;
var dataValue;
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
        the_session.readVariableValue("ns=2;s=Furnace_1.Temperature", function(err,dataValues,diagnostics) {
            if (!err) {
                console.log(" temperature = " , dataValue=dataValues[0].value.value);
            }
            callback(err);
        })
    },
    // step 5 : write a variable
    function(callback) {
        the_session.writeSingleNode("ns=2;s=Furnace_1.Temperature", { dataType: opcua.DataType.Double, value: dataValue+=1 }, function(err,statusCode) {
            if (!err) {
                console.log(" wrote to Furnace_1.Temperature = " , dataValue, statusCode);
            }
            callback(err);
        });
    },

    // step 6: install a subscription and monitored item while writing to the item
    //
    // -----------------------------------------
    function(callback) {
        async.parallel(
            [
                // create subscription
                function(callback) {

                    the_subscription=new opcua.ClientSubscription(the_session,{
                        requestedPublishingInterval: 1000,
                        requestedLifetimeCount: 10,
                        requestedMaxKeepAliveCount: 2,
                        maxNotificationsPerPublish: 10,
                        publishingEnabled: true,
                        priority: 10
                    });
                    the_subscription.on("started",function(){
                        console.log("subscription started for 10 seconds - subscriptionId=",the_subscription.subscriptionId);
                    }).on("keepalive",function(){
                        console.log("keepalive");
                    }).on("terminated",function(){
                        callback();
                    });
                    setTimeout(function(){
                        the_subscription.terminate();
                    },10000);


                    // install monitored item
                    //
                    var monitoredItem  = the_subscription.monitor({
                        nodeId: opcua.resolveNodeId("ns=2;s=Furnace_1.Temperature"),
                        attributeId: 13
                      //, dataEncoding: { namespaceIndex: 0, name:null }
                    },
                    { 
                        samplingInterval: 100,
                        discardOldest: true,
                        queueSize: 10 
                    });
                    console.log("-------------------------------------");

                    // subscription.on("item_added",function(monitoredItem){
                    //xx monitoredItem.on("initialized",function(){ });
                    //xx monitoredItem.on("terminated",function(value){ });
                    

                    monitoredItem.on("changed",function(value){
                       console.log(" New Value = ",value.toString());
                    });

                },

                function(callback) {
                    setTimeout( function(){
                        the_session.writeSingleNode("ns=2;s=Furnace_1.Temperature", { dataType: opcua.DataType.Double, value: dataValue+=1 }, function(err,statusCode) {
                            if (!err) {
                                console.log(" wrote to Furnace_1.Temperature = " , dataValue, statusCode);
                            }
                            callback(err);
                        });
                    },3000);
                },


            ], callback);

    },

    // ------------------------------------------------
    // closing session
    //
    function(callback) {
        console.log(" closing session");
        the_session.close(function(err){

            console.log(" session closed");
            callback();
        });
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

