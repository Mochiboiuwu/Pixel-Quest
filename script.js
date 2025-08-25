// Canvas und Kontext
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const healthBar = document.getElementById('health-bar');
const scoreDisplay = document.getElementById('score-display');
const weaponDisplay = document.getElementById('weapon-display');

// Spielvariablen
let gameRunning = true;
const enemySpeed = 1;
const playerMaxHealth = 100;
let score = 0;

// Waffen-Definitionen
const weapons = {
    'stock': { name: 'Stock', damage: 5 },
    'uebungs_schwert': { name: 'Übungsschwert', damage: 8 },
    'holzschaeter': { name: 'Holzschwert', damage: 10 },
    'eisenschaeter': { name: 'Eisenschwert', damage: 15 },
    'das_schwert': { name: 'Das Schwert', damage: 30 }
};

let obstacles = [];
let enemies = [];
let powerups = [];
let items = [];

const player = {
    x: 150,
    y: 150,
    size: 20,
    speed: 3,
    health: playerMaxHealth,
    isMovingUp: false,
    isMovingDown: false,
    isMovingLeft: false,
    isMovingRight: false,
    inventory: [],
    equippedWeapon: weapons['stock'] // Startwaffe
};

// --- Funktionen zum Laden der Map ---
function loadMap(mapName) {
    const mapData = maps[mapName];
    obstacles = mapData.obstacles;
    enemies = mapData.enemies.map(enemy => ({
        ...enemy,
        direction: 'right',
        moveCounter: 0,
        health: 30 // Gegner haben jetzt Lebenspunkte
    }));
    powerups = mapData.powerups;
    items = mapData.items; // Gegenstände laden
    
    player.x = 150;
    player.y = 150;
    player.inventory = [weapons['stock']]; // Inventar initialisieren
    player.equippedWeapon = weapons['stock'];
}

// --- Funktionen zum Zeichnen ---
function drawPlayer() {
    const s = player.size;
    const x = canvas.width / 2 - s / 2;
    const y = canvas.height / 2 - s / 2;

    ctx.fillStyle = 'blue';
    ctx.fillRect(x, y, s, s);
    ctx.fillStyle = 'brown';
    ctx.fillRect(x + s * 0.2, y - s * 0.4, s * 0.6, s * 0.4);
    ctx.fillStyle = 'darkblue';
    ctx.fillRect(x + s * 0.1, y + s, s * 0.3, s * 0.5);
    ctx.fillRect(x + s * 0.6, y + s, s * 0.3, s * 0.5);
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(x - s * 0.3, y + s * 0.1, s * 0.3, s * 0.7);
    ctx.fillRect(x + s, y + s * 0.1, s * 0.3, s * 0.7);
}

function drawObstacles() {
    const camX = player.x - canvas.width / 2;
    const camY = player.y - canvas.height / 2;
    ctx.fillStyle = '#654321';
    obstacles.forEach(obstacle => {
        const x = obstacle.x - camX;
        const y = obstacle.y - camY;
        ctx.fillRect(x, y, obstacle.size, obstacle.height || obstacle.size);
    });
}

function drawEnemies() {
    const camX = player.x - canvas.width / 2;
    const camY = player.y - canvas.height / 2;
    enemies.forEach(enemy => {
        const x = enemy.x - camX;
        const y = enemy.y - camY;

        // Gegner-Farbe basierend auf Gesundheit
        if (enemy.health > 20) {
            ctx.fillStyle = 'red';
        } else if (enemy.health > 10) {
            ctx.fillStyle = 'orange';
        } else {
            ctx.fillStyle = 'darkred';
        }
        ctx.fillRect(x, y, enemy.size, enemy.size);

        // Lebenspunktebalken zeichnen
        const barWidth = enemy.size;
        const barHeight = 4;
        const healthPercentage = enemy.health / 30; // 30 ist die Startgesundheit
        ctx.fillStyle = '#555';
        ctx.fillRect(x, y - barHeight - 2, barWidth, barHeight);
        ctx.fillStyle = 'lime';
        ctx.fillRect(x, y - barHeight - 2, barWidth * healthPercentage, barHeight);
    });
}

function drawPowerups() {
    const camX = player.x - canvas.width / 2;
    const camY = player.y - canvas.height / 2;
    ctx.fillStyle = 'greenyellow';
    powerups.forEach(powerup => {
        const x = powerup.x - camX;
        const y = powerup.y - camY;
        ctx.fillRect(x + powerup.size * 0.2, y, powerup.size * 0.6, powerup.size);
        ctx.fillRect(x, y + powerup.size * 0.2, powerup.size, powerup.size * 0.6);
    });
}

function drawItems() {
    const camX = player.x - canvas.width / 2;
    const camY = player.y - canvas.height / 2;
    items.forEach(item => {
        const x = item.x - camX;
        const y = item.y - camY;
        ctx.fillStyle = 'gold'; // Beispiel-Farbe für Gegenstände
        ctx.fillRect(x, y, item.size, item.size);
    });
}

