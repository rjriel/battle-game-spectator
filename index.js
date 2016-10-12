const config = require('./config')
const io = require('socket.io-client')
const request = require('request')

console.log('connecting')

let players = {}
let games = {}

let queryData = `apiId=${process.argv[2]}&apiSecret=${process.argv[3]}`
let apiKey = new Buffer(`${process.argv[2]}:${process.argv[3]}`).toString('base64')

let socket = io.connect(`http://${config.host}:${config.socketPort}`, {query: queryData})
console.log('connection requested')

socket.on('connect', (data) => {

  console.log('connected')
  // once connected we need to enter the arena
  // passing in our ID

  socket.on('success', () => {
    console.log('logged in')
    getGames()
        .then((games) => {
          games.forEach((game) => {
            if (game.winner == null) {
              processGame(game)
            }
          })
        })
  })


  socket.on('start game', (game) => {
    getGame(game.id)
        .then(processGame)
  })


  socket.on('move played', (move) => {
    getMove(move.id)
        .then((move) => {
          let playerName = players[move.player].name
          let opponentName
          if(games[move.game].player1 === move.player) {
            opponentName = players[games[move.game].player2].name
          } else {
            opponentName = players[games[move.game].player1].name
          }
          switch (move.result) {
            case "miss":
              console.log(`${playerName} missed ${opponentName}`)
              break;
            case "hit":
              console.log(`${playerName} hit ${opponentName} for ${move.value} points`)
              break;
            case "critical":
              console.log(`${playerName} critically hit ${opponentName} for ${move.value} points`)
              break;
            case "heal":
              console.log(`${playerName} healed ${opponentName} for ${move.value} points`)
              break;
          }
        })
  })

  socket.on('invalid', (error) => {
    // an invalid action has occurred, we should log it
    console.log("Invalid Action", error)
  })

  socket.on('game over', (game) => {
    getGame(game.id)
        .then((game) => {
          let playerName = players[game.winner].name
          let opponentName
          if(game.player1 === game.winner) {
            opponentName = players[game.player2].name
          } else {
            opponentName = players[game.player1].name
          }
          console.log(`${playerName} beat ${opponentName}`)
        })
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

let getPlayer = (playerId) => {
  return new Promise((resolve, reject) => {
    const options = {
      uri: `http://${config.host}:${config.apiPort}/players/${playerId}`,
      method: 'GET',
      headers: {
        "Authorization": `Basic ${apiKey}`
      }
    }

    request.get(options, (error, res, body) => {
      if (error) {
        console.error("Error Getting Player", error)
        reject(error)
      } else {
        resolve(JSON.parse(body))
      }
    })
  })
}

let getMove = (moveId) => {
  return new Promise((resolve, reject) => {
    const options = {
      uri: `http://${config.host}:${config.apiPort}/moves/${moveId}`,
      method: 'GET',
      headers: {
        "Authorization": `Basic ${apiKey}`
      }
    }

    request.get(options, (error, res, body) => {
      if (error) {
        console.error("Error Getting Move", error)
        reject(error)
      } else {
        resolve(JSON.parse(body))
      }
    })
  })
}

let getGames = () => {
  return new Promise((resolve, reject) => {
    const options = {
      uri: `http://${config.host}:${config.apiPort}/games`,
      method: 'GET',
      headers: {
        "Authorization": `Basic ${apiKey}`
      }
    }

    request.get(options, (error, res, body) => {
      if (error) {
        console.error("Error Getting Games", error)
        reject(error)
      } else {
        resolve(JSON.parse(body))
      }
    })
  })
}

let processGame = (game) => {
    games[game._id] = game
    getPlayer(game.player1)
      .then((player) => {
        players[player._id] = player
        return getPlayer(game.player2)
      })
      .then((player) => {
        players[player._id] = player

        console.log(`${players[games[game._id].player1].name} is playing ${player.name}`)
      })
      .catch((error) => {
        console.log("Error", error)
      })
}
