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
- [x] Create game that wraps around cube
    - [x] Left-Right Horizontal
    - [x] Left-right vertical
    - [x] Up-down vertical
- [x] Update BFS reveal to traverse faces
- [x] Change game to generate on click instead of page load
- [x] Allow resetting/restarting the game after loss
- [x] Keep track of remaining free tiles to be revealed
- [x] Show win message once all free tiles have been revealed
- [x] Show all bombs on a loss
- [x] Add a timer -- stop it on loss or win
- [x] Add a mine density slider
- [x] Add a board size slider
- [x] Add a skybox for a background
- [ ] Add lighting
- [ ] Add sound effects (remove tile, loss, win, flag, multiple-tile break)
- [x] Add soundtrack
