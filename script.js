let scene, camera, renderer, controls, rayCast;

const colors = [
  0x000080,
  0xFF6600,
  0xFFFF00,
  0x00FF00,
  0x911F27,
];

let random = function(from, to) {
  let a = Math.random() * (to - from);
  return a + from;
};

let createTorus = function() {
  let geometry = new THREE.TorusGeometry(10, 3, 16, 100);
  
  let color = colors[Math.floor(random(0, 5))];
  let emissive = color + 0.05;
  
  let material = new THREE.MeshPhongMaterial({
    color: color,
    emissive: emissive,
    shininess: 300
  });
  
  let torus = new THREE.Mesh(geometry, material);

  torus.position.x = random(-100, 100);
  torus.position.y = random(-100, 100);
  torus.position.z = random(-100, 100);

  scene.add(torus);
};

let addScore = 10;
let minScore = -5;
let scoreNow = 0;
let highScore = 0;
let scoreInt = document.getElementById("score");
let highScoreInt = document.getElementById("highscore");

let selectedObject = [];
let originalColors = [];

let onMouseClick = function(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
  mouse.z = 1;

  rayCast.setFromCamera(mouse, camera);

  let intersects = rayCast.intersectObjects(scene.children, false);

  if(intersects.length == 0) {
    return;
  }
  else {
    selectedObject.push(intersects);
    originalColors.push(intersects[0].object.material.color.getHex());

    if(selectedObject.length > 1) {
      if(selectedObject[0][0].object.uuid === selectedObject[1][0].object.uuid) {
        selectedObject[0][0].object.material.emissive.setHex(originalColors[0]);
        selectedObject[0][0].object.rotation.x = 0;
        selectedObject[0][0].object.rotation.y = 0;
      }
      else if(originalColors[0]==(originalColors[1])) {
        selectedObject.forEach(object => {
          object[0].object.geometry.dispose();
          object[0].object.material.dispose();
          scene.remove(object[0].object);
          renderer.renderLists.dispose();
        });

        scoreNow += addScore;
        console.log(scoreNow);
        scoreInt.innerHTML = scoreNow;
      }
      else {
        selectedObject[0][0].object.material.emissive.setHex(originalColors[0]);
        selectedObject[0][0].object.rotation.x = 0;
        selectedObject[0][0].object.rotation.y = 0;
        scoreNow += minScore;
        //console.log(scoreNow);
        scoreInt.innerHTML = scoreNow;
      }
      selectedObject = [];
      originalColors = [];
    }
    else if(selectedObject.length > 2) {
      selectedObject = [];
      originalColors = [];
      return;
    }
  }
};

let speed = 2500;
const baseSpeed = 2500;

let generateTorus = function() {
  if(scene.children.length >= 56) {
    speed = baseSpeed;

    if(scoreNow > highScore) {
        highScore = scoreNow;
        highScoreInt.innerHTML = highScore;
    }
      scoreNow = 0;
      scoreInt.innerHTML = scoreNow;
  }
  else {
    speed -= 150;
    createTorus();
  }
  setTimeout(generateTorus, speed);
};

let init = function() {
  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 70;

  /* Lighting */
  var light = new THREE.SpotLight(0xfffff,0.5);
  var light2 = new THREE.SpotLight(0xfffff,0.5);
  scene.add(new THREE.SpotLightHelper(light)); // letak Cahaya
  scene.add(light);
  scene.add(light2);
  light.position.set(0, 30, 0);
  light2.position.set(0, -30, 0);

  for(let i=1; i<=28; i++)
    createTorus();
  
  generateTorus();

  //renderer = new THREE.WebGLRenderer();
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setClearColor(0xffffff, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);
  document.addEventListener("click", onMouseClick, false);

  // control orbit
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.enableDamping = true;
      
  // raycaster
  rayCast = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  mouse.x = mouse.y = -1;
};
const clock = new THREE.Clock();

let mainLoop = function() {
  const elapsedTime = clock.getElapsedTime();

  if (selectedObject.length == 1) {
    selectedObject[0][0].object.material.emissive.setHex(elapsedTime % 0.5 >= 0.25 ? originalColors[0] : (originalColors[0] * 3));
    selectedObject[0][0].object.rotation.y += 10;
    selectedObject[0][0].object.rotation.x += 10;
  }
  
  renderer.render(scene, camera);
  controls.update();        
  window.requestAnimationFrame(mainLoop);
};

init();
mainLoop();