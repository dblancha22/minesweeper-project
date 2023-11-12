# 3D Minesweeper Graphics Project

## Installation and Running the Project
* Install [Node.js](https://nodejs.org/en/download/)
* `cd` to the project directory
* Run `npm install`
* Run `npx vite`
* Navigate to the url that `npx vite` provides
    * It should be `localhost:xxxx`, where `xxxx` is a 4-digit port number
* The hot-reload function is broken and duplicates files
    * After every change to the code, go to the terminal running the server and press `r` to restart it

## Game Settings
* The game size can currently be adjusted using the `game_size` variable in `main.js`
    * An `NxN` board will be generated according to that variable

## Playing
* Use `wasd` to rotate the cube
* Click on a tile to remove it from the scene
* Right click on a tile to flag it

## Todo
- [ ] Create game that wraps around cube
- [ ] Keep track of remaining free tiles to be revealed
- [ ] Show win message once all free tiles have been revealed
- [ ] Show all bombs on a loss
- [ ] Add a timer
- [ ] Add a mine density slider
- [ ] Add a board size slider
