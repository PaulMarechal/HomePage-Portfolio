import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'
import CircleType from 'circletype'
import Darkmode from 'darkmode-js';
// import noise from 'noise-library';
// import CircleType from `circletype`;

/**
 * Perlin noise 
 */
// Perlin noise 
const noise = `
  // GLSL textureless classic 3D noise "cnoise",
  // with an RSL-style periodic variant "pnoise".
  // Author:  Stefan Gustavson (stefan.gustavson@liu.se)
  // Version: 2011-10-11
  //
  // Many thanks to Ian McEwan of Ashima Arts for the
  // ideas for permutation and gradient selection.
  //
  // Copyright (c) 2011 Stefan Gustavson. All rights reserved.
  // Distributed under the MIT license. See LICENSE file.
  // https://github.com/ashima/webgl-noise
  //

  vec3 mod289(vec3 x)
  {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x)
  {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x)
  {
    return mod289(((x*34.0)+1.0)*x);
  }

  vec4 taylorInvSqrt(vec4 r)
  {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  vec3 fade(vec3 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
  }

  // Classic Perlin noise, periodic variant
  float pnoise(vec3 P, vec3 rep)
  {
    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
  }
`;
// fin perlin noise 

// Rotation test
const rotation = `
  mat3 rotation3dY(float angle) {
    float s = sin(angle);
    float c = cos(angle);

    return mat3(
      c, 0.0, -s,
      0.0, 1.0, 0.0,
      s, 0.0, c
    );
  }
  
  vec3 rotateY(vec3 v, float angle) {
    return rotation3dY(angle) * v;
  }  
`;

// Vertext shader test 
const vertexShader = `  
  varying vec3 vNormal;
  
  uniform float uTime;
  uniform float uSpeed;
  uniform float uNoiseDensity;
  uniform float uNoiseStrength;
    uniform float uFrequency;
  uniform float uAmplitude;
  
    ${noise}

    ${rotation}
  
  void main() {
    float t = uTime * uSpeed;
    float distortion = pnoise((normal + t) * uNoiseDensity, vec3(10.0)) * uNoiseStrength;

    vec3 pos = position + (normal * distortion);
    float angle = sin(uv.y * uFrequency + t) * uAmplitude;
    pos = rotateY(pos, angle);    
    
    vNormal = normal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
  }  
`;
// fin vertext shader test

// fragment Shader test 
const fragmentShader = `
  varying vec3 vNormal;
  
  uniform float uTime;
  
  void main() {
    vec3 color = vec3(1.0);
    
    gl_FragColor = vec4(vNormal, 1.0);
  }  
`;

// fin fragment shader test 
const settings = {
  speed: 0.2,
//   density: 1.5,
  density: 2,
  strength: 0.21,
  frequency: 5.0,
  amplitude: 6.0,
};


/**
 * Debug
 */
// const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded'
}

// gui
//     .addColor(parameters, 'materialColor')
//     .onChange(() => {
//         material.color.set(parameters.materialColor)
//         particlesMaterial.color.set(parameters.materialColor)
// })

// const folder1 = gui.addFolder('Noise');
// const folder2 = gui.addFolder('Rotation');
// folder1.add(settings, 'speed', 0.1, 1, 0.01);
// folder1.add(settings, 'density', 0, 10, 0.01);
// folder1.add(settings, 'strength', 0, 2, 0.01);
// folder2.add(settings, 'frequency', 0, 10, 0.1);
// folder2.add(settings, 'amplitude', 0, 10, 0.1);


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

scene.background = new THREE.Color( 0xffffff );

/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial({ color: '#ff0000' })
// )
// scene.add(cube)

/**
 * Objects
 */
// Textures 
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

// material
const material = new THREE.MeshToonMaterial({
    // color: parameters.materialColor, 
    color: 0x3a88fe, 
    gradientMap: gradientTexture
    
})

// Gradient de couleur theme jour ok 
const material1 = new THREE.MeshNormalMaterial();


// Pour theme sombre ok 
const material2 = new THREE.MeshPhongMaterial();
material2.shininess = 100
material2.specular = new THREE.Color(0x1188ff)
material2.opacity = 1
// material2.envMap = environmentMapTexture

