const roomController = require('./../controllers/roomController');
const {appConfig} = require('./../../config/appConfig');
const auth = require('./../middlewares/authMiddleware');

let setRouter = (app)=>{
    let baseUrl = `${appConfig.apiVersion}/room`;
    app.post(`${baseUrl}/create`,auth.isAuthorized,roomController.createRoom);
    app.post(`${baseUrl}/delete`,auth.isAuthorized,roomController.deleteRoom);
    app.post(`${baseUrl}/shareLink`,auth.isAuthorized,roomController.shareChatLink);
    app.post(`${baseUrl}/edit/:roomId`,auth.isAuthorized,roomController.editRoom);
    app.get(`${baseUrl}/view`,auth.isAuthorized,roomController.viewAllRooms);
    app.post(`${baseUrl}/joinGroup`,auth.isAuthorized,roomController.joinRoom);
    app.post(`${baseUrl}/close`,auth.isAuthorized,roomController.closeRoom);
}
module.exports = {
    setRouter
}