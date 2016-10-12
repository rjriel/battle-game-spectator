const config = require('./config')
const io = require('socket.io-client')
const request = require('request')
let lastMove
let playerId

console.log('connecting')

let queryData = `apiId=${process.argv[2]}&apiSecret=${process.argv[3]}`
let apiKey = new Buffer(`${process.argv[2]}:${process.argv[3]}`).toString('base64')

let socket = io.connect(`http://${config.host}:${config.socketPort}`, {query: queryData})
console.log('connection requested')

var keypress = require('keypress')

keypress(process.stdin)

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  if (key && key.ctrl && key.name == 'c') {
    process.exit()
  }
  if (key && key.name == 'a') {
    console.log('attack')
    lastMove = 'heal'
    performMove()
  }
  if (key && key.name == 'h') {
    console.log('heal')
    lastMove = 'attack'
    performMove()
  }
})

process.stdin.resume()

socket.on('connect', (data) => {

  let playerId
  console.log('connected')
  // once connected we need to enter the arena
  // passing in our ID

  socket.on('success', (player) => {
    playerId = player.id
    console.log('logged in')
  })


  socket.on('start game', (game) => {

    console.log('game started')
    // if the current player is us, we want to play
    getGame(game.id)
        .then((game) => {
          if (game.current === playerId) {
            console.log("your turn. type 'a <enter>' to attack or 'h <enter>' to heal.")
          }
        })
  })

  socket.on('in game', (game) => {

    console.log('already in game')

    getGame(game.id)
        .then((game) => {
          if (game.current === playerId) {
            console.log('your turn')
          }
        })
  })


  socket.on('move played', (move) => {
    // if the move just played wasn't by us, we want to
    // make a move

    if (move.player != playerId) {
      console.log(`opponent performed ${move.result}`)
      performMove()
    }
  })

  socket.on('invalid', (error) => {
    // an invalid action has occurred, we should log it
    console.log("Invalid Action", error)
  })

  socket.on('game over', (game) => {
    // game is over
    console.log("Game Over")
    if(game.game.winner === playerId) {
      console.log("You Won!!!")
    } else {
      console.log("You Lost :(")
    }
  })
})

let getGame = (gameId) => {
  return new Promise((resolve, reject) => {
    const options = {
      uri: `http://${config.host}:${config.apiPort}/games/${gameId}`,
      method: 'GET',
      headers: {
        "Authorization": `Basic ${apiKey}`
      }
    }

    request.get(options, (error, res, body) => {
      if (error) {
        console.error("Error Getting Game", error)
        reject(error)
      } else {
        resolve(JSON.parse(body))
      }
    })
  })
}

let performMove = () => {

  // this is where we would put our logic for deciding which move to make
  // here we are just doing the opposite of what we did last

  lastMove = lastMove === "attack" ? "heal" : "attack"
  var body = {action: lastMove}

  const options = {
    uri: `http://${config.host}:${config.apiPort}/moves`,
    method: 'POST',
    headers: {
      "Authorization": `Basic ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  }

  request.post(options, (error, res, body) => {
    if(error) {
      console.log("Error Performing Move", error)
    } else if (res.statusCode != 200) {
      console.log("Error Performing Move", res.body)
    } else {
      console.log(`${lastMove} performed successfully`)
    }
  })

}
