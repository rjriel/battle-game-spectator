const config = require('./config')
const io = require('socket.io-client')
let lastMove

console.log('connecting')
let socket = io.connect(config.host)
console.log('connection requested')

var keypress = require('keypress');

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

process.stdin.resume();

socket.on('connect', (data) => {

  console.log('connected')
  // once connected we need to enter the arena
  // passing in our ID
  socket.emit('enter arena',{id: process.argv[2]})


  socket.on('in arena',() => {
    console.log('in the arena')

    // when in the arena, we want to let the server know we are ready to play
    socket.emit('ready to play',{})
  })


  socket.on('start game', (game) => {

    console.log('game started')

    // if the current player is us, we want to play
    if (game.current === process.argv[2]) {
      console.log('your turn')
    }
  })


  socket.on('move played', (move) => {
    console.log("MOVE PLAYED", move)

    // if the move just played wasn't by us, we want to
    // make a move
    if(move.player != process.argv[2]) {
      performMove()
    }
  })

  socket.on('invalid', (error) => {
    // an invalid action has occurred, we should log it
    console.log("INVALID ACTION", error)
  })

  socket.on('game over', (game) => {
    // game is over
    console.log("GAME OVER", game)
  })
})

let performMove = () => {

  // this is where we would put our logic for deciding which move to make
  // here we are just doing the opposite of what we did last

  if (lastMove !== "attack") {
    lastMove = "attack"
    socket.emit("attack")
  } else {
    lastMove = "heal"
    socket.emit("heal")
  }
}
