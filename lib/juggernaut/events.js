var redis   = require("./redis");
var Settings = require("./settings");

Events = module.exports = {};

Events.client = redis.createClient();

Events.publish = function(key, value){
  this.client.publish(
    "juggernaut:" + key, 
    JSON.stringify(value)
  );
};

Events.subscribe = function(channel, client) {
  this.publish(
    "subscribe", 
    {
      channel:    channel.name,
      meta:       client.meta,
      credential_str: client.credential_str,
      server_id:  Settings.server_id //used to identify which server sent message, so sender can ignore
    }
  );
};

Events.unsubscribe = function(channel, client) {
  this.publish(
    "unsubscribe",
    {
      channel:    channel.name,
      meta:       client.meta,
      credential_str: client.credential_str,
      server_id:  Settings.server_id //used to identify which server sent message, so sender can ignore
    }
  );  
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