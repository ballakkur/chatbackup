const mongoose = require('mongoose');
const shortId = require('shortid');
const crypto = require('crypto');

const {appConfig} = require('./../../config/appConfig');

//libraries
const logger = require('./../library/loggerLib');
const time = require('./../library/timeLib');
const check = require('./../library/checkLib');
const response = require('./../library/responseLib');
const validate = require('./../library/validateLib');
const password = require('./../library/passwordLib');
const token = require('./../library/tokenLib');
const nodemailer = require('./../library/nodeMailerLib');

//model
const userModel = mongoose.model('User');
const authModel = mongoose.model('auth');
const resetTokenModel = mongoose.model('resetToken');

let signup = (req, res) => {
    validateEmail = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true,
                        'password missing', 400, null);
                    console.log('invalid password');
                    reject(apiResponse);
                } else {
                    if (validate.Email(req.body.email)) {
                        if (validate.Password(req.body.password)) {
                            resolve(req);
                        } else {
                            let apiResponse = response.generate(true,
                            'password must be atleast 6 characters long',
                            400, null);
                    console.log(' password must be 5 char');
                            reject(apiResponse);
                        }
                    } else {
                        let apiResponse = response.generate(true,
                            'invalid email', 400, null);
                    console.log('invalid email');
                        reject(apiResponse);
                    }
                }

            } else {
                logger.error('Field Missing signup'
                    , 'userController: signup()',
                    5);
                    console.log('missing params');
                let apiResponse = response.generate(true,
                    'one or more parameter is missing',
                    400, null);
                reject(apiResponse);
            }
        })

    }
    let createUser = ()=>{
        return new Promise((resolve,reject)=>{
            timeStamp = time.now();
            console.log(req.body.password);
            let bcryptPassword = password.hashPassword(
                req.body.password
            );
            userModel.findOne({email:req.body.email})
            .then((data)=>{
                if(check.isEmpty(data)){
                 let newUser = new userModel({
                        userId:shortId.generate(),
                        firstName:req.body.firstName,
                        lastName:req.body.lastName,
                        email:req.body.email,
                        password:bcryptPassword,
                        mobileNumber:req.body.mobileNumber,
                        createdOn:timeStamp
                    });
                    newUser.save()
                    .then((newUser)=>{
                        resolve(newUser.toObject())
                    })
                    .catch((err)=>{
                        logger.error(err,'userController:saveUser',10);
                        let apiResponse = response.generate(true,
                            'could not create user',500,null);
                        reject(apiResponse);
                    });
                }else{
                    let apiResponse = response.generate(false,
                        'email already in use',200,null);
                    reject(apiResponse);
                }
            })
            .catch((err)=>{
                let apiResponse = response.generate(true,
                    'failed to create user',500,null);
                console.log(err);
                reject(apiResponse);
            })
            

        })
    }
    validateEmail(req, res)
        .then(createUser)
        .then((result) => {
            delete result.password
            delete result._id
            delete result.__v
            let apiResponse = response.generate(false,
                 'User created', 200, result);
            nodemailer.mailer({
                email:result.email,
                firstName:result.firstName,
                subject:'welcome',
                message:'welcome to Chat box'
            });
            res.send(apiResponse);
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })
   

}
let login = (req, res) => {
    let findUser = () => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.body.email) || check.isEmpty(req.body.password)) {
                console.log(req.body.email);
                let apiResponse = response.generate(true, 
                    'please enter email and password', 400, null);
                reject(apiResponse);
            }
            else if(req.body.email){
                userModel.findOne({email:req.body.email})
                .then((data)=>{
                    if(check.isEmpty(data)){
                        let apiResponse = response.generate(true,
                            'user not found',404,null);
                    reject(apiResponse);
                    }
                    else{
                        resolve(data);
                    }
                })
                .catch((error)=>{
                    console.log(error);
                    logger.error('Failed To Retrieve User Data',
                     'userController: findUser()', 10);
                     let apiResponse = response.generate(true,
                         'Failed To Find User Details', 500, null);
                        reject(apiResponse);
                })
            }
            else{
                let apiResponse = response.generate(true,
                    'please enter email',400,null);
            reject(apiResponse);
            }
        });
    }
    let verifyUser = (userData)=>{
        return new Promise((resolve, reject) => {
            password.comparePassword(req.body.password, userData.password)
                .then((isValid) => {
                    if (isValid) {
                        let details = userData.toObject();
                        delete details.__v
                        delete details._id
                        delete details.createdOn   
                        delete details.password 
                        resolve(details);
                    } else {
                        let apiResponse = response.generate(true,
                            'password doesnt match',500,null);
                            reject(apiResponse);
                    }
                })
                .catch((error)=>{
                    console.log(error);
                    let apiResponse = response.generate(true,
                        'login failed',500,null);
                    reject(apiResponse);
                })
        })
    }

    let genToken = (userDetails)=>{
        return new Promise((resolve,reject)=>{
            token.genarateToken(userDetails)
            .then((newTokenDetails)=>{
                newTokenDetails.userId = userDetails.userId;
                newTokenDetails.userDetails = userDetails;
                resolve(newTokenDetails);
            })
            .catch((error)=>{
                console.log(error);
                let apiResponse = response.generate('true',
                'cannot generate token',500,null);
                reject(apiResponse);
            })
        });
    }
    let saveToken = (tokenDetails)=>{
        return new Promise((resolve,reject)=>{
            authModel.findOne({userId:tokenDetails.userId})
            .then((tokenDetail)=>{
                if(check.isEmpty(tokenDetail)){
                    let newAuthToken = new authModel({
                        userId:tokenDetails.userId,
                        authToken:tokenDetails.token,
                        tokenSecret:tokenDetails.secret,
                        tokenCreatedOn:time.now()
                    });
                    newAuthToken.save()
                    .then((newTokenDetail)=>{
                        let responseBody = {
                            authToken:newTokenDetail.authToken,
                            userDetails:newTokenDetail.userDetails
                        }
                        resolve(responseBody);
                    })
                    .catch((error)=>{
                        console.log(error);
                        let apiResponse = response.generate(true,
                        'unable to generate authtoken',500,null);
                        reject(apiResponse);
                    })
                }else{
                    tokenDetail.token = tokenDetails.token;
                    tokenDetail.tokenSecret = tokenDetails.tokenSecret;
                    tokenDetail.createdOn = time.now();
                    tokenDetail.save()
                    .then((newTokenDetail)=>{
                        console.log(newTokenDetail);
                        let responseBody = {
                            authToken:newTokenDetail.authToken,
                            userDetails:newTokenDetail.userDetails
                        }
                        resolve(responseBody);
                    })
                    .catch((err)=>{
                        console.log(err);
                        logger.error(err.message,
                             'userController: saveToken', 10);
                        let apiResponse = response.generate(true,
                             'Failed To Generate Token', 500, null);
                        reject(apiResponse);
                    });
                }
            })
            .catch((err)=>{
                console.log(err.message,
                     'userController: saveToken', 10);
                let apiResponse = response.generate(true,
                     'Failed To Generate Token', 500, null);
                reject(apiResponse);
            })
        });
    }

    findUser(req,res)
    .then((data)=>verifyUser(data))
    .then((data)=>genToken(data))
    .then((data)=>saveToken(data))
    .then((resolve)=>{
        let apiResponse = response.generate(false, 
            'Login Successful', 200, resolve);
            res.status(200).send(apiResponse);
    })
    .catch((apiResponse)=>{
        console.log(apiResponse);
        res.status(apiResponse.status).send(apiResponse);
    })
}
//forgot password
let forgotPassword = (req,res)=>{
let checkEmail = ()=>{
    return new Promise((resolve,reject)=>{
    console.log(req.body.email);
    if(!req.body.email || !validate.Email(req.body.email)){
        console.log('email is missing or null');
        let apiResponse = response.generate(true,
        'email is invalid or null',400,null);
        reject(apiResponse);
        // res.status(apiResponse.status).send(apiResponse);
    }else{
        userModel.findOne({email:req.body.email})
        .then((userDetail)=>{
            if(userDetail){
                /* let apiResponse = response.generate(false,
                    'password reset link has been sent,please check your email',
                    200,null); */
                resolve(userDetail);
                // res.status(200).send(apiResponse);
            }else{
                console.log('user not found');
                let apiResponse = response.generate(true,
                'user with given emailId not found',404,null);
                reject(apiResponse);
                // res.status(apiResponse.status).send(apiResponse);
            }
        })
        .catch((error)=>{
            console.log('database error',error);
            let apiResponse = response.generate(true,
            'failed to find email',500,null);
            reject(apiResponse);
            // res.status(500).send(apiResponse);
        })
    }
});
}
//resetUrl
let generateResetUrl = (userDetail)=>{
    crypto.randomBytes(256,(err,buf)=>{
        if(err){
            console.log('crypto gen error',err);
            let apiResponse = response.generate(true,
            'failed to generate token, try again',400,null);
            res.status(400).send(apiResponse);
        }
        else{
            // console.log(buf.toString('hex'));
            let token = buf.toString('hex');    
            // console.log(userDetail);
                let newResetToken = new resetTokenModel({
                email:userDetail.email,
                token:token
            });
            newResetToken.save() 
            .then((resetDetail)=>{
                // console.log(resetDetail);
                let baseUrl = `${appConfig.apiVersion}/users`;  
                let resetEmail = `<a href='http://localhost:${appConfig.port}${baseUrl}/resetPassword/${userDetail.email}/${token}'></a>`;
                    nodemailer.mailer({
                    firstName:userDetail.firstName,
                    email:userDetail.email,
                    subject:'password reset',
                    message:`please click on the link to reset password -${resetEmail}`
                });
                let apiResponse = response.generate(false,
                'reset email has been sent,please check your email',200,null);
                res.status(200).send(apiResponse);
            })
            .catch((error)=>{
                console.log(error,"failed to save reset token to db");
                let apiResponse = response.generate(true,
                'failed to generate reset token,try again',400,null);
                res.status(400).send(apiResponse);
            })     
        }
    })
}
checkEmail()
.then(generateResetUrl)
.catch((apiResponse)=>res.status(apiResponse.status).send(apiResponse));
}

