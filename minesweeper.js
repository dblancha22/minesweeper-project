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
                adjacent: [],
                x: i,
                y: j,
                bomb_adj_count: 0
            };
            row.push(tile);
        }
        game.push(row);
    }

    // link adjacent tiles
    for (let i = 0; i < game_size; i++) {
        for (let j = 0; j < game_size; j++) {
            let tile = game[i][j];
            let adjacent = [];
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++){
                    if (x == 0 && y == 0) continue;
                    let x_pos = i + x;
                    let y_pos = j + y;
                    if (x_pos < 0 || x_pos >= game_size || y_pos < 0 || y_pos >= game_size) continue;
                    adjacent.push(game[x_pos][y_pos]);
                }
            }
            tile.adjacent = adjacent;
        }
    }


    return game;
}
