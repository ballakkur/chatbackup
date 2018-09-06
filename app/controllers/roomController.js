const shortId = require('shortid');
const mongoose = require('mongoose');
const check = require('./../library/checkLib');
const response = require('./../library/responseLib');
const nodeMailer = require('./../library/nodeMailerLib');

//models
const roomModel = mongoose.model('Room');
const userModel = mongoose.model('User');

let createRoom = (req, res) => {
    let createModel = () => {
        return new Promise((resolve, reject) => {
            userModel.findOne({ userId: req.user.userId })
                .then((userdetails) => {
                    if (check.isEmpty(userdetails)) {
                        let apiResponse = response.generate(true,
                            'unable to find the user', 500, null);
                        reject(apiResponse);
                    }
                    else {
                        let newRoom = new roomModel({
                            roomId: shortId.generate(),
                            roomSubject: req.body.roomSubject,
                            admin: {
                                adminId: userdetails.userId,
                                adminName: `${userdetails.firstName} ${userdetails.lastName}`
                            }
                        });
                        let member = userdetails.userId;
                        newRoom.members.push(member);
                        //save newRoom and resolve member(which will be added to userModel)
                        newRoom.save()
                            .then((roomDetails) => {
                                let data = {
                                    roomDetails,
                                    member
                                }
                                resolve(data);
                            })
                            .catch((error) => {
                                console.log('db error,unable to save new room', error);
                                let apiResponse = response.generate(true,
                                    'db error,unable to save new room', 500, null);
                                reject(apiResponse);
                            })
                    }
                })
                .catch((error) => {
                    console.log('db error,unable to find user details', error);
                    let apiResponse = response.generate(true,
                        'failed to find user details', 500, null);
                    reject(apiResponse);
                })
        });
    }
    let saveModel = (data) => {
        return new Promise((resolve, reject) => {
            let updateQuery = {
                groups: data.roomDetails.roomId
            }
            console.log(updateQuery);
            console.log(data.member);
            userModel.update({ userId: data.member }, updateQuery, { multi: true })
                .then((result) => {
                    console.log(result);
                    if (result.nModified === 1) {
                        let finalData = data.roomDetails.toObject();
                        delete finalData._id
                        resolve(finalData);
                    } else {
                        console.log('some error udpateMany');
                        let apiResponse = response.generate(true,
                            "unable to save user to chat room", 500, null);
                        reject(apiResponse);
                    }
                })
                .catch((error) => {
                    console.log('db error saveModel', error);
                    let apiResponse = response.generate(true,
                        'failed to update user groups');
                    reject(apiResponse);
                })
        });
    }
    createModel()
        .then(saveModel)
        .then((roomDetails) => {
            let apiResponse = response.generate(false,
                'room created Successfully', 200, roomDetails);
            res.status(apiResponse.status).send(apiResponse);
        })
        .catch((apiResponse) => {
            res.status(apiResponse.status).send(apiResponse);
        })
}//end of createRoom

