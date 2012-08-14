var db;
var watchID = null;
var uid;
var tt = "";
var gis;
var gps = false;
var timeOut = 0;
var gpsCheck;
var gpsFlag;

function onLoad(){
  
  // Wait for PhoneGap to load
  document.addEventListener("deviceready", onDeviceReady, false);
  $("#stat").html("Standby");
}
$(document).ready(function(){
  
  $.blockUI({
    message : '<h4><img src="images/ajax-loader.gif" /><br/>Loading Database...</h4>',
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
  $("#stop").hide();
});
$("#start").bind("click", function(event, ui){
  
 // if (gis == "now") {
    
    $("#start").hide();
    $("#stop").show();
    
    $.mobile.showToast("Starting GPS", 2000, function(){
      gps = true
      
      $("#stat").empty().html("<img src='images/initialising.gif' /><br/>GPS initializing...");
    });
    
  //} else {
  ////  alert("GPS Not Ready, Please Wait!");
  //}
});

$("#stop").bind("click", function(event, ui){
  
  $("#stop").hide();
  $("#start").show();
  
  $.mobile.showToast("Stopping", 2000, function(){
    gps = false;
    $("#stat").empty().html("<img src='images/off.gif' /><br/>Stopped");
  });
  
  
});
$("#upload").live(
    "click",
    function(event, ui){
      
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
        alert('Your phone web connection is not working. Please check and Try Again.');
      } else {
        
        if(gps == false) {
          $.blockUI({
            message : '<h4><img src="images/ajax-loader.gif" /><br/>Checking Connection...</h4>',
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
          
        checkDrupalConnec().then(function(){
          $.unblockUI();
          checkDB().then(
              function(n){
                
                $.blockUI({
                  message : '<h4><img src="images/ajax-loader.gif" /><br/>Uploading...</h4>',
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
                
                // count = n;
                loginStatus().then(function(){
                  
                  upload(localStorage.usr);
                }).fail(
                    function(){
                      
                      if (localStorage.usr != "0" && localStorage.psw != "0" && localStorage.usr != undefined
                          && localStorage.psw != undefined) {
                        $.ajax({
                          url : "http://api.geobucket.org/?q=bucket/user/login.json",
                          type : 'post',
                          data : 'username=' + encodeURIComponent(localStorage.usr) + '&password='
                          + encodeURIComponent(localStorage.psw),
                          dataType : 'json',
                          error : function(XMLHttpRequest, textStatus, errorThrown){
                            
                            alert('Failed to login ' + errorThrown);
                          },
                          success : function(data){
                            
                            upload(localStorage.usr);
                          }
                        });
                      } else if (localStorage.anonymous != "0" && localStorage.anonymous != undefined) {
                        upload(localStorage.anonymous);
                      } else {
                    	  
                    	  $('<div>').simpledialog2({
                              mode : 'button',
                              headerText : 'Info...',
                              headerClose : true,
                              buttonPrompt : "You are not logged in. Do you want to upload annonymously?",
                              buttons : {
                                'OK' : {
                                  click : function(){
                                    
                                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, createAnonymous, failanonymousCreate);
                                    upload(localStorage.anonymous);
                                  }
                                },
                                'Cancel' : {
                                  click : function(){
                                    
                                    // logout();
                                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, deleteAnony, failDeleteAnony);
                                    $.mobile.changePage("#page_login", "slide", true, false);
                                    //alert("You must login to upload");
                                  },
                                  icon : "delete",
                                  theme : "b"
                                }
                              }
                            });
                    	  
                        $.unblockUI();
                      }
                    });
              }).fail(function(){
                
                alert("No Data Left In Database.");
                
              });
          
        }).fail(function(){
          $.unblockUI();
          alert("GeoBucket Site is Not Available")
          
        });
      } else{
        alert("Please Stop Tracking Before Uploading.")
      }
        
      }
    });

function checkDrupalConnec(){
  var d = $.Deferred();
  
  $.ajax({
    url: "http://api.geobucket.org/?q=bucket/system/connect.json",
    type: 'post',
    dataType: 'json',
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      d.reject();
      console.log(JSON.stringify(XMLHttpRequest));
      console.log(JSON.stringify(textStatus));
      console.log(JSON.stringify(errorThrown));
    },
    success: function (data) {
      d.resolve();
    }
  });
  return d;
  
}

function upload(username){
  
  var d = $.Deferred();
  var name;
  var data;
  $.blockUI({
    message : '<h4><img src="images/ajax-loader.gif" /><br/>Uploading...</h4>',
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
  createTags().then(function(linestring){
    //alert("Wkt is "+linestring);
    data = linestring.split(";");
    loginStatus().then(function(){
      
      name = localStorage.usr;
    }).fail(function(){
      
      name = "Anonymous";
    });
    sendData(data[1], data[0], username).then(function(){
      countUpload();
      countDB().then(function(rows){
        
        // alert("rows are "+rows);
        if (rows > 0) {
          upload(name);
          countUpload();
          countDB();
        } else {
          alert("Upload Complete");
          $.unblockUI();
        }
      });
      // d.resolve(ig);
    }).fail(function(err){
      
      alert("Data Not Uploaded " + err);
      $.unblockUI();
      // d.reject(err);
    });
  }).fail(function(){
    
    alert("Wkt-LineString not created");
    $.unblockUI();
  });
  /*
   */
  return d;
}
function sendData(id, tags, user){
  
  var d = $.Deferred();
  var title = "GeoBucket " + id;
  // BEGIN: drupal services node create login (warning: don't use https if you
  // don't have ssl setup)
  $.ajax({
    url : "http://api.geobucket.org/?q=bucket/node.json",
    type : 'post',
    data : 'node[type]=geobuckettype&node[title]=' + encodeURIComponent(title) + '&node[language]=und&node[field_gpstrace][und][0][wkt]='
    + encodeURIComponent(tags),
    dataType : 'json',
    error : function(XMLHttpRequest, textStatus, errorThrown){
      
      d.reject(errorThrown);
      // $.unblockUI();
    },
    success : function(data){
      
      d.resolve("Node created ");
      // $.unblockUI();
    }
  });
  // END: drupal services node create
  return d;
}
$("#settings").live("click", function(event, ui){
  
  $.mobile.changePage("#page_login", "slide", true, false);
});
$("#reset").bind("click", function(event, ui){
  
  $.mobile.showToast("Reseting Bucket...", 3000, function(){
    
    loginStatus().then(function(){
      
      logout();
    });
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, deleteAnony, failDeleteAnony);
    clearTable();
    countUpload();
    countDB();
    $.mobile.changePage("#page_home", "slide", true, false);
  });
});
/*
 * $("#page_home").on("pageshow",function(){ if(gis == "now"){ countDB();
 * countUpload();
 *  }
 *  })
 */
$("#check").live("click", function(event, ui){
  
  if ($("#username").val().length > 0 && $("#pass").val().length > 0) {
    var u = $("#username").val();
    var p = $("#pass").val();
    loginStatus().then(function(){
      
      alert("You are already logged in");
    }).fail(function(h){
      
      if (localStorage.usr != "0" && localStorage.psw != "0" && localStorage.usr != undefined && localStorage.psw != undefined) {
        login(localStorage.usr, localStorage.psw);
      } else {
    	  
    	
        login(u, p).then(function(x){
          
          alert(x);
        }).fail(function(h){
          alert(h);
          
        });
      }
    });
  } else {
    alert("Please Enter Username and Password")
  }
});

//PhoneGap is ready
function onDeviceReady(){
  
  $.unblockUI();
  var shortName = 'geoe';
  var version = '1.0';
  var displayName = 'geoe';
  var maxSize = 500000;
  db = openDatabase(shortName, version, displayName, maxSize);
  db.transaction(function(transaction){
    
    transaction.executeSql('CREATE TABLE IF NOT EXISTS gable ' + ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '
        + ' lat FLOAT(8) NOT NULL, lon FLOAT(8) NOT NULL, ' + ' tim INTEGER NOT NULL, submit INTEGER NOT NULL);');
  });
  
  //gis = "now";
  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, readPass, failreadPass);
  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, readAnonymous, failAnonymousread);
  countDB();
  countUpload();
  
  var options = {
      enableHighAccuracy : true,
      //timeout : 5000,
      maximumAge: 4000,
  };
  
  watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
  
  
  gpsCheck = setTimeout(function(){
	  if(timeOut <= 5){
	    alert("Please Check that GPS is On.")
	    //$("#stat").empty().html("StandBy");
	  }
	  
	  
  }, 90000 );
}

//onSuccess Geolocation
function onSuccess(position){
  timeOut = timeOut + 1 ;
  //alert("");
  if(gps == true && position.coords.accuracy <= 3){
  
	  countDB();
	  $("#stat").empty().html("<img src='images/tracking.gif' /><br/>Now tracking...");
	  saveCoords(position.coords.latitude, position.coords.longitude, position.timestamp);
  }
  
}

//onError Callback receives a PositionError object
function onError(error){
  $("#stat").empty().html("Error");
}

function saveCoords(la, lo, ti){
  
  if (la != 0 && lo != 0 && la != "" && lo != "" && la != null && lo != null && la != undefined && lo != undefined
      && ti != undefined) {
    db.transaction(function(transaction){
      
      transaction.executeSql('INSERT INTO gable (lat, lon, tim, submit) VALUES (?, ?, ?, ?);', [ la, lo, ti, 0
                                                                                                 ], function(transaction, result){
        
      }, function(transaction, error){
        
      });
    });
  }
}

function countDB(){
  
  var d = $.Deferred();
  var r = "";
  db.transaction(function(transaction){
    
    transaction.executeSql('SELECT * FROM gable where submit = ?;', [ 0
                                                                      ], function(transaction, result){
      
      r = result.rows.length;
      if (r > 0) {
        $("#savedentries").html(r);
      } else {
        $("#savedentries").html("_");
      }
      d.resolve(r);
    }, function(transaction, error){
      
      alert("Database Error: " + error);
    });
  });
  return d;
}
function countUpload(){
  
  var r = "";
  db.transaction(function(transaction){
    
    transaction.executeSql('SELECT * FROM gable where submit = ?;', [ 1
                                                                      ], function(transaction, result){
      
      r = result.rows.length;
      if (r > 0) {
        $("#entry").html(r);
      } else {
        $("#entry").html("_");
      }
    }, function(transaction, error){
      
      alert("Database Error: " + error);
    });
  });
}
function clearTable(){
  
  db.transaction(function(tx){
    
    tx.executeSql("DELETE FROM gable WHERE submit=?;", [ 1 ], function(transaction, result){
      
    }, function(transaction, error){
      
      alert("Database error Table not Cleared: " + error);
    });
  });
}
(function($, window, undefined){
  
  $.extend($.mobile, {
    showToast : function(message, delay, callback){
      
      var oldMsg = $.mobile.loadingMessage;
      $.mobile.loadingMessage = message;
      $.mobile.showPageLoadingMsg();
      if (delay && delay > 0) {
        setTimeout(function(){
          
          $.mobile.hidePageLoadingMsg();
          $.mobile.loadingMessage = oldMsg;
          if (callback)
            callback();
        }, delay);
      }
    }
  });
})(jQuery, this);
function checkDB(){
  
  var d = $.Deferred();
  var r = "";
  db.transaction(function(transaction){
    
    transaction.executeSql('SELECT * FROM gable where submit = ?;', [ 0
                                                                      ], function(transaction, result){
      
      r = result.rows.length;
      if (r > 0) {
        d.resolve(r);
      } else {
        d.reject(r);
      }
    }, function(transaction, error){
      
      alert("Database Error: " + error);
    });
  });
  return d;
}
function createTags(){
  
  var d = $.Deferred();
  var allTags = '';
  var wkt;
  var timestamp = new Date().valueOf().toString().substring(2);
  checkDB().then(function(count){
    
    if (count >= 100) {
    	
      db.transaction(function(transaction){
        transaction.executeSql('SELECT * FROM gable WHERE submit=? ORDER BY id LIMIT 100 ;', [ 0 ], function(transaction, result){
          
          if (result.rows.length > 1) {
            for ( var i = 0; i < result.rows.length; i++) {
              allTags = allTags + result.rows.item(i).lon + ' ' + result.rows.item(i).lat;
              if (i < (result.rows.length) - 1) {
                allTags = allTags + ',';
              }
              updateRecord(result.rows.item(i).id);
            }
            wkt = "LINESTRING (" + allTags + ");" + timestamp;
          } else if (result.rows.length == 1) {
            for ( var i = 0; i < result.rows.length; i++) {
              allTags = allTags + result.rows.item(i).lon + ' ' + result.rows.item(i).lat;
              updateRecord(result.rows.item(i).id);
            }
            wkt = "POINT (" + allTags + ");" + timestamp;
          }
          d.resolve(wkt);
        }, function(transaction, error){
          
          d.reject(error);
        });
      });
    } else {
      db.transaction(function(transaction){
        
        transaction.executeSql('SELECT * FROM gable WHERE submit=? ORDER BY id;', [ 0 ], function(transaction, result){
          
          if (result.rows.length > 1) {
            for ( var i = 0; i < result.rows.length; i++) {
              allTags = allTags + result.rows.item(i).lon + ' ' + result.rows.item(i).lat;
              if (i < (result.rows.length) - 1) {
                allTags = allTags + ',';
              }
              updateRecord(result.rows.item(i).id);
            }
            wkt = "LINESTRING (" + allTags + ");" + timestamp;
          } else if (result.rows.length == 1) {
            for ( var i = 0; i < result.rows.length; i++) {
              allTags = allTags + result.rows.item(i).lat + ' ' + result.rows.item(i).lon;
              updateRecord(result.rows.item(i).id);
            }
            wkt = "POINT (" + allTags + ");" + timestamp;
          }
          d.resolve(wkt);
        }, function(transaction, error){
          
          d.reject(error);
        });
      });
    }
  });
  return d;
}
//Update record on the fly
function updateRecord(id){
  
  db.transaction(function(tx){
    
    tx.executeSql("UPDATE gable SET submit = ? WHERE id = ?", [ 1, id
                                                                ], null, onDBError);
  });
}
function errorHandler(transaction, error){
  
  alert('Database Error was ' + error.message);
}
function onDBError(transaction, error){
  
  alert('Database Error was ' + error.message);
}
function loginStatus(){
  
  var d = $.Deferred();
  $.ajax({
    url : "http://api.geobucket.org/?q=bucket/system/connect.json",
    type : 'post',
    dataType : 'json',
    error : function(XMLHttpRequest, textStatus, errorThrown){
      
      alert('Failed Connect to Upload Site');
    },
    success : function(data){
      
      var drupal_user = data.user;
      if (drupal_user.uid == 0) {
        // user is not logged in
        d.reject();
      } else { // user is logged in
        d.resolve();
        // alert("logged in");
      }
    }
  });
  return d;
}
function login(name, pass){
  
  var d = $.Deferred();
  $.ajax({
    url : "http://api.geobucket.org/?q=bucket/user/login.json",
    type : 'post',
    data : 'username=' + encodeURIComponent(name) + '&password=' + encodeURIComponent(pass),
    dataType : 'json',
    error : function(XMLHttpRequest, textStatus, errorThrown){
      
      d.reject("Failed to login: " + errorThrown);
    },
    success : function(data){
      
      d.resolve("Login Success");
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, deleteAnony, failDeleteAnony);
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, savePasswords, failsavePass);
      $.mobile.changePage("#page_home", "slide", true, false);
    }
  });
  return d;
}
function logout(){
  
  $.ajax({
    url : "http://api.geobucket.org/?q=bucket/user/logout.json",
    type : 'post',
    dataType : 'json',
    error : function(XMLHttpRequest, textStatus, errorThrown){
      
      alert('Failed to logout ' + errorThrown);
    },
    success : function(data){
      
      localStorage.usr = "0";
      localStorage.psw = "0";
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, clearPasswords, failclearPass);
      alert("Logged out.");
    }
  });
}
function readPass(fileSystem){
  
  fileSystem.root.getFile("passwords.txt", null, readPassFileEntry, failreadPass);
}
function readPassFileEntry(fileEntry){
  
  fileEntry.file(readPassFile, failreadPass);
}
function readPassFile(file){
  
  readPassAsText(file);
}
function readPassAsText(file){
  
  var reader = new FileReader();
  reader.onload = function(evt){
    
    var text = evt.target.result;
    var words = text.split(',');
    localStorage.usr = words[0];
    localStorage.psw = words[1];
    //alert("Read Pass and user: " + words[0] + " and " + words[1]);
  };
  reader.readAsText(file);
}
function failreadPass(evt){
  
  console.log(evt.target.error.code);
  alert("User and Pass Not read");
}
function savePasswords(fileSystem){
  
  fileSystem.root.getFile("passwords.txt", {
    create : true,
    exclusive : false
  }, savePassFileEntry, failsavePass);
}
function savePassFileEntry(fileEntry){
  
  fileEntry.createWriter(savePassFileWriter, failsavePass);
}
function savePassFileWriter(writer){
  
  writer.onwriteend = function(evt){
    
    localStorage.usr = $("#username").val();
    localStorage.psw = $("#pass").val();
  };
  var auth = $("#username").val() + "," + $("#pass").val();
  writer.write(auth);
}
function failsavePass(error){
  
  console.log(error.code);
  alert("User and Pass Not Saved");
  $.unblockUI();
}
function clearPasswords(fileSystem){
  
  fileSystem.root.getFile("passwords.txt", {
    create : true,
    exclusive : false
  }, clearPassFileEntry, failclearPass);
}
function clearPassFileEntry(fileEntry){
  
  fileEntry.createWriter(clearPassFileWriter, failclearPass);
}
function clearPassFileWriter(writer){
  
  writer.onwriteend = function(evt){
    
  };
  var auth = 0 + "," + 0;
  writer.write(auth);
}
function failclearPass(error){
  
  console.log(error.code);
  alert("Error Logging Out, Try again");
  $.unblockUI();
}
function createAnonymous(fileSystem){
  
  fileSystem.root.getFile("anonymous.txt", {
    create : true,
    exclusive : false
  }, anonymousFileEntry, failanonymousCreate);
}
function anonymousFileEntry(fileEntry){
  
  fileEntry.createWriter(anonymousFileWriter, failanonymousCreate);
}
function anonymousFileWriter(writer){
  
  writer.onwriteend = function(evt){
    
    localStorage.anonymous = "anonymous";
  };
  var auth = "anonymous";
  writer.write(auth);
}
function failanonymousCreate(error){
  
  console.log(error.code);
  alert("User and Pass Not Saved");
  $.unblockUI();
}
function readAnonymous(fileSystem){
  
  fileSystem.root.getFile("anonymous.txt", null, gotAnonymous, failAnonymousread);
}
function gotAnonymous(fileEntry){
  
  fileEntry.file(gotAnonymousFile, failAnonymousread);
}
function gotAnonymousFile(file){
  
  readAnonymousText(file);
}
function readAnonymousText(file){
  
  var reader = new FileReader();
  reader.onload = function(evt){
    
    //alert("read annonymous: " + evt.target.result);
    localStorage.anonymous = evt.target.result;
  };
  reader.readAsText(file);
}
function failAnonymousread(evt){
  
  console.log(evt.target.error.code);
  alert("User and Pass Not read");
}
function deleteAnony(fileSystem){
  
  fileSystem.root.getFile("anonymous.txt", {
    create : true,
    exclusive : false
  }, gotDeleteFileEntry, failDeleteAnony);
}
function gotDeleteFileEntry(fileEntry){
  
  fileEntry.createWriter(gotDeleteFileWrite, failDeleteAnony);
}
function gotDeleteFileWrite(writer){
  
  writer.onwriteend = function(evt){
    
    localStorage.anonymous = "0";
  };
  var auth = "0";
  writer.write(auth);
}
function failDeleteAnony(error){
  
  console.log(error.code);
  alert("User and Pass Not Saved");
  $.unblockUI();
}
/*
 * function saveRows(fileSystem){
 * 
 * fileSystem.root.getFile("rowcount.txt", { create : true, exclusive : false },
 * gotRowsFile, failRows); } function gotRowsFile(fileEntry){
 * 
 * fileEntry.createWriter(gotWrite, failAnony); } function gotWrite(writer){
 * 
 * writer.onwriteend = function(evt){
 *  }; var auth = localStorage.savedCount; writer.write(auth); } function
 * failRows(error){
 * 
 * console.log(error.code); alert("User and Pass Not Saved"); $.unblockUI(); };
 */