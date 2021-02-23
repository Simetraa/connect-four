let canvas: HTMLCanvasElement
let ctx: CanvasRenderingContext2D
let border: number

const TEXT_COL = "#da4366"
const GRID_COL = "#333"
const BG_COL = "#fff0f0"
// Red = true, yellow = false, null = empty
type Disc = (boolean | null)

let board: Disc[][]
let rows: number
let cols: number
let currentDisc: boolean
let discPreviewX: number

let fontSize = 30 + "px Arial";

let running = false
window.addEventListener("mousedown", findDropPos)
window.addEventListener("resize", resize)
window.addEventListener("mousemove", updateDiscPreview)
window.addEventListener("keydown", resetBoard)

function init() {
    canvas = <HTMLCanvasElement>document.getElementById("canvas")!
    ctx = canvas.getContext("2d")!
    ctx.font = "30px Arial";
    resetBoard()
    resize()
}

function resetBoard() {
    if(!running) {
        running = true
        // Reset currentDisc so red always plays first.
        currentDisc = true
        board = Array.from({ length: 6 }, () => (Array.from({ length: 7 }, () => null)));
        cols = board[0].length
        rows = board.length
    }
}

function drawGameOver(winner: Disc) {
    window.requestAnimationFrame(update)
    running = false
    ctx.font = "50px Arial";
    let winText = (winner ? "Red" : "Yellow") + " wins!";
    let winText2 = "Press any key to reset"
    let metrics = ctx.measureText(winText);
    let height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    let metrics2 = ctx.measureText(winText);
    let width = metrics2.width
    let height2 = metrics2.actualBoundingBoxAscent + metrics2.actualBoundingBoxDescent;

    ctx.fillStyle = BG_COL

    ctx.fillStyle = TEXT_COL
    ctx.textAlign = "center"
    ctx.fillText(winText, canvas.width/2, canvas.height/2-height - border)
    ctx.fillText(winText2, canvas.width/2, canvas.height/2)


}

function resize() {
    canvas.width = window.innerHeight;
    canvas.height = window.innerHeight;
    border = canvas.height / 100 * 2
    window.requestAnimationFrame(update)
}

function findDropPos(event: MouseEvent) {
    if(running) {
        let sideLength = (canvas.height - (2 * border)) / (cols + 1);
        let padding = (canvas.width - (sideLength * cols)) / 2;
        let leftBoundry = Math.round((0 * sideLength) + padding);
        let rightBoundry = Math.round((cols * sideLength) + padding);
        if (event.clientX > leftBoundry && event.clientX < rightBoundry) {
            let index = Math.floor((event.clientX - leftBoundry) / sideLength)
            let y = dropDisc(index, currentDisc)
            if (y == null) {
                return
            }
            if (isWin(currentDisc, index, y)) {
                running = false
            } else {
                currentDisc = Boolean((Number(currentDisc) + 1) % 2)
            }
        }
        window.requestAnimationFrame(update)
    }

}

function updateDiscPreview(event: MouseEvent) {
    let sideLength = (canvas.height - (2 * border)) / (cols + 1);
    let padding = (canvas.width - (sideLength * cols)) / 2;
    let leftBoundry = Math.round((0 * sideLength) + padding);
    let rightBoundry = Math.round((cols * sideLength) + padding);
    if (event.clientX > leftBoundry && event.clientX < rightBoundry) {
        let index = Math.floor((event.clientX - leftBoundry) / sideLength)
        let realX = (index * sideLength) + padding + sideLength / 2
        discPreviewX = realX
    }
    window.requestAnimationFrame(update)
}

function dropDisc(x: number, disc: Disc) {
    for (let y = rows - 1; y >= 0; y--) {
        if (board[y][x] == null) {
            board[y][x] = disc
            return y
        }
    }
    return null
}

function update() {
    let sideLength = Math.floor((canvas.height - (2 * border)) / (cols + 1))
    let padding = Math.floor((canvas.width - (sideLength * cols)) / 2)
   
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = GRID_COL
    // draw board grid to screen
    ctx.beginPath()
    for (let i = 0; i <= cols; i++) {
        let realX = Math.floor((i * sideLength) + padding)
        ctx.moveTo(realX, padding + sideLength)
        ctx.lineTo(realX, sideLength * rows + padding + sideLength)

    }

    for (let i = 0; i < rows + 1; i++) {
        let realY = Math.floor((i * sideLength) + padding + sideLength)
        ctx.moveTo(padding, realY)
        ctx.lineTo(sideLength * cols + padding, realY)
    }
    ctx.closePath()
    ctx.stroke()


    for (const [y, row] of board.entries()) {
        for (let x = 0; x <= rows; x++) {
            if (board[y][x] == null) {
                continue
            } else {
                let realY = (y * sideLength) + sideLength + padding + sideLength / 2
                let realX = (x * sideLength) + padding + sideLength / 2

                ctx.beginPath()
                ctx.arc(realX, realY, sideLength / 2 - border / 2, 0, 2 * Math.PI);
                ctx.fillStyle = board[y][x] ? "red" : "yellow"
                ctx.fill()
                ctx.closePath()
            }
        }
    }


    if(running) {
        ctx.beginPath()
        let realY = (-1 * sideLength) + sideLength + padding + sideLength / 2
        ctx.arc(discPreviewX, realY, sideLength / 2 - border / 2, 0, 2 * Math.PI);
        ctx.fillStyle = currentDisc ? "red" : "yellow"
        ctx.fill()
        ctx.closePath()
    } else {
        drawGameOver(currentDisc)
    }

}

function cell_exists(x: number, y: number) {
    return ((x >= 0 && x <= cols - 1) && (y >= 0 && y <= rows - 1))
}

function isWin(disc: Disc, xPos: number, yPos: number) {
    let count = 0
    for (let x = -3, y = -3; x <= 3; x++, y++) {
        if (!cell_exists(xPos + x, yPos + y)) { count = 0; continue }
        if (board[yPos + y][xPos + x] == disc) {
            count++
        } else {
            count = 0
        }
        if (count == 4) {
            return true
        }
    }
    count = 0
    for (let x = -3, y = 3; x <= 3; x++, y--) {
        if (!cell_exists(xPos + x, yPos + y)) { count = 0; continue }
        if (board[yPos + y][xPos + x] == disc) {
            count++
        } else {
            count = 0
        }
        if (count == 4) {
            return true
        }
    }
    count = 0
    for (let x = -3; x <= 3; x++) {
        if (!cell_exists(xPos + x, yPos)) { count = 0; continue }
        if (board[yPos][xPos + x] == disc) {
            count++
        } else {
            count = 0
        }
        if (count == 4) {
            return true
        }
    }
    count = 0
    for (let y = -3; y <= 3; y++) {
        if (!cell_exists(xPos, yPos + y)) { count = 0; continue }
        if (board[yPos + y][xPos] == disc) {
            count++
        } else {
            count = 0
        }
        if (count == 4) {
            return true
        }
    }
    return false
}
init()
