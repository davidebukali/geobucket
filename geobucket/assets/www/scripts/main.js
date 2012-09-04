var db;
var watchID = null;
var gps = false;
var accuracy;
var acc;
var lineid = 1;
var tempId;
var idStep = 1;
var R = 6371; // earth's radius in km
var accuracy = 20;

$(document).ready(function() {
  $
  .blockUI({
    message : '<h4><img src="images/ajax-loader.gif" /><br/>Loading Database...</h4>',
    css : {
      top : ($(window).height()) / 3 + 'px',
      left : ($(window).width() - 200) / 2
      + 'px',
      width : '200px',
      backgroundColor : '#33CCFF',
      '-webkit-border-radius' : '10px',
      '-moz-border-radius' : '10px',
      color : '#FFFFFF',
      border : 'none'
    }
  });
  
  // Wait for PhoneGap to load
  document.addEventListener("deviceready", onDeviceReady, false);
  $("#stat").html("Standby");
  
  $("#stop").hide();
});

$("#start").live(
    "click",
    function(event, ui) {
      
      $("#start").hide();
      $("#stop").show();
      
      $("#upDiv").hide();
      
      
      gps = true
      if (watchID == null) {
        var options = {
            enableHighAccuracy : true,
            maximumAge : 5000,
            timeout : 5000
        };
        watchID = navigator.geolocation
        .watchPosition(onSuccess,
            onError, options);
      }
      $("#stat")
      .empty()
      .html(
      "<p id='initial'>Please wait, improving GPS Accuracy <a id='acc'></a>...</p>");
      
    });

$("#stop").bind("click", function(event, ui) {
  
  $("#stop").hide();
  $("#start").show();
  
  $("#upDiv").show();
  lineid = lineid + 1;
  
  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, createLine,
      failLineCreate);
  //alert("lineid: "+lineid);
  gps = false;
  clearWatch();
  $("#stat").empty().html("<p id='stopped'>Stopped</p>");
  
  
});

$("#saveSettings").live(
    "click",
    function(event, ui) {
      $.mobile.showToast("Saving...", 1000, function() {
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            saveSettings, failsaveSettings);
      });
      
    });


$("#settings").live("click", function(event, ui) {
  $.mobile.changePage("#page_login", "slide", true, false);
});

$("#about").live("click", function(event, ui) {
  $.mobile.changePage("#page_about", "slide", true, false);
});

$("#page_login").live("pageshow", function(event, ui) {
  if (localStorage.batch != undefined) {
    $("#batch").val(localStorage.batch).slider("refresh");
    
  }
  
});

$("#reset").live(
    "click",
    function(event, ui) {
      
      $.mobile.showToast("Reseting Bucket...", 3000, function() {
        
        loginStatus().then(function() {
          
          logout();
        });
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            deleteAnony, failDeleteAnony);
        clearTable();
        countUpload();
        countDB();
        $.mobile.changePage("#page_home", "slide", true, false);
      });
    });

$("#check").live(
    "click",
    function(event, ui) {
      if ($("#username").val().length > 0
          && $("#pass").val().length > 0) {
            var u = $("#username").val();
            var p = $("#pass").val();
            
            $
            .blockUI({
              message : '<h4><img src="images/ajax-loader.gif" /><br/>Signing In...</h4>',
              css : {
                top : ($(window).height()) / 3 + 'px',
                left : ($(window).width() - 200) / 2
                + 'px',
                width : '200px',
                backgroundColor : '#33CCFF',
                '-webkit-border-radius' : '10px',
                '-moz-border-radius' : '10px',
                color : '#FFFFFF',
                border : 'none'
              }
            });
            
            loginStatus().then(function() {
              
              alert("You are already logged in");
              $.unblockUI();
            }).fail(
                function(h) {
                  
                  if (localStorage.usr != "0"
                    && localStorage.psw != "0"
                      && localStorage.usr != undefined
                      && localStorage.psw != undefined) {
                        login(localStorage.usr,
                            localStorage.psw).then(
                                function(g) {
                                  $.unblockUI();
                                  
                                });
                  } else {
                    
                    login(u, p).then(function(x) {
                      
                      alert(x);
                      $.unblockUI();
                    }).fail(function(h) {
                      alert(h);
                      $.unblockUI();
                      
                    });
                  }
                });
      } else {
        alert("Please Enter Username and Password");
        
      }
    });