let deleteRoom = (req, res) => {
    console.log(req.user.userId);
    console.log(req.body.roomId);
    roomModel.findOne({
        $and: [{ roomId: req.body.roomId },
        { "admin.adminId": req.user.userId }]
    })
        .select('roomId')
        .then((data) => {
            if (!check.isEmpty(data)) {
                console.log(data);
                roomModel.remove({ roomId: data.roomId })
                    .then((result) => {
                        if (check.isEmpty(result)) {
                            let apiResponse = response.generate("true",
                                "No chat room found", 500, null);
                            res.send(apiResponse);
                        } else {
                            let apiResponse = response.generate(true,
                                "Chat Room deleted", 200, null);
                            res.send(apiResponse);
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        let apiResponse = response.generate(true,
                            `db error,${error.message}`, 500, null);
                        res.send(apiResponse);
                    })
            } else {
                let apiResponse = response.generate(true,
                    'room not found', 404, null);
                res.send(apiResponse);
            }
        })
        .catch((error) => {
            console.log(error);
            let apiResponse = response.generate(true,
                `db error,${error.message}`, 500, null);
            res.send(apiResponse);
        })

}//delete room ends here
let shareChatLink = (req, res) => {
    let validateInput = () => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.body.receiverMail) || check.isEmpty(req.body.roomId)) {
                let apiResponse = response.generate(true,
                    'receiver email or roomId is missing', 400, null);
                reject(apiResponse);
            } else {
                resolve();
            }
        });
    }//end validate
    let details = () => {
        return new Promise((resolve, reject) => {
            roomModel.findOne({ roomId: req.body.roomId },
                { admin: { $elemMatch: { adminId: req.user.userId } } })
                .select({ roomId: 1, roomSubject: 1 })
                .then((data) => {
                    if (!check.isEmpty(data)) {
                        console.log(data);
                        resolve(data)
                    }
                    else {
                        let apiResponse = response.generate(true,
                            'room not found', 404, null);
                        reject(apiResponse);
                    }
                })
                .catch((error) => {
                    console.log(error);
                    let apiResponse = response.generate(true,
                        `db error,${error.message}`, 500, null);
                    reject(apiResponse);
                })
        })
    }//end details
    let sendMail = (data) => {
        return new Promise((resolve, reject) => {
            nodeMailer.mailer({
                email: req.body.receiverMail,
                subject: `link to a chat room "${data.roomSubject}" from ChatBox`,
                message: `<a href='http://localhost:4200/joinGroup/${data.roomId}/${data.roomSubject}'>click here to join the Chat Room</a>`
            });
            let apiResponse = response.generate(false,
                "mail sent successfully", 200, null);
            resolve(apiResponse);
        });
    }
    validateInput()
        .then(details)
        .then(sendMail)
        .then((apiResponse) => {
            res.status(apiResponse.status).send(apiResponse);
        })
        .catch((apiResponse) => res.status(apiResponse.status).send(apiResponse));
}//end sharChatLink
let editRoom = (req, res) => {
    //check to see if req.user.userId is same as admin.userId
    let validate = () => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.params.roomId)) {
                let apiResponse = response.generate(true,
                    'room ID is missing', 500, null);
                reject(apiResponse);
            }
            roomModel.find({
                $and: [{ roomId: req.params.roomId },
                { "admin.adminId": req.user.userId }]
            })
                .select({ roomId: 1, roomSubject: 1, admin: 1 })
                .then((roomData) => {
                    if (check.isEmpty(roomData)) {
                        let apiResponse = response.generate(true,
                            `no room with roomId ${req.params.roomId} with admin privilege found`
                            , 500, null);
                        reject(apiResponse);
                        console.log(roomData);
                        console.log(req.user.userId);
                    }
                    else {
                        console.log(roomData);
                        console.log(req.user.userId);
                        let data = {}
                        if (!check.isEmpty(req.body.roomSubject)) {
                            data.roomSubject = req.body.roomSubject;
                        }
                        if (!check.isEmpty(req.body.active)) {
                            data.active = req.body.active;
                        }
                        if (check.isEmpty(data)) {
                            let apiResponse = response.generate(true,
                                'nothing to update', 500, null);
                            console.log(data);
                            reject(apiResponse);
                        } else {
                            console.log(data);
                            resolve(data);
                        }
                    }
                })
        });
    }
    //make updates
    let updateRoom = (data) => {
        return new Promise((resolve, reject) => {
            let update = {
                roomSubject: data.roomSubject,
                active: data.active
            }
            roomModel.update({ roomId: req.params.roomId }, update)
                .then((result) => {
                    console.log(result);
                    if (result.nModified === 1) {
                        let apiResponse = response.generate(false,
                            'update successfull', 200, null);
                        resolve(apiResponse);
                    } else {
                        let apiResponse = response.generate(true,
                            'nothing to update', 500, null);
                        reject(apiResponse);
                    }
                })
                .catch((error) => {
                    let apiResponse = response.generate(true,
                        `db error ${error.message}`, 400, null);
                    reject(apiResponse);
                })
        })
    }
    validate()
        .then(updateRoom)
        .then((apiResponse) => res.status(apiResponse.status).send(apiResponse))
        .catch((apiResponse) => res.status(apiResponse.status).send(apiResponse));
}//end of editRoom

let viewAllRooms = (req, res) => {
    //find all rooms 
    roomModel.find({ active: true })
        .select({ roomId: 1, roomSubject: 1, admin: 1, members: 1, _id: -1 })
        .then((rooms) => {
            let apiResponse = response.generate(false,
                'rooms listed', 200, rooms);
            res.status(apiResponse.status).send(apiResponse);
        })
        .catch((error) => {
            console.log('viewAllrooms', error);
            let apiResponse = response.generate(true,
                'db error,couldnot featch active room list', 404, null);
            res.status(apiResponse.status).send(apiResponse);
        })
}//end of viewRooms

