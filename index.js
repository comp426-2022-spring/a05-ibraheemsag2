// Place your server entry point code here
// Require Express.js
const express = require('express')
const app = express()
const db = require("./src/services/database.js")

const morgan = require('morgan');
const arg = require('minimist')(process.argv.slice(2))
const stream = require('stream');
const fs = require('fs');
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static("./public"));
arg["help", "port", "debug", "log"]
// Store help text 
const help = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)
// Start an app server
const port =  arg.port||process.env.PORT|| 5555

// If --help or -h, echo help text to STDOUT and exit
if (arg.help || arg.h) {
    console.log(help)
    process.exit(0)
}

const debug = arg.debug || false

if(debug == true){
  app.get('/app/log/access', (req, res) => { 
    const stmt = db.prepare('SELECT * FROM accesslog').all()
    res.status(200).json(stmt)
});
  app.get('/app/error', (req, res) => { 
    throw new Error('Error test successful')
  });}

// Use morgan for logging to files
// Create a write stream to append (flags: 'a') to a file
const log = arg.log || true
if(log == true){
  const accessLog = fs.createWriteStream("access.log", { flags: 'a' })
  // Set up the access logging middleware
  app.use(morgan('combined', { stream: accessLog }))}

app.use((req, res, next) => {
  let logdata = {
      remoteaddr: req.ip,
      remoteuser: req.user,
      time: Date.now(),
      method: req.method,
      url: req.url,
      protocol: req.protocol,
      httpversion: req.httpVersion,
      status: res.statusCode,
      referer: req.headers["referer"],
      useragent: req.headers["user-agent"],
  };
  const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
  next();
});













const server = app.listen(port, () => {
  console.log('App listening on port %PORT%'.replace('%PORT%',port))
});
// Default response for any other request


//200 Status code
app.get('/app/', (req, res) => {
    // Respond with status 200
        res.statusCode = 200;
    // Respond with status message "OK"
        res.statusMessage = 'OK';
        res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
        res.end(res.statusCode+ ' ' +res.statusMessage)
    });
//normal flip
app.get('/app/flip/', (req, res) => {
  res.status(200).json({"flip" : coinFlip()})
    });

//Guess
app.get('/app/flip/call/tails', (req, res) => {
    const val = flipACoin("tails")
    res.status(200).json(val)
    });
app.get('/app/flip/call/heads', (req, res) => {
  const val = flipACoin("heads")
  res.status(200).json(val)
});
//Return number flips
app.get('/app/flips/:number', (req, res) => {
  const array = coinFlips(req.params.number)
  res.status(200).json({ 'raw' : array, 'summary' : countFlips(array) })
    });

/** Coin flip functions 
 * This module will emulate a coin flip given various conditions as parameters as defined below
 */

/** Simple coin flip
 * 
 * Write a function that accepts no parameters but returns either heads or tails at random.
 * 
 * @param {*}
 * @returns {string} 
 * 
 * example: coinFlip()
 * returns: heads
 * 
 */

function coinFlip() {
    const value = Math.floor(Math.random() * 2);
    if(value == 0){
      return "heads";
    }
    return "tails";
  }
  
  /** Multiple coin flips
   * 
   * Write a function that accepts one parameter (number of flips) and returns an array of 
   * resulting "heads" or "tails".
   * 
   * @param {number} flips 
   * @returns {string[]} results
   * 
   * example: coinFlips(10)
   * returns:
   *  [
        'heads', 'heads',
        'heads', 'tails',
        'heads', 'tails',
        'tails', 'heads',
        'tails', 'heads'
      ]
   */
  
function coinFlips(flips) {
    let array = [];
    for(let i = 0; i < flips; i++){
    array[i] = coinFlip();
    }
    return array;
  }
  
  /** Count multiple flips
   * 
   * Write a function that accepts an array consisting of "heads" or "tails" 
   * (e.g. the results of your `coinFlips()` function) and counts each, returning 
   * an object containing the number of each.
   * 
   * example: conutFlips(['heads', 'heads','heads', 'tails','heads', 'tails','tails', 'heads','tails', 'heads'])
   * { tails: 5, heads: 5 }
   * 
   * @param {string[]} array 
   * @returns {{ heads: number, tails: number }}
   */
  
function countFlips(array) {
    let counter = 0;
    for(let i = 0; i < array.length; i++){
      if(array[i] == "Heads"){
        counter = counter + 1;
      }
  
    return {tails: array.length - counter, heads: counter}};
  
  }
  
  /** Flip a coin!
   * 
   * Write a function that accepts one input parameter: a string either "heads" or "tails", flips a coin, and then records "win" or "lose". 
   * 
   * @param {string} call 
   * @returns {object} with keys that are the input param (heads or tails), a flip (heads or tails), and the result (win or lose). See below example.
   * 
   * example: flipACoin('tails')
   * returns: { call: 'tails', flip: 'heads', result: 'lose' }
   */
  
function flipACoin(call) {
    const coin = coinFlip()
    if(coin == call){
      results = "win"
    }
    else{
      results = "lose"
    }
    return  { call: call, flip: coin, result: results}
  }
  app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
});
  
  /** Export 
   * 
   * Export all of your named functions
  */
  