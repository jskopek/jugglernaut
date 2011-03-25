var fs = require("fs");

//load config file
try {
    var config_file_name = process.argv[2] ? process.argv[2] : "defaults.json";
    var config_file_args = JSON.parse(fs.readFileSync("./" + config_file_name))  
} catch(e){
    console.error("Could not load the config file!: ", config_file_name, e.toString());
    process.exit()
};

console.log("config", config_file_args);

var config = module.exports = {
  "server_id": config_file_args.server_id ? config_file_args.server_id : Math.floor( Math.random() * 10000 ),
	"port": config_file_args.port,
	"debug": config_file_args.debug,

  //open = client-side can connect to channel; 
  //redis = only users who can publish to juggernaut:subscribe on redis can connect users (aka server)
	"channel_authentication": config_file_args.channel_authentication,
	"secret": config_file_args.secret
}