
showLoadingScreen();
loadPage('pages/title-screen.html');

var progress = 0;
var interval = setInterval(function () {
    progress += 10;
    setLoadingProgress(progress);
    if (progress >= 100) {
        clearInterval(interval);
        closeLoadingScreen();

        startGame();
    }
}, 200);

function startGame() {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Real sky using SkyDome
    const skyGeometry = new THREE.SphereGeometry(500, 60, 40);
    const skyMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('https://images.unsplash.com/photo-1597200381847-30ec200eeb9a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
        side: THREE.BackSide
    });
    
    const skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skyDome);

    // Add sunlight
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    scene.add(directionalLight);

    // Create the grass ground
    const groundTexture = new THREE.TextureLoader().load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/textures/terrain/grasslight-big.jpg');
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(50, 50);

    const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Camera starting position
    camera.position.set(0, 2, 5);

    // Key control setup
    const keysPressed = {};

    window.addEventListener('keydown', (event) => {
        keysPressed[event.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (event) => {
        keysPressed[event.key.toLowerCase()] = false;
    });

    function move() {
        requestAnimationFrame(move);

        const moveSpeed = 0.5;
        const turnSpeed = 0.02;

        // Movement
        if (keysPressed['w']) {
            camera.translateZ(-moveSpeed);
        }
        if (keysPressed['s']) {
            camera.translateZ(moveSpeed);
        }

        // Turning
        if (keysPressed['a']) {
            camera.rotation.y += turnSpeed;
        }
        if (keysPressed['d']) {
            camera.rotation.y -= turnSpeed;
        }

        renderer.render(scene, camera);
    }

    move();
}
