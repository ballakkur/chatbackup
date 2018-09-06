// connecting with sockets.
const socket = io('http://localhost:3000');
let authToken ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6Im5ObkZoa2JPYyIsImlhdCI6MTUzNjIwNzM0ODk4NSwiZXhwIjoxNTM2MjkzNzQ4LCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJjaGF0Qm94IiwiZGF0YSI6eyJlbWFpbCI6ImJhbGxha2t1cmthcnRoaWsxQGdtYWlsLmNvbSIsIm1vYmlsZU51bWJlciI6OTEyNDU4OTQzNSwiZ3JvdXBzIjpbIk50X19iV3hmQSJdLCJ1c2VySWQiOiJWd2U5b2liX1UiLCJmaXJzdE5hbWUiOiJLYXJ0aGlrIiwibGFzdE5hbWUiOiJSYW8ifX0.ZfOxvztTEIpvv1RPRUS3B-03zXB-fLpq-yxDmGZLcFU';
let userId = 'Vwe9oib_U';

let chatSocket = () => {
  let chatMessage = {
    receiverId:'idppQAsC1',
    senderId:userId,
    senderName:'Karthik',
    receiverName:'someone'
  }

  socket.on('verifyUser',()=>{
    console.log('server verifying the user');
    socket.emit('setUser',authToken);
  });
  //authError
  socket.on('authError',(data)=>{
    data.user='user1';
    console.log(data);
  });
  //when server emits event named my userId
 socket.on(userId,(message)=>{
   console.log(message);
 });
  socket.on('onlineUsers',(list)=>{
    console.log('list of user online right now');
    console.log(list);
  });
  $("#send").on('click', function () {
    let messageText = $("#messageToSend").val()
    chatMessage.message = messageText;
    socket.emit("chatMessage",chatMessage);
  })
  $("#messageToSend").on('keypress', function () {
    socket.emit("typing",chatMessage.senderName);

  })

  socket.on("typing", (data) => {
    console.log(data+" is typing");
  });

}// end chat socket function

chatSocket();
