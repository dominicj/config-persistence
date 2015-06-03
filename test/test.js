var Config = require("../index");
var should = require("should");
var assert = require("assert");
var redis = require("redis");

var db = 0;
var options = {
	port: 6379,
	host: process.env.REDIS_HOST
}

describe("Config Persistance", function() {
	beforeEach(function(done) {
		var client = redis.createClient(options.port, options.host, options);
		client.FLUSHALL(function(err, result) {
			done();
		})
	});

	describe("Instance", function() {
		it("Should test if config is an instance of Config", function(done) {

			var config = new Config(db, options);
			config.should.be.an.instanceOf(Config);
			done();

		});
	});

	describe("Initialize", function() {
		it("Should initialize a config object", function(done) {
			var config = new Config(db, options);
			var settings = {
				foo: "bar"
			}
			config.init(settings);

			config.on("initialized", function() {
				var client = redis.createClient(options.port, options.host, options);
				client.get("foo", function(err, result) {
					result.should.be.a.String;
					result.should.be.equal(settings.foo);
					done();
				});
			});
		});

		it("Should initialize a config object twice and not replace values", function(done) {
			var config = new Config(db, options);
			var settings = {
				foo: "bar"
			}
			
			var client = redis.createClient(options.port, options.host, options);
			client.set("foo", "Is not bar", function(err, result) {
				// when init is run, it should not replace the value of foo
				config.init(settings);
			});
			
			config.on("initialized", function() {
				client.get("foo", function(err, result) {
					result.should.be.a.String;
					result.should.be.equal("Is not bar");
					done();
				});
			});
		});
	});

	describe("Events", function() {
		it("Should listen for event initialize", function(done) {
			var config = new Config(db, options);
			var settings = {
				foo: "bar"
			}
			config.init(settings);

			config.on("initialized", function(results) {
				results.foo.should.be.equal(settings.foo);
				done();
			});
		});
	});

	describe("mset", function() {
		it("Should set a group of keys", function(done) {
			var config = new Config(db, options);
			var settings = {
				foo: "bar"
			}
			config.init(settings);

			config.on("initialized", function(results) {
				var change = {
					foo: "Is not bar anymore",
					redis: "Is awesome"
				}

				config.mset(change);
			});

			config.on("mset", function(res) {
				var client = redis.createClient(options.port, options.host, options);
				client.get("redis", function(err, result) {
					result.should.be.a.String;
					result.should.be.equal("Is awesome");

					client.get("foo", function(err, result) {
						result.should.be.a.String;
						result.should.be.equal("Is not bar anymore");
						done();
					})
				});
			});
		});
	});

	describe("Set", function() {
		it("Should replace an old key", function(done) {
			var config = new Config(db, options);
			var settings = {
				foo: "bar"
			}
			config.init(settings);

			config.on("initialized", function(results) {
				config.set("foo", "Is not bar anymore");
			});

			config.on("set:foo", function(res) {
				var client = redis.createClient(options.port, options.host, options);
				client.get("foo", function(err, result) {
					result.should.be.a.String;
					result.should.be.equal("Is not bar anymore");
					done();
				});
			});
		});
	});

	describe("Get", function() {
		it("Should get a key as a callback", function(done) {
			var config = new Config(db, options);
			var settings = {
				foo: "bar"
			}
			config.init(settings);

			config.on("initialized", function(results) {
				config.get("foo", function(err, value) {
					value.should.be.a.String;
					value.should.be.equal(settings.foo);
					done();
				});
			});
		});

		it("Should get a key as a promise", function(done) {
			var config = new Config(db, options);
			var settings = {
				foo: "bar"
			}
			config.init(settings);

			config.on("initialized", function(results) {
				config.get("foo")
				.then(function(value) {
					value.should.be.a.String;
					value.should.be.equal(settings.foo);
					done();
				});
			});
		});
	});

	describe("Get all", function() {
		it("Should get all keys", function(done) {
			var config = new Config(db, options);
			var settings = {
				foo: "bar",
				zas: "zap",
				xam: "rab"
			}
			config.init(settings);

			config.on("initialized", function(results) {
				config.all()
				.then(function(results) {
					results.should.be.an.Object;
					results.should.have.property("foo", settings.foo);
					results.should.have.property("zas", settings.zas);
					results.should.have.property("xam", settings.xam);
					done();
				});
			});
		});
	});

	describe("Diff", function() {
		it("Should know if a key is modified");
		it("Should know if the settings object is modified");
		it("Should know the difference between two keys");
	});
});





