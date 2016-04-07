'use strict';

var ipc = require("electron").ipcRenderer;
var remote = require('remote');
var Tray = remote.require('tray');
var Menu = remote.require('menu');
var path = require('path');
var exec = require('child_process').exec;
var fs = require('fs');
var configuration = require('../app/js/configuration.js');

const app = remote.app;

var template = [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      },
    ]
  },
  {
    label: 'View',
    submenu: [

      {
        label: 'Toggle Developer Tools',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      },
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
    ]
  }
];

if (process.platform == 'darwin') {
  var name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Preferences',
        click: function() {
          ipc.send('open-settings-window');
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() { app.quit(); }
      },
    ]
  });
  // Window menu.
  template[3].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  );
}

function checkPython() {
    var pypath = 'python'
    if (configuration.readSettings('pypath')) {
      pypath = configuration.readSettings('pypath');
    }
    var $alertPane = document.querySelector('.output-pane .alert');

    configuration.checkPythonPath(pypath).then(function(result) {
        $alertPane.style.display = 'none';
    }, function(err) {
        $alertPane.style.display = 'block';
    });
};


var menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

ipc.on('main-window-focused', function () {
  checkPython();
});

document.addEventListener('DOMContentLoaded', function () {
  checkPython();

  var $editor = document.querySelector('.editor-pane textarea');
  $editor.addEventListener('keydown', keyDownEditor);
  $editor.addEventListener('keyup', keyUpEditor);

});


function keyDownEditor(e) {
    if(e.keyCode === 9) {
        var start = this.selectionStart;
        var end = this.selectionEnd;

        var value = this.value;

        // set textarea value to: text before caret + tab + text after caret
        this.value = value.substring(0, start) + "\t" + value.substring(end);

        // put caret at right position again (add one for the tab)
        this.selectionStart = this.selectionEnd = start + 1;

        // prevent the focus lose
        e.preventDefault();
    }
};

function keyUpEditor() {
    var contents = this.value;
    var filepath = path.join(__dirname,"temp.py")
    fs.writeFile(filepath, contents, function (err) {
        if (err) {
          console.error(err);
        }
    });
    var pypath = 'python'
    if (configuration.readSettings('pypath')) {
      pypath = configuration.readSettings('pypath');
    }

    var execstr = pypath + ' ' + filepath
    exec(execstr, function (error, stdout, stderr) {
      var $output = document.querySelector('.output-pane textarea');

      if (error) {
        $output.textContent = stderr;
      } else {
        $output.textContent = stdout;
      }
    });
};
