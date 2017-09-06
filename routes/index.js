var express = require('express');
var moment = require('moment-timezone');
var router = express.Router();
var dbUtil = require('../models/dbUtil.js');
var settings = require('../settings');
var JsonFileTools =  require('../models/jsonFileTools.js');
var path = './public/data/finalList.json';
var path2 = './public/data/test.json';
var unitPath = './public/data/unit.json';
var selectPath = './public/data/select.json';
var hour = 60*60*1000;
var type = 'gps';

function findUnitsAndShowSetting(req,res,isUpdate){
	var obj = {
		"selector": {
		 "category": "device"
		  },
		  "skip": 0
		};
	dbUtil.queryDoc(obj).then(function(value) {
		// on fulfillment(已實現時)
			
			var units = value.docs;
			req.session.units = units;
			
			res.render('setting', { title: 'Setting',
				units:req.session.units,
				user:req.session.user,
				success: null,
				error: null,
			});
			//console.log("#### finalList : "+JSON.stringify(finalList));
		}, function(reason) {
		// on rejection(已拒絕時)
		});
}

module.exports = function(app) {
  app.get('/', function (req, res) {
  	    var now = new Date().getTime();
		var selectObj = JsonFileTools.getJsonFromFile(selectPath);
	    var obj = {
			"selector": {
			 "_id": "finalList"
			  },
			 "skip": 0
		   };
		dbUtil.queryDoc(obj).then(function(value) {
			// on fulfillment(已實現時)
			if(value.docs.length > 0){
				var finalList = value.docs[0];
				delete finalList._id;
				delete finalList._rev;
				var unitObj = JsonFileTools.getJsonFromFile(unitPath);
				
				//console.log('finalList :'+JSON.stringify(finalList));
				if(finalList){
					var keys = Object.keys(finalList);
					console.log('Index finalList :'+keys.length);
					for(var i=0;i<keys.length ;i++){
						console.log( i + ') mac : ' + keys[i] +'=>' + JSON.stringify(finalList[keys[i]]));
						let mTimestamp = new Date(finalList[keys[i]].recv).getTime();
						console.log(i+' result : '+ ((now - mTimestamp )/hour));
						finalList[keys[i]].overtime = true;
						if( ((now - mTimestamp)/hour) < 24 )  {
							finalList[keys[i]].overtime = false;
						}
						finalList[keys[i]].name = '';
						//console.log(i+' keys[i] : '+ keys[i]);
						//console.log(i+' unitObj[keys[i]] : '+ unitObj[keys[i]]);
						if( unitObj[keys[i]] )  {
							finalList[keys[i]].name = unitObj[keys[i]];
						}
					}
				}else{
					finalList = null;
				}
				res.render('index', { title: 'Index',
					success: null,
					error: null,
					finalList:finalList
				});
			}
			//console.log("#### finalList : "+JSON.stringify(finalList));
		  }, function(reason) {
			// on rejection(已拒絕時)
			res.render('index', { title: 'Index',
				success: '',
				error: err.toString(),
				finalList:null
			});
		  });
  });

  app.get('/devices', function (req, res) {
	var mac = req.query.mac;
	var date = req.query.date;
	var option = req.query.option;
	res.render('devices', { title: 'Device',
		devices: null,
		success: "success",
		error: null,
		mac:mac,
		date:date,
		option:option,
	});
  });

  app.get('/setting', function (req, res) {
		console.log('render to setting.ejs');
		findUnitsAndShowSetting(req,res,true);
  });

  app.post('/setting', function (req, res) {
		var	post_mac = req.body.mac;
		var post_name = req.body.name;
		var post_type = req.body.type_option;
		var post_mode = req.body.mode;
		var typeString = req.body.typeString;
		var tmpTime = moment().tz(settings.timezone);
		mDate = tmpTime.format('YYYY-MM-DD HH:mm:ss');
		console.log('mode : '+post_mode);
		
		if(post_mode == 'new'){
			if(	post_mac && post_name && post_mac.length==8 && post_name.length>=1){
				console.log('post_mac:'+post_mac);
				console.log('post_name:'+post_name);
				
				var obj = {
					"category": "device",
					"macAddr": post_mac,
					"name": post_name,
					"type": post_type,
					"typeString": typeString,
					"date": mDate
				   };
				dbUtil.insert(obj).then(function(value) {
					findUnitsAndShowSetting(req,res,true);
				  }, function(reason) {
					req.flash('error', reason);
					return res.redirect('/setting');
				  });
			}
		}else if(post_mode == 'del'){//Delete mode
			post_mac = req.body.postMac;
			var obj = {
				"selector": {
					"category": "device",
					"macAddr": post_mac
				  },
				  "skip": 0
				};
			dbUtil.queryDoc(obj).then(function(value) {
				// on fulfillment(已實現時)
					if( value.docs.length > 0){
						var unit = value.docs[0];
						dbUtil.removeDoc(unit._id,unit._rev).then(function(value) {
								findUnitsAndShowSetting(req,res,false);
								var unitObj = JsonFileTools.getJsonFromFile(unitPath);
								if(unitObj[post_mac]){
									delete unitObj[post_mac];
								}
								JsonFileTools.saveJsonToFile(unitPath,unitObj);
							}, function(reason) {
							    return res.redirect('/setting');
							});
					}
				}, function(reason) {
				    return res.redirect('/setting');
				});
		}else{//Edit mode
			post_mac = req.body.postMac;
			var obj = {
				"selector": {
					"category": "device",
					"macAddr": post_mac
				  },
				  "skip": 0
				};
			var obj2 = {
				"category": "device",
				"macAddr": post_mac,
				"name": post_name,
				"type": post_type,
				"typeString": typeString,
				"date": mDate
				};
			dbUtil.queryDoc(obj).then(function(value) {
				// on fulfillment(已實現時)
					if( value.docs.length > 0){
						var unit = value.docs[0];
						obj2._rev = unit._rev;
						dbUtil.insert(obj2,unit._id).then(function(value) {
								findUnitsAndShowSetting(req,res,false);
								var unitObj = JsonFileTools.getJsonFromFile(unitPath);
								if(unitObj[post_mac]){
									delete unitObj[post_mac];
								}
								JsonFileTools.saveJsonToFile(unitPath,unitObj);
							}, function(reason) {
							    return res.redirect('/setting');
							});
					}
				}, function(reason) {
				    return res.redirect('/setting');
				});
		}
  	});
};