// Thème sombre ok 
const material3 = new THREE.MeshStandardMaterial();
material3.metalness = 0.45
material3.roughness = 0.65

const material4 = new THREE.MeshLambertMaterial();

const material5 = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: settings.speed },
        uNoiseDensity: { value: settings.density },
        uNoiseStrength: { value: settings.strength },
        // uFrequency: { value: settings.frequency },
        // uAmplitude: { value: settings.amplitude },
      },
    //   wireframe: true,
});


// Meshes
const objectsDistance = 4
// Donut
const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material1
)

const mesh2 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material1
)

const mesh3 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material1
)

const mesh4 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.5, 16, 60),
    material1
)

// // Cone
// const mesh2 = new THREE.Mesh(
//     new THREE.ConeGeometry(1, 2, 32),
//     material1
// )

// // TorusKnot
// const mesh3 = new THREE.Mesh(
//     new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
//     material1
// )

// // Dodecahedron
// const mesh4 = new THREE.Mesh(
//     new THREE.DodecahedronGeometry(),
//     material1
// )

// // Octahedron
// const mesh5 = new THREE.Mesh(
//     new THREE.OctahedronGeometry(),
//     material2
// )

// Sphere 
const mesh6 = new THREE.Mesh(
    // new THREE.SphereGeometry( 24, 6, 17 ), 
    // material1
    new THREE.IcosahedronBufferGeometry(1, 64),
    material5 
)

mesh1.position.y = - objectsDistance * -0.4
mesh2.position.y = - objectsDistance * -0.7
mesh3.position.y = - objectsDistance * 0.7
mesh4.position.y = - objectsDistance * 0.6
mesh6.position.z = 2.19

mesh1.position.x = 4.4
mesh2.position.x = -3.48
mesh3.position.x = 3.03
mesh4.position.x = -3.85

// mesh1.position.y = 1.93
// mesh2.position.y = 2.17
// mesh3.position.y = -2.5
// mesh4.position.y = -4.22


// gui.add(mesh6.position, 'x').min(-20).max(20).step(0.01).name('TorusKnot position x')
// gui.add(mesh6.position, 'y').min(-20).max(20).step(0.01).name('TorusKnot position y')
// gui.add(mesh6.position, 'z').min(-60).max(20).step(0.01).name('TorusKnot position z')

scene.add(mesh1, mesh2, mesh3, mesh4,  mesh6 )

const sectionMeshes = [ mesh1, mesh2, mesh3, mesh4, mesh6 ]

// console.log(sectionMeshes[4]);

// const folder3 = gui.addFolder('mesh1')

// position
// folder3.add(mesh1.position, 'y', -5, 5, 0.01);
// folder3.add(mesh1.position, 'y', -5, 5, 0.01);
// folder3.add(mesh1.position, 'z', -5, 5, 0.01);

// rotation
// const folder31 = gui.addFolder('mesh1 ratation')
// folder31.add(mesh1.ratation, 'x', -5, 5, 0.01);
// folder31.add(mesh1.ratation, 'y', -5, 5, 0.01);



// position
// const folder4 = gui.addFolder('mesh2 position')
// folder4.add(mesh2.position, 'y', -5, 5, 0.01);
// folder4.add(mesh2.position, 'y', -5, 5, 0.01);
// folder4.add(mesh2.position, 'z', -5, 5, 0.01);

// position
// const folder5 = gui.addFolder('mesh3 posiiton')
// folder5.add(mesh3.position, 'y', -5, 5, 0.01);
// folder5.add(mesh3.position, 'y', -5, 5, 0.01);
// folder5.add(mesh3.position, 'z', -5, 5, 0.01);

// position
// const folder6 = gui.addFolder('mesh4')
// folder6.add(mesh4.position, 'y', -5, 5, 0.01);
// folder6.add(mesh4.position, 'y', -5, 5, 0.01);
// folder6.add(mesh4.position, 'z', -5, 5, 0.01);

/**
* Particles
*/
// Geometry
const particlesCount = 300
const positions = new Float32Array(particlesCount * 3 )

