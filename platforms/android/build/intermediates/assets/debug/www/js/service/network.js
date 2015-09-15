qaalog.service('network',['$http', 'page', 'config','$q','$timeout', function($http, page,config,$q,$timeout) {
  var $network = this;
  $network.servisePath = 'http://qas.qaalog.com/ExternalDataServices/Data/';
  if (navigator.userAgent.toLocaleLowerCase().indexOf('windows') > -1)
  $network.servisePath = 'http://localhost/proxy/qaalog.php/';
  var userId = false;
  var catalogDB = false;
  var abortBlock = false;
  var cancelerList = [];

  var activeRequests = [];

  $network.setAbortBlock = function(value) {
    abortBlock = value;
  };

  $network.getActiveRequestsCount = function() {
    return activeRequests.length;
  };

  $network.setUserId = function(id) {
    userId = id;
  };
  
  $network.getUserId = function() {
    return userId;
  };
  
  $network.setCatalogDB = function(db) {
    catalogDB = db;
  };
  
  $network.getCatalogDB = function() {
    return catalogDB;
  };

  $network.stopAllHttpRequests = function() {
    //for (var i in cancelerList) {
    //  cancelerList[i].resolve();
    //}
    //cancelerList = [];
  };

  $network.getConnection = function() {
    return true;
    var res = true;
    if(navigator == undefined) {
      res = false;
    } else {
      var networkState = navigator.connection.type;
      var states = {};
      states[Connection.UNKNOWN]  = 'unknown';
      states[Connection.ETHERNET] = 'ethernet';
      states[Connection.WIFI]     = 'wifi';
      states[Connection.CELL_2G]  = 'Cell 2G connection';
      states[Connection.CELL_3G]  = '3g';
      states[Connection.CELL_4G]  = '4g';
      states['cellular']          = 'cellular';
  //    states[Connection.NONE]     = 'No network connection';

      res = states[networkState] || false;
    }
    return res;
  };

  var checkAborted = function() {
    activeRequests.pop();
    if (activeRequests.length === 0)  {
      $network.setAbortBlock(false);
    }
  };

  var reGetTimeout = 1000;
  $network.get = function(methodName, params, callback) {
    
    if(!$network.getConnection()) {
      callback(false,{'errorCode':'not_connected', 'errorText':'Connection error. Please check your internet connection and try again.'});
      alert('Please check your internet connection');
      return false;
    }
    
    var path = $network.servisePath+methodName+'?'+$network.serialize(params);
    //console.log('#<<<['+methodName+']',path);
    //var canceler = $q.defer();
    var timeout;
    //cancelerList.push(canceler);
    activeRequests.push(true);
    $http({ 'method': 'get'
          , 'url': path
//        , 'data':  params
          , timeout: 20000//canceler.promise
          })
            .success(function(result, status, headers) {
              //console.log('#>>>['+methodName+']',result);
              callback(true, result);
              activeRequests.pop();
              if (typeof timeout === 'function') timeout.cancel();
            })
            .error(function(data, status, headers, config, statusText) { //return incorrect server status (404 instead of 401)
              if (activeRequests.length === 0)  {
                $network.setAbortBlock(false);
              }
              if (status != 500 && !abortBlock) {
                activeRequests.pop();
                $timeout(function() {
                  if (typeof timeout === 'function') timeout.cancel();

                  if (reGetTimeout > 3000) {
                    reGetTimeout = 1000;
                    callback(false,data);
                    page.hideExtendedHeader();
                    page.hideMenu();
                    page.hideSearch();
                    alert('Server not responding');
                    page.showNoResult('Please check your Internet connection');
                    page.hideLoader();
                    return false;
                  }
                  console.error('ReGet',reGetTimeout);
                  reGetTimeout += 1000;
                  $network.get(methodName, params, callback);

                },reGetTimeout);
                return false;
              }
              //alert('Please check your internet connection');
              //page.goBack();
              checkAborted();
              page.hideLoader();
              callback(false,data);

            });
    timeout = $timeout(function(){
     // canceler.resolve();
    },10);
  };


  $network.getAddressLink = function(address,callback) {

    var path = 'http://maps.google.com/maps/api/geocode/json?address='+address+'&sensor=false';
    console.log('get coords for '+path);

    $http({ 'method': 'get'
          , 'url': path
          , 'dataType': 'json'
          })
          .success(function(data) {
            try {
              console.log('GEO DATA', data.results[0].geometry.location);
              var location = data.results[0].geometry.location;
              var mapsPath = 'http://maps.google.com/maps?q=loc:' + location.lat + ',' + location.lng;
              callback(mapsPath);
            } catch(e) {
              callback(false);
            }
          })
  };
  

  
  $network.getGeoPosition = function(callback) {
    callback = callback || function(){};
    if (!navigator.geolocation) {
      console.log('no geolocation');
      callback(false);
      return false;
    };
    
    var onSuccess = function(position) {
      callback(true,position.coords);
    };
    var onError = function(error) {
      console.error(error);
      callback(false);
    };
    navigator.geolocation.getCurrentPosition(onSuccess, onError,{timeout: 5000, enableHighAccuracy: true});
  };
  
  
  $network.serialize = function(obj, prefix) {
    var str = [];
    for(var p in obj) {
      if (obj.hasOwnProperty(p)) {
        var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
        str.push(typeof v == "object" ?
          serialize(v, k) :
          encodeURIComponent(k) + "=" + encodeURIComponent(v));
      }
    }
    return str.join("&");
  };

}]);