let joinRoom = (req, res) => {
    //verify weather email and roomId exists and find them in db
    let verifyParam = () => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.body.email) || check.isEmpty(req.body.roomId)) {
                let apiResponse = response.generate(true,
                    'email and roomId missing', 500, null);
                reject(apiResponse);
            }
            else {
                let data = {}
                userModel.find({ email: req.body.email })
                    .select('-_id -__v -password -mobileNumber')
                    .then((userData) => {
                        if (check.isEmpty(userData)) {
                            let apiResponse = response.generate(true,
                                'cannot find the user with the given emailId', 400, null);
                            reject(apiResponse);
                        } else {
                            data.userData = userData;
                            //if roomId is present in userData.groups
                            // console.log(userData[0].groups);
                            let found = userData[0].groups.find((id) => {
                                return id === req.body.roomId
                            })
                            // console.log(found);
                            //discard sayin that user is already in the group
                            if (found) {
                                let apiResponse = response.generate(true,
                                    'you have already joined the room', 400, null);
                                reject(apiResponse);
                            }
                            //find room details
                            roomModel.find({ roomId: req.body.roomId })
                                .select('-_id -__v')
                                .then((roomData) => {
                                    if (check.isEmpty(roomData)) {
                                        let apiResponse = response.generate(true,
                                            'room not found', 400, null);
                                        reject(apiResponse);
                                    } else {

                                        data.roomData = roomData;
                                        resolve(data);
                                    }
                                })
                                .catch((error) => {
                                    console.log('roomModelFind', error);
                                    let apiResponse = response.generate(true,
                                        `${error.message}`, 400, null);
                                    reject(apiResponse);
                                });
                        }
                    })
                    .catch((error) => {
                        console.log('userModelFind', error);
                        let apiResponse = response.generate(true,
                            `${error.message}`, 400, null);
                        reject(apiResponse);
                    });
            }
        });
    }
    //update roomModel members and userModel groups
    let updateDb = (data) => {
        return new Promise((resolve, reject) => {
            console.log(data);
            // console.log(data.userData[0].email);
            data.userData[0].groups.push(req.body.roomId);
            console.log(data.userData[0].groups);
            let update = {
                groups: data.userData[0].groups
            }
            userModel.update({ email: data.userData[0].email }, update)
                .then((result) => {
                    console.log('userMOdel update', result);
                    if (result.nModified === 1) {
                        data.roomData[0].members.push(data.userData[0].userId);
                        let update = {
                            members: data.roomData[0].members
                        }
                        roomModel.update({ roomId: data.roomData[0].roomId }, update)
                            .then((result) => {
                                if (result.nModified === 1) {
                                    console.log('modified');

                                    resolve(result);
                                } else {
                                    let apiResponse = response.generate(true,
                                        "unable to update chat room", 500, null);
                                    reject(apiResponse);
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                                let apiResponse = response.generate(true,
                                    `db error ${error.message}`, 500, null);
                                reject(apiResponse);
                            })
                    } else {
                        let apiResponse = response.generate(true,
                            "unable to save user to chat room", 500, null);
                        reject(apiResponse);
                    }
                })
                .catch((error) => {
                    console.log(error);
                    let apiResponse = response.generate(true,
                        `db error ${error.message}`, 500, null);
                    reject(apiResponse);
                })
        });
    }
    verifyParam()
        .then(updateDb)
        .then((result) => {
            let apiResponse = response.generate(false,
                `user joined successfully`, 200, result);
            res.status(apiResponse.status).send(apiResponse);

        })
        .catch((apiResponse) => res.status(apiResponse.status).send(apiResponse));
}//joinRoom

let closeRoom = (req, res) => {
    roomModel.update({
        $and: [{ roomId: req.body.roomId },
        { "admin.adminId": req.user.userId }]
    },
        {
            active: false
        }
    )
        .then((result) => {
            console.log(result);
            if (result.nModified === 1) {
                let apiResponse = response.generate(false,
                    'room deactivated', 200, null);
                res.status(200).send(apiResponse);
            }
            else if (result.n === 0) {
                let apiResponse = response.generate(true,
                    'cannot find room with admin previlage', 500, null);
                res.status(500).send(apiResponse);
            }
            else {
                let apiResponse = response.generate(true,
                    'room already deactivated', 400, null);
                res.status(400).send(apiResponse);
            }
        })
        .catch((error) => {
            console.log(error);
            let apiResponse = response.generate(true,
                `db error ${error.message}`, 500, null);
            reject(apiResponse);
        })
}
module.exports = {
    createRoom,
    deleteRoom,
    shareChatLink,
    editRoom,
    viewAllRooms,
    joinRoom,
    closeRoom
}
