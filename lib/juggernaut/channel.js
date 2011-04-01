var sys = require("sys");
var Events = require("./events");
var Clients = require("./clients");
var SuperClass = require("superclass");

Channel = module.exports = new SuperClass;

Channel.extend({
  channels: {},
  
  find: function(name){
    if ( !this.channels[name] ) 
      this.channels[name] = new Channel(name)
    return this.channels[name];
  },
  
  publish: function(message){
    var channels = message.getChannels();
    delete message.channels;
    
    sys.log(
      "Publishing to channels: " + 
      channels.join(", ") + " : " + message.data
    );
    
    for(var i=0, len = channels.length; i < len; i++) {
      message.channel = channels[i];
      var clients     = this.find(channels[i]).clients;
      
      for(var x=0, len2 = clients.length; x < len2; x++) {
        clients[x].write(message);
      }
    }
  },
  
  unsubscribe: function(client){
    for( var name in this.channels ) {
      this.channels[name].unsubscribe(client, true);
    }
  }
});

Channel.include({
  init: function(name){
    this.name    = name;
    this.clients = [];
  },
  
  subscribe: function(client){
    if( this.clients.include(client) ) return;
    this.clients.push(client);
    
    //store the user's subscription to the channel in the redis datastore, in the event that the server is reset
    //or the user transitions to another server
    Clients.channel_store.add(client.credential_str, this.name);
  },
  
  unsubscribe: function(client, skip_redis){
    if ( !this.clients.include(client) ) return;
    this.clients = this.clients.delete(client);

    //remove the user's subscription to the channel in the redis datastore, in the event that the server is reset
    //or the user transitions to another server
    //The skip_redis flag is passed when Channel.unsubscribe(client) is called; we don't want to remove the user's redis values
    //in case the disconnection was accidental
    if( !skip_redis ) {
        Clients.channel_store.remove(client.credential_str, this.name);
    }
  }
});
