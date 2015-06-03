var events = require("events");
var async = require("async");
var redis = require("redis");
var _ = require("lodash");
var util = require("util");
var Q = require("q");

/**
 * Config Class
 * @param {integer} db      An integer with the number of the database to use
 * @param {object} options A Javascript object with a host, port and any other option needed by redis
 */
function Config(db, options) {
	this.db = db;
	this.client = redis.createClient(options.port, options.host, options);

	this.client.select(db, function(err, result) {

	});

	events.EventEmitter.call(this);
}

util.inherits(Config, events.EventEmitter);

/**
 * Initialize the settings
 * @param  {object} settings A JS object to set, each property will be set
 * @return {event}          Emits the event "initialized" with the settings passed to the method
 */
Config.prototype.init = function init(settings) {
	var self = this;

	this.client.select(this.db, function(err, result) {
		async.forEach(
			Object.keys(settings),
			function(key, next) {
				self.client.set(key, settings[key], function(err, res) {
					return next(err);
				});
			}, 
			function(err) {
				return self.emit("initialized", settings);
			}
		);
	});
}

/**
 * Sets a key with a given value, if the value exists, it will be replaced
 * @param {string} key   The key to set
 * @param {string} value The value to set, it can be a number or a JSON object to
 * @return {event} This method will return an event set:key where key is the name of the key
 */
Config.prototype.set = function set(key, value) {
	var self = this;
	self.client.set(key, value, function(err, result) {
		return self.emit("set:" + key, result);
	});
}

/**
 * Get a key
 * @param  {string}   key  The name of the key to get
 * @param  {Function} next An optional callback to execute 
 * @return {String}        The value of the key
 */
Config.prototype.get = function get(key, next) {
	var d = Q.defer();
	var self = this;

	self.client.get(key, function(err, reply) {
		if(err) d.reject(err);
		else {
			d.resolve(reply);
		}
	});

	d.promise.nodeify(next);
	return d.promise;
}

/**
 * Get all keys of the current database
 * @param  {Function} next An optional callback to execute
 * @return {Object}        A Javascript Object with all the keys and values
 */
Config.prototype.all = function all(next) {
	var d = Q.defer();
	var self = this;

	self.client.keys("*", function(err, reply) {
		if(err) d.reject(err);
		else {
			var result = {};
			async.each(reply, function(key, callback) {
				self.client.get(key, function(err, value) {
					result[key] = value;
					callback(err);
				})
			}, function() {
				d.resolve(result);
			})
		}
	});

	d.promise.nodeify(next);
	return d.promise;
}

/**
 * Todo
 * @param  {[type]}   key  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
Config.prototype.diff = function diff(key, next) {

}

module.exports = Config;