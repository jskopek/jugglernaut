var SuperClass = require("superclass");
var redis   = require("./redis");

Clients = module.exports = new SuperClass;

Clients.redis = redis.createClient();
Clients.extend({
  client_list: [],  
  find: function(credential_str) {
    var index = this._client_list_index(credential_str)
    return index ? this.client_list[index] : undefined;
  },
  remove: function(client) {
    var index = this._client_list_index(client.credential_str);    
    delete this.client_list[index];
    return true;
  },
  add: function(client) {
    if( this.client_list.include(client) ) return;
    this.client_list.push(client);
    return true;
  },
  _client_list_index: function(credential_str) {
    var credential_str_list = this.client_list.map(function(client) { return client.credential_str; });
    var index = credential_str_list.indexOf(credential_str);
    return (index == -1) ? false : index;
  },
  
  channel_store: {
    expires: 120 * 60, //since channels are not cleared in the event of a disconnection (in case the server was dropped), we need a final timeout for when channel info is removed
    add: function(credential_str, channel_str) {
      Clients.redis.sadd("juggernaut:channels__" + credential_str, channel_str);
      Clients.redis.expire("juggernaut:channels__" + credential_str, this.expires);
    },
    remove: function(credential_str, channel_str) {
      Clients.redis.srem("juggernaut:channels__" + credential_str, channel_str);
      Clients.redis.expire("juggernaut:channels__" + credential_str, this.expires);
    },
    subscribe: function(client) {
      //takes a client, finds all the channels that have been stored in the redis server, and connects the client to each
      Clients.redis.smembers("juggernaut:channels__" + client.credential_str, function(i, channel_list) {
        if( channel_list ) {
          for( var index = 0; index <= channel_list.length; index++ ) {
            if( channel_list[index] && channel_list[index].toString ) {
              client.subscribe(channel_list[index].toString());
            }
          }
        }
      });
    }
  }  
});