# battle-game-spectator

## Overview

This is a demo spectator app for the [battle-game](https://github.com/rjriel/battle-game) server.

The point of this app is to log in with a player under the "spectator" role and track existing
games as they're played

## Getting started
To get up and running please follow the following steps

1. clone the repo
2. run `npm install` to install dependencies
3. add a config.js file to the root of the project. It should look like the following:
```
    module.exports = {
      host: <The server to connect to (ie. localhost)>,
      socketPort: <The port to connect to the socket over (ie. 3000)>,
      apiPort: <The port to connect to the api over (ie. 8080)>
    }
```
4. run `node index.js <player api id> <player api secret>`

## Contributing
Please feel free to contribute to this project. Work on issues, open issues for bugs/enhancements and create pull requests. You can view the [CONTRIBUTING](CONTRIBUTING) document for more information
