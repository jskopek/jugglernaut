var sys     = require("sys");
var redis   = require("./redis");
var Message = require("./message");
var Channel = require("./channel");
var Clients = require("./clients");
var config = require("./config");


Publish = module.exports = {};
Publish.listen = function(){
  this.client = redis.createClient();
  this.client.subscribeTo("juggernaut", function(_, data) {
    sys.log("Redis Callback (Message): " + data);
    
    try {
      var message = Message.fromJSON(data);
    } catch(e) { return; }
    
    Channel.publish(message);
  });
  
  this.client.subscribeTo("juggernaut:subscribe", function(_, data) {
    sys.log("Redis Callback (Subscribe): " + data);
    
    try {
      var message = Message.fromJSON(data);
    } catch(e) { return; }
    
    //ignore messages sent by self
    if( message.server_id && (message.server_id == config.server_id) ) {
      return;
    }
    
    client = Clients.find(message.credential_str);
    if( client ) {
      client.subscribe( message.channel )
    }
  });
  
  this.client.subscribeTo("juggernaut:unsubscribe", function(_, data) {
    sys.log("Redis Callback (Unsubscribe): " + data);
    
    try {
      var message = Message.fromJSON(data);
    } catch(e) { return; }

    //ignore messages sent by self
    if( message.server_id && (message.server_id == config.server_id) ) {
      return;
    }
    
    client = Clients.find(message.credential_str);
    if( client ) {
      client.unsubscribe( message.channel )
    }
  });

};