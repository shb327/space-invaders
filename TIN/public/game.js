var canvas = document.getElementsByTagName("canvas")[0];
var context = canvas.getContext("2d");

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

var activeTimeUnits = 0;
var enemySpeed = 1;

const countActiveTimeUnits = () => {
    activeTimeUnits++;
}
var intervalId = setInterval(countActiveTimeUnits, 1000);

var leftButton = false;
var rightButton = false;
var spaceButton = false;

const buttonPressed = (event) => {
    if (event.keyCode == 65) leftButton = true;
    if (event.keyCode == 68) rightButton = true;
}

const buttonReleased = (event) => {
    if (event.keyCode == 65) leftButton = false;
    if (event.keyCode == 68) rightButton = false;
    if (event.keyCode == 32) spaceButton = true;
}

document.addEventListener("keydown", buttonPressed, false);
document.addEventListener("keyup", buttonReleased, false);

var enemySpeed = 1;

var score = 0;
var running = true;

const UFO_COUNT = 20;
const WAR_COUNT = 10;
const SHUT_COUNT = 5;

var leftToKill = UFO_COUNT + WAR_COUNT + SHUT_COUNT;

const BOTTOM_LINE = canvas.height - (canvas.height*0.35);

class Ship {
    constructor() {
        this.image.src = "imgs/ship.png";
    }
    image = new Image();
    position = { x: 20, y: canvas.height - 95};
    speed = 5;
    min = 20;
    max = canvas.width - 95;
    draw = () => {
        context.drawImage(this.image, this.position.x, this.position.y, 75, 75);
    }
    update = () => {
        if (rightButton && this.position.x < this.max){
            this.position.x += this.speed;
        }
        else if (leftButton && this.position.x > this.min){
            this.position.x -= this.speed;
        }
        if (spaceButton) {
            rockets.push(new Rocket(JSON.parse(JSON.stringify(this.position))));
            var audio = document.getElementById('audio1');
            if (audio.paused) {
              audio.play();
            }else{
              audio.currentTime = 0
            }
            spaceButton = false;
        }
    }
}

class Rocket{
    constructor(position)
    {
        this.position = {x: position.x + 35, y: position.y + 10};
        this.speed = 8;
        this.image = new Image();
        this.image.src = "imgs/rocket.png";
    }
    draw = () => {
        context.drawImage(this.image, this.position.x,  this.position.y, 5, 5);
    }
    update = () => {
        this.position.y -= this.speed;
    }
}

class Enemy {
    constructor(position, location, img, size, health, points) {
        this.image.src = img;
        this.position = position;
        this.min = this.position.x;
        this.max = this.position.x + canvas.width-1150;
        this.location = location;
        this.size = size;
        this.health = health;
        this.points = points;
    }
    image = new Image();
    position = { x: 20, y: canvas.height - (canvas.height*0.01) };
    direction = true;
    min = 20;
    max = canvas.width - 95;
    draw = () => {
        context.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
    }
    update = () => {
        if (this.direction && this.position.x < this.max){
            this.position.x += enemySpeed;
            if (this.position.x >= this.max) {
                this.direction = !this.direction;
                this.position.y += 55;
            }
        }else if (!this.direction && this.position.x > this.min){
            this.position.x -= enemySpeed;
            if (this.position.x <= this.min) {
                this.direction = !this.direction;
                this.position.y += 55;
            }
        }
        if (this.position.y >= BOTTOM_LINE){
            running = false;
            window.location.assign("/loseMenu");
        }
        rockets.forEach((rocket, i) => {
            if (rocket != null && rocket.position.x >= this.position.x && rocket.position.x < this.position.x + this.size
                && rocket.position.y >= this.position.y && rocket.position.y < this.position.y + this.size){
                    this.collision();
                    rockets[i] = null;
                }
        });
    }
    collision = () => {
       if(--this.health < 1){
        rows[this.location.y][this.location.x] = null;
        leftToKill--;
        var audio = document.getElementById('audio2');
        if (audio.paused) {
          audio.play();
        }else{
          audio.currentTime = 0
        }
        enemySpeed += 0.1;
        score += this.points;
      }
    }
}

var background = new Image();
background.src = "imgs/back.jpg";
var ship = new Ship();
var rockets = [];
var rows = []

var shuttles = [];
var wars = [];
var ufos = [];

for (var i = 0; i < UFO_COUNT; i++){
    ufos.push(new Enemy({x: 20 + 55 * i, y: 250}, {x:i, y:2}, "imgs/ufo.png", 40, 1, 10));
}
for (var i = 0; i < WAR_COUNT; i++){
    wars.push(new Enemy({x: 20 + 111 * i, y: 140}, {x:i, y:1}, "imgs/warship.png", 80, 2, 20));
}
for (var i = 0; i < SHUT_COUNT; i++){
    shuttles.push(new Enemy({x: 20 + 242 * i, y: 20}, {x:i, y:0}, "imgs/shuttle.png", 120, 3, 30));
}

rows.push(shuttles);
rows.push(wars);
rows.push(ufos);

window.onload = () => {
    window.requestAnimationFrame(gameLoop);
}

const gameLoop = () => {
    draw();
    update();
    if (running){
        window.requestAnimationFrame(gameLoop);
    }
}

const draw = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    ship.draw();
    shuttles.forEach(enemy => {if(enemy != null){
      enemy.draw()
    }});
    wars.forEach(enemy => {if (enemy != null){
      enemy.draw()
    }});
    ufos.forEach(enemy => {if (enemy != null){
      enemy.draw()}});
    rockets.forEach(rocket => {if (rocket != null){
      rocket.draw()
    }});
}

const update = () => {
    ship.update();
    shuttles.forEach(enemy => {if (enemy != null){
      enemy.update()
    }});
    wars.forEach(enemy => {if (enemy != null){
      enemy.update()
    }});
    ufos.forEach(enemy => {if (enemy != null){
      enemy.update()
    }});
    rockets.forEach(rocket => {if (rocket != null){
      rocket.update()
    }});

    if (leftToKill < 1){
        clearInterval(intervalId);
        leftToKill = 1;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/updateLeaderboard", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({
            score: activeTimeUnits+score
        }));
        window.location.assign("/winMenu");
    }
}
