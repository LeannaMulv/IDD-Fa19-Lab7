# Video Doorbell, Lab 7

*A lab report by John Q. Student*

### In This Report

1. Upload a video of your version of the camera lab to your lab Github repository
1. As usual, update your class Hub repository to add your [forked IDD-Fa18-Lab7](/FAR-Lab/IDD-Fa18-Lab7) repository.
1. Answer the questions in-line below on your README.md.

## Part A. HelloYou from the Raspberry Pi

**a. Link to a video of your HelloYou sketch running.**

https://youtu.be/LOLNgCp_RTY

## Part B. Web Camera

**a. Compare `helloYou/server.js` and `IDD-Fa18-Lab7/pictureServer.js`. What elements had to be added or changed to enable the web camera? (Hint: It might be good to know that there is a UNIX command called `diff` that compares files.)**

Here's what diff -y spit out initially. To enable the web camera I ended up adding takePicture() to the server-msg function in the client.js.

pi@ixe147:~ $ diff -y helloYou/server.js IDD-Fa19-Lab7/pictureServer.js
const express = require('express'); // web server application |	/*
const http = require('http');       // http basics	      |	server.js
const app = express();				// instantiat <
const server = http.Server(app);	// connects http libr <
const io = require('socket.io')(server);	// connect we <
const serverPort = 8000;            // port (ixe##.local:PORT <

