const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const {appConfig} = require('./config/appConfig');

//import middleware
const errorHandler = require('./app/middlewares/appErrorHandler');

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'client')));
app.use(errorHandler.errorHandler);
//import model
fs.readdirSync('./app/models').forEach((file)=>{
    if(~file.indexOf('.js')){
        require('./app/models/' + file)
    }
});
//import routes
fs.readdirSync('./app/routes').forEach((file)=>{
    if(~file.indexOf('.js')){
        let route = require('./app/routes/' + file);
        route.setRouter(app);
    }
})

app.use(errorHandler.notFoundHandler);

//create a http server
const server = http.createServer(app);

//listen to http server 

server.listen(appConfig.port);
server.on('error',onError);
server.on('listening',onListening);

//importing socketLib here so that chatModel gets imported before
const socketLib = require('./app/library/socketLib');
//socket connections
const socketServer = socketLib.setServer(server);


function onError(error){
    console.log(error);
    process.exit(1);    
}
function onListening(){
    console.log(server.address());
    mongoose.connect(appConfig.db.url,{ useNewUrlParser: true })
    .then(()=>console.log('connected to database'))
    .catch((err)=>{console.log(err.message)});
}


