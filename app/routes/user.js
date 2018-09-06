const userController = require('./../controllers/userController');
const {appConfig} = require('./../../config/appConfig');
const auth = require('./../middlewares/authMiddleware');

let setRouter = (app)=>{
    let baseUrl = `${appConfig.apiVersion}/users`;

    //signup
     app.post(`${baseUrl}/signup`,userController.signup); 
    //login
    app.post(`${baseUrl}/login`,userController.login);
    //forgot password
    app.post(`${baseUrl}/forgotPassword`,userController.forgotPassword);
    //resetPassword
    app.get(`${baseUrl}/resetPassword/:email/:token`,userController.resetPassword);  
    //enternew pass
    app.post(`${baseUrl}/newPass`,userController.newPassword);
    //logout
    app.post(`${baseUrl}/logout`,auth.isAuthorized ,userController.logout);
}

module.exports = {
    setRouter
}