const response = require('./../library/responseLib');

let errorHandler = (err,req,res,next)=>{
    console.log('some error occured at global level');
    console.log(err);
    let apiResponse = response.generate(true,
    'route not found',500,null);
    res.status(500).send(apiResponse);
}

let notFoundHandler = (req,res,next)=>{
    console.log('global error handler called');
    res.status(404).send('route not found');
}
module.exports = {
    errorHandler,
    notFoundHandler
}