for( let i = 0; i < particlesCount; i++){
    positions[i * 3 + 0 ] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1 ] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length
    positions[i * 3 + 2 ] = (Math.random() - 0.5) * 10
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

// Material 
// Ta have round particles 
function createCircleTexture(color, size) {
  var matCanvas = document.createElement('canvas');
  matCanvas.width = matCanvas.height = size;
  var matContext = matCanvas.getContext('2d');
  // create texture object from canvas.
  var texture = new THREE.Texture(matCanvas);
  // Draw a circle
  var center = size / 2;
  matContext.beginPath();
  matContext.arc(center, center, size/2, 0, 2 * Math.PI, false);
  matContext.closePath();
  matContext.fillStyle = color;
  matContext.fill();
  // need to set needsUpdate
  texture.needsUpdate = true;
  // return a texture made from the canvas
  return texture;
}

// Particles material with round particles function ( createCircleTexture )
const particlesMaterial = new THREE.PointsMaterial({
    // color: parameters.materialColor, 
    // color: 0x000000,
    // sizeAttenuation: true, 
    // size: 0.04
    map: createCircleTexture('#000000', 256),
    size: 0.05,
    transparent: true,
    depthWrite: false
})

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
* Lights
*/
const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)

/**
 * Sizes
 */
const canvas3D = document.querySelector(".canvas3D");

const sizes = {
  width: ((window.innerWidth / 12) * 11) + 14, 
  height: ((window.innerHeight / 12) * 11) - 6
}


const body = document.querySelector(".body")
body.style.display = "grid"
body.style.gridTemplateColumns = `${((window.innerWidth / 11) * 0.5) - 10}px repeat(4, ${(window.innerWidth / 11) + ((window.innerWidth / 11) * 0.245)}px) repeat(2, ${(window.innerWidth / 11) * 0.1}px) repeat(4, ${(window.innerWidth / 11) + ((window.innerWidth / 11) * 0.245)}px) ${((window.innerWidth / 11) * 0.5) - 20}px`
body.style.gridTemplateRows = `${((window.innerHeight / 11) * 0.5) - 8 }px repeat(10, ${window.innerHeight / 11}px) ${(window.innerHeight / 11) * 0.5}px`


window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth * 0.9
    sizes.height = window.innerHeight * 0.9

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * Camera
 */
// Group 
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas, 
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
*/
let scrollY = window.scrollY
let currentSection = 0 

window.addEventListener('scroll', () => {

    scrollY = window.scrollY

    const newSection = Math.round(scrollY / sizes.height)

        // test 

        var lastScrollTop = 0;

        window.addEventListener("scroll", function(){ 
        var st = window.pageYOffset || newSection; 

        if (st > lastScrollTop ){
            //   alert('down')
            // camera.position.z += 0.5
            // camera.rotation.y += 0.0001

        } else {
            //   alert('up')
            // camera.rotation.y -= 0.0001

            // camera.position.z -= 0.5
        }
        lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
        }, false);

        // fin test 

    if(newSection != currentSection){
        currentSection = newSection

        gsap.to(
            sectionMeshes[currentSection].rotation,
            {
                duration: 1.5, 
                ease: 'power2.inOut',
                x: '+=6', 
                y: '+=3', 
                z: '+=1.5'
            }
        )
    }
})



/**
 * Cursor
*/
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', () => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})


///////////////////
// Custom cursor //
///////////////////
// var cursor = document.querySelector('.cursor');
var cursorinner = document.querySelector('.cursor2');
var a = document.querySelectorAll('a');

// round text cursor test 2 
const cursorOuter = document.querySelector(".cursor--large");
const cursorInner = document.querySelector(".cursor--small");
const cursorTextContainerEl = document.querySelector(".cursor--text");
const cursorTextEl = cursorTextContainerEl.querySelector(".text");

const hoverItems = document.querySelectorAll(".cursor-hover-item");
const hoverEffectDuration = 0.3;
let isHovered = false;

const cursorRotationDuration = 8;

let circleType = new CircleType(cursorTextEl);
circleType.radius(50);

