const mongoose = require('mongoose');
const check = require('./../library/checkLib');
const response = require('./../library/responseLib');

//models
const chatModel = mongoose.model('Chat');
const userModel = mongoose.model('User');

let groupChat = (req, res) => {
    let checkParams = () => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.query.chatRoom)) {
                let apiResponse = response.generate(true,
                    'chatRoom params is missing', 403, null);
                reject(apiResponse);
            } else {
                resolve();
            }
        });
    }//end of validate
    //findChat
    let findChat = () => {
        return new Promise((resolve, reject) => {
            let chatRoom = req.query.chatRoom;
            chatModel.find({ chatRoom: chatRoom })
                .select('-_id -__v')
                .sort('-createdOn')
                .skip(parseInt(req.query.skip) || 0)
                .limit(10)
                .then((chatData) => {
                    if (check.isEmpty(chatData)) {
                        let apiResponse = response.generate(false,
                            'no chat found', 404, null);
                        reject(apiResponse);
                    } else {
                        resolve(chatData);
                    }
                })
                .catch((error) => {
                    console.log('findChat db error', error);
                    let apiResponse = response.generate(true,
                        'could not fetch messages', 500, null);
                    reject(apiResponse);
                });
        });
    }
    checkParams()
        .then(findChat)
        .then((chatData) => {
            let apiResponse = response.generate(false,
                'chat found and listed', 200, chatData);
            res.status(apiResponse.status).send(apiResponse);
        })
        .catch((apiResponse) => res.status(apiResponse.status).send(apiResponse));
}
//chat as seen
let markChatAsSeen = (req, res) => {
    let checkParams = () => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.query.chatId)) {
                console.log('markchatasseen id is missing');
                let apiResponse = response.generate(true,
                    'chat id missing', 403, null);
                reject(apiResponse);
            } else {
                console.log('parameter found');
                resolve();
            }
        });
    }//end checkparams
    //updatechat
    let updateChat = () => {
        return new Promise((resolve, reject) => {
            chatModel.update({ chatId: req.query.chatId }, { seen: true }, { multi: true })
                .then((result) => {
                    if (result.n == 0) {
                        console.log('no chat found', error);
                        let apiResponse = response.generate(true,
                            'no chat messages found', 404, null);
                        reject(apiResponse);
                    } else {
                        console.log('chat found and updated.');
                        resolve(result);
                    }
                })
                .catch((error) => {
                    console.log('updateChat db error', error);
                    let apiResponse = response.generate(true,
                        'could not mark it as seen', 500, null);
                    reject(apiResponse);
                });
        });
    }
    checkParams()
        .then(updateChat)
        .then((result) => {
            let apiResponse = response.generate(false, 'chat found and updated.', 200, result);
            res.send(apiResponse);
        })
        .catch((apiResponse) => res.status(apiResponse.status).send(apiResponse));
}
//count all the unseen chat messages

