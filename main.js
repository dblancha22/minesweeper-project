"use strict";
import * as THREE from 'three';

const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0.1, 1000 );
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let intersected;

var game = new THREE.Group();
var tiles = [];

function createTileGroup(rx, ry, rz) {
    const tile_group = new THREE.Group();
    const tile_geometry = new THREE.BoxGeometry(0.09, 0.09, 0);
    const tile_material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

    for (let i = -0.40; i <= 0.45; i += 0.1) {
        for (let j = -0.40; j <= 0.45; j += 0.1) {
            const tile = new THREE.Mesh( tile_geometry.clone(), tile_material.clone() );
            tile.position.x = i;
            tile.position.y = j;
            tile.position.z = 0.501;
            tile_group.add(tile);
        }
    }

    tile_group.rotation.x = rx;
    tile_group.rotation.y = ry;
    tile_group.rotation.z = rz;
    return tile_group;
}

function generateTiles() {
    let front = createTileGroup(0, 0, 0);
    let left = createTileGroup(0, -Math.PI / 2, 0);
    let right = createTileGroup(0, Math.PI / 2, 0);
    let back = createTileGroup(0, Math.PI, 0);
    let top = createTileGroup(-Math.PI / 2, 0, 0);
    let bottom = createTileGroup(Math.PI / 2, 0, 0);

    tiles.push(front, left, right, back, top, bottom);
    tiles.forEach(tile => game.add(tile));
}

function onPointerMove( event ) {

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function removeTile() {
    if (intersected) {
        console.log(intersected);
        intersected.parent.remove(intersected);
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

function setupGame() {
    const base_geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const base_material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const base = new THREE.Mesh( base_geometry, base_material );
    game.add( base );
    generateTiles();

    scene.add( game );
}

function animate() {
	requestAnimationFrame( animate );
    // game.rotation.x += 0.01;
    // game.rotation.y += 0.01;
    // tiles.forEach(tile => tile.rotation.z += 0.01);
    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObjects( scene.children );
    if (intersects.length > 0 && intersects[0].object !== game.children[0]) {
        if (intersected) {
            intersected.material.color.set( 0xff0000 );
        }
        intersected = intersects[0].object;
        intersected.material.color.set( 0x0000ff );
    } else {
        if (intersected) {
            intersected.material.color.set( 0xff0000 );
        }
        intersected = null;
    }

	renderer.render( scene, camera );
}

window.addEventListener( 'pointermove', onPointerMove );
window.addEventListener('click', removeTile);
window.addEventListener('keydown', rotateGame);
setupGame();
animate();
