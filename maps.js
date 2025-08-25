const maps = {
    startArea: {
        obstacles: [
            { x: 0, y: 0, size: 800, height: 20 },
            { x: 0, y: 0, size: 20, height: 600 },
            { x: 780, y: 0, size: 20, height: 600 },
            { x: 0, y: 580, size: 350, height: 20 },
            
            { x: 100, y: 100, size: 20, height: 400 },
            { x: 100, y: 100, size: 300, height: 20 },
            { x: 400, y: 100, size: 20, height: 250 },
            { x: 400, y: 350, size: 300, height: 20 },
            { x: 700, y: 350, size: 20, height: 200 },
            { x: 200, y: 400, size: 400, height: 20 },
            { x: 200, y: 200, size: 20, height: 100 }
        ],
        enemies: [
            { x: 150, y: 150, size: 25 },
            { x: 300, y: 400, size: 25 },
            { x: 500, y: 200, size: 25 },
            { x: 650, y: 500, size: 25 }
        ],
        powerups: [
            { x: 500, y: 500, size: 20 },
            { x: 150, y: 250, size: 20 }
        ],
        items: [
            { x: 250, y: 150, size: 20, type: 'holzschaeter' },
            { x: 550, y: 300, size: 20, type: 'eisenschaeter' }
        ]
    }
};