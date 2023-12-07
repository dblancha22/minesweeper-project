import * as THREE from 'three';
import { generate_game, place_bombs } from './minesweeper.js';

let setups = 0;
let game_started = false;

let intersects;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 2;

const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( 'audio/ambient.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5 );
	sound.play();
});

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let intersected;

var game;
var skydome;
export let game_size = 10;
var tiles = [];

var timer_started = false;
var start_time = 0;

let total_bombs = 0;
let total_flags = 0;
let remaining_tiles = game_size * game_size * 6;

const textures = [];

let front, left, right, back, top, bottom;

function createTileGroup(rx, ry, rz) {
    const tile_group = new THREE.Group();
    const tile_size = 1 / game_size;

    let spacing = tile_size;
    let spacing_start = -0.5 + (tile_size / 2);
    let spacing_end = 0.5;

    let minesweeper_game = generate_game();
    let x = 0;
    let y = 0;
    let count = 0;
    for (let i = spacing_start; i <= spacing_end; i += spacing) {
        for (let j = spacing_start; j <= spacing_end; j += spacing) {
            const tile_geometry = new THREE.BoxGeometry( tile_size, tile_size, 0);
            const tile_material = new THREE.MeshBasicMaterial( { transparent: true } );
            let tile = new THREE.Mesh( tile_geometry, tile_material );

            tile.data = minesweeper_game[x][y];
            tile.position.x = i;
            tile.position.y = j;
            tile.position.z = 0.5;

            tile_group.add(tile);
            x++;
            count++;
        }
        x = 0;
        y++;
    }
    tile_group.rotation.x = rx;
    tile_group.rotation.y = ry;
    tile_group.rotation.z = rz;

    tile_group.board = minesweeper_game;

    return tile_group;
}

function colorTiles(tile_group) {
    for (let i = 0; i < tile_group.children.length; i++) {
        let tile = tile_group.children[i];
        if (tile.data.bomb) {
            tile.material.map = textures[9];
        }
        else {
            tile.material.map = textures[11];
        }

        if (tile.data.revealed) {
            tile.material.map = textures[tile.data.bomb_adj_count];
        }
        if (tile.data.flagged) {
            tile.material.map = textures[10];
        }

        if (tile.data.revealed && tile.data.bomb) {
            tile.material.map = textures[12];
        }
    }
}

function placeTileSetLeft(left_tiles, right_tiles) {
    // left = 0#
    // right = game_size - 1#

    // left = 0 + i
    // right = (game_size-1)*game_size + i

    // we merge the left tiles on their right side with the right tiles on their left side

    let right_column = (game_size-1)*game_size;
    for (let i = 0; i < game_size; i++) {
        let left = left_tiles.children[right_column + i];
        // get the three tiles to the right of the left tile
        let right = right_tiles.children[i];
        let top = (i + 1 < game_size) ? right_tiles.children[i + 1] : null;
        let bottom = (i > 0) ? right_tiles.children[i - 1] : null;

        // update the bomb count in each tile
        if (right) {
            // left.data.adjacent += right.data.bomb ? 1 : 0;
            // right.data.adjacent += left.data.bomb ? 1 : 0;
            left.data.adjacent.push(right.data);
            right.data.adjacent.push(left.data);
        }
        if (top) {
            // left.data.adjacent += top.data.bomb ? 1 : 0;
            // top.data.adjacent += left.data.bomb ? 1 : 0;
            left.data.adjacent.push(top.data);
            top.data.adjacent.push(left.data);
        }
        if (bottom) {
            // left.data.adjacent += bottom.data.bomb ? 1 : 0;
            // bottom.data.adjacent += left.data.bomb ? 1 : 0;
            left.data.adjacent.push(bottom.data);
            bottom.data.adjacent.push(left.data);
        }
    }
}