//reset password
let resetPassword = (req,res)=>{
    // console.log(req.params);
    resetTokenModel.findOne({$and:[{email:req.params.email},{token:req.params.token}]})
    .then((userdetail)=>{
        if(userdetail){
            // console.log(userdetail);
            let now = Date.parse(new Date());
            console.log(now);
            let expire =Date.parse(userdetail.expiresOn);
            console.log(expire);
            console.log(expire<now);
            if(expire<now){
                // res.status(401);
                //return to login page and try to send jwt token
                console.log('token expired');
            }
            else{
                let newToken = userdetail.token;
                let newEmail = userdetail.email;
                resetTokenModel.update({$and:[{email:newEmail},{token:newToken}]},{confirmed:true})
                .then((userdetail)=>{
                    if(userdetail.nModified === 1){
                        console.log(userdetail);
                        console.log('redirect to password reset page');
                        return res.redirect(`http://localhost:3000/user1.html?token=${newToken}&email=${newEmail}`);
                    }else{
                        console.log('return to login page');
                        console.log('invalid token since it has already been used 400')
                    }
                })
                .catch((error)=>console.log(error,'database error'));
            }
        }else{
            console.log('user not found');
            res.status(404);
            // return res.redirect('http://localhost:3000/api/v1/users/login');
            //res.redirect has to be a frontend link
        }
    })
    .catch((error)=>{
        console.log(error,'failed to varify email and token');
        // let apiResponse = response.generate(true,
            // 'failed to generate verify email please try again',404,null);
            res.status(400);
            return res.redirect('http://localhost:3000/api/v1/users/login');

    })
    //dont forget to add confirm in db before saving the token
    //check if the token has expired
    //redirect to enter new password page
    //how to use req.redirect with post req instead of get
    //write a link to frontend instead of api call in res.redirect()
    // return res.redirect('http://localhost:3000/api/v1/users/newPass');

}
//new pass
let newPassword = (req,res)=>{
    console.log(req.body);
    //front end will pass token,email and password
    if(check.isEmpty(req.body.email) ||check.isEmpty(req.body.password) || check.isEmpty(req.body.token)){
        let apiResponse = response.generate(true,
        'please enter email,password and token',500,null);
        res.send(apiResponse);
    }else{
    //check the token and see if its confirmed
        resetTokenModel.findOne({$and:[{email:req.body.email},{token:req.body.token},{confirmed:true}]})
        .then((userdetail)=>{
    //if yes change the password in the database to the new password
        let updatedPassword = password.hashPassword(req.body.password);
        let update = {
            password:updatedPassword
        }
        userModel.findOneAndUpdate({email:req.body.email},update)            
        .then((finalUser)=>{
            console.log(finalUser);
            let user = finalUser.toObject();
            delete user.password
            delete user._id
            delete user.__v
            let apiResponse = response.generate(false,
            'password successfully modified',200,user);
            res.status(200).send(apiResponse);
        })
        })
        .catch((error)=>{
            console.log(error);
            let apiResponse = response.generate(true,'failed to verify token',404,null);
            res.status(404).send(apiResponse);
        })
    }        
}

let logout = (req, res) => {
    console.log(req.user)
    authModel.findOneAndRemove({userId:req.user.userId})
    .then((authDetail)=>{
        if(authDetail){
            console.log(authDetail);
            let apiResponse = response.generate(true,
            'user successfully logged out',200,null);
            res.status(200).send(apiResponse);
        }else{
            console.log('user already logged out');
            let apiResponse = response.generate(true,
                'user already logged out',404,null);
                res.status(404).send(apiResponse);
        }
    })
    .catch((error)=>{
        console.log(error);
        let apiResponse = response.generate(err,'some error occured',500,null);
        response.status(500).send(apiResponse);
    })
}

module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword,
    newPassword,
    logout
}