$("#upload").live(
    "click",
    function(event, ui) {
      
      var networkState = navigator.network.connection.type;
      var states = {};
      
      states[Connection.UNKNOWN] = 'Unknown connection';
      states[Connection.ETHERNET] = 'Ethernet connection';
      states[Connection.WIFI] = 'WiFi connection';
      states[Connection.CELL_2G] = 'Cell 2G connection';
      states[Connection.CELL_3G] = 'Cell 3G connection';
      states[Connection.CELL_4G] = 'Cell 4G connection';
      states[Connection.NONE] = 'No network connection';
      
      if ((states[networkState] == 'No network connection') || (states[networkState] == 'Unknown connection')) {
        alert('Please check your phone internet connection is working and Try Again.');
      } else {
        
        
        $
        .blockUI({
          message : '<h4><img src="images/ajax-loader.gif" /><br/>Checking Connection...</h4>',
          css : {
            top : ($(window).height()) / 3 + 'px',
            left : ($(window).width() - 200) / 2
            + 'px',
            width : '200px',
            backgroundColor : '#33CCFF',
            '-webkit-border-radius' : '10px',
            '-moz-border-radius' : '10px',
            color : '#FFFFFF',
            border : 'none'
          }
        });
        
        checkDrupalConnec()
        .then(
            function() {
              
              checkDB()
              .then(
                  function(n) {
                    
                    tempId = parseInt(localStorage.line, 10);
                    //alert("tempId is: "+tempId);
                    
                    loginStatus()
                    .then(
                        function() {
                          $.unblockUI();
                          upload(localStorage.usr);
                        })
                        .fail(
                            function() {
                              
                              if (localStorage.usr != "0"
                                && localStorage.psw != "0"
                                  && localStorage.usr != undefined
                                  && localStorage.psw != undefined) {
                                    $
                                    .ajax({
                                      url : "http://api.geobucket.org/?q=bucket/user/login.json",
                                      type : 'post',
                                      data : 'username='
                                        + encodeURIComponent(localStorage.usr)
                                        + '&password='
                                        + encodeURIComponent(localStorage.psw),
                                        dataType : 'json',
                                        error : function(
                                            XMLHttpRequest,
                                            textStatus,
                                            errorThrown) {
                                              
                                              alert('Failed to login '
                                                  + errorThrown);
                                        },
                                        success : function(
                                            data) {
                                              
                                              upload(localStorage.usr);
                                        }
                                    });
                              } else if (localStorage.anonymous != "0"
                                && localStorage.anonymous != undefined) {
                                  upload(localStorage.anonymous);
                              } else {
                                
                                $(
                                '<div>')
                                .simpledialog2(
                                      {
                                        mode : 'button',
                                        headerText : 'Info...',
                                        headerClose : true,
                                        buttonPrompt : "You are not logged in. Do you want to upload annonymously?",
                                        buttons : {
                                          'OK' : {
                                            click : function() {
                                              
                                              window
                                              .requestFileSystem(
                                                  LocalFileSystem.PERSISTENT,
                                                  0,
                                                  createAnonymous,
                                                  failanonymousCreate);
                                              upload(localStorage.anonymous);
                                            }
                                          },
                                          'Cancel' : {
                                            click : function() {
                                              window
                                              .requestFileSystem(
                                                  LocalFileSystem.PERSISTENT,
                                                  0,
                                                  deleteAnony,
                                                  failDeleteAnony);
                                              $.mobile
                                              .changePage(
                                                  "#page_login",
                                                  "slide",
                                                  true,
                                                  false);
                                            },
                                            icon : "delete",
                                            theme : "b"
                                          }
                                        }
                                      });
                                
                                $
                                .unblockUI();
                              }
                            });
                  })
                  .fail(
                      function() {
                        
                        alert("No Data Left In Database.");
                        $.unblockUI();
                        
                      });
              
            }).fail(function() {
              $.unblockUI();
              alert("GeoBucket Site is Not Available")
              
              
            });
        
      }
    });

