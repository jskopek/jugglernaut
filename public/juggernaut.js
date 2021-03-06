// For sprockets:
//
//= require <json>
//= require <socket_io>

if (typeof window != 'undefined'){
	WEB_SOCKET_SWF_LOCATION = '/WebSocketMain.swf';
}

var Juggernaut = function(options){
  /* 
  events:
  
  this.on("connect", function() {})
  this.on("disconnect", function() {})
  this.on("subscribed", function(channel) {})
  this.on("unsubscribed", function(channel) {})
  this.on("authenticate", function(credential_str) {})
  this.on("private", function(data) {})
  
  this.on("data", function(channel, data) {});
  this.on(channel + ":data", function(data) {});
  this.on("message", function(message) { console.log(message.type, message.xyz)});
  */
  
  this.options = options || {};
  
  this.host = this.options.host || window.location.hostname;
  this.port = this.options.port || 8080;

  this.handlers = {};
  this.state    = "disconnected";
  this.meta     = this.options.meta;

  this.on("connect", this.proxy(this.writeMeta));
  this.on("authenticate", function(credential_str) {
    this.credential_str = credential_str;
  });

  this.socket = new io.Socket(this.host, {rememberTransport: false, port: this.port, secure: this.options.secure});

  this.socket.on("connect",    this.proxy(this.onconnect));
  this.socket.on("message",    this.proxy(this.onmessage));
  this.socket.on("disconnect", this.proxy(this.ondisconnect));
};

// Helper methods
Juggernaut.fn = Juggernaut.prototype;

Juggernaut.fn.connect = function(){
  if (this.state == "connected" || this.state == "connecting") return;

  this.state = "connecting";
  this.socket.connect();
};

Juggernaut.fn.proxy = function(func){
  var thisObject = this;
  return(function(){ return func.apply(thisObject, arguments); });
};

// Public methods

Juggernaut.fn.on = function(name, callback){
  if ( !name || !callback ) return;
  if ( !this.handlers[name] ) this.handlers[name] = [];
  this.handlers[name].push(callback);
};
Juggernaut.fn.bind = Juggernaut.fn.on;

Juggernaut.fn.write = function(message){
  if (typeof message.toJSON == "function")
    message = message.toJSON();

  this.socket.send(message);
};

Juggernaut.fn.authenticate = function(credential_str, callback){
  var connectCallback = this.proxy(function(){
    var message     = new Juggernaut.Message;
    message.type    = "authenticate";
    message.credential_str = credential_str;

    this.write(message);
  });

  this.on("connect", connectCallback);

  if (this.state == "connected")
    connectCallback();
  else {
    this.connect();
  }
};

Juggernaut.fn.subscribe = function(channel, callback){
  if ( !channel ) throw "Must provide a channel";

  this.on(channel + ":data", callback);

  var connectCallback = this.proxy(function(){
    var message     = new Juggernaut.Message;
    message.type    = "subscribe";
    message.channel = channel;

    this.write(message);
  });

  this.on("connect", connectCallback);

  if (this.state == "connected")
    connectCallback();
  else {
    this.connect();
  }
};

Juggernaut.fn.unsubscribe = function(channel) {
  if ( !channel ) throw "Must provide a channel";
  
  var message     = new Juggernaut.Message;
  message.type    = "unsubscribe";
  message.channel = channel;

  this.write(message);
};

// Private

Juggernaut.fn.trigger = function(){
  var args = [];
  for (var f=0; f < arguments.length; f++) args.push(arguments[f]);
  
  var name  = args.shift();

  var callbacks = this.handlers[name];
  if ( !callbacks ) return;

  for(var i=0, len = callbacks.length; i < len; i++)
    callbacks[i].apply(this, args);
};

Juggernaut.fn.writeMeta = function(){
  if ( !this.meta ) return;
  var message     = new Juggernaut.Message;
  message.type    = "meta";
  message.data    = this.meta;
  this.write(message);
};

Juggernaut.fn.onconnect = function(){
  this.sessionID = this.socket.transport.sessionid;
  this.state = "connected";
  this.trigger("connect");
};

Juggernaut.fn.ondisconnect = function(){
  this.state = "disconnected";
  this.trigger("disconnect");

  if ( this.options.reconnect !== false )
    this.reconnect();
};

Juggernaut.fn.onmessage = function(data){
  var message = Juggernaut.Message.fromJSON(data);
  this.trigger("message", message);
  switch( message.type ) {
    case "unsubscribed":
      this.trigger("unsubscribed", message.channel);
    break;    
    case "subscribed":
      this.trigger("subscribed", message.channel);
    break;
    case "authenticate":
      this.trigger("authenticate", message.credential_str)
    break;
    case "private":
      this.trigger("private", message.data);
    break;
    case "channel":
      this.trigger("data", message.channel, message.data);
      this.trigger(message.channel + ":data", message.data);
    break;
    default:
      throw "Unknown type"
  }
};

Juggernaut.fn.reconnect = function(){
  if (this.recInterval) return;

  var clear = function(){
    clearInterval(this.recInterval);
    this.recInterval = null;
  };

  this.recInterval = setInterval(this.proxy(function(){
    if (this.state == "connected") clear()
    else {
      this.trigger("reconnect");
      this.connect();
    }
  }), 3000);
}

Juggernaut.Message = function(hash){
  for (var key in hash) this[key] = hash[key];
};

Juggernaut.Message.fromJSON = function(json){
  return(new this(JSON.parse(json)))
};

Juggernaut.Message.prototype.toJSON = function(){
  var object = {};
  for (var key in this) {
    if (typeof this[key] != "function")
      object[key] = this[key];
  }
  return(JSON.stringify(object));
};