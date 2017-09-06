var express = require('express');
var moment = require('moment-timezone');
var dbUtil =  require('../models/dbUtil.js');
var listPath = './public/data/finalList.json';
var hour = 60*60*1000;
var JsonFileTools =  require('../models/jsonFileTools.js');
var router = express.Router();

router.route('/devices')

	// create a bear (accessed at POST http://localhost:8080/bears)
	/*.post(function(req, res) {

		var bear = new Bear();		// create a new instance of the Bear model
		bear.name = req.body.name;  // set the bears name (comes from the request)

		bear.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'Bear created!' });
		});

	})*/

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		var mac    = req.query.mac;
		var option = req.query.option;
		var mdate  = req.query.mdate;
		var obj = {
			"selector": {
			 "macAddr": mac
			},
			 "fields" : ["date", "macAddr", "data", "information"],
			 //"limit": 10,
			 "skip": 0
		   };
		if(mac){
			dbUtil.queryDoc(obj).then(function(value) {
				// on fulfillment(已實現時)
				var devices = value.docs;
				return res.json(devices);
			  }, function(reason) {
				// on rejection(已拒絕時)
				return res.send({});
			  })
		}else{
			return res.json({});
		}
	});

router.route('/devices/:mac')

	// get the bear with that id
	.get(function(req, res) {
		var mac    = req.query.mac;
		var option = req.query.option;
		var mdate  = req.query.mdate;
		var obj = {
			"selector": {
			 "macAddr": mac
			},
			 "fields" : ["macAddr", "date", "information."],
			 //"limit": 10,
			 "skip": 0
		   };
		if(mac){
			dbUtil.queryDoc(obj).then(function(value) {
				// on fulfillment(已實現時)
				var devices = value.docs;
				return res.json(devices);
			  }, function(reason) {
				// on rejection(已拒絕時)
				return res.send({});
			  })
		}else{
			return res.json({});
		}
	})

	// update the bear with this id
	.put(function(req, res) {
		/*Bear.findById(req.params.bear_id, function(err, bear) {

			if (err)
				res.send(err);

			bear.name = req.body.name;
			bear.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Bear updated!' });
			});

		});*/
	})

	// delete the bear with this id
	.delete(function(req, res) {
		/*Bear.remove({
			_id: req.params.bear_id
		}, function(err, bear) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});*/
	});

router.route('/lists')

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		var name    = req.query.name;
		//JsonFileTools.saveJsonToFile(listPath,json);
		var finalList = JsonFileTools.getJsonFromFile(listPath);
		return res.json(finalList);
	});

module.exports = router;