function checkDrupalConnec() {
  var d = $.Deferred();
  
  $.ajax({
    url : "http://api.geobucket.org/?q=bucket/system/connect.json",
    type : 'post',
    dataType : 'json',
    error : function(XMLHttpRequest, textStatus, errorThrown) {
      d.reject();
      
    },
    success : function(data) {
      d.resolve();
    }
  });
  return d;
  
}

function upload(username) {
  
  var d = $.Deferred();
  var name;
  var data;
  var batchSize;
  
  $
  .blockUI({
    message : '<h4><img src="images/ajax-loader.gif" /><br/>Uploading Traces...</h4>',
    css : {
      top : ($(window).height()) / 3 + 'px',
      left : ($(window).width() - 200) / 2 + 'px',
      width : '200px',
      backgroundColor : '#33CCFF',
      '-webkit-border-radius' : '10px',
      '-moz-border-radius' : '10px',
      color : '#FFFFFF',
      border : 'none'
    }
  });
  if (localStorage.batch != undefined && localStorage.batch != null) {
    batchSize = localStorage.batch;
  } else {
    batchSize = 100;
  }
  
  checkDBLines(tempId).then(function(h){
    createTags(batchSize, h).then(function(linestring) {
      
      data = linestring.split(";"); 
      loginStatus().then(function() {
        
        name = localStorage.usr;
      }).fail(function() {
        
        name = "Anonymous";
      });
      
      //alert("The tags are: "+ data[0]);
      
      sendData(data[1], data[0], username).then(function() {
        countUpload();
        
        countDB().then(function(rows) {
          
          if (rows > 0) {
            checkDBLines(tempId).then(function(){
              upload(name);
              countUpload();
              countDB();
              //alert("inside success TempId is: "+tempId);
              
            }).fail(function(){
              tempId =  tempId - 1;
              upload(name);
              countUpload();
              countDB();
              //alert("inside fail TempId is: "+tempId);
            });
            
          } else {
            alert("Upload Complete");
            $.unblockUI();
          }
        });
        
        
      }).fail(function(err) {
        
        alert("Data Not Uploaded, " + err);
        $.unblockUI();
        
      });
      
    }).fail(function(v) {
      alert("Wkt-LineString not created");
      $.unblockUI(); 
      
      
    });
    
    
    
  }).fail(function(v) {
    
    countDB().then(function(rows) {
      
      if (rows > 0) {
        tempId =  tempId - 1;
        upload(name);
       // alert("fail checkDb tempid is: "+tempId);
        
      } else {
        alert("Upload Complete");
        $.unblockUI();
      }
    });
    
    
  });
  
  
  return d;
}
function (id, tags, user) {
  
  var d = $.Deferred();
  var title = "GeoBucket " + id;
  // BEGIN: drupal services node create login (warning: don't use https if you
  // don't have ssl setup)
  $.ajax({
    url : "http://api.geobucket.org/?q=bucket/node.json",
    type : 'post',
    data : 'node[type]=geobuckettype&node[title]='
      + encodeURIComponent(title)
      + '&node[language]=und&node[field_gpstrace][und][0][wkt]='
      + encodeURIComponent(tags),
      dataType : 'json',
      error : function(XMLHttpRequest, textStatus, errorThrown) {
        
        d.reject(errorThrown);
        
      },
      success : function(data) {
        
        d.resolve("Node created ");
        
      }
  });
  // END: drupal services node create
  return d;
}


