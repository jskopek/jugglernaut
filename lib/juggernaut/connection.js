var sys = require("sys");
var SuperClass = require("superclass");
var Client     = require("./client");
var config     = require("./config");
Connection     = module.exports = new SuperClass;

Connection.include({
  init: function(stream){
    this.stream     = stream;
    this.session_id = this.stream.sessionId;
    this.client     = new Client(this);

    this.stream.on("message", this.proxy(this.onmessage));
    this.stream.on("disconnect", this.proxy(this.ondisconnect));
  },
  
  onmessage: function(data){
    sys.log("Received: " + data);
    
    try {
      var message = Message.fromJSON(data);
    
      switch (message.type){
        case "subscribe":
          if( config.channel_authentication != "open" ) { return; } //only allow client-side subscription if there is no channel authentication
          this.client.subscribe(message.getChannel());
        break;
        case "unsubscribe":
          if( config.channel_authentication != "open" ) { return; } //only allow client-side subscription if there is no channel authentication
          this.client.unsubscribe(message.getChannel());
        break;
        case "meta":
          this.client.setMeta(message.data);
        break;
        case "event":
          this.client.event(message.data);
        break;
        case "authenticate":
          this.client.authenticate(message.credential_str);
        break;
        default:
          throw "Unknown type"
      }
    } catch(e) { 
      sys.error("Error!");
      sys.error(e);
      return; 
    }
  },
  
  ondisconnect: function(){
    this.client.disconnect();
  },
  
  write: function(message){
    if (typeof message.toJSON == "function")
      message = message.toJSON();
    this.stream.send(message);
  }
});