hoverItems.forEach((item) => {
  item.addEventListener("pointerenter", handlePointerEnter);
  item.addEventListener("pointerleave", handlePointerLeave);
});

let mouse = {
  x: -100,
  y: -100,
};

document.body.addEventListener("pointermove", updateCursorPosition);

function updateCursorPosition(e) {
  mouse.x = e.pageX;
  mouse.y = e.pageY;
}

function updateCursor() {
  gsap.set([cursorInner, cursorTextContainerEl], {
    x: mouse.x,
    y: mouse.y,
  });

  gsap.to(cursorOuter, {
    duration: 0.15,
    x: mouse.x,
    y: mouse.y,
  });

  if (!isHovered) {
    gsap.to(cursorTextContainerEl, hoverEffectDuration, {
      opacity: 0,
      scale: 1.2,
    });
    gsap.set(cursorTextContainerEl, {
      rotate: 0,
    });
  }

  requestAnimationFrame(updateCursor);
}

updateCursor();

function handlePointerEnter(e) {
  isHovered = true;

  const target = e.currentTarget;
  const cursorTextRepeatTimes = target.getAttribute("data-cursor-text-repeat");
  const cursorText = returnMultipleString(
    target.getAttribute("data-cursor-text"),
    cursorTextRepeatTimes
  );

  gsap.fromTo(
    cursorTextContainerEl,
    {
      rotate: 0,
    },
    {
      duration: cursorRotationDuration,
      rotate: 360,
      ease: "none",
      repeat: -1,
    }
  );

  circleType.destroy();
  cursorTextEl.innerHTML = cursorText;
  circleType = new CircleType(cursorTextEl);
  // circleType.forceHeight();

  gsap.to(cursorInner, hoverEffectDuration, {
    scale: 2,
  });
  gsap.fromTo(
    cursorTextContainerEl,
    hoverEffectDuration,
    {
      scale: 1.2,
      opacity: 0,
      
    },
    {
      delay: hoverEffectDuration * 0.75,
      scale: 1,
      opacity: 1,
    }
  );
  gsap.to(cursorOuter, hoverEffectDuration, {
    scale: 1.2,
    opacity: 0,
  });
    
}

function handlePointerLeave() {
  isHovered = false;
  gsap.to([cursorInner, cursorOuter], hoverEffectDuration, {
    scale: 1,
    opacity: 1,
  });
}

function returnMultipleString(string, count) {
  let s = "";
  for (let i = 0; i < count; i++) {
    s += ` ${string} `;
  }
  return s;
}
// fin round text cursor test 2 

// Button Day - Night
var backgroundButton = document.querySelector('#change-background');
const classess = backgroundButton.classList;

