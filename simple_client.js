

const {
    OPCUAClient,
    resolveNodeId,
    AttributeIds,
    ClientSubscription
} = require("node-opcua");
const async = require("async");

const client = new OPCUAClient({ endpoint_must_exist: false });

const endpointUrl = "opc.tcp://opcuademo.sterfive.com:26543";
const nodeId = "ns=1;s=Temperature";

let theSession = null;
let theSubscription = null;
async.series([


    // step 1 : connect to
    function(callback) {

        client.connect(endpointUrl, function(err) {

            if (err) {
                console.log(" cannot connect to endpoint :", endpointUrl);
            } else {
                console.log("connected !");
            }
            callback(err);
        });
    },
    // step 2 : createSession
    function(callback) {
        client.createSession(function(err, session) {
            if (!err) {
                theSession = session;
            }
            callback(err);
        });

    },
    // step 3 : browse
    function(callback) {

        theSession.browse("RootFolder", function(err, browse_result) {
            if (!err) {
                browse_result.references.forEach(function(reference) {
                    console.log(reference.browseName);
                });
            }
            callback(err);
        });
    },
    // step 4 : read a variable
    function(callback) {
        theSession.readVariableValue(nodeId, function(err, dataValue) {
            if (!err) {
                console.log(" temperature = ", dataValue.toString());
            }
            callback(err);
        })
    },

    // step 5: install a subscription and monitored item
    //
    // -----------------------------------------
    // create subscription
    function(callback) {

        theSubscription = new ClientSubscription(theSession, {
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 1000,
            requestedMaxKeepAliveCount: 20,
            maxNotificationsPerPublish: 10,
            publishingEnabled: true,
            priority: 10
        });
        theSubscription.on("started", function() {
            console.log("subscription started for 2 seconds - subscriptionId=", theSubscription.subscriptionId);
        }).on("keepalive", function() {
            console.log("keepalive");
        }).on("terminated", function() {
            callback();
        });



        setTimeout(function() {
            theSubscription.terminate();
        }, 10000);


        // install monitored item
        //
        const monitoredItem = theSubscription.monitor({
            nodeId: resolveNodeId(nodeId),
            attributeId: AttributeIds.Value
            //, dataEncoding: { namespaceIndex: 0, name:null }
        },
            {
                samplingInterval: 100,
                discardOldest: true,
                queueSize: 10
            });
        console.log("-------------------------------------");

        monitoredItem.on("changed", function(value) {
            console.log(" New Value = ", value.toString());
        });

    },

    // ------------------------------------------------
    // closing session
    //
    function(callback) {
        console.log(" closing session");
        theSession.close(function(err) {
            console.log(" session closed");
            callback();
        });
    },


],
    function(err) {
        if (err) {
            console.log(" failure ", err);
        } else {
            console.log("done!")
        }
        client.disconnect(function() { });
    });

