let replayButton = document.getElementById("replay");
let nextLevelButton = document.getElementById("nextlevel");
let finished = false;
let game_maze;

let opacity = 0.3;
let video;

let handPose, detections = [];
let options = { maxHands: 1, flipped: false };

let mazes = [];
let blured = true;
let game = document.getElementById("game");

// ---------------------- Maze Class ----------------------
class Maze {
    constructor(rows, cols, cellSize, map) {
        this.rows = rows;
        this.cols = cols;
        this.cellSize = cellSize;
        this.map = map
        this.player = { r: 1, c: 1 };
    }

    getDistance(c, r) {
        return Math.sqrt((this.player.c - c) ** 2 + (this.player.r - r) ** 2);
    }

    display(blured = true) {
        push();
        translate(0, 0);
        stroke(50);

        // Draw map
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let x = c * this.cellSize;
                let y = r * this.cellSize;

                if (this.getDistance(c, r) > 3 && blured) {
                    fill("#ffffff12");
                } else if (this.map[r][c] === 1) {
                    fill("#edf646ff");
                } else if (this.map[r][c] === 2) {
                    fill("blue");
                }
                else {
                    fill("#ffffff60");
                }
                rect(x, y, this.cellSize, this.cellSize);
            }
        }

        // Draw player
        fill("red");
        let px = this.player.c * this.cellSize + this.cellSize / 2;
        let py = this.player.r * this.cellSize + this.cellSize / 2;
        circle(px, py, this.cellSize * 0.6);

        pop();
    }

    move(dir) {
        if (finished) return;
        let dr = 0, dc = 0;

        if (dir === "UP") dr = -1;
        if (dir === "DOWN") dr = 1;
        if (dir === "LEFT") dc = -1;
        if (dir === "RIGHT") dc = 1;

        let nr = this.player.r + dr;
        let nc = this.player.c + dc;

        if (this.map[nr][nc] === 0) {
            this.player.r = nr;
            this.player.c = nc;
        }
        if (this.map[nr][nc] === 2) {
            this.player.r = nr;
            this.player.c = nc;
            console.log("You reached the goal!");
            game.innerText = "You Win!";
            finished = true;
            replayButton.disabled = false;
            nextLevelButton.disabled = false;
            blured = false;
        }
    }


}

// ---------------------- Replay & Next Level Buttons ----------------------
replayButton.onclick = function () {
    // Replay
    blured = true;
    finished = false;
    game_maze.player = { r: 1, c: 1 };
    replayButton.disabled = true;
    nextLevelButton.disabled = true;
    game.innerText = "Game " + (mazes.indexOf(game_maze) + 1).toString();
};

nextLevelButton.onclick = function () {
    // Next Level
    blured = true;
    let currentIndex = mazes.indexOf(game_maze);
    let nextIndex = (currentIndex + 1) % mazes.length;
    game_maze = mazes[nextIndex];
    game.innerText = "Game " + (mazes.indexOf(game_maze) + 1).toString();
    game_maze.player = { r: 1, c: 1 };
    finished = false;
    replayButton.disabled = true;
    nextLevelButton.disabled = true;
}

// ---------------------- PRELOAD & SETUP ------------------------

function preload() {
    handPose = ml5.handPose(options);
}

function setup() {
    createCanvas(900, 500);
    // ---- Create Maze on the left ----
    // mazes = [maze1, maze2, maze3];
    maps.forEach(m => {
        console.log(m);
        mazes.push(new Maze(m.length, m[0].length, Math.floor(450 / m.length), m));
    });
    game_maze = mazes[0];
    // ---- Camera & Handpose on the right ----
    video = createCapture(VIDEO);
    video.size(400, 300);
    video.hide();
    handPose.detectStart(video, gotResults);
    replayButton.disabled = true;
    nextLevelButton.disabled = true;
}

function gotResults(results) { detections = results; }


// ---------------------- MAIN DRAW ------------------------
function draw() {
    background("#0e3f5e");

    // Left area: Maze
    game_maze.display(blured);
    // Right area: Camera video (mirrored)
    push();
    translate(1000 + video.width, 0);
    scale(-1, 1);
    image(video, 500, 0);
    pop();

    // Draw Keypoints
    if (detections && detections.length > 0) {
        drawKeypoints(detections);
    }
}

// ---------------------- Draw Keypoints & Move ---------------------
function drawKeypoints(detections) {
    stroke("#FFFFFF");
    fill(255, 0, 0);
    let d = detections[0];
    let tip = d.index_finger_tip;
    let mirroredX = 500 + (video.width - tip.x);
    let y = tip.y;

    circle(mirroredX, y, 50);

    if (frameCount % 15 === 0) {
        if (tip.x > 200) {
            game_maze.move("LEFT");
        } else if (tip.x < 200) {
            game_maze.move("RIGHT");
        }
        if (tip.y < 150) {
            game_maze.move("UP");
        } else if (tip.y > 150) {
            game_maze.move("DOWN");
        }
    }

}

// ---------------------- Keyboard control test ----------------------
function keyPressed() {
    if (key === "ArrowUp" || key === "w") game_maze.move("UP");
    if (key === "ArrowDown" || key === "s") game_maze.move("DOWN");
    if (key === "ArrowLeft" || key === "a") game_maze.move("LEFT");
    if (key === "ArrowRight" || key === "d") game_maze.move("RIGHT");
}
