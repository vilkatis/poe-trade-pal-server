const setupClient = require("./poe-client");

let PROTO_PATH = __dirname + '/poe.proto';
let grpc = require('grpc');
let protoLoader = require('@grpc/proto-loader');
let packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });

// The protoDescriptor object has the full package hierarchy
const poe = grpc.loadPackageDefinition(packageDefinition).poe;

function getNotifications(call) {
    const {session_id, query_id} = call.request;

    const handleMessage = (message) => {
        call.write({message});
    };

    const handleError = () => {
        call.end();
    };

    setupClient(session_id, query_id, handleMessage, handleError);
}


function getServer() {
    const server = new grpc.Server();
    server.addService(poe.Poe.service, {
        getNotifications: getNotifications
    });
    return server;
}

const server = getServer();
server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
server.start();
