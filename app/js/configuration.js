'use strict';
var exec = require('child_process').exec;
var nconf = require('nconf').file({file: getUserHome() + '/pyplayground.json'});

function saveSettings(settingKey, settingValue) {
    nconf.set(settingKey, settingValue);
    nconf.save();
}

function readSettings(settingKey) {
    nconf.load();
    return nconf.get(settingKey);
}

function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function checkPythonPath(path) {
  var pypath = 'python'
  if (path !== undefined && path !== '') {
    pypath = path;
  } else if (readSettings('pypath')) {
    pypath = readSettings('pypath');
  }
  pypath += ' --version'
  var promise = new Promise(function(resolve, reject) {
    exec(pypath, function (error, stdout, stderr) {
      if (error) {
        reject(Error(stderr));
      } else {
        resolve("Success");
      }
    });
  });
  return promise;
};

module.exports = {
    saveSettings: saveSettings,
    readSettings: readSettings,
    checkPythonPath: checkPythonPath
};
