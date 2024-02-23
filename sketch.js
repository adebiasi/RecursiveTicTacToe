let board;
let currentPlayer = 'X';

let numLevels = 3
const numRows = 3
const numCols = 3

let slider;

function setup() {

    slider = document.getElementById('num_levels_slider'); // Ottenere il componente range
    slider.addEventListener('input', updateNumLevels); // Aggiungere un listener per l'evento di input


    createCanvas(1000, 1000);
    board = new Board(0, 0, 0, width, height)

    noLoop();
    redraw();

}


function draw() {

    console.log("MAIN DRAW")

    background(0);
    textAlign(LEFT, LEFT);
    stroke(0)
    textSize(25);

    fill(255, 255, 255);
    checkWinner(board)
    board.draw()

    if (board.winner != '') {
        translate(width / 2, height / 2);
        fill(255, 255, 255);
        stroke(255, 255, 255);
        textSize(200);
        text(board.winner + " wins", 0, 0);
    }
}


function checkWinner(currBoard) {

    if (currBoard.hasSubBoards()) {
        console.log("currBoard.hasSubBoards()")
        for (let col = 0; col < numCols; col++) {
            for (let row = 0; row < numRows; row++) {
                let subBoard = currBoard.getSubBoard(col, row);
                if (subBoard.winner === '') {
                    checkWinner(subBoard);
                    if (subBoard.winner != '') {
                        console.log("currBoard.setValue()" + subBoard.winner + " " + col + " " + row)
                        currBoard.setValue(subBoard.winner, col, row);
                    }
                }
            }
        }
    }

    // Check rows
    for (let row = 0; row < numRows; row++) {
        if (currBoard.getValue(0, row) === currBoard.getValue(1, row) &&
            currBoard.getValue(1, row) === currBoard.getValue(2, row) &&
            currBoard.getValue(0, row) !== '') {
            currBoard.winner = currBoard.getValue(0, row);
            return;
        }
    }

    // Check columns
    for (let col = 0; col < numCols; col++) {
        if (currBoard.getValue(col, 0) === currBoard.getValue(col, 1) && currBoard.getValue(col, 1) === currBoard.getValue(col, 2) && currBoard.getValue(col, 0) !== '') {
            currBoard.winner = currBoard.getValue(col, 0);
            return;
        }
    }

    // Check diagonals
    if (currBoard.getValue(0, 0) === currBoard.getValue(1, 1) && currBoard.getValue(1, 1) === currBoard.getValue(2, 2) && currBoard.getValue(0, 0) !== '') {
        currBoard.winner = currBoard.getValue(0, 0);
        return;
    }
    if (currBoard.getValue(0, 2) === currBoard.getValue(1, 1) && currBoard.getValue(1, 1) === currBoard.getValue(2, 0) && currBoard.getValue(0, 2) !== '') {
        currBoard.winner = currBoard.getValue(0, 2);
        return;
    }

    // Check for a tie
    let openSpots = 0;
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            if (currBoard.getValue(col, row) === '') {
                openSpots++;
            }
        }
    }
    if (openSpots === 0) {
        currBoard.winner = 'T';
        return;
    }

    return; // No winner yet
}

function mousePressed() {

    let currBoard = board;

    if (currBoard.winner != '') {
        return
    }

    for (let i = 0; i < numLevels - 1; i++) {
        let indexes = getIndexes(i);
        currBoard = currBoard.getSubBoard(indexes[0], indexes[1]);
        if (currBoard.winner != '') {
            return
        }
    }

    let [col, row] = getIndexes(numLevels - 1);

    if (col >= 0 && row >= 0) {
        if (currBoard.getValue(col, row) == '') {
            currBoard.setValue(currentPlayer, col, row);
            currentPlayer = (currentPlayer == 'X') ? 'O' : 'X';

            redraw();
        } else {
            currBoard.setValue('', col, row);
            currentPlayer = (currentPlayer == 'X') ? 'O' : 'X';

            redraw();
        }

    }
}


