/*
client.js

Author: Nikolas Martelaro (nmartelaro@gmail.com)
Extended: David Goeicke (da.goedicke@gmail.com)
Purpose: This run the interactivity and communication for the web app. This file
is served to the users web browser and executes on the browser.

Usage: This file is called automatically when the webpage is served.

//--Addition. Added a button handling for the `Take a picture` button.
*/

// WebSocket connection setup
var socket = io();

// send out LedOn message over socket
function ledON() {
  socket.emit('ledON');
}

// send out ledOFF message over socket
function ledOFF() {
  socket.emit('ledOFF');
}

//-- Addition: Forward the `Take a picture` button-press to the webserver.
function takePicture(){
  socket.emit('takePicture');
}

//-- Addition: This function receives the new image name and applies it to html element.

socket.on('newPicture', function(msg) {
  document.getElementById('pictureContainer').src=msg;
});
// read the data from the message that the server sent and change the
// background of the webpage based on the data in the message
socket.on('server-msg', function(msg) {
  msg = msg.toString();
  console.log('msg:', msg);
  switch (msg) {
    case "light":
      document.body.style.backgroundColor = "white";
      console.log("white")
      takePicture()
//       //('takePicture', function() {
//       /// First, we create a name for the new picture.
//       /// The .replace() function removes all special characters from the date.
//       /// This way we can use it as the filename.
//       var imageName = new Date().toString().replace(/[&\/\\#,+()$~%.'":*?<>{}\s-]/g, '');

//       console.log('making a making a picture at'+ imageName); // Second, the name is logged to the console.

//       //Third, the picture is  taken and saved to the `public/`` folder
//       NodeWebcam.capture('public/'+imageName, opts, function( err, data ) {
//       io.emit('newPicture',(imageName+'.jpg')); ///Lastly, the new name is send to the client web browser.
//       /// The browser will take this new name and load the picture from the public folder.
//     //});
      break;
    case "dark":
      document.body.style.backgroundColor = "black";
      console.log("black");
      break;
    default:
      //console.log("something else");
      break;
  }
});