function updateUI() {
    const healthPercentage = (player.health / playerMaxHealth) * 100;
    healthBar.style.width = healthPercentage + '%';
    scoreDisplay.textContent = `Punkte: ${score}`;
    weaponDisplay.textContent = `Ausrüstung: ${player.equippedWeapon.name}`;
}

// Kollisionen prüfen
function checkCollision(x, y, size) {
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        if (
            x < obs.x + obs.size &&
            x + size > obs.x &&
            y < obs.y + (obs.height || obs.size) &&
            y + size > obs.y
        ) {
            return true;
        }
    }
    return false;
}

// Angriffschaden zufügen
function checkAttackCollision() {
    const playerMidX = player.x + player.size / 2;
    const playerMidY = player.y + player.size / 2;
    const attackRange = 50;

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const enemyMidX = enemy.x + enemy.size / 2;
        const enemyMidY = enemy.y + enemy.size / 2;

        const distance = Math.hypot(playerMidX - enemyMidX, playerMidY - enemyMidY);

        if (distance < attackRange + enemy.size / 2) {
            // Schaden zufügen anstatt zu löschen
            enemy.health -= player.equippedWeapon.damage;
            if (enemy.health <= 0) {
                enemies.splice(i, 1);
                score += 10;
            }
        }
    }
}

// Kollision mit Gegnern
function checkEnemyCollision() {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (
            player.x < enemy.x + enemy.size &&
            player.x + player.size > enemy.x &&
            player.y < enemy.y + enemy.size &&
            player.y + player.size > enemy.y
        ) {
            player.health -= 1;
            if (player.health <= 0) {
                endGame();
            }
        }
    }
}

// Power-up-Kollision
function checkPowerupCollision() {
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        if (
            player.x < powerup.x + powerup.size &&
            player.x + player.size > powerup.x &&
            player.y < powerup.y + powerup.size &&
            player.y + player.size > powerup.y
        ) {
            player.health = Math.min(player.health + 30, playerMaxHealth);
            powerups.splice(i, 1);
        }
    }
}

// Gegenstands-Kollision
function checkItemCollision() {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (
            player.x < item.x + item.size &&
            player.x + player.size > item.x &&
            player.y < item.y + item.size &&
            player.y + player.size > item.y
        ) {
            const newItem = weapons[item.type];
            player.inventory.push(newItem);
            
            // Wenn der neue Gegenstand stärker ist, rüste ihn aus
            if (newItem.damage > player.equippedWeapon.damage) {
                player.equippedWeapon = newItem;
            }

            items.splice(i, 1);
        }
    }
}

function endGame() {
    gameRunning = false;
    ctx.fillStyle = 'white';
    ctx.font = '50px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
}

// Haupt-Spielloop
function gameLoop() {
    if (!gameRunning) return;

    let newX = player.x;
    let newY = player.y;

    if (player.isMovingUp) {
        newY -= player.speed;
    }
    if (player.isMovingDown) {
        newY += player.speed;
    }
    if (player.isMovingLeft) {
        newX -= player.speed;
    }
    if (player.isMovingRight) {
        newX += player.speed;
    }

    if (!checkCollision(newX, newY, player.size)) {
        player.x = newX;
        player.y = newY;
    }

    enemies.forEach(enemy => {
        let newEnemyX = enemy.x;
        let newEnemyY = enemy.y;

        if (enemy.moveCounter <= 0) {
            const directions = ['up', 'down', 'left', 'right', 'stay'];
            enemy.direction = directions[Math.floor(Math.random() * directions.length)];
            enemy.moveCounter = Math.floor(Math.random() * 60) + 30;
        }

        switch(enemy.direction) {
            case 'up':
                newEnemyY -= enemySpeed;
                break;
            case 'down':
                newEnemyY += enemySpeed;
                break;
            case 'left':
                newEnemyX -= enemySpeed;
                break;
            case 'right':
                newEnemyX += enemySpeed;
                break;
            case 'stay':
                break;
        }

        if (!checkCollision(newEnemyX, newEnemyY, enemy.size)) {
            enemy.x = newEnemyX;
            enemy.y = newEnemyY;
        } else {
            enemy.moveCounter = 0;
        }

        enemy.moveCounter--;
    });

    checkEnemyCollision();
    checkPowerupCollision();
    checkItemCollision();

    updateUI();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawObstacles();
    drawEnemies();
    drawPowerups();
    drawItems();
    drawPlayer();

    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            player.isMovingUp = true;
            break;
        case 'ArrowDown':
            player.isMovingDown = true;
            break;
        case 'ArrowLeft':
            player.isMovingLeft = true;
            break;
        case 'ArrowRight':
            player.isMovingRight = true;
            break;
        case ' ':
            checkAttackCollision();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            player.isMovingUp = false;
            break;
        case 'ArrowDown':
            player.isMovingDown = false;
            break;
        case 'ArrowLeft':
            player.isMovingLeft = false;
            break;
        case 'ArrowRight':
            player.isMovingRight = false;
            break;
    }
});

loadMap('startArea');
gameLoop();