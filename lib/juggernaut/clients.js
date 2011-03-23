var SuperClass = require("superclass");

Clients = module.exports = new SuperClass;

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
  
  channel_queue: {
    channel_queue_dict: {},
    add: function(credential_str, channel_str) {
      var channel_list = this.channel_queue_dict[credential_str] ? this.channel_queue_dict[credential_str] : [];
      if( !(channel_str in channel_list) ) {
        channel_list.push(channel_str);
      }
      this.channel_queue_dict[credential_str] = channel_list;
    },
    remove: function(credential_str, channel_str) {
      var channel_list = this.channel_queue_dict[credential_str] ? this.channel_queue_dict[credential_str] : [];
      
      for( var index in channel_list ) {
        if( channel_list[index] == channel_str ) {
          channel_list.pop(index);
        }
      }
      this.channel_queue_dict[credential_str] = channel_list;
    },
    find: function(credential_str) {
      var channel_list = this.channel_queue_dict[credential_str] ? this.channel_queue_dict[credential_str] : [];
      return channel_list;
    }
  }
});