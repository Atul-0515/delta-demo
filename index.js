const INITIAL_SPEED = 0.025;
const SPEED_INCREASE = 0.00001;
const COMPUTER_MAX_SPEED = 0.02;

class Ball {
    constructor(ballElem) {
        this.ballElem = ballElem;
        this.reset();
    }

    get x() {
        return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--x"));
    }

    set x(value) {
        this.ballElem.style.setProperty("--x", value);
    }

    get y() {
        return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--y"));
    }

    set y(value) {
        this.ballElem.style.setProperty("--y", value);
    }

    rect() {
        return this.ballElem.getBoundingClientRect();
    }

    update(delta, paddleRects) {
        this.x += this.direction.vx * this.speed * delta;
        this.y += this.direction.vy * this.speed * delta;
        this.speed += SPEED_INCREASE * delta;
        const rect = this.rect();

        if (rect.bottom >= window.innerHeight || rect.top <= 0) {
            this.direction.vy *= -1;
        }

        if (paddleRects.some(paddle => isCollision(paddle, rect))) {
            this.direction.vx *= -1;
        };
        // if (rect.left <= 0 || rect.right >= window.innerWidth) {
        //     this.direction.vx *= -1;
        // }
    }

    reset() {
        this.x = 50;
        this.y = 50;
        this.direction = { vx: 0, vy: 0 }
        while (Math.abs(this.direction.vx) <= 0.2 || Math.abs(this.direction.vx) >= 0.9) {
            const heading = randomNumberBetween(0, 2 * Math.PI);
            this.direction = { vx: Math.cos(heading), vy: Math.sin(heading) }
        }
        this.speed = INITIAL_SPEED;
    }
}

function isCollision(paddle, ballRect) {
    return paddle.left <= ballRect.right &&
        paddle.right >= ballRect.left &&
        paddle.top <= ballRect.bottom &&
        paddle.bottom >= ballRect.top;
}

class Paddle {
    constructor(paddleElem) {
        this.paddleElem = paddleElem;
        this.reset();
    }

    get position() {
        return parseFloat(getComputedStyle(this.paddleElem).getPropertyValue("--position"));
    }
    set position(value) {
        this.paddleElem.style.setProperty("--position", value);
    }

    rect() {
        return this.paddleElem.getBoundingClientRect();
    }

    update(delta, ballY) {
        this.position += COMPUTER_MAX_SPEED * delta * (ballY - this.position);
    }

    reset() {
        this.position = 50;
    }
}


function randomNumberBetween(min, max) {
    return Math.random() * (max - min) + min;
}

let ball = new Ball(document.getElementById('ball'));
let playerPaddle = new Paddle(document.getElementById('player-paddle'));
let computerPaddle = new Paddle(document.getElementById('computer-paddle'));
let playerScoreElement = document.getElementById('player-score');
let computerScoreElement = document.getElementById('computer-score');



let lastTime;
function update(time) {
    if (lastTime != null) {
        const delta = (time - lastTime);
        ball.update(delta, [playerPaddle.rect(), computerPaddle.rect()]);
        computerPaddle.update(delta, ball.y);

        const hue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hue"));
        document.documentElement.style.setProperty("--hue", hue + delta * 0.01);

        if (isLoose()) handleLoose();
    }
    lastTime = time;
    window.requestAnimationFrame(update);
}


function isLoose() {
    const rect = ball.rect();
    return rect.left <= 0 || rect.right >= window.innerWidth;
}

function handleLoose() {
    const rect = ball.rect();
    if (rect.right >= window.innerWidth) {
        playerScoreElement.textContent = parseInt(playerScoreElement.textContent) + 1;
    } else {
        computerScoreElement.textContent = parseInt(computerScoreElement.textContent) + 1;
    }
    ball.reset();
    playerPaddle.reset();
    computerPaddle.reset();
}


document.addEventListener("mousemove", (event) => {
    playerPaddle.position = (event.y / window.innerHeight) * 100;
})
window.requestAnimationFrame(update);
