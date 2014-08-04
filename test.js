var startChrome = require("./index");
var fail = function(error) {
    console.log("FAIL", arguments);
}
var killDelayed = function(instance) {
    console.log("PROCESS STARTED ON " + instance.port);
    setTimeout(function() {
        instance.process.kill("SIGTERM");
        console.log("KILLED " + instance.port);
    }, Math.floor(Math.random() * 10000));
};
for (var i=0;i<500;i++) {
    startChrome().then(killDelayed).catch(fail);
}

setTimeout(function() {
    startChrome().then(killDelayed).catch(fail);
}, 1000);