function placeTopFront(top_tile, front_tile) {

    for (let i = 0; i < game_size; i++ ) {

        // game_size * i
        let bot = front_tile.children[(game_size * i)+(game_size-1)];
        // get the three tiles to the top of the bottom tile
        let top = top_tile.children[game_size * i];
        let left = (i > 0) ? top_tile.children[(game_size * (i-1))] : null;
        let right = (i + 1 < game_size) ? top_tile.children[(game_size * (i+1))] : null;
    
        if (top) {
            // bot.data.adjacent += top.data.bomb ? 1 : 0;
            // top.data.adjacent += bot.data.bomb? 1 : 0;
            bot.data.adjacent.push(top.data);
            top.data.adjacent.push(bot.data);
        }
        if (left){
            // bot.data.adjacent += left.data.bomb ? 1 : 0;
            // left.data.adjacent += bot.data.bomb ? 1 : 0;
            bot.data.adjacent.push(left.data);
            left.data.adjacent.push(bot.data);
        }
        if (right) {
            // bot.data.adjacent += right.data.bomb ? 1 : 0;
            // right.data.adjacent += bot.data.bomb ? 1 : 0;
            bot.data.adjacent.push(right.data);
            right.data.adjacent.push(bot.data);
        }
        // 
        // let topt = top_tile.children[]

    }
}

function placeTopBack(top_tile, back_tile) {
    for (let i = 0; i < game_size; i++) {

        // let back = back_tile[(game_size * (game_size-i-1))+(game_size-1)];
        let back = back_tile.children[((game_size-i-1)*game_size)+(game_size-1)];


        let top = top_tile.children[game_size * i + (game_size -1)];
        let left = (i > 0) ? top_tile.children[(game_size * (i-1))+ (game_size -1)] : null;
        let right = (i + 1 < game_size) ? top_tile.children[(game_size * (i+1))+ (game_size -1)] : null;

        if (top) {
            // back.data.adjacent += top.data.bomb ? 1 : 0;
            // top.data.adjacent += back.data.bomb? 1 : 0;
            top.data.adjacent.push(back.data);
            back.data.adjacent.push(top.data);
        }
        if (left){
            // back.data.adjacent += left.data.bomb ? 1 : 0;
            // left.data.adjacent += back.data.bomb ? 1 : 0;
            left.data.adjacent.push(back.data);
            back.data.adjacent.push(left.data);
        }
        if (right) {
            // back.data.adjacent += right.data.bomb ? 1 : 0;
            // right.data.adjacent += back.data.bomb ? 1 : 0;
            right.data.adjacent.push(back.data);
            back.data.adjacent.push(right.data);
        }
    }
}

function placeBotBack(bot_tile, back_tile) {
    for (let i = 0; i < game_size; i++) {

        // let back = back_tile[(game_size * (game_size-i-1))+(game_size-1)];
        let back = back_tile.children[i*game_size];

        let top = bot_tile.children[(game_size -i -1)*game_size];
        let left = (i > 0) ? bot_tile.children[game_size*(game_size-i)] : null;
        let right = (i + 1 < game_size) ? bot_tile.children[game_size*(game_size-i-2)] : null;

        if (top) {
            // back.data.adjacent += top.data.bomb ? 1 : 0;
            // top.data.adjacent += back.data.bomb? 1 : 0;
            top.data.adjacent.push(back.data);
            back.data.adjacent.push(top.data);
        }
        if (left){
            // back.data.adjacent += left.data.bomb ? 1 : 0;
            // left.data.adjacent += back.data.bomb ? 1 : 0;
            left.data.adjacent.push(back.data);
            back.data.adjacent.push(left.data);
        }
        if (right) {
            // back.data.adjacent += right.data.bomb ? 1 : 0;
            // right.data.adjacent += back.data.bomb ? 1 : 0;
            right.data.adjacent.push(back.data);
            back.data.adjacent.push(right.data);
        }
    }
}

function placeBotFront(bot_tile, front_tile) {
    for (let i = 0; i < game_size; i++) {

        // let front = front_tile.children[i*game_size];
        let front = front_tile.children[i*game_size];

        let top = bot_tile.children[(i*game_size)+(game_size-1)];
        let left = (i > 0) ? bot_tile.children[((i-1)*game_size)+(game_size-1)] : null;
        let right = (i + 1 < game_size) ? bot_tile.children[((i+1)*game_size)+(game_size-1)] : null;

        if (top) {
            // front.data.adjacent += top.data.bomb ? 1 : 0;
            // top.data.adjacent += front.data.bomb? 1 : 0;
            top.data.adjacent.push(front.data);
            front.data.adjacent.push(top.data);
        }
        if (left){
            // front.data.adjacent += left.data.bomb ? 1 : 0;
            // left.data.adjacent += front.data.bomb ? 1 : 0;
            left.data.adjacent.push(front.data);
            front.data.adjacent.push(left.data);
        }
        if (right) {
            // front.data.adjacent += right.data.bomb ? 1 : 0;
            // right.data.adjacent += front.data.bomb ? 1 : 0;
            right.data.adjacent.push(front.data);
            front.data.adjacent.push(right.data);
        }
    }
}

