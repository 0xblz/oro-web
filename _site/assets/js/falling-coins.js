/**
 * Falling Coins Animation
 * 
 * This script creates an animation of falling oro.svg coins that bounce off the edges
 * of the screen and disappear when they reach the bottom. The animation plays once
 * per page load.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Create container for falling coins if it doesn't exist
    let container = document.querySelector('.falling-coins-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'falling-coins-container';
        document.body.appendChild(container);
    }

    // Configuration
    const config = {
        coinCount: 20,           // Number of coins to create
        minSpeed: 4,             // Minimum falling speed
        maxSpeed: 5,             // Maximum falling speed
        minSize: 64,             // Minimum coin size in pixels
        maxSize: 120,            // Maximum coin size in pixels
        gravity: 0.2,            // Gravity effect
        friction: 0.99,          // Friction when bouncing
        bounceReduction: 0.95,   // Reduction in velocity after bounce (increased for more bounce)
        horizontalBoost: 1.5,    // Boost to horizontal velocity when bouncing
        bottomBounceThreshold: 0.5, // Minimum velocity needed to bounce at bottom
        spawnInterval: 200,      // Milliseconds between coin spawns
        maxSpawnDelay: 3000      // Maximum delay for the last coin
    };

    // Array to store all coin objects
    const coins = [];
    
    // Create coins with staggered timing
    let coinsCreated = 0;
    
    // Function to create a coin with delay
    const createCoinsWithDelay = () => {
        if (coinsCreated < config.coinCount) {
            createCoin(container, config, coins);
            coinsCreated++;
            
            // Calculate delay for next coin - shorter delays at first, longer later
            const progress = coinsCreated / config.coinCount; // 0 to 1
            const delay = config.spawnInterval + (progress * progress * (config.maxSpawnDelay - config.spawnInterval));
            
            // Schedule next coin creation
            setTimeout(createCoinsWithDelay, delay);
        }
    };
    
    // Start creating coins
    createCoinsWithDelay();

    // Start animation
    requestAnimationFrame(() => updateCoins(coins, config));
});

/**
 * Creates a coin element and adds it to the container
 */
function createCoin(container, config, coins) {
    // Create coin element
    const coin = document.createElement('div');
    coin.className = 'coin';
    
    // Random size
    const size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
    coin.style.width = `${size}px`;
    coin.style.height = `${size}px`;
    
    // Random starting position (only from the top)
    const startX = Math.random() * window.innerWidth;
    coin.style.left = `${startX}px`;
    coin.style.top = '-50px'; // Start above the viewport
    
    // Add to container
    container.appendChild(coin);
    
    // Random rotation
    const rotation = Math.random() * 360;
    coin.style.transform = `rotate(${rotation}deg)`;
    
    // Add to coins array with physics properties
    coins.push({
        element: coin,
        x: startX,
        y: -50,
        vx: (Math.random() - 0.5) * 3, // Increased initial horizontal velocity for more movement
        vy: Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed,
        size: size,
        rotation: rotation,
        rotationSpeed: (Math.random() - 0.5) * 8, // Increased rotation speed
        opacity: 0,
        fadeInDistance: Math.random() * 200 + 100, // Random distance over which the coin will fade in
        fadeInProgress: 0, // Track fade-in progress
        removed: false,
        bounceCount: 0, // Track number of bounces
        maxBounces: Math.floor(Math.random() * 3) + 2 // Random max bounces before disappearing
    });
}

/**
 * Updates the position of all coins
 */
function updateCoins(coins, config) {
    let allRemoved = true;
    
    coins.forEach(coin => {
        if (coin.removed) return;
        allRemoved = false;
        
        // Apply gravity
        coin.vy += config.gravity;
        
        // Apply friction
        coin.vx *= config.friction;
        coin.vy *= config.friction;
        
        // Update position
        coin.x += coin.vx;
        coin.y += coin.vy;
        
        // Handle fade in as the coin falls
        if (coin.fadeInProgress < coin.fadeInDistance) {
            // Calculate how far the coin has traveled
            coin.fadeInProgress += coin.vy;
            
            // Update opacity based on progress
            coin.opacity = Math.min(1, coin.fadeInProgress / coin.fadeInDistance);
            coin.element.style.opacity = coin.opacity;
        }
        
        // Update rotation
        coin.rotation += coin.rotationSpeed;
        
        // Check for collisions with screen edges
        const rightEdge = window.innerWidth - coin.size;
        const bottomEdge = window.innerHeight - (coin.size * 0.2);
        
        // Bounce off left and right edges with enhanced effect
        if (coin.x < 0) {
            coin.x = 0;
            coin.vx = -coin.vx * config.bounceReduction;
            // Add a bit of upward velocity for a more dynamic bounce
            coin.vy -= Math.abs(coin.vx) * 0.3;
            // Increase rotation speed
            coin.rotationSpeed = Math.abs(coin.rotationSpeed) * (Math.random() > 0.5 ? 1 : -1) * 1.2;
            coin.bounceCount++;
        } else if (coin.x > rightEdge) {
            coin.x = rightEdge;
            coin.vx = -coin.vx * config.bounceReduction;
            // Add a bit of upward velocity for a more dynamic bounce
            coin.vy -= Math.abs(coin.vx) * 0.3;
            // Increase rotation speed
            coin.rotationSpeed = Math.abs(coin.rotationSpeed) * (Math.random() > 0.5 ? 1 : -1) * 1.2;
            coin.bounceCount++;
        }
        
        // Handle bottom edge - bounce a few times before fading out
        if (coin.y > bottomEdge) {
            if (coin.bounceCount < coin.maxBounces && Math.abs(coin.vy) > config.bottomBounceThreshold) {
                // Bounce off bottom
                coin.y = bottomEdge;
                coin.vy = -coin.vy * config.bounceReduction;
                
                // Add some horizontal movement for a more natural bounce
                coin.vx += (Math.random() - 0.5) * config.horizontalBoost;
                
                // Increase rotation for visual effect
                coin.rotationSpeed *= 1.1;
                
                coin.bounceCount++;
            } else {
                // After max bounces or when velocity is too low, start fading out
                coin.opacity -= 0.03;
                coin.element.style.opacity = coin.opacity;
                
                // Remove when fully faded
                if (coin.opacity <= 0) {
                    coin.element.remove();
                    coin.removed = true;
                }
            }
        }
        
        // Update element position and rotation
        coin.element.style.transform = `translate(${coin.x}px, ${coin.y}px) rotate(${coin.rotation}deg)`;
    });
    
    // Continue animation if not all coins are removed
    if (!allRemoved) {
        requestAnimationFrame(() => updateCoins(coins, config));
    }
} 