function getIndexes(level) {
    let col = floor(mouseX / width * Math.pow(numCols, level + 1)) % numCols;
    let row = floor(mouseY / height * Math.pow(numRows, level + 1)) % numRows;
    return [col, row];
}

function updateNumLevels() {
    numLevels = parseInt(slider.value);
    setup()
}

class Board {
    constructor(level, grid_x_offset, grid_y_offset, grid_width, grid_height) {

        this.winner = '';
        this.level = level;
        this.grid_x_offset = grid_x_offset;
        this.grid_y_offset = grid_y_offset;
        this.grid_width = grid_width;
        this.grid_height = grid_height;

        this.values = this.initBoardValues();
        this.subBoards = [];
        if (level < numLevels - 1) {
            for (let j = 0; j < numRows; j++) {

                for (let i = 0; i < numCols; i++) {
                    this.subBoards.push(new Board(level + 1, grid_x_offset + (i * grid_width / numCols), grid_y_offset + (j * grid_height / numRows), grid_width / numCols, grid_height / numRows))
                }
            }
        }

    }

    hasSubBoards() {
        return this.subBoards.length != 0;
    }

    getSubBoard(col, row) {
        console.log("getSubBoard " + col + " " + row + " " + this.get_pos(col, row))
        return this.subBoards[this.get_pos(col, row)];
    }

    getValue(col, row) {
        return this.values[col][row];
    }

    setValue(value, col, row) {
        this.values[col][row] = value;
    }

    get_pos(col, row) {
        let pos = numCols * (row) + (col);
        return pos;
    }

    initBoardValues() {
        return Array(numRows).fill().map(() => Array(numCols).fill(''));
    }

    draw() {
        this.draw_grid(this, this.winner != '')
        if (this.winner === '') {
            this.subBoards.forEach(subBoard => {
                subBoard.draw();
            });
        }
    }

    draw_grid(board, transparent = false) {

        let alpha = 100;

        textAlign(CENTER, CENTER);
        let w = board.grid_width / numCols;
        let h = board.grid_height / numRows;

        let x_offset = board.grid_x_offset;
        let y_offset = board.grid_y_offset;

        let small_x_offset = board.grid_width / 10
        let small_y_offset = board.grid_height / 10

        strokeWeight(2 * (numLevels - board.level) - 1 );
        if (transparent) {
            stroke(255, 255, 255, alpha)
        } else {
            stroke(255, 255, 255)
        }
        // Disegna griglia
        for (let i = 1; i < numCols; i++) {
            let xline1 = x_offset + (i * w)
            line(xline1, small_y_offset + y_offset, xline1, y_offset + board.grid_height - small_y_offset);
        }

        for (let i = 1; i < numCols; i++) {
            let yline2 = y_offset + (i * h)
            line(x_offset + small_x_offset, yline2, x_offset + board.grid_width - small_x_offset, yline2);
        }

        // Disegna X e O
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                let x = x_offset + col * w + w / 2;
                let y = y_offset + row * h + h / 2;
                let spot = board.getValue(col, row);

                if (spot == 'O') {
                    noFill();
                    if (transparent) {
                        stroke(255, 0, 0, alpha)
                    } else {
                        stroke(255, 0, 0)
                    }
                    ellipse(x, y, w / 2);
                } else if (spot == 'X') {
                    if (transparent) {
                        stroke(0, 255, 0, alpha)
                    } else {
                        stroke(0, 255, 0)
                    }
                    line(x - w / 4, y - h / 4, x + w / 4, y + h / 4);
                    line(x + w / 4, y - h / 4, x - w / 4, y + h / 4);
                } else {
                    fill(0);
                    stroke(0)
                    if (currentPlayer == 'X') {
                        if (transparent) {
                            fill(0, 255, 0, alpha);
                        } else {
                            fill(0, 255, 0);
                        }
                    } else {
                        if (transparent) {
                            fill(255, 0, 0, alpha);
                        } else {
                            fill(255, 0, 0);
                        }
                    }
                }
            }
        }
    }
}