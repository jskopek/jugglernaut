var sys = require("sys");
var SuperClass = require("superclass");
var Channel    = require("./channel");
var JUtils     = require("jutils");
var Events     = require("./events");
var Clients    = require("./clients");
var Message = require("./message");

Client = module.exports = new SuperClass;

Client.include({
  init: function(conn){
    this.connection = conn;
    this.session_id = this.connection.session_id;
    this.credential_str = JUtils.createUUID();
    Clients.add(this);
    
    //set up a random UUID for the user's initial credential string
    this.authenticate( JUtils.createUUID() );
  },
  
  authenticate: function(credential_str) {
    //called when the client sends a message of type 'authenticate'; sets credential_str to something of their choosing
    this.credential_str = credential_str;
    
    //inform the user of their credential_str via the 'authenticate' message type
    var message = new Message({
      "type": "authenticate",
      "credential_str": credential_str
    });
    this.write(message);    
  },
  
  setMeta: function(value){
    this.meta = value;
  },
  
  event: function(data){
    Events.custom(this, data);
  },
  
  subscribe: function(name){
    sys.log("Client subscribing to: " + name);
    
    var channel = Channel.find(name)
    channel.subscribe(this);

    //inform the user they have been subscribed to a channel
    var message = new Message({
      "type": "subscribed",
      "channel": name
    });
    this.write(message);    
  },
  
  unsubscribe: function(name){
    sys.log("Client unsubscribing from: " + name);

    var channel = Channel.find(name);
    channel.unsubscribe(this);

    //inform the user they have been unsubscribed from a channel
    var message = new Message({
      "type": "unsubscribed",
      "channel": name
    });
    this.write(message);
  },
    
  write: function(message){
    if (message.except) {
      except = JUtils.makeArray(message.except)
      if (except.indexOf(this.credential_str) != -1)
        return false;
    }
    
    this.connection.write(message);
  },
  
  disconnect: function(){
    // Unsubscribe from all channels
    Channel.unsubscribe(this);
    
    //remove user from client list
    Clients.remove(this);
  }
});