//PhoneGap is ready
function onDeviceReady() {
  
  $.unblockUI();
  var shortName = 'geoe';
  var version = '1.0';
  var displayName = 'geoe';
  var maxSize = 500000;
  db = openDatabase(shortName, version, displayName, maxSize);
  db.transaction(function(transaction) {
    
    transaction.executeSql('CREATE TABLE IF NOT EXISTS gable '
        + ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '
        + ' lat FLOAT(8) NOT NULL, lon FLOAT(8) NOT NULL, '
        + ' tim INTEGER NOT NULL, submit INTEGER NOT NULL, lineId INTEGER NOT NULL);');
  });
  
  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, readPass,
      failreadPass);
  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, readAnonymous,
      failAnonymousread);
  
  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, readSettings,
      failSettings);
  
  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, readLine,
      failLineread);
  
  tempId = parseInt(localStorage.line, 10);
  
  if(localStorage.line == undefined){
    localStorage.line = 1; 
  }else{
    lineid = parseInt(localStorage.line, 10);
  }
  
  countDB();
  countUpload();
  
  var options = {
      enableHighAccuracy : true,
      timeout : 5000,
      maximumAge : 5000
  };
  
  watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
}

//onSuccess Geolocation
function onSuccess(position) {
  
  if (localStorage.accuracy != undefined && localStorage.accuracy != null) {
    accuracy = localStorage.accuracy;
  } else {
    accuracy = 20;
  }
  
  acc = position.coords.accuracy;
  $("#acc").empty().html("("+acc+"m) to atleast "+accuracy+" meters.");
  
  if (localStorage.lat != undefined && localStorage.lon != undefined) {
   
  if (gps == true && position.coords.accuracy <= accuracy) {
    var m = calcDist(localStorage.lat,position.coords.latitude,localStorage.lon,position.coords.longitude);
    if (m >= 2.0) {
    
    localStorage.lat = position.coords.latitude;
    localStorage.lon = position.coords.longitude;
    
    //alert("The distance is: "+m);
    localStorage.track = true;
    saveCoords(position.coords.latitude, position.coords.longitude,
        position.timestamp, lineid);
    countDB();
    $("#stat")
    .empty()
    .html(
        "<p id='track'>Now Tracking Points...</p>");
    }
    
  }
    
  
  }else{
    
    if (gps == true && position.coords.accuracy <= accuracy) {
      localStorage.lat = position.coords.latitude;
      localStorage.lon = position.coords.longitude;
      
      localStorage.track = true;
      saveCoords(position.coords.latitude, position.coords.longitude,
          position.timestamp, lineid);
      countDB();
      $("#stat")
      .empty()
      .html(
          "<p id='track'>Now Tracking Points...</p>");
      
    }
    
  }
  
}



//onError Callback receives a PositionError object
function onError(error) {
  var gpsoff = "The last location provider was disabled";
  if (error.message == gpsoff) {
    alert("Please Check That GPS Switched is On");
    
    $("#stop").hide();
    $("#start").show();
    
    gps = false;
    clearWatch();
    $("#stat").empty().html("StandBy");
    
  }else if(error.code == error.PERMISSION_DENIED && localStorage.track != undefined){
    lineid = lineid + 1;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, createLine,
        failLineCreate);
    //alert("Error PERMISSION_DENIED: "+error.message+", "+error.code);
    
  }else if(error.message == gpsoff && localStorage.track != undefined){
    lineid = lineid + 1;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, createLine,
        failLineCreate);
    //alert("Error gpsoff: "+error.code);
    
  }
}

//clear the watch that was started earlier
function clearWatch() {
  if (watchID != null) {
    navigator.geolocation.clearWatch(watchID);
    watchID = null;
  }
}


function distance(lat1,lat2,lon1,lon2){
  var dLat = toRad((lat2-lat1));
  var dLon = toRad((lon2-lon1));
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c * 1000;
  return d;
  
}