function placeTopRight(top_tile, right_tile) {
    for (let i = 0; i < game_size; i++) {

        let top = top_tile.children[(game_size *(game_size-1)) + i];

        let bot = right_tile.children[(game_size*i) +(game_size -1)];
        let left = (i > 0) ? right_tile.children[(game_size*(i-1))+(game_size-1)] : null;
        let right = (i + 1 < game_size) ? right_tile.children[(game_size*(i+1)) + (game_size-1)] : null;

        if (bot) {
            // top.data.adjacent += bot.data.bomb ? 1 : 0;
            // bot.data.adjacent += top.data.bomb? 1 : 0;
            top.data.adjacent.push(bot.data);
            bot.data.adjacent.push(top.data);
        }
        if (left){
            // top.data.adjacent += left.data.bomb ? 1 : 0;
            // left.data.adjacent += top.data.bomb ? 1 : 0;
            top.data.adjacent.push(left.data);
            left.data.adjacent.push(top.data);
        }
        if (right) {
            // top.data.adjacent += right.data.bomb ? 1 : 0;
            // right.data.adjacent += top.data.bomb ? 1 : 0;
            top.data.adjacent.push(right.data);
            right.data.adjacent.push(top.data);
        }
    }
}

function placeTopLeft(top_tile, left_tile) {
    for (let i = 0; i < game_size; i++) {

        let top = top_tile.children[i];

        let bot = left_tile.children[((game_size-1-i)*game_size) + (game_size-1)];
        let left = (i > 0) ? left_tile.children[((game_size-i)*game_size) + (game_size-1)] : null;
        let right = (i + 1 < game_size) ? left_tile.children[((game_size-2-i)*game_size) + (game_size-1)] : null;

        if (bot) {
            // top.data.adjacent += bot.data.bomb ? 1 : 0;
            // bot.data.adjacent += top.data.bomb? 1 : 0;
            top.data.adjacent.push(bot.data);
            bot.data.adjacent.push(top.data);
        }
        if (left){
            // top.data.adjacent += left.data.bomb ? 1 : 0;
            // left.data.adjacent += top.data.bomb ? 1 : 0;
            top.data.adjacent.push(left.data);
            left.data.adjacent.push(top.data);
        }
        if (right) {
            // top.data.adjacent += right.data.bomb ? 1 : 0;
            // right.data.adjacent += top.data.bomb ? 1 : 0;
            top.data.adjacent.push(right.data);
            right.data.adjacent.push(top.data);
        }
    }
}

function placeBotRight(bot_tile, right_tile) {
    for (let i = 0; i < game_size; i++) {

        let bot = bot_tile.children[((game_size-1)*game_size)+(game_size-i-1)];

        let top = right_tile.children[game_size*i];
        let left = (i > 0) ? right_tile.children[game_size*(i-1)] : null;
        let right = (i + 1 < game_size) ? right_tile.children[game_size*(i+1)] : null;

        if (top) {
            // bot.data.adjacent += top.data.bomb ? 1 : 0;
            // top.data.adjacent += bot.data.bomb? 1 : 0;
            bot.data.adjacent.push(top.data);
            top.data.adjacent.push(bot.data);
        }
        if (left){
            // bot.data.adjacent += left.data.bomb ? 1 : 0;
            // left.data.adjacent += bot.data.bomb ? 1 : 0;
            bot.data.adjacent.push(left.data);
            left.data.adjacent.push(bot.data);
        }
        if (right) {
            // bot.data.adjacent += right.data.bomb ? 1 : 0;
            // right.data.adjacent += bot.data.bomb ? 1 : 0;
            bot.data.adjacent.push(right.data);
            right.data.adjacent.push(bot.data);
        }
    }
}

