/*
 * Import Sockets UDP Datagram
 */
const dgram = require('dgram');
/*
 * New instances of dgram.Socket
 */
const server = dgram.createSocket('udp4');
/*
 * Generate a v4 UUID (random)
 */
const uuid = require('uuid');
const { v4: uuidv4 } = require('uuid');
/**
* Import protocol
*/
var protocol = require('./protocol');
/*
 * New instances of map instruments and song
 */
const instruments = new Map([
                            ["piano", "ti-ta-ti"],
                            ["trumpet",  "pouet"],
                            ["flute",    "trulu"],
                            ["violin", "gzi-gzi"],
                            ["drum", "boum-boum"]
                            ]);
/*
 * verification of user input
 */
if(process.argv.length != 3){
    console.log('Invalid number of arguments');
    console.log('Usage: node app.js <instrument>');
    return;
}

/**
 * Load the name of instrument input by user
 */
var instrument = process.argv[2];
/**
 * get the sound of instrument
 */
var sound = instruments.get(instrument);
/**
 * Check if instrument input is in Map
 */
if(sound == null){
    console.log('Invalid instrument');
    return;
}
// class instrument
class Instrument {

    constructor(uuid, sound) {
      this.uuid = uuid;
      this.sound  = sound;
    }

    start(){
      setInterval(this.update.bind(this), 5000);
    }

    update() {
        var  payload = JSON.stringify(this);
        var  message = new Buffer.from(payload);
        server.send(message, 0, message.length, protocol.PROTOCOL_MULTICAST_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, (err, bytes) => {
            if(err){
                throw new Error(err);
            }
          console.log("Sending ad: " + payload + " via port " + protocol.PROTOCOL_MULTICAST_PORT);
        });
    };
  }

  let instru = new Instrument(uuidv4(), sound);
  instru.start();
