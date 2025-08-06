const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 8080;

// Create a basic HTTP server
const server = http.createServer((req, res) => {
    // This will only be reached for non-WebSocket requests
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Websocket server is running, but this is the HTTP fallback.');
});

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ noServer: true });

// Handle WebSocket connection events
wss.on('connection', ws => {
    console.log('Client connected via WebSocket');
    ws.send('Welcome to the WebSocket server!');

    ws.on('message', message => {
        console.log(`Received message: ${message}`);
        ws.send(`Echo: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// The 'upgrade' event is how the HTTP server transitions to a WebSocket
server.on('upgrade', (request, socket, head) => {
    // Check if the request headers indicate a WebSocket upgrade
    if (request.headers['upgrade'] === 'websocket') {
        console.log('Upgrading connection to WebSocket...');
        // Hand over the connection to the WebSocket server
        wss.handleUpgrade(request, socket, head, ws => {
            wss.emit('connection', ws, request);
        });
    } else {
        // For any other protocol upgrade request, destroy the socket
        socket.destroy();
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
