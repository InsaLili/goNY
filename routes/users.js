//var express = require('express');
//var router = express.Router();
///*
// * GET userlist.
// */
//router.get('/locationlist', function(req, res) {
//    var db = req.db;
//    db.collection('locationlist').find().toArray(function (err, items) {
//        res.json(items);
//    });
//});
//
///*
// * POST to adduser.
// */
//router.post('/addnote', function(req, res) {
//    var db = req.db;
//    db.collection('locationlist').insert(req.body, function(err, result){
//        res.send(
//            (err === null) ? { msg: '' } : { msg: err }
//        );
//    });
//});
//
//module.exports = router;
