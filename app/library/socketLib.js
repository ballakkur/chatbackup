const socketIo = require('socket.io');
const mongoose = require('mongoose');
const shortId = require('shortid');
//library
const tokenLib = require('./../library/tokenLib');

//events and emiter
const events = require('events');
const eventEmitter = new events.EventEmitter();

//model
const chatModel = mongoose.model('Chat');


let setServer = (server) => {
    var onlineUsersList = [];
    let io = socketIo.listen(server);
    let myIo = io.of('/');
    myIo.on('connection', (socket) => {
        console.log('emit verify user');
        socket.emit('verifyUser', '');
        //listen to set user event from clientPc
        socket.on('setUser', (authToken) => {
            tokenLib.verifyClaim(authToken)
                .then((userDetails) => {
                    console.log(userDetails);
                    let currentUser = userDetails.data;
                    socket.userId = currentUser.userId;
                    let name = `${currentUser.firstName} ${currentUser.lastName}`;
                    socket.name = name;
                    console.log(`${name} is online`);
                    console.log(`emit ${currentUser.userId} message`);
                    socket.emit(currentUser.userId, `Welcome ${name}`);
                    let user = {
                        userId: currentUser.userId,
                        name: name
                    }
                    onlineUsersList.push(user);
                    console.log(onlineUsersList);
                    //name of the room is given by the client
                    socket.room = 'chatBox'
                    console.log(socket.room);
                    socket.join(socket.room, (err) => {
                        console.log('error', err);
                    });
                    // socket.to(socket.room).broadcast.emit('onlineUsers', onlineUsersList);
                    myIo.to(socket.room).emit('onlineUsers', onlineUsersList);
                })
                .catch((error) => {
                    console.log(error);
                    socket.emit('authError', {
                        status: 500,
                        error: 'please provide valid auth token',
                    })
                })
        })//setUser ends here
        //join room

        socket.on('disconnect', () => {
            //disconnect the user from socket
            //remove the user from online list
            //unsubscribe the user from his own channel
            console.log(`${socket.userId} ${socket.name} disconnected`);
            //find the index of this user and remove him from userList
            let removeIndex = onlineUsersList.map((user) => {
                return user.userId;
            }).indexOf(socket.userId);
            onlineUsersList.splice(removeIndex, 1);
            console.log(onlineUsersList);
            //you can trigger(emit) an event saying socket.name is offline
            // socket.to(socket.room).broadcast.emit('onlineUsers', onlineUsersList);
            myIo.to(socket.room).emit('onlineUsers', onlineUsersList);
            // socket.leave(socket.room);
        });//end disconnect  
        socket.on('chatMessage', (data) => {
            console.log('socket chat message called');
            data['chatId'] = shortId.generate();
            console.log(data);
            //temperaryly add socketroom to data
            data['chatRoom'] = 'chatBox'
            eventEmitter.emit('saveChat', data);
            myIo.emit(data.receiverId, data);
        });
         //typing
         socket.on('typing', (name) => {
            socket.to(socket.room).broadcast.emit('typing', name);
            // myIo.to(socket.room).emit('typing', name);
        });
        eventEmitter.on('saveChat', (messageDetail) => {
            let newChat = new chatModel({
                chatId: messageDetail.chatId,
                senderName: messageDetail.senderName,
                senderId: messageDetail.senderId,
                receiverName: messageDetail.receiverName || '',
                receiverId: messageDetail.receiverId || '',
                message: messageDetail.message,
                chatRoom: messageDetail.chatRoom || '',
                createdOn: messageDetail.createdOn
            });
            newChat.save()
                .then((result) => {
                    if (result == undefined || result == null || result == "") {
                        console.log('chat not saved');
                    }
                    else {
                        console.log("Chat Saved.");
                        console.log(result);
                    }
                })
                .catch((error) => console.log('failed to save chat', error));
        })
       
    });
}

module.exports = {
    setServer
}