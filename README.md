# battle-game-client

This is a demo app for the [battle-game](https://github.com/rjriel/battle-game) server.

The strategy for this app is to perform the opposite action of last turn (ie. heal if last move was attack, attack if last move was heal)

## IMPORTANT

At the time of writing this readme there were issues with the [socket.io-client](https://www.npmjs.com/package/socket.io-client) npm package, so you may have to manually add it to the node_modules folder
