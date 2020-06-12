const http = require('http');
const port = process.env.PORT || '3000';
const interval = process.env.INTERVAL || '1000';
const timeout = process.env.TIMEOUT || '3000';

let clientId = 0;

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    const client = ++clientId;

    console.log(`${client}: ${new Date().toUTCString()} CONNECTED`);

    const intervalID = setInterval(() => {
      console.log(`${client}: ${new Date().toUTCString()}`);
    }, interval);

    setTimeout(() => {
      clearInterval(intervalID);
      const time = new Date().toUTCString();
      console.log(`${client}: ${new Date().toUTCString()} DONE`);
      res.end(time);
    }, timeout);
  } else {
    res.end('Method unavailable');
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`The interval is ${interval}`);
  console.log(`The timeout is ${timeout}`);
});