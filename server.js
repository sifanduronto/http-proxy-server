// Import of net module
const net = require("net");
const express = require("express");
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


function createProxyServer(host, port) {
    try {
        const server = net.createServer();
        server.on("error", (err) => {
            console.error(err);
        });
        server.on("close", () => {
            console.error("Client disconnected");
        });
        server.listen(
            {
                host: host,
                port: port,
            },
            () => {
                server.on("connection", (clientToProxySocket) => {
                    clientToProxySocket.once("data", (data) => {
                        let isTLSConnection = data.toString().indexOf("CONNECT") !== -1;

                        let serverPort = 80;
                        let serverAddress;
                        if (isTLSConnection) {
                            serverPort = 443;
                            serverAddress = data
                                .toString()
                                .split("CONNECT")[1]
                                .split(" ")[1]
                                .split(":")[0];
                        } else {
                            serverAddress = data.toString().split("Host: ")[1].split("\r\n")[0];
                        }
                        let proxyToServerSocket = net.createConnection(
                            {
                                host: serverAddress,
                                port: serverPort,
                            },
                            () => {
                                console.log("Proxy to server set up");
                            }
                        );
                        proxyToServerSocket.on("error", (err) => {

                            console.error(err);
                        });
                        clientToProxySocket.on("error", (err) => {

                            console.error(err)
                        });

                    })
                });
            }
        );
    }
    catch (exception){
        console.erorr(exception)
    }
}
app.post("/login", (req, res) => {
    if (req.body.user == "sifan" && req.body.pass == "testing") {
        createProxyServer('0.0.0.0', '8081')
        res.statusCode = 201
        res.send({ message: "Proxy Server Created" })
    }
    else {
        res.statusCode = 400
        res.send({ message: "Could not create proxy Server" })
    }
})
app.listen(3000);

