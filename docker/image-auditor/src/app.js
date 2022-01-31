/*
 * Import Sockets UDP Datagram
 */
const dgram = require('dgram');
/*
 * New instances of dgram.Socket
 */
const socket = dgram.createSocket('udp4');
/**
 * and lodash for algorithmic
*/
var _ = require('lodash');
/**
 *  for TCP network 
 */
var net = require('net');
/**
 *  for date
 */
var moment = require('moment');

/**
* Import protocol
*/
var protocol = require('./protocol');

/*
 * Generate a v4 UUID (random) 
 */

const uuid = require('uuid');
const { v4: uuidv4 } = require('uuid');

/*
 * New instances of map instrument and son
 */
var instruments = new Map();
instruments.set("ti-ta-ti", "piano");
instruments.set("pouet", "trumpet");
instruments.set("trulu", "flute");
instruments.set("gzi-gzi", "violin");
instruments.set( "boum-boum", "drum");

/*
 * check user input
 */
if(process.argv.length != 2){
    console.log('Invalid numbers of arguments');
    console.log('Usage: node app.js <>');
    return;
}
/*
 * New instance of musician to store active musician
 */
var musician = new Map();

/*
 * Bind the multicast port and join multicast group
 */
socket.bind(protocol.PROTOCOL_MULTICAST_PORT, () => {
  socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
  });
socket.on('message', (msg, rinfo) => {

    var newSound = JSON.parse(msg);
    var instrument = {
                      uuid : newSound.uuid,
                      instrument : instruments.get(newSound.sound),
                      activeSince: moment().toISOString()
                     };
    // store musicians
    musician.set(instrument.uuid, instrument);
});

var server = net.createServer((sock) => {
    var arraymus = new Array();

    for(var [key, value] of musician.entries()){
      if(moment().diff(value.activeSince, 'seconds') > 5){
        musician.delete(key);
      }else{
       // store active musician
        console.log("Active musician: " + value + " via port " + server.address().port);
        arraymus.push(value);
      }
    }
    // send array before closimg the connection
    sock.end(JSON.stringify(arraymus));
});
// server would listen on the port and address specified in the protocol
server.listen(protocol.PROTOCOL_TCP_PORT, protocol.PROTOCOL_TCP_ADDRESS);