let countUnseenChat = (req, res) => {
    let checkParams = () => {
        return new Promise((resolve, reject) => {
            //here userId is the receiverId
            if (check.isEmpty(req.query.userId)) {
                let apiResponse = response.generate(true,
                    'chatRoom params is missing', 403, null);
                reject(apiResponse);
            } else {
                resolve();
            }
        });
    }//end of validate
    let countUnseen = () => {
        return new Promise((resolve, reject) => {
            let findQuery = {
                receiverId: req.query.userId,
                seen: false
            };
            if (check.isEmpty(req.query.senderId) === false) {
                findQuery['senderId'] = req.query.senderId
            }
            chatModel.count(findQuery)
                .then((result) => {
                    console.log('unseen chat count found.');
                    resolve(result);
                })
                .catch((error) => {
                    console.log('db error countUnseen', error);
                    let apiResponse = response.generate(true,
                        `error occurred: ${err.message}`, 500, null);
                    reject(apiResponse);
                });
        });
    }
    checkParams()
        .then(countUnseen)
        .then((result) => {
            let apiResponse = response.generate(false,
                'unseen chat count found.', 200, result);
            res.send(apiResponse);
        })
        .catch((apiResponse) => res.status(apiResponse.status).send(apiResponse));
}//end of unseenchat count
let findUnseenChat = (req, res) => {
    let checkParams = () => {
        return new Promise((resolve, reject) => {
            //here userId is the receiverId
            if (check.isEmpty(req.query.userId)) {
                let apiResponse = response.generate(true,
                    'chatRoom params is missing', 403, null);
                reject(apiResponse);
            } else {
                resolve();
            }
        });
    }//end of validate
    let findUnseen = () => {
        return new Promise((resolve, reject) => {
            let findQuery = {
                receiverId: req.query.userId,
                seen: false
            };
            if (check.isEmpty(req.query.senderId) === false) {
                findQuery['senderId'] = req.query.senderId
            }
            chatModel.find(findQuery)
                .select('-_id -_v')
                .sort('-createdOn')
                .skip(parseInt(req.query.skip) || 0)
                .limit(10)
                .then((result) => {
                    if (check.isEmpty(result)) {
                        let apiResponse = response.generate(true,
                            'No Chat Found', 404, null);
                        reject(apiResponse);
                    } else {
                        console.log('chat found and listed.');
                        resolve(result);
                    }
                })
                .catch((error) => {
                    console.log('findChat db error', error);
                    let apiResponse = response.generate(true,
                        `error occurred: ${err.message}`, 500, null);
                    reject(apiResponse);
                })
        });
    }
    checkParams()
        .then(findUnseen)
        .then((result) => {
            let apiResponse = response.generate(false,
                'unseen chat found.', 200, result);
            res.send(apiResponse);
        })
        .catch((apiResponse) => res.status(apiResponse.status).send(apiResponse));
}
//userList of unseen chat
let findUserListOfUnseenChat = (req, res) => {
    let checkParams = () => {
        return new Promise((resolve, reject) => {
            //here userId is the receiverId
            if (check.isEmpty(req.query.userId)) {
                let apiResponse = response.generate(true,
                    'chatRoom params is missing', 403, null);
                reject(apiResponse);
            } else {
                resolve();
            }
        });
    }//end of validate
    let findDistinctSender = () => {
        return new Promise((resolve, reject) => {
            chatModel.distinct('senderId', { receiverId: req.query.userId, seen: false })
                .then((senderIdList) => {
                    if (check.isEmpty(senderIdList)) {
                        let apiResponse = response.generate(true,
                            'No Unseen Chat User Found', 404, null);
                        reject(apiResponse);
                    } else {
                        console.log('User found and userIds listed.');
                        console.log(senderIdList);
                        resolve(senderIdList);
                    }
                })
                .catch((error) => {
                    console.log('db error findDistinctsender', error);
                    let apiResponse = response.generate(true,
                        `error occurred: ${err.message}`, 500, null);
                    reject(apiResponse);
                })
        });
    }//end findDistict user

    // function to find user info.
    let findUserInfo = (senderIdList) => {
        return new Promise((resolve, reject) => {
            userModel.find({ userId: { $in: senderIdList } })
                .select('-id -__v -password -email -mobileNumber')
                .lean()
                .then((result) => {
                    if (check.isEmpty(result)) {
                        let apiResponse = response.generate(true,
                            'No User Found', 404, null);
                        reject(apiResponse);
                    }else{
                        console.log('user found and listed');
                        resolve(result);
                    }
                })
                .catch((error) => {
                    console.log('db error senderIdList', error);
                    let apiResponse = response.generate(true,
                        `error occurred: ${err.message}`, 500, null);
                    reject(apiResponse);
                })
        });
    }
    checkParams()
        .then(findDistinctSender)
        .then(findUserInfo)
        .then((result) => {
            let apiResponse = response.generate(false,
                'user found and listed.', 200, result);
            res.status(apiResponse.status).send(apiResponse);
        })
        .catch((apiResponse) => res.status(apiResponse.status).send(apiResponse));
}

module.exports = {
    groupChat,
    markChatAsSeen,
    countUnseenChat,
    findUnseenChat,
    findUserListOfUnseenChat
}