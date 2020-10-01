const {
    OPCUAClient,
    AttributeIds,
    TimestampsToReturn,
    StatusCodes,
    DataType
} = require("node-opcua");

const endpointUrl = "opc.tcp://opcuademo.sterfive.com:26543";
const nodeId = "ns=7;s=Scalar_Simulation_Double";

async function main() {

    try {

        const client = OPCUAClient.create({
            endpoint_must_exist: false,
            connectionStrategy: {
                maxRetry: 2,
                initialDelay: 2000,
                maxDelay: 10 * 1000
            }
        });
        client.on("backoff", () => console.log("retrying connection"));


        await client.connect(endpointUrl);

        const session = await client.createSession();

        const browseResult = await session.browse("RootFolder");

        console.log(browseResult.references.map((r) => r.browseName.toString()).join("\n"));

        const dataValue = await session.read({ nodeId, attributeId: AttributeIds.Value });
        console.log(` value = ${dataValue.value.value.toString()}`);

        // step 5: install a subscription and monitored item
        const subscription = await session.createSubscription2({
            requestedPublishingInterval: 1000,
            requestedLifetimeCount: 100, // 1000ms *100 every 2 minutes or so
            requestedMaxKeepAliveCount: 10,// every 10 seconds
            maxNotificationsPerPublish: 10,
            publishingEnabled: true,
            priority: 10
        });

        subscription
            .on("started", () => console.log("subscription started - subscriptionId=", subscription.subscriptionId))
            .on("keepalive", () => console.log("keepalive"))
            .on("terminated", () => console.log("subscription terminated"));


        const monitoredItem = await subscription.monitor({
            nodeId: nodeId,
            attributeId: AttributeIds.Value
        },
            {
                samplingInterval: 1000,
                discardOldest: true,
                queueSize: 10
            }, TimestampsToReturn.Both);


        monitoredItem.on("changed", (dataValue) =>
            console.log(` value = ${dataValue.value.value.toString()}`));

        await new Promise((resolve) => setTimeout(resolve, 5000));

        await subscription.terminate();

        const statusCode = await session.write({
            nodeId: "ns=7;s=Scalar_Static_Double",
            attributeId: AttributeIds.Value,
            value: {
                statusCode: StatusCodes.Good,
                sourceTimestamp: new Date(),
                value: {
                    dataType: DataType.Double,
                    value: 25.0
                }
            }
        });
        console.log("statusCode = ", statusCode.toString());

        console.log(" closing session");
        await session.close();

        await client.disconnect();
    }
    catch (err) {
        console.log("Error !!!", err);
        process.exit();
    }
}

main();
