# config-persistence

This module helps you persist configuration in a Redis database. Read the example below to understand the motivations.

### Install

		npm install config-persistance

### Example

If you need to boot a node.js application with some default values, but then an administration needs to change those values without rebooting the whole application, this module helps you save your configuration in Redis.

### Use

		var db = 2;
		var options = {
			port: 6379,
			host: "localhost"
		}

		var config = new Config(db, options);
		var settings = {
			foo: "bar"
		}
		
		config.init(settings); // initialize with events

		config.on("initialized", function(settings) {
			// do something with the values
		});

		// change the values
		config.set("foo", "Foo is not bar anymore");

		config.on("set:foo", function(value) {
			console.log("Use the name of the key as the event and then get the value");
		});

		config.get("foo", function(err, value) {
			// get the value of foo
		});

		config.get("foo")
		.then(function(value) {
			console.log("Works with promises too");
		})
		.fail(function(err) {
			console.log(err);
		});

