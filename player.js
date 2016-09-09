const io = require('socket.io-client')

module.exports = (host, playerName) => {

  let opponent = {}
  let me = {}
  let moves = []
  let lastMove = "attack"

  console.log('connecting')
  let socket = io.connect(host)
  console.log('connection requested')

  socket.on('connect', (data) => {
    console.log('connected')
    socket.emit('enter arena',{id: '57b5c288d08df10a4761d7a8'})
  })

  socket.on('request registration', () => {
    console.log('registration requested')
    socket.emit('register', {
      name: playerName
    })
  })

  socket.on('registered', (data) => {
    console.log('registered')
    me.id = data.id
    socket.emit('request game', {})
  })

  socket.on('disconnect', () => {
    console.log('disconnected')
  })

  socket.on('start game', (data) => {
    console.log('game started')
    data.players.forEach((player) => {
      if (player.id !== me.id) {
        opponent = player
      } else {
        me = player
      }
    })
    if (data.current === me.id) {
      console.log("Playing first")
      play()
    }
  })

  socket.on('waiting', () => {
    console.log('waiting on new player')
  })

  socket.on('invalid', (data) => {
    console.log(data.message)
  })

  socket.on('game over', (data) => {
    console.log("GAME OVER!")
    if (data.winner === me.id) {
      console.log("YOU WON!!!!")
    } else {
      console.log("You Lost")
    }
    console.log(data.moves.length.toString(), "Moves")
    socket.emit('request game', {})
  })

  socket.on('opponent played', (data) => {
    console.log('opponent played')
    processMove(data)
    play()
  })

  socket.on('played', (data) => {
    console.log('you played')
    processMove(data)
  })

  let processMove = (move) => {
    moves.push(move)
    if (move.player == me.id) {
      if (move.action == "attack") {
        opponent.health -= move.value
      } else {
        me.health += move.value
      }
    } else {
      if (move.action == "attack") {
        me.health -= move.value
      } else {
        opponent.health += move.value
      }
    }
    console.log("You", me.health, "Opponent", opponent.health)
  }

  let play = () => {
    console.log('playing')
    if (lastMove == "attack") {
      lastMove = "heal"
      console.log("Healing...")
      socket.emit('heal', {})
    } else {
      lastMove = "attack"
      console.log("Attacking...")
      socket.emit('attack', {})
    }
  }

}
