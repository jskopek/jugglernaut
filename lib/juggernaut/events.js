var redis   = require("./redis");
var config = require("./config");

Events = module.exports = {};

Events.client = redis.createClient();

Events.publish = function(key, value){
  this.client.publish(
    "juggernaut:" + key, 
    JSON.stringify(value)
  );
};

Events.subscribe = function(args) {
/*  {
    REQ:
    channel:    
    credential_str: 
    
    OPN'L:
    meta:           
    server_id:  //used to identify which server sent message, so sender can ignore
  }
*/
  if( args["server_id"] == undefined ) {
    args["server_id"] = config.server_id; //server_id is optional
  }
  
  this.publish("subscribe", args );
};

Events.unsubscribe = function(args) {
  /*  {
      REQ:
      channel:    
      credential_str: 

      OPN'L:
      meta:           
      server_id:  //used to identify which server sent message, so sender can ignore
    }
  */
  if( args["server_id"] == undefined ) {
    args["server_id"] = config.server_id; //server_id is optional
  }
  
  this.publish("unsubscribe", args);
};

Events.custom = function(client, data) {  
  this.publish(
    "custom", 
    {
      meta:       client.meta,
      credential_str: client.credential_str,
      data:       data
    }
  );
};

Events.message = function(channel_list, data) {
  msg = {
   "channels": channel_list,
   "data": data
  }
  this.client.publish("juggernaut", JSON.stringify(msg));
}