function toRad(x){
  return x * Math.PI / 180;
}


function calcDist(lat1,lat2,lon1,lon2){
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);
  var lon1 = toRad(lon1);
  var lon2 = toRad(lon2);
  var y = Math.acos(Math.sin(lat1)*Math.sin(lat2) + 
      Math.cos(lat1)*Math.cos(lat2) *
      Math.cos(lon2-lon1)) * R;
  return y * 1000;
  
}


function saveCoords(la, lo, ti, id) {
  
  if (la != 0 && lo != 0 && la != "" && lo != "" && la != null && lo != null
      && la != undefined && lo != undefined && ti != undefined) {
        db
        .transaction(function(transaction) {
          
          transaction
          .executeSql(
              'INSERT INTO gable (lat, lon, tim, submit, lineId) VALUES (?, ?, ?, ?, ?);',
              [ la, lo, ti, 0, id], function(transaction,
                  result) {
                    
              }, function(transaction, error) {
                
              });
        });
  }
}

function countDB() {
  
  var d = $.Deferred();
  var r = "";
  db.transaction(function(transaction) {
    
    transaction.executeSql('SELECT * FROM gable where submit = ?;', [ 0 ],
        function(transaction, result) {
          
          r = result.rows.length;
          if (r > 0) {
            $("#savedentries").html(r);
          } else {
            $("#savedentries").html("_");
          }
          d.resolve(r);
    }, function(transaction, error) {
      
      alert("Database Error: " + error);
    });
  });
  return d;
}
function countUpload() {
  
  var r = "";
  db.transaction(function(transaction) {
    
    transaction.executeSql('SELECT * FROM gable where submit = ?;', [ 1 ],
        function(transaction, result) {
          
          r = result.rows.length;
          if (r > 0) {
            $("#entry").html(r);
          } else {
            $("#entry").html("_");
          }
    }, function(transaction, error) {
      
      alert("Database Error: " + error);
    });
  });
}
function clearTable() {
  
  db.transaction(function(tx) {
    
    tx.executeSql("DELETE FROM gable WHERE submit=?;", [ 1 ], function(
        transaction, result) {
          
    }, function(transaction, error) {
      
      alert("Database error Table not Cleared: " + error);
    });
  });
}
(function($, window, undefined) {
  
  $.extend($.mobile, {
    showToast : function(message, delay, callback) {
      
      var oldMsg = $.mobile.loadingMessage;
      $.mobile.loadingMessage = message;
      $.mobile.showPageLoadingMsg();
      if (delay && delay > 0) {
        setTimeout(function() {
          
          $.mobile.hidePageLoadingMsg();
          $.mobile.loadingMessage = oldMsg;
          if (callback)
            callback();
        }, delay);
      }
    }
  });
})(jQuery, this);

function checkDB() {
  
  var d = $.Deferred();
  var r = "";
  db.transaction(function(transaction) {
    
    transaction.executeSql('SELECT * FROM gable where submit = ?;', [ 0 ],
        function(transaction, result) {
          
          r = result.rows.length;
          if (r > 0) {
            d.resolve(r);
          } else {
            d.reject(r);
          }
    }, function(transaction, error) {
      
      alert("Database Error: " + error);
    });
  });
  return d;
}


function checkDBLines(id) {
  
  var d = $.Deferred();
  var r = "";
  
  db.transaction(function(transaction) {
    
    transaction.executeSql('select * from gable where submit=? and lineId=? order by tim, id;', [ 0, id ],
        function(transaction, result) {
          
          r = result.rows.length;
          if (r > 0) {
            d.resolve(r);
          } else {
            d.reject(r);
          }
          
    }, function(transaction, error) {
      
      alert("Database Error: " + error);
    });
  });
  return d;
}


