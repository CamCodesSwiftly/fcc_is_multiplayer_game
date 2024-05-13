import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const ctx = canvas.getContext('2d');

let Players=[]
let frame
let curCoin
let score=0
let ranking

socket.on('start', (players, coin, myId)=>{
  
  cancelAnimationFrame(frame)

  players.forEach(player=>{
    let newPlayer=new Player(player)

    Players.push(newPlayer)
  })
  let thisPlayer=Players.find(player=>player.id==myId)
  ranking=thisPlayer.calculateRank(Players)

  curCoin=new Collectible(coin)

  socket.on('new player', player=>{
    let newPlayer=new Player(player)
    Players.push(newPlayer)
    ranking=thisPlayer.calculateRank(Players)
  })

  socket.on('player left', playerId=>{
    Players=Players.filter(player=>playerId!=player.id)
    ranking=thisPlayer.calculateRank(Players)
  })

  document.onkeydown=e=>{
    let key=e.keyCode

    let direction
    switch(key){
      case 87: case 38: direction='up'; break
      case 83: case 40: direction='down'; break
      case 65: case 37: direction='left'; break
      case 68: case 39: direction='right'
    }

    if (direction){
      socket.emit('movement', direction)
    }

  }

  socket.on('movement', (playerId, direction)=>{
    let player=Players.find(player=>player.id==playerId)
    player.movePlayer(direction, 10)
    if (myId==playerId){
      if (player.collision(curCoin)){
        socket.emit('collision', curCoin.value)
      }
    }
  })

  socket.on('collision', (playerId, value, coin)=>{
    let player=Players.find(player=>player.id==playerId)
    player.score+=value

    ranking=thisPlayer.calculateRank(Players)
    curCoin=new Collectible(coin)
    if (myId==playerId){
      score=player.score
    }
  })

  update()
})

function update(){

  ctx.clearRect(0 ,0 , 640, 480)

  ctx.lineWidth=4
  ctx.strokeStyle = curCoin.color;
  ctx.strokeRect(2, 2, 640-4, 44)
  //ctx.fillStyle = 'rgb(121, 145, 175)'
  //ctx.fillRect(0, 0, 640, 480)
  
  // let test=Players.sort((a, b)=>b.score-a.score).map(p=>p.score).join('|')
  let text=`<> Your score: ${score} <> ${ranking} <>`
  ctx.font = `30px sans-serif`
  ctx.fillStyle=curCoin.color
  ctx.fillText(text, 80, 36)
  ctx.lineWidth=1
  ctx.strokeStyle='black'
  ctx.strokeText(text, 80, 36);

  Players.forEach(player=>{
    player.draw(ctx)
  })

  curCoin.draw(ctx)

  frame=window.requestAnimationFrame(update)
}

//obsolete function to get rank
function getRank(id){
  return Players.sort((a, b)=>b.score-a.score).findIndex(player=>player.id==id)+1
}

 