backgroundButton.addEventListener('click', function(){
    const result = classess.toggle("Night");
    var canvasBorder = document.querySelector('canvas.webgl')
    var cursorTextColor = document.querySelector('.cursor--text')
    var cursorSmallColor = document.querySelector('.cursor--small')
    var cursorLargeColor = document.querySelector('.cursor--large')
    var tablerIconGit = document.querySelector('.icon-tabler-brand-github')
    var tablerIconLink = document.querySelector('.icon-tabler-brand-linkedin')
    var tablerIconSun = document.querySelector('.linkDayNight')
    var iconSun = document.querySelector('.icon-tabler-sun')
    var tablerIconMail = document.querySelector('.icon-tabler-mail')
    // console.log(cursorColor);

    if (result) {
        // Sky
        darkmode.toggle();
        scene.background = new THREE.Color( '#000' );
        // document.body.style.border = 'solid 1px #fff'; 
        canvasBorder.style.border = 'solid 1px #fff'; 
        canvasBorder.style.borderRadius = '20px';
        particlesMaterial.map = createCircleTexture('#fff', 256);
        cursorTextColor.style.color = '#fff';
        cursorSmallColor.style.background = '#000';
        cursorLargeColor.style.border = '2px solid #fff';
        // console.log(body)
        document.querySelector("body").style.background = "#fefefe";
        // tablerIcon.style.stroke = '#000'
        tablerIconGit.style.stroke = '#000'
        tablerIconLink.style.stroke = '#000'
        iconSun.style.stroke = '#fff'
        tablerIconMail.style.stroke = '#000'

        console.log(document.querySelector("body").style.background)
        document.querySelector(".body").style.background = "#383838!important"
        // const canvas3D = document.querySelector(".canvas3D");

        function changeColorHoverDark(classOrId){
          const canvas3D = document.querySelector(classOrId);
          canvas3D.addEventListener("mouseover", function() {
            cursorTextColor.style.color = '#fff';
            cursorSmallColor.style.background = '#000';
            cursorLargeColor.style.border = '2px solid #fff';
          });
  
          canvas3D.addEventListener("mouseout", function() {
            cursorTextColor.style.color = '#000';
            cursorSmallColor.style.background = '#fff';
            cursorLargeColor.style.border = '2px solid #000';
          });
        }
        // changeColorHoverDark(".canvas3D")
        // changeColorHoverDark(".nameTitle")
        // changeColorHoverDark(".creativeDev")
        // changeColorHoverDark(".portfolioLink")
        // changeColorHoverDark(".siteLink")  
        
    } else {
        // Sky
        scene.background = new THREE.Color( '#fff' );
        canvasBorder.style.border = 'solid 1px #000'; 
        particlesMaterial.map = createCircleTexture('#000', 256);
        cursorTextColor.style.color = '#000';
        cursorSmallColor.style.background = '#fff';
        cursorLargeColor.style.border = '2px solid #000';
        // tablerIcon.style.stroke = '#fff'
        tablerIconGit.style.stroke = '#fff'
        tablerIconLink.style.stroke = '#fff'
        iconSun.style.stroke = '#FFF'
        tablerIconMail.style.stroke = '#fff'
        darkmode.toggle();

    }
});

/**
 * Hover redirect icon
 */
const iconesRedirect = document.querySelectorAll('.icon-tabler');
console.log(iconesRedirect[0])
const icone = document.querySelector('.icon')

iconesRedirect.forEach(icone => {
    icone.addEventListener('mouseover', () => {
      if(icone.classList.contains('icon-tabler-sun')){
        icone.style.stroke = "#FFF"
      } else {
        icone.style.stroke = "#000"
        icone.style.zIndex = "999999"
        icone.classList.add("hoverIconRedirect")
        icone.classList.remove("normalIcon")
      }
    });
    icone.addEventListener('mouseout', () => {
        if(icone.classList.contains('icon-tabler-sun')){
          icone.style.stroke = "#000"
        } else {
          icone.style.stroke = "#FFF"
          icone.classList.remove("hoverIconRedirect")
          icone.classList.add("normalIcon")
        }
    });
});
 
const darkmode =  new Darkmode();


// const icons = document.querySelectorAll(".icon");
// console.log(darkmode.isActivated())
// if(darkmode.isActivated()){
//   icons.forEach(function(icon) {
//     console.log('yo')
//     if(icon.classList.contains("icon-tabler-sun")){
//       console.log(icon)
//       icon.style.stroke = "#000!important"
//     } else {
//       console.log(icon)
//       icon.style.stroke = "#FFF";
//     }
//   });
// } else {  
//   icons.forEach(function(icon) {
//     console.log("yooooo")
//     if(icon.classList.contains("icon-tabler-sun")){
//       icon.style.stroke = "#000"
//     } else {
//       icon.style.stroke = "#FFF";
//     }
//   });
// }


/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Animate Camera 
    camera.position.y = - scrollY / sizes.height * objectsDistance

    const parallaxX = cursor.x * 0.5
    const parallaxY = - cursor.y * 0.5

    cameraGroup.position.x += (parallaxX - cameraGroup.position.x ) * 4 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y ) * 4 * deltaTime

    // Animate meshes
    for(const mesh of sectionMeshes){
        // mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.z += deltaTime * 0.03
        mesh.rotation.x += deltaTime * 0.02
    }

    sectionMeshes[4].rotation.x += deltaTime * 0.06
    sectionMeshes[4].rotation.z += deltaTime * 0.05

    // Render
    renderer.render(scene, camera)


    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()