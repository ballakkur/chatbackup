// connecting with sockets.
const socket = io('http://localhost:3000');

const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6InluMFpWS3U1cyIsImlhdCI6MTUzNjIwNzIzNzQ5NywiZXhwIjoxNTM2MjkzNjM3LCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJjaGF0Qm94IiwiZGF0YSI6eyJlbWFpbCI6InNvbWVvbmVAZ21haWwuY29tIiwibW9iaWxlTnVtYmVyIjo5MTI0NTg5NDQ2LCJncm91cHMiOlsiTnRfX2JXeGZBIl0sInVzZXJJZCI6ImlkcHBRQXNDMSIsImZpcnN0TmFtZSI6InNvbWUiLCJsYXN0TmFtZSI6Im9uZSJ9fQ.bKYDaWiEy3Fl9_gJyUxAh60zx-Sw7VlSW13E0HXUrDk"
const userId= "idppQAsC1";

let chatSocket = () => {

  socket.on('verifyUser',()=>{
    console.log('server verifying the user');
    socket.emit('setUser',authToken);
  });
  //authError
  socket.on('authError',(data)=>{
    data.user='user2';
    console.log(data);
  });
  //when server emits event named my userId
  socket.on(userId,(message)=>{
    console.log(message);
  });
  //emit chatMessage event specifying receiver
  let chatMessage = {
    senderId:userId,
    receiverId:'Vwe9oib_U',
    senderName:'someone',
    receiverName:'Karthik'
  }
  //online user list
  socket.on('onlineUsers',(list)=>{
    console.log('list of user online right now');
    console.log(list);
  });
  //
  $("#send").on('click', function () {

    let messageText = $("#messageToSend").val()
    chatMessage.message = messageText;
    socket.emit("chatMessage",chatMessage)

  })

  $("#messageToSend").on('keypress', function () {
    socket.emit("typing",chatMessage.senderName);

  })

  socket.on("typing", (data) => {

    console.log(data+" is typing")
    
    
  });

}// end chat socket function

chatSocket();
