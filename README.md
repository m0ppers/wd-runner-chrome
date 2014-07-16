# wd-runner-chrome

Autostarting chromedriver when executing tests

Heavily inspired by dalekjs but without dalekjs ;)

## Usage

    var startChrome = require("wd-runner-chrome");

    startChrome().then(function(instance) {
        // webdriver instance running on some port. startup your favorite webdriver test thingy now (example for wd)
        var browser = wd.promiseChainRemote("http://localhost:" + instance.port + "/wd/hub");
        // instance will contain the process as well so when your test has finished:
        instance.process.kill("SIGTERM");
    });

