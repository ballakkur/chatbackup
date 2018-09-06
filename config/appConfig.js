let appConfig = {
    port :3000,
    allowedCorsOrigin:"*",
    env:"dev",
    db:{
        url:'mongodb://127.0.0.1:27017/chatbox'
    },
    apiVersion:'/api/v1'
}
module.exports = {
    appConfig
}