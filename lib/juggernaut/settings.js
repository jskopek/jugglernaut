var settings = module.exports = {
  server_id: Math.floor( Math.random() * 10000 ),
  port: 9000,

  //open = client-side can connect to channel; 
  //redis = only users who can publish to juggernaut:subscribe on redis can connect users (aka server)
  channel_authentication: "redis" 
}