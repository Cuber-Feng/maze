let replayButton = document.getElementById("replay");
let nextLevelButton = document.getElementById("nextlevel");
let finished = false;
let game_maze;

let opacity = 0.3;
let video;

let handPose, detections = [];
let options = { maxHands: 1, flipped: false };

let mazes;

// ---------------------- Maze Class ----------------------
class Maze {
    constructor(rows, cols, cellSize, map) {
        this.rows = rows;
        this.cols = cols;
        this.cellSize = cellSize;
        this.map = map
        this.player = { r: 1, c: 1 };
    }

    display() {
        push();
        translate(0, 0);
        stroke(50);

        // Draw map
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                let x = c * this.cellSize;
                let y = r * this.cellSize;

                if (this.map[r][c] === 1) {
                    fill(120);
                } else if (this.map[r][c] === 2) {
                    fill(0, 200, 0);
                }
                else {
                    fill(240);
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
            finished = true;
            replayButton.disabled = false;
            nextLevelButton.disabled = false;
        }
    }
}

let map1 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 1, 1, 0, 1, 1, 1],
    [1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 2, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

let map2 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

let map3 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1]
];
maze1 = new Maze(10, 10, 40, map1);
maze2 = new Maze(15, 15, 25, map2);
maze3 = new Maze(20, 20, 20, map3);

// ---------------------- Replay & Next Level Buttons ----------------------
replayButton.onclick = function () {
    // Replay
    finished = false;
    game_maze.player = { r: 1, c: 1 };
    replayButton.disabled = true;
    nextLevelButton.disabled = true;
};

nextLevelButton.onclick = function () {
    // Next Level
    let currentIndex = mazes.indexOf(game_maze);
    let nextIndex = (currentIndex + 1) % mazes.length;
    game_maze = mazes[nextIndex];
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
    mazes = [maze1, maze2, maze3];
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
    game_maze.display();
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
    if (key === "W" || key === "w") maze.move("UP");
    if (key === "S" || key === "s") maze.move("DOWN");
    if (key === "A" || key === "a") maze.move("LEFT");
    if (key === "D" || key === "d") maze.move("RIGHT");
}
