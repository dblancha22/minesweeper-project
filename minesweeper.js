import { game_size } from "./main.js";


export function generate_game() {
    let mine_density = 0.2;
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
