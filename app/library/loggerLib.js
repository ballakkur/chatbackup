'use strict'

var pino = require('pino')();
var moment = require('moment');

let info = (message,origin,importance) => {
    let date = moment();
    let timeStamp = date.format('Do MMM YYYY  hh:m:s a');
    let obj = {
        timeStamp,
        message,
        origin,
        importance
    }
     pino.info(obj);

}
//error
let error = (message,origin,importance)=>{
    let date = moment();
    let timeStamp = date.format('Do MMM YYYY  hh:m:s a');
    let obj = {
        timeStamp,
        message,
        origin,
        importance
    }
     pino.error(obj);
}
// error('error in pino','pino',10);
// info('hell from logger','logger',10);

module.exports = {
    info,
    error
}