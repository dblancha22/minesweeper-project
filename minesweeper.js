import { bomb_count, game_size } from "./main.js";
import { mine_density } from "./main.js";


export function generate_game() {
    //let mine_density = document.getElementById("Density").value;
    // let count = Math.round(game_size*game_size * mine_density);
    //console.log(count);
    let game = [];
    for (let i = 0; i < game_size; i++) {
        let row = [];
        for (let j = 0; j < game_size; j++) {
            let is_bomb = Math.random() < mine_density;
            let tile = {
                bomb: is_bomb,
                revealed: false,
                flagged: false,
                adjacent: 0,
                x: i,
                y: j
            };
            row.push(tile);
        }
        game.push(row);
    }

    game = make_bombs(game, bomb_count);

    // Calculate adjacent bombs
    for (let i = 0; i < game_size; i++) {
        for (let j = 0; j < game_size; j++) {
            let tile = game[i][j];
            if (tile.bomb) {
                continue;
            }

            let adjacent = 0;
            for (let x = -1; x <= 1; x++) {
                let row = i + x;
                if (row < 0 || row >= game_size) {
                    continue;
                }
                for (let y = -1; y <= 1; y++) {
                    let col = j + y;
                    if (col < 0 || col >= game_size) {
                        continue;
                    }
                    if (game[row][col].bomb) {
                        adjacent++;
                    }
                }
            }
            tile.adjacent = adjacent;
        }
    }

    return game;
}


export function make_bombs(game, count) {
    //let mine_density = document.getElementById("Density").value;
    //let count = Math.round(game_size * game_size * mine_density);
    for (let i = 0; i < game_size; i++) {
        for (let j = 0; j < game_size; j++) {
            let tile = game[i][j];
            if (tile.bomb == 1 || tile.revealed == true || count == 0) {
                continue;
            } else {
                let is_bomb = Math.random() < mine_density;
                tile.bomb = is_bomb;
                if (is_bomb == 1){
                    count--;
                }
            }
        }
    }
    return game;
}