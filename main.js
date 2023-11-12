import * as THREE from 'three';
import { generate_game } from './minesweeper.js';

let setups = 0;

let intersects;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let intersected;

var game = new THREE.Group();
export let game_size = 5;
var tiles = [];

function createTileGroup(rx, ry, rz) {
    const tile_group = new THREE.Group();
    const tile_size = 1 / game_size;
    const tile_geometry = new THREE.BoxGeometry( tile_size - 0.01, tile_size - 0.01, 0);
    const tile_material = new THREE.MeshBasicMaterial( { color: 0x0000ff, transparent: true } );

    let spacing = tile_size;
    let spacing_start = -0.5 + (tile_size / 2);
    let spacing_end = 0.5;

    let minesweeper_game = generate_game();
    let x = 0;
    let y = 0;
    let count = 0;
    for (let i = spacing_start; i <= spacing_end; i += spacing) {
        for (let j = spacing_start; j <= spacing_end; j += spacing) {
            let tile = new THREE.Mesh( tile_geometry.clone(), tile_material.clone() );

            tile.data = minesweeper_game[x][y];
            tile.position.x = i;
            tile.position.y = j;
            tile.position.z = 0.501;

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
        if (tile.data.bomb)
            tile.material.color.set( 0xff0000 );
        else
            tile.material.color.set( 0x0000ff );

        if (tile.data.revealed)
            tile.material.opacity = 0.0;
        if (tile.data.flagged)
            tile.material.color.set( 0xFFA500 );
    }
}

function generateTiles() {
    let front = createTileGroup(0, 0, 0);
    let left = createTileGroup(0, -Math.PI / 2, 0);
    let right = createTileGroup(0, Math.PI / 2, 0);
    let back = createTileGroup(0, Math.PI, 0);
    let top = createTileGroup(-Math.PI / 2, 0, 0);
    let bottom = createTileGroup(Math.PI / 2, 0, 0);

    // tiles.push(front);
    tiles.push(front, left, right, back, top, bottom);
    tiles.forEach(tile => game.add(tile));
}

function onPointerMove( event ) {
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function removeTile(e) {
    e.preventDefault();
    if (intersected)
        intersected.data.revealed = true;
    if (intersected && intersected.data.bomb) {
        alert("Game Over");
        intersected.material.color.set( 0xffffff );
    }
}

function toggleFlag(e) {
    e.preventDefault();
    if (intersected)
        intersected.data.flagged = !intersected.data.flagged;
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

function setupGame() {
    const base_geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const base_material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const base = new THREE.Mesh( base_geometry, base_material );
    game.add( base );
    generateTiles();

    scene.add( game );
    setups++;
}

function animate() {
	requestAnimationFrame( animate );
    raycaster.setFromCamera( pointer, camera );

    intersects = raycaster.intersectObjects( scene.children );
    if (intersects.length > 0) {
        // console.log(intersects);
        intersected = intersects[0].object;
    } else {
        intersected = null;
    }

    tiles.forEach(tile => colorTiles(tile));

	renderer.render( scene, camera );
}

window.addEventListener( 'pointermove', onPointerMove );
window.addEventListener('click', removeTile);
window.addEventListener('keydown', rotateGame);
window.addEventListener('contextmenu', toggleFlag);

setupGame();
console.log("Setups: " + setups);
animate();

