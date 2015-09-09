
var app = {
    wrapper: false,
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('DOMContentLoaded', this.resize, false);
        window.onresize = this.resize;
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log('deviceready');
        app.wrapper = document.getElementsByClassName('content-wrapper')[0];
        app.wrapper.style.height = window.innerHeight+'px';
        angular.bootstrap(document, ['qaalog']);
        window.open = cordova.InAppBrowser.open;
        console.log(device);
    },
    
    resize: function () {
      var width = window.innerWidth;
      var body = document.getElementsByTagName("body")[0];
      var size = (width / 640).toFixed(3);
      body.style.fontSize = size + 'em';
    },

    onImgError: function(target) {
      var parent = target.parentElement;
      var rect = parent.getBoundingClientRect();
      if (rect.width <= rect.height) {
        target.style.margin = 0;
        target.src = 'img/error2.png';
        return false;
      }
      target.style.margin = '';
      target.src = 'img/error.png';
      //console.log('error',target);
    }
  }
   
;

app.initialize();

if (navigator.userAgent.toLowerCase().indexOf('windows') > -1) {
  angular.element(document).ready(function() {
    app.wrapper = document.getElementsByClassName('content-wrapper')[0];
    app.wrapper.style.height = window.innerHeight+'px';
    angular.bootstrap(document, ['qaalog']);
  });
}