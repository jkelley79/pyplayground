
const dialog = require('electron').remote.dialog;
const remote = require('electron').remote;
const app = remote.app;

var configuration = require('../app/js/configuration.js');

function checkInput() {
  var path = document.getElementById('pythonpath').value;
  var $alertPane = document.querySelector('.settings .alert');

  configuration.checkPythonPath(path).then(function(result) {
    $alertPane.style.display = 'none';
  }, function(err) {
    $alertPane.style.display = 'block';
  });
};

function openFile() {
  dialog.showOpenDialog({ properties: [ 'openFile'] },
    function (results) {
      if (results && results.length > 0) {
        var path = results[0];
        var pathElement = document.getElementById('pythonpath');
        pathElement.value = path;
        checkInput();
      }
    });
};

function closeSettings(saveConf){
  if (saveConf){
    var pathElement = document.getElementById('pythonpath');
    configuration.saveSettings('pypath', pathElement.value);
  }

  var window = remote.getCurrentWindow();
  window.close();
};


document.addEventListener('DOMContentLoaded', function () {

  var pathElement = document.getElementById('pythonpath');
  if (configuration.readSettings('pypath')) {
    var pypath = configuration.readSettings('pypath');
    pathElement.value = pypath;
  }

  pathElement.addEventListener('keyup', checkInput);
  checkInput();

});
