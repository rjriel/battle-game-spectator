const player = require('./player')
const config = require('./config')
const io = require('socket.io-client')
let lastMove = ""

console.log('connecting')
let socket = io.connect(config.host)
console.log('connection requested')

var keypress = require('keypress');

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  if (key && key.ctrl && key.name == 'c') {
    process.exit()
  }
  if (key && key.name == 'a') {
    console.log('attack')
    socket.emit('attack')
  }
  if (key && key.name == 'h') {
    console.log('heal')
    socket.emit('heal')
  }
});

process.stdin.setRawMode(true);
process.stdin.resume();

socket.on('connect', (data) => {
  console.log('connected')
  socket.emit('enter arena',{id: process.argv[2]})
  socket.on('in arena',() => { socket.emit('ready to play',{}) })
  socket.on('start game', (game) => {
    console.log('game started')
    if (game.current === process.argv[2]) {
      console.log('your turn')
    }
  })
  socket.on('move played', (move) => {
    console.log("MOVE PLAYED", move)
    if(move.player != process.argv[2]) {
      performMove()
    }
  })
  socket.on('invalid', (error) => {
    console.log("INVALID ACTION", error)
  })
  socket.on('game over', (game) => {
    console.log("GAME OVER", game)
  })
})

let performMove = () => {
  if (lastMove !== "attack") {
    lastMove = "attack"
    socket.emit("attack")
  } else {
    lastMove = "heal"
    socket.emit("heal")
  }
}
