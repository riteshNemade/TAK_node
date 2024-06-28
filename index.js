const express = require('express');
const bodyParser = require('body-parser');
const net = require('net');


const app = express();
const port = process.env.LOCAL_SERVER_PORT || 8080;

// Middleware to parse XML body
app.use(bodyParser.text({ type: 'application/xml' }));

let client;

function connectToFreeTAKServer() {
  client = net.createConnection({ port: process.env.TAK_SERVER_PORT, host: process.env.TAK_SERVER_HOST }, () => {
    console.log('Connected to TAK Server!');
  });

  client.on('error', (error) => {
    console.error('TCP Socket error:', error);
  });

  client.on('close', () => {
    console.log('TCP Connection closed');
    // Optionally try to reconnect
    setTimeout(connectToFreeTAKServer, 5000); // Reconnect after 5 seconds
  });

  client.on('data', (data) => {
    console.log('Received from TCP server:', data.toString());
  });
}

connectToFreeTAKServer();

app.post('/send-xml', (req, res) => {
  const xml = req.body;

  if (client && client.readyState === 'open') {
    client.write(xml, (error) => {
      if (error) {
        console.error('Error sending XML data:', error);
        res.status(500).send('Error sending XML data');
      } else {
        console.log('XML data sent');
        res.send('XML data sent');
      }
    });
  } else {
    console.error('TCP client not connected');
    res.status(500).send('TCP client not connected');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