function placeBotLeft(bot_tile, left_tile) {
    for (let i = 0; i < game_size; i++) {

        let bot = bot_tile.children[i];

        let top = left_tile.children[game_size*i];
        let left = (i > 0) ? left_tile.children[game_size*(i-1)] : null;
        let right = (i + 1 < game_size) ? left_tile.children[game_size*(i+1)] : null;

        if (top) {
            // bot.data.adjacent += top.data.bomb ? 1 : 0;
            // top.data.adjacent += bot.data.bomb? 1 : 0;
            bot.data.adjacent.push(top.data);
            top.data.adjacent.push(bot.data);
        }
        if (left){
            // bot.data.adjacent += left.data.bomb ? 1 : 0;
            // left.data.adjacent += bot.data.bomb ? 1 : 0;
            bot.data.adjacent.push(left.data);
            left.data.adjacent.push(bot.data);
        }
        if (right) {
            // bot.data.adjacent += right.data.bomb ? 1 : 0;
            // right.data.adjacent += bot.data.bomb ? 1 : 0;
            bot.data.adjacent.push(right.data);
            right.data.adjacent.push(bot.data);
        }
    }
}



function generateTiles() {
    front = createTileGroup(0, 0, 0);
    left = createTileGroup(0, -Math.PI / 2, 0);
    right = createTileGroup(0, Math.PI / 2, 0);
    back = createTileGroup(0, Math.PI, 0);
    top = createTileGroup(-Math.PI / 2, 0, 0);
    bottom = createTileGroup(Math.PI / 2, 0, 0);

    placeTileSetLeft(left, front);
    placeTileSetLeft(front, right);
    placeTileSetLeft(right, back);
    placeTileSetLeft(back, left);

    placeTopFront(top, front);
    placeTopBack(top, back);
    placeBotBack(bottom, back);
    placeBotFront(bottom, front);

    placeTopRight(top, right);
    placeTopLeft(top, left);
    placeBotRight(bottom, right);
    placeBotLeft(bottom, left);

    tiles.push(front, left, right, back, top, bottom);
    tiles.forEach(tile => game.add(tile));
}

function calcBombs(tile_group) {
    let start_tile = tile_group.children[0].data;
    let queue = [start_tile];
    let visited = new Set();

    while (queue.length > 0) {
        let tile = queue.shift();
        if (visited.has(tile))
            continue;

        visited.add(tile);

        if (tile.bomb) {
            total_bombs++;
            total_flags++;
        }

        for (let i = 0; i < tile.adjacent.length; i++) {
            let adj = tile.adjacent[i];
            if (adj.bomb) {
                tile.bomb_adj_count++;
            }
            queue.push(adj);
        }
    }
}

