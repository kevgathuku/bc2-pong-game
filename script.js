// Call a specified function to update the animation before next repaint
// Optimized by the browser
var animate = window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              function(callback) {
                window.setTimeout(callback, 1000 / 60);
              };

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var width = canvas.width;
var height = canvas.height;
var middle = ((width - 5) / 2);
var keysDown = {};

// Create the paddles and ball objects
var player = new Paddle(20, 100, 20, 100); // Left Paddle
var computer = new Paddle(660, 100, 20, 100); // Right paddle
var ball = new Ball(360, 300);

// Determines whether the ball is served heading up or down
function randomDirection() {
  if (Math.random() > 0.5) {
    return -1;
  } else {
    return 1;
  }
}

function Ball(x, y) {
  this.x = x;
  this.y = y;
  this.radius = 10;

  // Horizontal speed
  // Choose the starting direction randomly
  this.x_speed = 5 * randomDirection();
  this.y_speed = 1; // Vertical speed

  this.render = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
    ctx.fillStyle = '#00FFFF';
    ctx.fill();
  };

  this.updatePosition = function(paddle1, paddle2) {
    this.x += this.x_speed;
    this.y += this.y_speed;

    var top_y = this.y - this.radius;
    var right_x = this.x + this.radius;
    var bottom_y = this.y + this.radius;
    var left_x = this.x - this.radius;

    // Hitting the top boundary
    if (this.y - 10 < 0) {
      this.y = 10; // Don't go beyond the boundary
      this.y_speed = -this.y_speed; // Reverse the direction
    } // Hitting the bottom boundary
    else if (this.y + 10 > height) {
      this.y = height - 10; // Set the new position
      this.y_speed = -this.y_speed; // Reverse direction
    }

    // If the computer has scored
    if (this.x < 0) {
      this.x_speed = 5; // Serve the ball to the computer
      this.y_speed = 3 * randomDirection();
      this.x = 360;
      this.y = 300;
    } // The player has scored
    else if (this.x > width) {
      this.x_speed = -5; // Serve the ball to the player
      this.y_speed = 3 * randomDirection();
      this.x = 340;
      this.y = 300;
    }

    // If the ball is in the left half of the table
    if (right_x < (width / 2)) {
      // The ball has not yet passed the paddle
      // The ball has made contact with the paddle
      // The topmost side of the ball is in the range of the paddle
      // The bottom side of the ball is in the range of the paddle
      if (right_x > paddle1.x && left_x < (paddle1.x + paddle1.width)
        && top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y)
      {
        this.x_speed = 5;
        this.y_speed += (paddle1.y_speed / 2);
        this.x += this.x_speed;
      }
    } else { // The ball is in the right half of the table
      if (right_x > paddle2.x  && left_x < (paddle2.x + paddle2.width)
        && top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y)
      {
        this.x_speed = -5;
        this.y_speed += (paddle2.y_speed / 2);
        this.x += this.x_speed;
      }
    }
  };
}

function Paddle(x, y, wide, long) {
  this.x = x;
  this.y = y;
  this.width = wide;
  this.height = long;
  this.x_speed = 0;
  this.y_speed = 0;

  this.render = function() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };

  this.move = function(x, y) {
    this.x += x;
    this.y += y;

    // Top of the board
    if (this.y < 0) {
      this.y = 0;
      this.y_speed = 0; // The paddle is stagnant
    } // Bottom of the board
    else if (this.y + this.height > height) {
      this.y = height - this.height;
      this.y_speed = 0;
    }
  };

  this.updatePosition = function() {
    if (keysDown.ArrowUp === true) {
      this.move(0, -5);
    } else if (keysDown.ArrowDown === true) {
      this.move(0, 5);
    }
  };

  // Computer AI
  this.update = function(ball) {
    var y_position = ball.y;

    // Get the position of the ball relative to the paddle
    var diff = -((this.y + (this.height / 2)) - y_position);
    // If the ball is above the paddle
    if (diff < 0 && diff < -4) {
      diff = -3; // max speed up
    } else if (diff > 0 && diff > 4) {
      diff = 3; // max speed down
    }

    this.move(0, diff);
    if (this.y < 0) {
      this.y = 0;
    } else if (this.y + this.height > height) {
      this.y = height - this.height;
    }
  }
}

// Draws the initial screen
function initialize() {
  // Draw the canvas background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Render the paddles
  computer.render();
  player.render();
  ball.render();

  // Render the line boundary
  ctx.setLineDash([15, 20]);
  ctx.beginPath();
  ctx.strokeStyle = '#ffffff';
  ctx.moveTo(middle, 0);
  ctx.lineWidth = 5;
  ctx.lineTo(middle, height);
  ctx.stroke();
}

var update = function() {
  ball.updatePosition(player, computer);
  player.updatePosition();
  computer.update(ball);
};

function main() {
  initialize();
  update();

  // Call animation function before the next repaint
  animate(main);
}

window.onload = function() {
  animate(main);
};

window.addEventListener('keydown', function(event) {
  switch (event.key) {
    case 'ArrowUp':
      keysDown.ArrowUp = true;
      break;
    case 'ArrowDown':
      keysDown.ArrowDown = true;
      break;
    default:
      return; // Do nothing
  }
});

window.addEventListener('keyup', function(event) {
  delete keysDown[event.key];
});
