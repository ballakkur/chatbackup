const {appConfig} = require('./../../config/appConfig');
const chatController = require('./../controllers/chatController');
const auth = require('./../middlewares/authMiddleware');

let setRouter = (app)=>{
    const baseUrl = `${appConfig.apiVersion}/chat`;
    app.get(`${baseUrl}/get/groupChat`,auth.isAuthorized,chatController.groupChat);
    app.get(`${baseUrl}/mark/chatAsSeen`,auth.isAuthorized,chatController.markChatAsSeen);
    app.get(`${baseUrl}/count/unseen`,auth.isAuthorized,chatController.countUnseenChat);
    app.get(`${baseUrl}/find/unseen`,auth.isAuthorized,chatController.findUnseenChat);
    app.get(`${baseUrl}/get/unseenChat/userList`,auth.isAuthorized,chatController.findUserListOfUnseenChat);
}

module.exports = {
    setRouter
}