function onPointerMove( event ) {
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function revealAllTiles() {
    tiles.forEach(tile => {
        tile.children.forEach(child => {
            child.data.revealed = true;
        });
    });
}

function removeTile(e) {
    e.preventDefault();
    if (!intersected || !intersected.data || intersected.data.revealed)
        return;

    if (!game_started) {
        game_started = true;
        console.log("Game started");
        // reserve the tiles around the first tile clicked
        intersected.data.reserved = true;
        for (let i = 0; i < intersected.data.adjacent.length; i++) {
            intersected.data.adjacent[i].reserved = true;
        }

        // place bombs
        place_bombs(front);
        place_bombs(left);
        place_bombs(right);
        place_bombs(back);
        place_bombs(top);
        place_bombs(bottom);

        calcBombs(front);
    }
  
    if (!timer_started) {
        timer_started = true;
        start_time = Date.now();
    }

    intersected.data.revealed = true;
    if (intersected.data.bomb) {
        revealAllTiles();
        timer_started = false;
        alert("Game Over");
        return;
    }

    // load a sound and set it as the Audio object's buffer
    const break_sound = new THREE.Audio( listener );

    audioLoader.load( 'audio/break.mp3', function( buffer ) {
        break_sound.setBuffer( buffer );
        break_sound.setVolume( 0.5 );
        break_sound.play();
    });

    let board = intersected.parent.board;
    //
    // ripple reveal
    let queue = [intersected.data];
    let visited = new Set();
    while (queue.length > 0) {
        let tile = queue.shift();

        if (visited.has(tile))
            continue;

        visited.add(tile);
        tile.revealed = true;
        remaining_tiles--;
        if (tile.bomb_adj_count === 0) {
            for (let i = 0; i < tile.adjacent.length; i++) {
                let adj = tile.adjacent[i];
                queue.push(adj);
            }
        }
    }

    if (remaining_tiles === total_bombs) {
        timer_started = false;
        alert("You Win!");
    }
}

function toggleFlag(e) {
    e.preventDefault();
    if (total_flags <= 0) {
        return;
    }

    if (intersected) {
        if (intersected.data.flagged) {
            total_flags++;
        } else {
            total_flags--;
        }

        intersected.data.flagged = !intersected.data.flagged;
    }
}

function rotateGame(e) {
    if (e.keyCode === 87) { // w
        game.rotation.x -= 0.1;
    } else if (e.keyCode === 68) { // d
        game.rotation.y += 0.1;
    } else if (e.keyCode === 83) { // s
        game.rotation.x += 0.1;
    } else if (e.keyCode === 65) { // a
        game.rotation.y -= 0.1;
    }
}

function loadTextures() {
    const loader = new THREE.TextureLoader();
    textures.push(loader.load('textures/TileEmpty.png'));
    textures.push(loader.load('textures/Tile1.png'));
    textures.push(loader.load('textures/Tile2.png'));
    textures.push(loader.load('textures/Tile3.png'));
    textures.push(loader.load('textures/Tile4.png'));
    textures.push(loader.load('textures/Tile5.png'));
    textures.push(loader.load('textures/Tile6.png'));
    textures.push(loader.load('textures/Tile7.png'));
    textures.push(loader.load('textures/Tile8.png'));
    textures.push(loader.load('textures/TileBomb.png'));
    textures.push(loader.load('textures/TileFlag.png'));
    textures.push(loader.load('textures/TileUnknown.png'));
    textures.push(loader.load('textures/TileExploded.png'));
    textures.push(loader.load('textures/skydome.jpg'));
}

function setupGame() {
    // const base_geometry = new THREE.BoxGeometry( 1, 1, 1 );
    // const base_material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    // const base = new THREE.Mesh( base_geometry, base_material );
    // game.add( base );
    game_started = false;
    timer_started = false;
    tiles = [];
    game = new THREE.Group();
    total_bombs = 0;
    total_flags = 0;
    generateTiles();

    const sphere_geometry = new THREE.SphereGeometry( 25, 32, 32 );
    const sphere_material = new THREE.MeshBasicMaterial( { side: THREE.BackSide } );
    skydome = new THREE.Mesh( sphere_geometry, sphere_material );
    skydome.rotation.x = Math.PI / 2;
    skydome.material.map = textures[13];

    scene.add( skydome );
    scene.add( game );
    setups++;
}

function animate() {
	requestAnimationFrame( animate );
    raycaster.setFromCamera( pointer, camera );

    intersects = raycaster.intersectObjects( scene.children );
    if (intersects.length > 0 && intersects[0].object != skydome) {
        if (intersected)
            intersected.material.color.setHex( 0xffffff );
        intersected = intersects[0].object;
        intersected.material.color.setHex( 0xfadadd );
    } else {
        if (intersected)
            intersected.material.color.setHex( 0xffffff );
        intersected = null;
    }

    // update timer every second in seconds
    let timer = document.getElementById("time_value");
    if (timer_started) {
        let elapsed_time = Math.floor((Date.now() - start_time) / 1000);
        timer.innerHTML = elapsed_time;
    }

    let flags = document.getElementById("flags_value");
    flags.innerHTML = total_flags;

    tiles.forEach(tile => colorTiles(tile));

	renderer.render( scene, camera );
}

window.addEventListener( 'pointermove', onPointerMove );
window.addEventListener('click', removeTile);
window.addEventListener('keydown', rotateGame);
window.addEventListener('contextmenu', toggleFlag);

document.getElementById("difficulty").addEventListener("change", function() {
    let difficulty = document.getElementById("difficulty").value;
    switch (difficulty) {
        case "easy":
            game_size = 5;
            break;
        case "medium":
            game_size = 10;
            break;
        case "hard":
            game_size = 20;
            break;
        default:
            game_size = 10;
            break;
    }

    scene.clear();
    setupGame();
});

loadTextures();
setupGame();
console.log("Setups: " + setups);
animate();