function createTags(batch, h) {
  var d = $.Deferred();
  var allTags = '';
  var wkt;
  var timestamp = new Date().valueOf().toString().substring(2);
  
  if (h >= batch) {
    
    db
    .transaction(function(transaction) {
      transaction
      .executeSql(
          'SELECT * FROM gable WHERE submit=? and lineId =? ORDER BY tim, id LIMIT '
          + batch + ';',
          [ 0,  tempId],
          function(transaction,
              result) {
                if (result.rows.length > 1) {
                  for ( var i = 0; i < result.rows.length; i++) {
                    allTags = allTags
                    + result.rows
                    .item(i).lon
                    + ' '
                    + result.rows
                    .item(i).lat;
                    if (i < (result.rows.length) - 1) {
                      allTags = allTags
                      + ',';
                    }
                    updateRecord(result.rows
                        .item(i).id);
                  }
                  wkt = "LINESTRING ("
                    + allTags 
                    + ");"
                    + timestamp;
                } else if (result.rows.length == 1) {
                  for ( var i = 0; i < result.rows.length; i++) {
                    allTags = allTags
                    + result.rows
                    .item(i).lon
                    + ' '
                    + result.rows
                    .item(i).lat;
                    updateRecord(result.rows
                        .item(i).id);
                  }
                  wkt = "POINT ("
                    + allTags
                    + ");"
                    + timestamp;
                }
                d.resolve(wkt);
          }, function(
              transaction,
              error) {
                
                d.reject(error);
          });
    });
    
  } else {
    
    db
    .transaction(function(transaction) {
      
      transaction
      .executeSql(
          'SELECT * FROM gable WHERE submit=? and lineId =? ORDER BY tim, id;',
          [ 0, tempId ],
          function(transaction,
              result) {
                
                if (result.rows.length > 1) {
                  for ( var i = 0; i < result.rows.length; i++) {
                    allTags = allTags
                    + result.rows
                    .item(i).lon
                    + ' '
                    + result.rows
                    .item(i).lat;
                    if (i < (result.rows.length) - 1) {
                      allTags = allTags
                      + ',';
                    }
                    updateRecord(result.rows
                        .item(i).id);
                  }
                  wkt = "LINESTRING ("
                    + allTags
                    + ");"
                    + timestamp;
                } else if (result.rows.length == 1) {
                  for ( var i = 0; i < result.rows.length; i++) {
                    allTags = allTags
                    + result.rows
                    .item(i).lat
                    + ' '
                    + result.rows
                    .item(i).lon;
                    updateRecord(result.rows
                        .item(i).id);
                  }
                  wkt = "POINT ("
                    + allTags
                    + ");"
                    + timestamp;
                }
                d.resolve(wkt);
          }, function(
              transaction,
              error) {
                
                d.reject(error);
          });
    });
    
  }
  
  return d;
}
//Update record on the fly
function updateRecord(id) {
  
  db.transaction(function(tx) {
    
    tx.executeSql("UPDATE gable SET submit = ? WHERE id = ?", [ 1, id ],
        null, onDBError);
  });
}
function errorHandler(transaction, error) {
  
  alert('Database Error was ' + error.message);
}
function onDBError(transaction, error) {
  
  alert('Database Error was ' + error.message);
}
function loginStatus() {
  
  var d = $.Deferred();
  $.ajax({
    url : "http://api.geobucket.org/?q=bucket/system/connect.json",
    type : 'post',
    dataType : 'json',
    error : function(XMLHttpRequest, textStatus, errorThrown) {
      
      alert('Failed Connect to GeoBucket Site. Check your internet connection is working');
      $.unblockUI();
    },
    success : function(data) {
      
      var drupal_user = data.user;
      if (drupal_user.uid == 0) {
        // user is not logged in
        d.reject();
      } else { // user is logged in
        d.resolve();
        
      }
    }
  });
  return d;
}
function login(name, pass) {
  
  var d = $.Deferred();
  $.ajax({
    url : "http://api.geobucket.org/?q=bucket/user/login.json",
    type : 'post',
    data : 'username=' + encodeURIComponent(name) + '&password='
    + encodeURIComponent(pass),
    dataType : 'json',
    error : function(XMLHttpRequest, textStatus, errorThrown) {
      
      d.reject("Failed to login: " + errorThrown);
    },
    success : function(data) {
      
      d.resolve("Login Success");
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
          deleteAnony, failDeleteAnony);
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
          savePasswords, failsavePass);
      $.mobile.changePage("#page_home", "slide", true, false);
    }
  });
  return d;
}
function logout() {
  
  $.ajax({
    url : "http://api.geobucket.org/?q=bucket/user/logout.json",
    type : 'post',
    dataType : 'json',
    error : function(XMLHttpRequest, textStatus, errorThrown) {
      
      alert('Failed to logout ' + errorThrown);
    },
    success : function(data) {
      
      localStorage.usr = "0";
      localStorage.psw = "0";
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
          clearPasswords, failclearPass);
      alert("Logged out.");
    }
  });
}
function readPass(fileSystem) {
  
  fileSystem.root.getFile("passwords.txt", null, readPassFileEntry,
      failreadPass);
}
function readPassFileEntry(fileEntry) {
  
  fileEntry.file(readPassFile, failreadPass);
}
function readPassFile(file) {
  
  readPassAsText(file);
}
function readPassAsText(file) {
  
  var reader = new FileReader();
  reader.onload = function(evt) {
    
    var text = evt.target.result;
    var words = text.split(',');
    localStorage.usr = words[0];
    localStorage.psw = words[1];
    // alert("Read Pass and user: " + words[0] + " and " + words[1]);
  };
  reader.readAsText(file);
}
function failreadPass(evt) {
  
  alert("User and Pass Not read");
}
function savePasswords(fileSystem) {
  
  fileSystem.root.getFile("passwords.txt", {
    create : true,
    exclusive : false
  }, savePassFileEntry, failsavePass);
}
function savePassFileEntry(fileEntry) {
  
  fileEntry.createWriter(savePassFileWriter, failsavePass);
}
function savePassFileWriter(writer) {
  
  writer.onwriteend = function(evt) {
    
    localStorage.usr = $("#username").val();
    localStorage.psw = $("#pass").val();
  };
  var auth = $("#username").val() + "," + $("#pass").val();
  writer.write(auth);
}
function failsavePass(error) {
  alert("User and Pass Not Saved");
  $.unblockUI();
}
function clearPasswords(fileSystem) {
  
  fileSystem.root.getFile("passwords.txt", {
    create : true,
    exclusive : false
  }, clearPassFileEntry, failclearPass);
}
function clearPassFileEntry(fileEntry) {
  
  fileEntry.createWriter(clearPassFileWriter, failclearPass);
}
function clearPassFileWriter(writer) {
  
  writer.onwriteend = function(evt) {
    
  };
  var auth = 0 + "," + 0;
  writer.write(auth);
}
function failclearPass(error) {
  alert("Error Logging Out, Try again");
  $.unblockUI();
}
function createAnonymous(fileSystem) {
  
  fileSystem.root.getFile("anonymous.txt", {
    create : true,
    exclusive : false
  }, anonymousFileEntry, failanonymousCreate);
}
function anonymousFileEntry(fileEntry) {
  
  fileEntry.createWriter(anonymousFileWriter, failanonymousCreate);
}
function anonymousFileWriter(writer) {
  
  writer.onwriteend = function(evt) {
    
    localStorage.anonymous = "anonymous";
  };
  var auth = "anonymous";
  writer.write(auth);
}
function failanonymousCreate(error) {
  alert("User and Pass Not Saved");
  $.unblockUI();
}
function readAnonymous(fileSystem) {
  
  fileSystem.root.getFile("anonymous.txt", null, gotAnonymous,
      failAnonymousread);
}
function gotAnonymous(fileEntry) {
  
  fileEntry.file(gotAnonymousFile, failAnonymousread);
}
function gotAnonymousFile(file) {
  
  readAnonymousText(file);
}
function readAnonymousText(file) {
  
  var reader = new FileReader();
  reader.onload = function(evt) {
    
    // alert("read annonymous: " + evt.target.result);
    localStorage.anonymous = evt.target.result;
  };
  reader.readAsText(file);
}
function failAnonymousread(evt) {
  alert("User and Pass Not read");
}
function deleteAnony(fileSystem) {
  
  fileSystem.root.getFile("anonymous.txt", {
    create : true,
    exclusive : false
  }, gotDeleteFileEntry, failDeleteAnony);
}
function gotDeleteFileEntry(fileEntry) {
  
  fileEntry.createWriter(gotDeleteFileWrite, failDeleteAnony);
}
function gotDeleteFileWrite(writer) {
  
  writer.onwriteend = function(evt) {
    
    localStorage.anonymous = "0";
  };
  var auth = "0";
  writer.write(auth);
}
function failDeleteAnony(error) {
  alert("User and Pass Not Saved");
  $.unblockUI();
}

