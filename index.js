var self = require("sdk/self");
var { ToggleButton } = require("sdk/ui/button/toggle");
var tabs = require('sdk/tabs');
var { Hotkey } = require("sdk/hotkeys");

var toggleState = {};
var workers = {};

var button = ToggleButton({
  id: "show-grids",
  label: "Show Grids",
  icon: "./icon-32.png",
  onChange: toggleGrid
});

var toggleHotKey = Hotkey({
  combo: "accel-alt-g",
  onPress: function() {
    toggleGrid();
  }
});

var activeTab = tabs.activeTab;

tabs.on('activate', function () {
  activeTab = tabs.activeTab;
  button.state('tab', {
    checked: toggleState[activeTab.id]
  });
});

function reset(tab) {
  if (workers[tab.id]) {
    detach(tab);
  }
}

tabs.on('close', reset);
tabs.on('ready', reset);

function detach(tab) {
  if (workers[tab.id]) {
    workers[tab.id].destroy();
  }
  delete workers[tab.id];
  toggleState[tab.id] = false;
  button.state('tab', {checked: false});
}

function attach(tab) {
  if (workers[tab.id]) {
    detach(tab);
  }
  var worker = tab.attach({
    contentScriptFile: "./page-script.js"
  });
  worker.on('detach', function () {
    detach(tab);
  });
  workers[tab.id] = worker;
}

function toggleGrid() {
  var id = activeTab.id;
  toggleState[id] = !toggleState[id];
  button.state('tab', {checked: toggleState[id]});
  if (toggleState[id]) {
    if (id in workers) {
      try {
        workers[id].port.emit('grid', 'show');
      } catch (e) {
        attach(activeTab);
      }
    } else {
      attach(activeTab);
    }
  } else {
    if (workers[id]) {
      workers[id].port.emit('grid', 'hide');
    }
  }
}
