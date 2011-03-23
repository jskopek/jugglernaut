//SOURCE: https://gist.github.com/869781
var httpProxy = require('http-proxy'),
    http = require('http');

// Addresses to use in the round robin proxy
var addresses = [
  {
    host: 'localhost',
    port: 8001
  },
  {
    host: 'localhost',
    port: 8002
  }
];

httpProxy.createServer(function (req, res, proxy) {
  // Get the first location off of the 'queue'.
  var target = addresses.shift();
  
  console.log(target.port, target.host);

  // Proxy to the specified location
  proxy.proxyRequest(target.port, target.host);

  // Push the location to the end of the 'queue'.
  addresses.push(target);
}).listen(8000);

/*
// Create your target server
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('request successfully proxied @ 9000!' + '\n' + JSON.stringify(req.headers, true, 2));
  res.end();
}).listen(9000);

// Create your target server
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('request successfully proxied @ 9001!' + '\n' + JSON.stringify(req.headers, true, 2));
  res.end();
}).listen(9001);*/