const SerialPort = require('serialport')		      |	Authors:David Goedicke (da.goedicke@gmail.com) & Nikolas Mart
const Readline = require('@serialport/parser-readline')	      |
							      >	This code is heavily based on Nikolas Martelaroes interaction
							      >	The  original purpose was:
							      >	This is the server that runs the web application and the seri
							      >	communication with the micro controller. Messaging to the mic
							      >	using serial. Messaging to the webapp is done using WebSocket
							      >
							      >	//-- Additions:
							      >	This was extended by adding webcam functionality that takes i
							      >
							      >	Usage: node server.js SERIAL_PORT (Ex: node server.js /dev/tt
							      >
							      >	Notes: You will need to specify what port you would like the 
							      >	served from. You will also need to include the serial port ad
							      >	line input.
							      >	*/
							      >
							      >	var express = require('express'); // web server application
							      >	var app = express(); // webapp
							      >	var http = require('http').Server(app); // connects http libr
							      >	var io = require('socket.io')(http); // connect websocket lib
							      >	var serverPort = 8000;
							      >	var SerialPort = require('serialport'); // serial library
							      >	var Readline = SerialPort.parsers.Readline; // read serial da
							      >	//-- Addition:
							      >	var NodeWebcam = require( "node-webcam" );// load the webcam 
							      >
							      >	//---------------------- WEBAPP SERVER SETUP ----------------
// use express to create the simple webapp			// use express to create the simple webapp
app.use(express.static('public'));	// find pages in publ |	app.use(express.static('public')); // find pages in public di

// check to make sure that the user calls the serial port for |	// check to make sure that the user provides the serial port 
// running the server					      |	// when running the server
if(!process.argv[2]) {					      |	if (!process.argv[2]) {
    console.error('Usage: node '+process.argv[1]+' SERIAL_POR |	  console.error('Usage: node ' + process.argv[1] + ' SERIAL_P
    process.exit(1);					      |	  process.exit(1);
}								}

// initialize the serial port based on the user input	      |	// start the server and say what port it is on
const port = new SerialPort(process.argv[2])		      |	http.listen(serverPort, function() {
							      |	  console.log('listening on *:%s', serverPort);
// create a parser so that we can easily handle the incoming  |	});
const parser = port.pipe(new Readline({			      |	//-----------------------------------------------------------
    delimiter: '\r\n'					      <
}))							      <

							      >	//--Additions:
							      >	//----------------------------WEBCAM SETUP-------------------
							      >	//Default options
							      >	var opts = { //These Options define how the webcam is operate
							      >	    //Picture related
							      >	    width: 1280, //size
							      >	    height: 720,
							      >	    quality: 100,
							      >	    //Delay to take shot
							      >	    delay: 0,
							      >	    //Save shots in memory
							      >	    saveShots: true,
							      >	    // [jpeg, png] support varies
							      >	    // Webcam.OutputTypes
							      >	    output: "jpeg",
							      >	    //Which camera to use
							      >	    //Use Webcam.list() for results
							      >	    //false for default device
							      >	    device: false,
							      >	    // [location, buffer, base64]
							      >	    // Webcam.CallbackReturnTypes
							      >	    callbackReturn: "location",
							      >	    //Logging
							      >	    verbose: false
							      >	};
							      >	var Webcam = NodeWebcam.create( opts ); //starting up the web
							      >	//-----------------------------------------------------------


// this is the websocket event handler and say if someone con <
// as long as someone is connected, listen for messages	      <
io.on('connect', function (socket) {			      <
    console.log('a user connected');			      <

    // if you get the 'ledON' msg, send an 'H' to the arduino |	//---------------------- SERIAL COMMUNICATION (Arduino) -----
    socket.on('ledON', function () {			      |	// start the serial port connection and read on newlines
        console.log('ledON');				      |	const serial = new SerialPort(process.argv[2], {});
        port.write('H');				      |	const parser = new Readline({
    });							      |	  delimiter: '\r\n'
							      <
    // if you get the 'ledOFF' msg, send an 'L' to the arduin <
    socket.on('ledOFF', function () {			      <
        console.log('ledOFF');				      <
        port.write('L');				      <
    });							      <
							      <
    // if you get the 'disconnect' message, say the user disc <
    socket.on('disconnect', function () {		      <
        console.log('user disconnected');		      <
    });							      <
});								});

// this is the serial port event handler		      |	// Read data that is available on the serial port and send it
// note that we are using the parser			      |	serial.pipe(parser);
// read the serial data coming from arduino - you must use 'd <
// and send it off to the client using a socket message	      <
parser.on('data', function(data) {				parser.on('data', function(data) {
    console.log('data:', data);				      |	  console.log('Data:', data);
    io.emit('server-msg', data);			      |	  io.emit('server-msg', data);
})							      |	});
							      >	//-----------------------------------------------------------

// start the server and say what port it is on		      |
server.listen(serverPort, function () {			      |	//---------------------- WEBSOCKET COMMUNICATION (web browser
    console.log('listening on *:%s', serverPort);	      |	// this is the websocket event handler and say if someone con
});							      \	// as long as someone is connected, listen for messages
							      >	io.on('connect', function(socket) {
							      >	  console.log('a user connected');
							      >
							      >	  // if you get the 'ledON' msg, send an 'H' to the Arduino
							      >	  socket.on('ledON', function() {
							      >	    console.log('ledON');
							      >	    serial.write('H');
							      >	  });
							      >
							      >	  // if you get the 'ledOFF' msg, send an 'L' to the Arduino
							      >	  socket.on('ledOFF', function() {
							      >	    console.log('ledOFF');
							      >	    serial.write('L');
							      >	  });
							      >
							      >	  //-- Addition: This function is called when the client clic
							      >	  socket.on('takePicture', function() {
							      >	    /// First, we create a name for the new picture.
							      >	    /// The .replace() function removes all special character
							      >	    /// This way we can use it as the filename.
							      >	    var imageName = new Date().toString().replace(/[&\/\\#,+(
							      >
							      >	    console.log('making a making a picture at'+ imageName); /
							      >
							      >	    //Third, the picture is  taken and saved to the `public/`
							      >	    NodeWebcam.capture('public/'+imageName, opts, function( e
							      >	    io.emit('newPicture',(imageName+'.jpg')); ///Lastly, the 
							      >	    /// The browser will take this new name and load the pict
							      >	  });
							      >
							      >	  });
							      >	  // if you get the 'disconnect' message, say the user discon
							      >	  socket.on('disconnect', function() {
							      >	    console.log('user disconnected');
							      >	  });
							      >	});
							      >	//-----------------------------------------------------------
pi@ixe147:~ $ 


**b. Include a video of your working video doorbell**

https://youtu.be/UMmoGwH4U_o

## Part C. Make it your own

**a. Find, install, and try out a node-based library and try to incorporate into your lab. Document your successes and failures (totally okay!) for your writeup. This will help others in class figure out cool new tools and capabilities.**

**b. Upload a video of your working modified project**

I attempted to try out a node-based library with limited success - I got stuck on the installation. I'm not sure what do with homebrew. I installed the nyancat library and I'm not sure what it is supposed to do. I tried using the commands in the terminal and I think maybe I was in the wrong spot?

I did make the video doorbell my own. I added an led and the piezo speaker with a song at the doorbell. Here's the video.

https://youtu.be/gqvHe6qrh94
