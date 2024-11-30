const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Circle properties
const circle = {
    x: 100,
    y: canvas.height - 150, // Adjust circle position above ground
    radius: 20,
    legRadius: 10, // Radius of each leg
    dx: 0,
    dy: 0,
    speed: 5,
    jumping: false,
    gravity: 0.8,
    friction: 0.9,
    jumpForce: 15,
    eyeRadius: 4, // Radius of the eyes
    eyeOffsetX: 7, // Horizontal offset for eyes from the center
    eyeOffsetY: -5, // Vertical offset for eyes from the center
};

// Ground properties
const groundHeight = 50;

// Floating platform properties
const platforms = [
    {
        x: 300,      // Horizontal position
        y: canvas.height - 150,  // Vertical position
        width: 300,  // Width of the platform
        height: 20,  // Height of the platform
    },
    {
        x: 800,      // Horizontal position of second platform
        y: canvas.height - 150,  // Vertical position of second platform
        width: 150,  // Width of the second platform
        height: 20,  // Height of the second platform
    }
];

// Bridge properties
const bridge = {
    x: platforms[0].x + platforms[0].width, // Position at the end of the first platform
    y: platforms[0].y - 150,  // Initially upright (vertical) position above the first platform
    width: 20,
    height: 150,  // Height of the bridge when upright
    isFalling: false, // Flag to check if the bridge is falling
    targetY: platforms[1].y, // Target position when the bridge falls
};

// Leg animation
let legAngle = 0;

// Handle user input
const keys = {};
window.addEventListener("keydown", (event) => {
    keys[event.code] = true;
});
window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

// Draw the circle with legs and eyes
function drawCircleWithLegsAndEyes() {
    const legOffset = circle.radius / 2; // Offset from the center of the circle
    const legMovement = Math.sin(legAngle) * 15; // Increased speed of leg movement

    // Calculate positions for the legs
    const leftLegX = circle.x - legOffset + legMovement; // Move left leg to the left and right
    const rightLegX = circle.x + legOffset - legMovement; // Move right leg in opposite direction
    const legY = circle.y + circle.radius + circle.legRadius; // Position below the circle

    // Draw body
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

    // Draw eyes
    // Left eye
    ctx.beginPath();
    ctx.arc(circle.x - circle.eyeOffsetX, circle.y + circle.eyeOffsetY, circle.eyeRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();

    // Right eye
    ctx.beginPath();
    ctx.arc(circle.x + circle.eyeOffsetX, circle.y + circle.eyeOffsetY, circle.eyeRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();

    // Draw the pupils
    // Left pupil
    ctx.beginPath();
    ctx.arc(circle.x - circle.eyeOffsetX, circle.y + circle.eyeOffsetY, circle.eyeRadius / 2, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();

    // Right pupil
    ctx.beginPath();
    ctx.arc(circle.x + circle.eyeOffsetX, circle.y + circle.eyeOffsetY, circle.eyeRadius / 2, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();

    // Left leg
    ctx.beginPath();
    ctx.arc(leftLegX, legY, circle.legRadius, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();

    // Right leg
    ctx.beginPath();
    ctx.arc(rightLegX, legY, circle.legRadius, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
}

// Draw the ground
function drawGround() {
    ctx.fillStyle = "green";
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
}

// Draw all platforms
function drawPlatforms() {
    ctx.fillStyle = "brown";
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

// Draw the bridge
function drawBridge() {
    ctx.fillStyle = "gray";
    ctx.fillRect(bridge.x, bridge.y, bridge.width, bridge.height);
}

// Check for collision with any of the platforms (using the legs as the collision point)
function checkPlatformCollision() {
    const leftLegX = circle.x - circle.radius + Math.sin(legAngle) * 15; // Left leg X position
    const rightLegX = circle.x + circle.radius - Math.sin(legAngle) * 15; // Right leg X position
    const legY = circle.y + circle.radius + circle.legRadius; // Leg Y position

    platforms.forEach(platform => {
        const platformTop = platform.y;
        const platformBottom = platform.y + platform.height;
        const platformLeft = platform.x;
        const platformRight = platform.x + platform.width;

        // Check collision with the left leg
        if (leftLegX >= platformLeft && leftLegX <= platformRight && legY >= platformTop && legY <= platformBottom) {
            circle.y = platformTop - circle.radius - circle.legRadius; // Position circle on top of the platform
            circle.dy = 0; // Stop vertical movement
            circle.jumping = false;
        }

        // Check collision with the right leg
        if (rightLegX >= platformLeft && rightLegX <= platformRight && legY >= platformTop && legY <= platformBottom) {
            circle.y = platformTop - circle.radius - circle.legRadius; // Position circle on top of the platform
            circle.dy = 0; // Stop vertical movement
            circle.jumping = false;
        }
    });
}

// Apply physics to the circle
function applyPhysics() {
    const legY = circle.y + circle.radius + circle.legRadius;

    // Horizontal movement
    if (keys["ArrowRight"] || keys["KeyD"]) {
        circle.dx = circle.speed;
        legAngle += 0.4; // Faster leg movement when moving right
    } else if (keys["ArrowLeft"] || keys["KeyA"]) {
        circle.dx = -circle.speed;
        legAngle += 0.4; // Faster leg movement when moving left
    } else {
        circle.dx *= circle.friction; // Slow down gradually
    }

    // Prevent legAngle overflow
    if (legAngle > Math.PI * 2) {
        legAngle -= Math.PI * 2;
    }

    // Jump
    if ((keys["ArrowUp"] || keys["Space"] || keys["KeyW"]) && !circle.jumping) {
        circle.dy = -circle.jumpForce;
        circle.jumping = true;
    }

    // Apply gravity
    circle.dy += circle.gravity;

    // Update position
    circle.x += circle.dx;
    circle.y += circle.dy;

    // Prevent the circle from falling below the ground
    if (circle.y + circle.radius > canvas.height - groundHeight) {
        circle.y = canvas.height - groundHeight - circle.radius;
        circle.dy = 0;
        circle.jumping = false;
    }

    // Check for platform collision (legs)
    checkPlatformCollision();

    // Keep the circle within the screen horizontally
    if (circle.x - circle.radius < 0) {
        circle.x = circle.radius;
    }
    if (circle.x + circle.radius > canvas.width) {
        circle.x = canvas.width - circle.radius;
    }
}

// Bridge mechanics: move it down when the player interacts with it
function checkBridgeInteraction() {
    const distanceToBridge = Math.abs(circle.x - bridge.x); // Check how close the player is to the bridge

    // If the player is near the bridge and presses the 'Enter' key (for example)
    if (distanceToBridge < 50 && keys["Enter"]) {
        bridge.isFalling = true; // Trigger the bridge falling animation
    }

    if (bridge.isFalling && bridge.y < bridge.targetY) {
        bridge.y += 5; // Gradually move the bridge down
    }
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    drawGround();
    drawPlatforms(); // Draw all platforms
    drawBridge(); // Draw the bridge
    drawCircleWithLegsAndEyes(); // Updated function with eyes
    applyPhysics();
    checkBridgeInteraction(); // Check if the player interacts with the bridge
    requestAnimationFrame(gameLoop);
}

gameLoop();
