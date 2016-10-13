/**
 * Created by suncg on 2016/10/13.
 */
var async = require('async');

async.map([1, 2, 3, 4, 5, 6, 7, 8], function (item, cb) {
    // console.info(item);
    if (item == 4) {
        cb('4 is bad');
    } else {
        // cb(null, 'transformed ' + item);
    }
}, function (err, result) {
    console.info('error：' + err);
    console.info('result：' + result);
});