function readSettings(fileSystem) {
  fileSystem.root.getFile("settings.txt", null, readSettingsFileEntry,
      failSettings);
}
function readSettingsFileEntry(fileEntry) {
  
  fileEntry.file(readSettingsFile, failSettings);
}
function readSettingsFile(file) {
  
  readAsText(file);
}
function readAsText(file) {
  
  var reader = new FileReader();
  reader.onload = function(evt) {
    
    //var text = evt.target.result;
    //var words = text.split(',');
    //localStorage.accuracy = words[0];
    localStorage.batch = evt.target.result;
    //alert("Read accuracy and batch size: " + words[0] + " and " + words[1]);
  };
  reader.readAsText(file);
}
function failSettings(evt) {
  alert("Settings Not Read");
}

function saveSettings(fileSystem) {
  fileSystem.root.getFile("settings.txt", {
    create : true,
    exclusive : false
  }, saveSettingsFileEntry, failsaveSettings);
}
function saveSettingsFileEntry(fileEntry) {
  
  fileEntry.createWriter(saveSettingsFileWriter, failsaveSettings);
}
function saveSettingsFileWriter(writer) {
  writer.onwriteend = function(evt) {
    
    //localStorage.accuracy = $("#accuracy").val();
    localStorage.batch = $("#batch").val();
  };
  // var auth = $("#accuracy").val() + "," + $("#batch").val();
  var auth = $("#batch").val();
  //alert("Just wrote; "+auth);
  writer.write(auth);
}
function failsaveSettings(error) {
  //alert("Batch Size Not Saved");
  $.unblockUI();
}

function createLine(fileSystem) {
  
  fileSystem.root.getFile("lineid.txt", {
    create : true,
    exclusive : false
  }, lineFileEntry, failLineCreate);
}
function lineFileEntry(fileEntry) {
  
  fileEntry.createWriter(lineFileWriter, failLineCreate);
}
function lineFileWriter(writer) {
  
  writer.onwriteend = function(evt) {
    
    localStorage.line = lineid;
    //alert("Saved line id: "+lineid);
  };
  var auth = lineid;
  writer.write(auth);
}
function failLineCreate(error) {
  //alert("Line Id Not saved");
  $.unblockUI();
}
function readLine(fileSystem) {
  
  fileSystem.root.getFile("lineid.txt", null, gotLine,
      failLineread);
}
function gotLine(fileEntry) {
  
  fileEntry.file(gotLineFile, failLineread);
}
function gotLineFile(file) {
  
  readLineText(file);
}
function readLineText(file) {
  
  var reader = new FileReader();
  reader.onload = function(evt) {
    
    
    localStorage.line = evt.target.result;
    // alert("read line: "+localStorage.line);
  };
  reader.readAsText(file);
}
function failLineread(evt) {
  //alert("Line Id not read");
}
