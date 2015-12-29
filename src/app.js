/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var ajax = require('ajax');
//the one and only menu
var main = new UI.Menu();

var server = 'www.ubs-hainer.com/downloads';
var user = null;
var password = null;

//calls one of the urls defined in the resource file
function callUrl(URL) {
  ajax(
  {
    url: URL
  },
  function(data) {
    // Success!
    console.log('Successfully exectuted loxone REST call!');
  },
  function(error) {
    // Failure!
    console.log('Failed executing loxone REST call!: ' + error + '\n url: ' + URL);
  }
);
}

//builds the correct action url for loxone REST and calls it
function doAction(ctrl) {
  var actionUrl = 'http://' + (user!==null?user+':'+password+'@':'')+ server;
  
  switch(ctrl.type) {
    case "Pushbutton":
      actionUrl += 'sps/io/'+ctrl.name+'/Pulse'; 
      break;
  }
  callUrl(actionUrl);
  
}

//crawls through loxone configuration and searches for favorite controls
function createMenuItems(data) {
  var items = [];
  var ctrls = data.controls;
  
  var ctrl;
  for(ctrl in ctrls) {
    if(ctrls[ctrl].isFavorite) {
      switch(ctrls[ctrl].type) {
        case "Pushbutton":
          var item = {
            title : ctrls[ctrl].name,
            ctrl : ctrls[ctrl]
          };
          items.push(item);
          break;
      }  
    }
  }
  return items;
}

//loads the resources and generates menu items
function loadItems() {
  var configUrl = 'http://' + (user!==null?user+':'+password+'@':'')+ server + '/LoxAPP3.json';
ajax( {
  url : configUrl,
  type : 'json'
},
    function(data) {
      var items = createMenuItems(data);
      items.push({
        title: 'Aktualisieren',
        url : null
      });
     
      main.items(0, items);
     
    },
    function(error) {
  // Failure!
    var card = new UI.Card({
      title: 'Loading Loxone failed'
    });
    card.body('Failed to load config from ' + configUrl);
      card.show();
  }
);
}

//show main menu and wait for action
main.show();
loadItems();

main.on('select', function(e) {
       if(e.item.url !== null) {
         doAction(e.item.ctrl);
       } else {
         loadItems();
       }
});


//configuration block //not working yet
Pebble.addEventListener('showConfiguration', function(e) {
  // Show config page
  Pebble.openURL('http://www.ubs-hainer.com/downloads/configure.html');


Pebble.addEventListener('webviewclosed', function(e) {
  // Decode and parse config data as JSON
   console.log('Event: ', JSON.stringify(e));
  if(e.response) {
    var config_data = JSON.parse(decodeURIComponent(e.response));
    console.log('Config window returned: ', JSON.stringify(config_data));
  
    // Prepare AppMessage payload
    var configDict = {
      'SERVER': config_data.ip,
      'USER': config_data.user,
      'PASSWORD': config_data.password
    };
  
    localStorage.setItem('config', configDict);
  }
});
});

// --------------------------------------------------------
// initialize

Pebble.addEventListener(
  'ready',
  function (/*e*/) {
    console.log('js.ready!');
    var configDict = localStorage.getItem('config');
    if (configDict) {
      console.log('found config');
      server = configDict.SERVER;
      user = configDict.USER;
      password = configDict.PASSWORD;
    }
  }
);
