var chromedriver = require('chromedriver');
var childProcess = require('child_process');
var Q = require("q");
var portscanner = require('portscanner');
var extend = require("extend");
var net = require("net");

// mop: to synchronize parallel starts (otherwise ports are shared when starting up many in parallel)
var currentlyStarting = [];

var start = function(options) {
    options = options || {};
    var defaultOptions = {"minPort": 9001, "maxPort": 9099, "path": "/wd/hub"};
    var settings = extend({}, defaultOptions, options);
    
    var findPort = function() {
        var defer = Q.defer();
        portscanner.findAPortNotInUse(settings.minPort, settings.maxPort, "127.0.0.1", function(error, port) {
            if (error) {
                defer.reject("No available port found in range! Reason: " + error);
            } else {
                defer.resolve(port);
            }
        });
        return defer.promise;
    }

    var startChromeDriver = function(options) {
        var args = ["--port=" + options.port, "--url-base=" + options.path];
        var process = childProcess.spawn(chromedriver.path, args);
        return {"port": options.port
                ,"process": process
               };
    }

    var waitUp = function(chrome) {
        var result = Q.reject();
        
        for (var i=0;i<3;i++) {
            result = result.catch(function(error) {
                var defer = Q.defer();
                setTimeout(function() {
                    defer.reject(error);
                }, 100);
                return defer.promise;
            }).catch(function(error) {
                var defer = Q.defer();
                var client = net.connect(chrome.port, function(err) {
                    client.end();
                    defer.resolve(chrome);
                });
                client.on("error", function(error) {
                    defer.reject(error);
                });
                return defer.promise;
            });
        }
        return result;
    }
    // mop: copy the array as we are immediately changing it
    var currentStart = Q.all(currentlyStarting.slice(0)).then(findPort)
        .then(function(port) {
            return {"host": "127.0.0.1", "port": port, "path": settings.path};
        })
        .then(startChromeDriver)
        .then(waitUp)
        .then(function(instance) {
            // mop: as we are serializing all startups our promise is located at index 0. remove it for the next request so we are not endlessly growing
            currentlyStarting.splice(0, 1);
            return instance;
        })
    currentlyStarting.push(currentStart);

    return currentStart;
}

module.exports = start;
