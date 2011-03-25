var http     = require("http");
var https    = require("https");
var sys      = require("sys");
var express  = require("express");
var io       = require("socket.io");
var SuperClass = require("superclass");
var Connection = require("./connection");
var Events = require("./events");
var config   = require("./config");

var path = require("path");
var fs   = require("fs");

var credentials = {};
if (path.existsSync("keys/privatekey.pem")) {
  var privateKey  = fs.readFileSync("keys/privatekey.pem", "utf8");
  var certificate = fs.readFileSync("keys/certificate.pem", "utf8");
  credentials = {key: privateKey, cert: certificate};
}

Server = module.exports = new SuperClass;

Server.include({
  init: function(){
    //set up web server
    this.httpServer = express.createServer();
    this.httpServer.use(express.bodyParser());

    this.httpServer.post("/connect_to_channel", function(req, res) {
        var channel_str = req.body.channel;
        var credential_str = req.body.credentials;
        var secret = req.body.secret;

        //check that server's secret string matches configuation's secret
        if( secret != config.secret ) {
            res.send("FAIL");
            return false;
        }

        Events.subscribe({
          channel: channel_str,
          credential_str: credential_str,
          meta: '',
          server_id: 0
        });

        if( config.debug )
            console.log("server-side connectToChannel", channel_str, credential_str);
            
        res.send("OK")
    });

    this.httpServer.post("/disconnect_from_channel", function(req, res) {
        var channel_str = req.body.channel;
        var credential_str = req.body.credentials;
        var secret = req.body.secret;

        //check that server's secret string matches configuation's secret
        if( secret != config.secret ) {
            res.send("FAIL");
            return false;
        }

        if( channel_str == "__all__") {
            //TODO: not really sure how to disconnect from all channels ATM
        } else {
          Events.unsubscribe({
            channel: channel_str,
            credential_str: credential_str,
            meta: '',
            server_id: 0
          });          
        }

        res.send("OK")

        if( config.debug )
            console.log("server-side disconnectFromChannel", channel_str, credential_str);
    });

    this.httpServer.post("/message", function(req, res) {
        var channel_str = req.body.channel;
        var message_str = req.body.message;
        var secret = req.body.secret;

        //check that server's secret string matches configuation's secret
        if( secret != config.secret ) {
            res.send("FAIL");
            return false;
        }

        if( config.debug ) {
            var console_msg_str = ( message_str.length > 250 ) ? message_str.substr(0,250) + "..." : message_str;
            console.log("server-side message", channel_str, console_msg_str);
        }
        
        Events.message([channel_str], message_str);

        res.send("OK")        
    });

    //set up static file server
    this.httpServer.use(express.static("./public"));
    
    //set up socket server
    this.socket = io.listen(this.httpServer);
    this.socket.on("connection", function(stream){ new Connection(stream) });
  },

  listen: function(port){
    port = parseInt(port || config.port || 8080);
    this.httpServer.listen(port);
  }
  
  /*  listen: function(port){},
      init: function() {
        var app = express.createServer();
        app.use(express.bodyParser());
        app.get('/', function(req, res){
            res.send('Hello World');
        });

        app.listen(3000);
      }*/
});