import { game_size } from "./main.js";

export function generate_game() {
    let game = [];

    for (let i = 0; i < game_size; i++) {
        let row = [];
        for (let j = 0; j < game_size; j++) {
            let tile = {
                bomb: false,
                revealed: false,
                flagged: false,
                adjacent: [],
                x: i,
                y: j,
                bomb_adj_count: 0,
                reserved: false
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

    game.bomb_count = 0;

    return game;
}

export function place_bombs(tile_group) {
    let board = tile_group.board;
    let bomb_count = board.bomb_count;

    let max_bombs = Math.floor(game_size * game_size * 0.15);

    while (bomb_count < max_bombs) {
        let x = Math.floor(Math.random() * board.length);
        let y = Math.floor(Math.random() * board.length);
        let tile = board[x][y];
        if (!tile.bomb && !tile.reserved) {
            tile.bomb = true;
            bomb_count++;
        }
    }

    console.log("Bombs placed: " + bomb_count);
    tile_group.bomb_count = bomb_count;
}
