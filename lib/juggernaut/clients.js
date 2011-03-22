var SuperClass = require("superclass");

Clients = module.exports = new SuperClass;

Clients.extend({
  client_dict: {},  
  find: function(session_id) {
    return this.client_dict[session_id];
  },
  remove: function(session_id) {
    delete this.client_dict[session_id];
    return true;
  },
  add: function(client) {
    this.client_dict[client.session_id] = client;
/*    console.log("Clients.add", this.client_dict);*/
    return true;
  },
  
  channel_queue: {
    channel_queue_dict: {},
    add: function(session_id, channel_str) {
      channel_list = this.channel_queue_dict[session_id] ? this.channel_queue_dict[session_id] : [];
      if( !(channel_str in channel_list) ) {
        channel_list.push(channel_str);
      }
      this.channel_queue_dict[session_id] = channel_list;
    },
    remove: function(session_id, channel_str) {
      channel_list = this.channel_queue_dict[session_id] ? this.channel_queue_dict[session_id] : [];
      for( var index in channel_list ) {
        if( channel_list[index] == channel_str ) {
          channel_list.pop(index);
        }
      }
      this.channel_queue_dict[session_id] = channel_list;
    }
  }
});