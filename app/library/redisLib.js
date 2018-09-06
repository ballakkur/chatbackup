//redis lib
const check = require('./checkLib');
const redis = require('redis');
let client = redis.createClient({
    url:'redis://redis-11006.c1.asia-northeast1-1.gce.cloud.redislabs.com:11006',
    password:'mfwK2zS5WFJv65sL8eTUqRcMC5hR2Ont'
})

client.on('connect', () => {

    console.log("Redis connection successfully opened");

});

let getAllUsersInAHash = (hashName, callback) => {

    client.HGETALL(hashName, (err, result) => {
        if (err) {
            console.log(err);
            callback(err, null)

        } else if (check.isEmpty(result)) {

            console.log("online user list is empty");
            console.log(result)

            callback(null, {})

        } else {

            console.log(result);
            callback(null, result)

        }
    });


}// end get all users in a hash

// function to set new online user.
let setANewOnlineUserInHash = (hashName, key, value, callback) => {
   
    client.HMSET(hashName, [
        key, value
    ], (err, result) => {
        if (err) {
            console.log(err);
            callback(err, null)
        } else {
            console.log(hashName);
            console.log("user has been set in the hash map");
            console.log(result)
            callback(null, result)
        }
    });


}// end set a new online user in hash

let deleteUserFromHash = (hashName,key)=>{

    client.HDEL(hashName,key);
    return true;

}// end delete user from hash

module.exports = {
    getAllUsersInAHash:getAllUsersInAHash,
    setANewOnlineUserInHash:setANewOnlineUserInHash,
    deleteUserFromHash:deleteUserFromHash
}

