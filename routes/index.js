/**
 * Created by mac on 09/04/15.
 */
/* GET Userlist page. */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'GoNY' });
});

router.get('/player', function(req, res){
    res.render('player', {});
});

module.exports = router;

