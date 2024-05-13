require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const helmet=require('helmet')
const cors=require('cors')

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({origin: '*'}))
app.use(helmet({
  frameguard: false,
  hidePoweredBy: {setTo: 'PHP 7.4.3'}
}))
app.use(helmet.noCache())

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

const io=socket(server)

let players=[]
let defaultColors=[[46,25,58],[0,90,70]]
let playerColors=[]

let coin=newCoin()

io.on('connection', socket=>{

  let addPlayer=newPlayer(socket.id)
  players.push(addPlayer)
  console.log('User connected: ', socket.id, ', players count: ', players.length)

  socket.emit('start', players, coin, socket.id)
  socket.broadcast.emit('new player', addPlayer)

  socket.on('movement', direction=>{
    //console.log(`Player ${socket.id} moves in direction- ${direction}`)
    io.emit('movement', socket.id, direction)
  })

  socket.on('collision', coinValue=>{
    players.find(player=>player.id==socket.id).score+=coinValue
    coin=newCoin()
    io.emit('collision', socket.id, coinValue, coin)
  })

  socket.on('disconnect', ()=>{

    // update players and color palette
    players=players.filter(player=>player.id!=socket.id)
    playerColors=players.map(player=>player.color.match(/\d+/g))
    console.log('User have disconnected, number of players left: ', players.length)
    console.log(players)
    
    io.emit('player left', socket.id)
  })

})

//take [hue, sat, light] values and generate a hsl color string
function parseColor(arr){
  return `hsl(${arr[0]}, ${arr[1]}%, ${arr[2]}%)`
}

//generate random color values, which do not match with current colors
function colorGen(){
  
  let hue=getRandomNum(20,340)
  let sat=getRandomNum(50, 90)
  let light=getRandomNum(30,70)
  let color=[hue, sat, light]

  //compare if two sets of color values have contrast
  let compareCol=(colorOne, colorTwo)=>{
    const minDif=60
    let dif=colorOne.reduce((contrast, value, i)=>{
      contrast+=Math.abs(value-colorTwo[i])
      return contrast
    }, 0)
    return dif>minDif
  }
  if ([...defaultColors, ...playerColors].every(hsl=>compareCol(hsl, color))){
    return color
  }
  return colorGen()
}

function newCoin(){
  let x=getRandomX()
  let y=getRandomY()
  let id='coin'
  let value=getRandomNum(10,20)
  let color=parseColor([0,90,70])
  return {x,y,id,value, color}
}

function newPlayer(id){
  let x=getRandomX()
  let y=getRandomY()
  let score=0
  let color=colorGen()
  playerColors.push(color)
  color=parseColor(color)
  return {x,y,id,score, color}
}

function getRandomX(){
  return getRandomNum(20,620)
}
function getRandomY(){
  return getRandomNum(64,460)
}
function getRandomNum(min, max) {
  const range=max-min+1
  const random=Math.random() * range + min
  return Math.floor(random)
}

module.exports = app; // For testing