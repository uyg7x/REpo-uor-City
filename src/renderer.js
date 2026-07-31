// Three.js 3D Rendering Module - Enhanced with Curved Layouts, Isometric View & Smooth Animations
import { fetchUserRepos, fetchRepoDetails } from './api.js';

// Configuration Constants
const CONFIGS = {
  DE: { 
    lang: { title: 'WILLKOMMEN IN', repos: 'PROJEKTE', climate: 'Bewölkt & Regen' }, 
    arch: 'GERMANY', 
    wallColor: 0x5d4037, 
    roofColor: 0x3e2723, 
    fog: { color: 0x556677, density: 0.008 }, 
    ambient: 0x778899, 
    particle: { color: 0x8888aa, opacity: 0.8 }, 
    road: 0x1e1e24, 
    path: 0x6e6e73, 
    bin: 0x2d4a22 
  },
  JP: { 
    lang: { title: 'ようこそ', repos: 'プロジェクト', climate: '桜 & 晴れ' }, 
    arch: 'JAPAN', 
    wallColor: 0xeeeeee, 
    roofColor: 0x1a1a1a, 
    fog: { color: 0xffeeff, density: 0.003 }, 
    ambient: 0xffeef5, 
    particle: { color: 0xff88aa, opacity: 0.6 }, 
    road: 0x2a2a2a, 
    path: 0xcccccc, 
    bin: 0x444444 
  },
  IN: { 
    lang: { title: 'स्वागत है', repos: 'रिपॉजिटरी', climate: 'धूप और गर्मी' }, 
    arch: 'INDIA', 
    wallColor: 0xf5f5dc, 
    roofColor: 0xcccccc, 
    fog: { color: 0xffccaa, density: 0.0025 }, 
    ambient: 0xffddbb, 
    particle: { color: 0xddccaa, opacity: 0.4 }, 
    road: 0x4a3b2c, 
    path: 0xa89988, 
    bin: 0x665544 
  },
  US: { 
    lang: { title: 'WELCOME TO', repos: 'REPOSITORIES', climate: 'Cyberpunk Night' }, 
    arch: 'MODERN', 
    wallColor: 0x1f2937, 
    roofColor: 0x111827, 
    fog: { color: 0x0a0f1d, density: 0.005 }, 
    ambient: 0x374151, 
    particle: { color: 0x38bdf8, opacity: 0.6 }, 
    road: 0x111827, 
    path: 0x4b5563, 
    bin: 0x6b7280 
  },
  GB: { 
    lang: { title: 'WELCOME TO', repos: 'REPOSITORIES', climate: 'Overcast & Drizzle' }, 
    arch: 'UK', 
    wallColor: 0x8d6e63, 
    roofColor: 0x37474f, 
    fog: { color: 0x445566, density: 0.007 }, 
    ambient: 0x778899, 
    particle: { color: 0x8899aa, opacity: 0.7 }, 
    road: 0x222222, 
    path: 0x555555, 
    bin: 0x2d4a22 
  }
};

// Layout Constants
const LAYOUT = {
  HOUSE_SPACING: 16,
  HOUSE_SIZE: 5,
  MAX_REPO_DISPLAY: 36
};

// Three.js CDN Configuration
const THREE_CDN = process.env.THREE_CDN || 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const ORBIT_CONTROLS_CDN = process.env.ORBIT_CONTROLS_CDN || 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';

/**
 * Generate home page HTML with 3D neighborhood featuring curved roads, isometric view, and smooth animations
 * @param {string} username - GitHub username
 * @returns {Promise<string>} HTML string
 */
export async function getHomeHTML(username) {
  const repos = await fetchUserRepos(username);
  const reposData = JSON.stringify(repos.slice(0, LAYOUT.MAX_REPO_DISPLAY).map(r => ({ name: r.name, size: r.size })));

  return `
  <!DOCTYPE html>
  <html lang="en"><head>
    <meta charset="UTF-8">
    <title>${username}'s Explorable City Portfolio</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; overflow: hidden; background: #07090e; font-family: 'Plus Jakarta Sans', sans-serif; opacity: 0; transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1); color: #f8fafc; }
      canvas { display: block; width: 100vw; height: 100vh; }
      #ui-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
      
      /* Glassmorphism Header Bar */
      #top-bar {
        position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px;
        padding: 10px 24px; display: flex; align-items: center; gap: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); pointer-events: auto; z-index: 10;
        transition: all 0.3s ease;
      }
      #main-title { font-size: 15px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
      
      /* Control Buttons */
      .nav-btn {
        background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15);
        color: #f1f5f9; padding: 8px 16px; border-radius: 12px; font-size: 13px; font-weight: 600;
        cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; gap: 6px;
      }
      .nav-btn:hover { background: rgba(56, 189, 248, 0.25); border-color: rgba(56, 189, 248, 0.5); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(56, 189, 248, 0.2); }
      .nav-btn.active { background: linear-gradient(135deg, #38bdf8, #6366f1); border-color: transparent; color: #ffffff; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
      
      /* Badges & Widgets */
      #env-badge {
        position: absolute; bottom: 24px; right: 24px; color: #cbd5e1;
        background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        padding: 12px 20px; border-radius: 16px; font-size: 13px; font-weight: 600;
        border: 1px solid rgba(255, 255, 255, 0.1); pointer-events: auto;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; flex-direction: column; gap: 4px; text-align: right;
      }
      #env-badge span { color: #38bdf8; font-weight: 700; }

      /* Floating House Labels */
      .house-label {
        position: absolute; color: #f8fafc; font-size: 12px; font-weight: 700; text-align: center;
        pointer-events: none; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px);
        padding: 6px 12px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 10px 25px rgba(0,0,0,0.4); transition: transform 0.2s ease, opacity 0.3s ease;
        white-space: nowrap; transform: translate(-50%, -100%);
      }
      .house-label::after {
        content: ''; position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%);
        border-width: 5px 5px 0; border-style: solid; border-color: rgba(15, 23, 42, 0.85) transparent;
      }
      
      /* Loading Screen */
      #loading-screen {
        position: absolute; top:0; left:0; width:100%; height:100%; background:#07090e;
        display:flex; justify-content:center; align-items:center; color:#f8fafc; font-size:18px;
        font-weight: 600; z-index:9999; flex-direction:column; gap:16px;
      }
      .spinner {
        width: 48px; height: 48px; border: 4px solid rgba(56, 189, 248, 0.15);
        border-left-color: #38bdf8; border-radius: 50%; animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  </head><body>
    <div id="loading-screen"><div class="spinner"></div><div>Constructing Curved Isometric City Architecture...</div></div>
    
    <div id="top-bar">
      <h1 id="main-title">REPO CITY</h1>
      <button id="view-toggle-btn" class="nav-btn active">📐 Isometric View</button>
    </div>
    
    <div id="env-badge"><div>Environment: <span id="env-climate">Detecting...</span></div><div style="font-size: 11px; opacity: 0.75;">Click house to explore repo code city</div></div>
    <div id="ui-layer"></div>

    <script src="${THREE_CDN}"><\/script>
    <script src="${ORBIT_CONTROLS_CDN}"><\/script>
    <script>
      const repos = ${reposData};
      const CONFIGS = ${JSON.stringify(CONFIGS)};
      const LAYOUT = ${JSON.stringify(LAYOUT)};
      let ENV = CONFIGS.US;

      fetch('https://ipapi.co/json/').then(res => res.json()).then(data => { 
        if (CONFIGS[data.country_code]) ENV = CONFIGS[data.country_code]; 
        initScene(); 
      }).catch(() => initScene());

      function initScene() {
          const userTitle = repos[0]?.name.split('/')[0]?.toUpperCase() || '${username.toUpperCase()}';
          document.getElementById('main-title').innerText = \`\${ENV.lang.title} \${userTitle}\`;
          document.getElementById('env-climate').innerText = ENV.lang.climate;
          
          const loadingScreen = document.getElementById('loading-screen');
          loadingScreen.style.opacity = '0';
          setTimeout(() => loadingScreen.style.display = 'none', 500);
          document.body.style.opacity = '1';
          
          // Scene Setup
          const scene = new THREE.Scene(); 
          scene.background = new THREE.Color(ENV.fog.color); 
          scene.fog = new THREE.FogExp2(ENV.fog.color, ENV.fog.density);

          // Dual Cameras (Perspective & True Isometric Orthographic)
          const aspect = window.innerWidth / window.innerHeight;
          const perspCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
          perspCamera.position.set(120, 100, 120);

          const frustumSize = 130;
          const orthoCamera = new THREE.OrthographicCamera(
            (frustumSize * aspect) / -2, (frustumSize * aspect) / 2,
            frustumSize / 2, frustumSize / -2,
            -500, 2000
          );
          // Standard isometric angles: pitch ~ 35.264°, yaw 45°
          orthoCamera.position.set(200, 200, 200);
          orthoCamera.lookAt(0, 0, 0);

          let isIsometric = true;
          let activeCamera = orthoCamera;

          const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", alpha: true }); 
          renderer.setSize(window.innerWidth, window.innerHeight); 
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.15;
          document.body.appendChild(renderer.domElement);

          const controls = new THREE.OrbitControls(activeCamera, renderer.domElement); 
          controls.enableDamping = true; 
          controls.dampingFactor = 0.05;
          controls.maxPolarAngle = Math.PI / 2.05;
          controls.target.set(0, 0, 0);

          // Camera View Switcher Toggle
          const viewToggleBtn = document.getElementById('view-toggle-btn');
          viewToggleBtn.addEventListener('click', () => {
            isIsometric = !isIsometric;
            const targetCam = isIsometric ? orthoCamera : perspCamera;
            
            if (isIsometric) {
              viewToggleBtn.innerText = '📐 Isometric View';
              viewToggleBtn.classList.add('active');
            } else {
              viewToggleBtn.innerText = '🎥 Perspective View';
              viewToggleBtn.classList.remove('active');
            }

            // Smoothly sync target position and switch controls
            targetCam.position.copy(activeCamera.position);
            targetCam.lookAt(controls.target);
            activeCamera = targetCam;
            controls.object = activeCamera;
            controls.update();
          });

          // Lighting
          scene.add(new THREE.AmbientLight(ENV.ambient, 0.75));
          const sunLight = new THREE.DirectionalLight(0xfff5ea, 1.2);
          sunLight.position.set(100, 150, 80);
          sunLight.castShadow = true;
          sunLight.shadow.mapSize.width = 2048;
          sunLight.shadow.mapSize.height = 2048;
          sunLight.shadow.camera.near = 0.5;
          sunLight.shadow.camera.far = 500;
          const shadowD = 120;
          sunLight.shadow.camera.left = -shadowD;
          sunLight.shadow.camera.right = shadowD;
          sunLight.shadow.camera.top = shadowD;
          sunLight.shadow.camera.bottom = -shadowD;
          scene.add(sunLight);

          // Subtle hemisphere light for soft ground fill
          const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x111122, 0.4);
          scene.add(hemiLight);
          
          // BASE GROUND (Grass/Terrain with smooth rounded border)
          const groundGeo = new THREE.CylinderGeometry(140, 140, 2, 64);
          const groundMat = new THREE.MeshStandardMaterial({ color: 0x152219, roughness: 0.8, metalness: 0.1 });
          const ground = new THREE.Mesh(groundGeo, groundMat);
          ground.position.y = -1;
          ground.receiveShadow = true;
          scene.add(ground);

          // SMOOTH CURVED RIVER WITH BRIDGES
          const riverPoints = [
            new THREE.Vector3(-140, -0.4, -60),
            new THREE.Vector3(-70, -0.4, -20),
            new THREE.Vector3(0, -0.4, -40),
            new THREE.Vector3(70, -0.4, 20),
            new THREE.Vector3(140, -0.4, 60)
          ];
          const riverCurve = new THREE.CatmullRomCurve3(riverPoints);
          const riverGeo = new THREE.TubeGeometry(riverCurve, 64, 9, 8, false);
          const riverMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.85 });
          const river = new THREE.Mesh(riverGeo, riverMat);
          scene.add(river);

          // SMOOTH CURVED MAIN ROAD & PATHWAYS
          // Create an organic curved loop road passing through the neighborhood
          const numRepos = repos.length;
          const roadPoints = [];
          const roadRadius = Math.max(35, Math.min(85, numRepos * 3.2));
          const numRoadControlPoints = 12;
          for (let i = 0; i < numRoadControlPoints; i++) {
            const angle = (i / numRoadControlPoints) * Math.PI * 2;
            const rOffset = Math.sin(angle * 3) * 8 + Math.cos(angle * 2) * 5;
            const x = Math.cos(angle) * (roadRadius + rOffset);
            const z = Math.sin(angle) * (roadRadius + rOffset);
            roadPoints.push(new THREE.Vector3(x, 0.05, z));
          }
          const roadCurve = new THREE.CatmullRomCurve3(roadPoints, true);
          
          // Render Asphalt Road Surface using Extruded Shape Ribbon along Curve
          const roadShape = new THREE.Shape();
          roadShape.moveTo(-3, 0); roadShape.lineTo(3, 0);
          const roadGeo = new THREE.ExtrudeGeometry(roadShape, { steps: 120, extrudePath: roadCurve });
          const roadMat = new THREE.MeshStandardMaterial({ color: ENV.road, roughness: 0.85, metalness: 0.15 });
          const mainRoad = new THREE.Mesh(roadGeo, roadMat);
          mainRoad.receiveShadow = true;
          scene.add(mainRoad);

          // Glowing Center Line along Curved Road
          const lineGeo = new THREE.TubeGeometry(roadCurve, 120, 0.15, 6, true);
          const lineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
          const centerLine = new THREE.Mesh(lineGeo, lineMat);
          centerLine.position.y = 0.1;
          scene.add(centerLine);

          // WEATHER PARTICLES
          const pCount = 3500; 
          const pGeo = new THREE.BufferGeometry(); 
          const pPos = new Float32Array(pCount * 3);
          const pVel = new Float32Array(pCount * 3);
          for(let i=0; i<pCount*3; i+=3) { 
            pPos[i] = (Math.random()-0.5)*260; 
            pPos[i+1] = Math.random()*90; 
            pPos[i+2] = (Math.random()-0.5)*260;
            pVel[i] = (Math.random()-0.5)*0.1;
            pVel[i+1] = -0.3 - Math.random()*0.4;
            pVel[i+2] = (Math.random()-0.5)*0.1;
          }
          pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
          const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: ENV.particle.color, size: 0.45, transparent: true, opacity: ENV.particle.opacity })); 
          scene.add(particles);

          // TREES & LIGHT POSTS
          function buildTree(x, z) {
              const group = new THREE.Group();
              const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.45, 3.5, 8), 
                new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 })
              );
              trunk.position.y = 1.75; trunk.castShadow = true; group.add(trunk);
              
              let leaves;
              if (ENV.arch === 'JAPAN') { 
                leaves = new THREE.Mesh(new THREE.SphereGeometry(2.6, 12, 12), new THREE.MeshStandardMaterial({ color: 0xffa3c4, emissive: 0xff4d88, emissiveIntensity: 0.25, roughness: 0.6 })); 
                leaves.position.y = 4.2; 
              } else if (ENV.arch === 'GERMANY' || ENV.arch === 'UK') { 
                leaves = new THREE.Mesh(new THREE.ConeGeometry(2.2, 5.5, 8), new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.7 })); 
                leaves.position.y = 5.2; 
              } else if (ENV.arch === 'INDIA') { 
                leaves = new THREE.Mesh(new THREE.SphereGeometry(3.2, 10, 10), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })); 
                leaves.position.y = 4.8; 
              } else { 
                leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2, 1), new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.2, roughness: 0.5 })); 
                leaves.position.y = 4.5; 
              }
              leaves.castShadow = true;
              group.add(leaves);
              group.position.set(x, 0, z);
              scene.add(group);
          }

          // HOUSES & SMOOTH CONNECTING CURVED PATHS
          const wallMeshes = []; 
          const houseData = []; 
          const labels = [];

          function buildHouse(repo, x, z, targetAngle) {
              const group = new THREE.Group(); 
              const h = Math.max(3, Math.log2(repo.size + 1) * 1.35); 
              
              const wallMat = new THREE.MeshStandardMaterial({ color: ENV.wallColor, roughness: 0.55, metalness: 0.1 });
              const walls = new THREE.Mesh(new THREE.BoxGeometry(LAYOUT.HOUSE_SIZE, h, LAYOUT.HOUSE_SIZE), wallMat); 
              walls.position.y = h/2; 
              walls.castShadow = true; walls.receiveShadow = true;
              walls.userData = { type: 'wall', repoName: repo.name, houseGroup: group }; 
              group.add(walls); 
              wallMeshes.push(walls);
              
              // Architecture Styles
              if (ENV.arch === 'GERMANY') { 
                  const roofL = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.3, 5.6), new THREE.MeshStandardMaterial({ color: ENV.roofColor, roughness: 0.6 })); 
                  roofL.position.set(-1.5, h + 1.4, 0); roofL.rotation.z = 0.65; roofL.castShadow = true; group.add(roofL); 
                  const roofR = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.3, 5.6), new THREE.MeshStandardMaterial({ color: ENV.roofColor, roughness: 0.6 })); 
                  roofR.position.set(1.5, h + 1.4, 0); roofR.rotation.z = -0.65; roofR.castShadow = true; group.add(roofR); 
              } else if (ENV.arch === 'JAPAN') { 
                  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.6, 2.8, 4), new THREE.MeshStandardMaterial({ color: ENV.roofColor, roughness: 0.4 })); 
                  roof.position.y = h + 1.4; roof.rotation.y = Math.PI/4; roof.castShadow = true; group.add(roof); 
              } else if (ENV.arch === 'INDIA') { 
                  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 })); 
                  dome.position.set(0, h, 0); dome.castShadow = true; group.add(dome); 
              } else { 
                  const balcony = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1, 0.2), new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6, roughness: 0.1, transmission: 0.8 })); 
                  balcony.position.set(0, h*0.6, 2.6); group.add(balcony); 
              }

              const door = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.3), new THREE.MeshStandardMaterial({ color: 0x0f172a })); 
              door.position.set(0, 1.15, 2.51); group.add(door);
              
              const windowMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 }); 
              const windows = [];
              [-1.4, 1.4].forEach(px => { 
                const win = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.3), windowMat.clone()); 
                win.position.set(px, h*0.6, 2.51); group.add(win); windows.push(win); 
              });
              
              const light = new THREE.PointLight(0xfacc15, 0, 10); 
              light.position.set(0, h/2, 0); group.add(light);
              
              group.rotation.y = targetAngle + Math.PI / 2;
              
              // Initial spawn parameters for smooth bounce animation
              const finalY = 0;
              group.position.set(x, 40 + Math.random()*25, z); 
              group.scale.set(0.01, 0.01, 0.01);
              group.userData = { 
                targetY: finalY, 
                targetScale: 1.0, 
                currentScale: 0.01, 
                repoName: repo.name, 
                windows, 
                light,
                hoverLerp: 0
              }; 
              scene.add(group); 
              houseData.push(group);

              // Winding Bezier Curved Pathway connecting house entrance to curved road curve
              const roadPointOnCurve = roadCurve.getPointAt((houseData.length / repos.length) % 1.0);
              const pathCurve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(x, 0.02, z),
                new THREE.Vector3((x + roadPointOnCurve.x)*0.5 + (Math.random()-0.5)*10, 0.02, (z + roadPointOnCurve.z)*0.5),
                new THREE.Vector3(roadPointOnCurve.x, 0.02, roadPointOnCurve.z)
              );
              const pathGeo = new THREE.TubeGeometry(pathCurve, 20, 0.6, 6, false);
              const pathMat = new THREE.MeshStandardMaterial({ color: ENV.path, roughness: 0.9 });
              const pathMesh = new THREE.Mesh(pathGeo, pathMat);
              pathMesh.receiveShadow = true;
              scene.add(pathMesh);

              // Floating Label UI element
              const div = document.createElement('div'); 
              div.className = 'house-label'; 
              div.innerText = repo.name; 
              document.getElementById('ui-layer').appendChild(div); 
              labels.push({ div, mesh: group, baseY: h + 3.2 });
          }

          // Arrange Houses along Organic Curved Radial Rings
          repos.forEach((repo, i) => { 
              const angle = (i / repos.length) * Math.PI * 2;
              const distance = roadRadius + (i % 2 === 0 ? 12 : -12) + (Math.sin(i * 1.5) * 4);
              const x = Math.cos(angle) * distance; 
              const z = Math.sin(angle) * distance; 
              
              buildHouse(repo, x, z, angle); 
              buildTree(x + (Math.random()-0.5)*8, z + (Math.random()-0.5)*8); 
          });

          // INTERACTION & SMOOTH RAYCASTING
          let hoveredHouse = null;
          let isEntering = false;
          let enterTarget = null;
          const raycaster = new THREE.Raycaster();
          const mouse = new THREE.Vector2();

          window.addEventListener('mousemove', e => { 
            if(isEntering) return; 
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1; 
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1; 
            raycaster.setFromCamera(mouse, activeCamera); 
            
            const intersects = raycaster.intersectObjects(wallMeshes); 
            if (intersects.length > 0) { 
              const newHouse = intersects[0].object.userData.houseGroup; 
              document.body.style.cursor = 'pointer'; 
              if (hoveredHouse !== newHouse) { 
                if (hoveredHouse) hoveredHouse.userData.targetScale = 1.0; 
                hoveredHouse = newHouse; 
                hoveredHouse.userData.targetScale = 1.15; 
              } 
            } else { 
              document.body.style.cursor = 'default'; 
              if (hoveredHouse) { 
                hoveredHouse.userData.targetScale = 1.0; 
                hoveredHouse = null; 
              } 
            } 
          });

          window.addEventListener('click', e => { 
            if(isEntering || !hoveredHouse) return; 
            isEntering = true; 
            controls.enabled = false; 
            enterTarget = new THREE.Vector3(hoveredHouse.position.x, 1.5, hoveredHouse.position.z); 
          });

          // ANIMATION LOOP WITH SMOOTH LERPING & PHYSICS
          const clock = new THREE.Clock();
          
          const animate = () => { 
            requestAnimationFrame(animate); 
            const delta = clock.getDelta();
            const time = clock.getElapsedTime();

            controls.update();

            // Smooth Drop-in & Hover Scale Animations
            houseData.forEach((h, index) => { 
              // Drop down spring easing
              if (h.position.y > h.userData.targetY + 0.05) {
                h.position.y += (h.userData.targetY - h.position.y) * 0.07;
              } else {
                h.position.y = h.userData.targetY;
              }

              // Smooth scale spring lerp
              h.userData.currentScale += (h.userData.targetScale - h.userData.currentScale) * 0.12;
              h.scale.set(h.userData.currentScale, h.userData.currentScale, h.userData.currentScale);

              // Smooth emissive window glow & light intensity interpolation
              const isHovered = (hoveredHouse === h);
              const targetGlow = isHovered ? 1 : 0;
              h.userData.hoverLerp += (targetGlow - h.userData.hoverLerp) * 0.1;

              h.userData.windows.forEach(w => {
                w.material.color.lerpColors(new THREE.Color(0x1e293b), new THREE.Color(0xfacc15), h.userData.hoverLerp);
              });
              h.userData.light.intensity = h.userData.hoverLerp * 3.5;
            });

            // Smooth Weather Movement
            const pos = particles.geometry.attributes.position.array; 
            for(let i=1; i<pos.length; i+=3) { 
              pos[i] += pVel[i] * 60 * delta; 
              pos[i-1] += Math.sin(time + i) * 0.05;
              if(pos[i] < 0) pos[i] = 80; 
            } 
            particles.geometry.attributes.position.needsUpdate = true;

            // Camera Click Transition
            if (isEntering && enterTarget) { 
              activeCamera.position.lerp(enterTarget, 0.05); 
              if (activeCamera.position.distanceTo(enterTarget) < 4.0) { 
                document.body.style.opacity = '0'; 
                setTimeout(() => window.location.href = '/view?repo=' + hoveredHouse.userData.repoName, 800); 
              } 
            }

            // Smooth Floating Label Positioning
            labels.forEach(l => { 
              const vector = new THREE.Vector3(); 
              l.mesh.getWorldPosition(vector); 
              vector.y += l.baseY; 
              vector.project(activeCamera); 
              
              const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
              const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
              
              l.div.style.transform = \`translate3d(\${x}px, \${y}px, 0) translate(-50%, -100%)\`; 
              l.div.style.opacity = (isEntering || vector.z > 1) ? '0' : '1'; 
            });

            renderer.render(scene, activeCamera); 
          }; 
          
          animate();

          // Handle Resize cleanly
          window.addEventListener('resize', () => { 
            const newAspect = window.innerWidth / window.innerHeight;
            perspCamera.aspect = newAspect; 
            perspCamera.updateProjectionMatrix(); 

            orthoCamera.left = (-frustumSize * newAspect) / 2;
            orthoCamera.right = (frustumSize * newAspect) / 2;
            orthoCamera.top = frustumSize / 2;
            orthoCamera.bottom = -frustumSize / 2;
            orthoCamera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight); 
          });
      }
    <\/script>
  </body></html>`;
}

/**
 * Generate repository city view HTML featuring curved building clusters, isometric view, and smooth animations
 * @param {string} username - GitHub username
 * @param {string} repoName - Repository name
 * @returns {Promise<string>} HTML string
 */
export async function getCityHTML(username, repoName) {
  const { files, commitHeatmap, maxCommits, lastUpdated, rawTimestamp } = await fetchRepoDetails(username, repoName);
  
  return `
  <!DOCTYPE html>
  <html lang="en"><head>
    <meta charset="UTF-8">
    <title>${repoName} - Isometric Code City</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; overflow: hidden; background: #04060a; font-family: 'Plus Jakarta Sans', sans-serif; opacity: 0; animation: fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; color: #f8fafc; }
      @keyframes fadeIn { to { opacity: 1; } }
      canvas { display: block; width: 100vw; height: 100vh; }
      
      /* Floating Glass HUD Header */
      #header { 
        position: absolute; top: 24px; left: 24px; color: white; z-index: 10; pointer-events: auto;
        background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        padding: 16px 24px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 20px 40px rgba(0,0,0,0.5); display: flex; flex-direction: column; gap: 4px;
      }
      #header h2 { margin: 0; font-size: 22px; font-weight: 800; background: linear-gradient(135deg, #4ade80, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      #header p { margin: 0; color: #94a3b8; font-size: 13px; font-weight: 500; }
      
      /* Action Buttons */
      #btn-group {
        position: absolute; top: 24px; right: 24px; display: flex; gap: 12px; z-index: 10; pointer-events: auto;
      }
      .nav-btn {
        color: white; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 10px 20px; border-radius: 14px; cursor: pointer; font-size: 13px; font-weight: 700;
        text-decoration: none; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; gap: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      }
      .nav-btn:hover { background: rgba(56, 189, 248, 0.25); border-color: rgba(56, 189, 248, 0.5); transform: translateY(-2px); box-shadow: 0 12px 25px rgba(56, 189, 248, 0.25); }
      .nav-btn.active { background: linear-gradient(135deg, #38bdf8, #6366f1); border-color: transparent; }

      /* Tooltip Card */
      #tooltip { 
        position: absolute; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.15); color: #fff; padding: 18px 22px; border-radius: 16px;
        pointer-events: none; display: none; box-shadow: 0 25px 60px rgba(0,0,0,0.6); z-index: 100;
        min-width: 220px; transition: transform 0.1s ease, opacity 0.2s ease;
      }
      #tooltip h3 { margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: #38bdf8; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; word-break: break-all;}
      #tooltip p { margin: 6px 0; font-size: 13px; display: flex; justify-content: space-between; color: #94a3b8; font-weight: 500; }
      #tooltip span { color: #f8fafc; font-weight: 700; }
      .badge { background: #22c55e; color: #052e16; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 800;}
      
      /* Live indicator */
      #live-indicator { 
        position: absolute; bottom: 24px; left: 24px; color: #4ade80; font-size: 12px; font-weight: 700;
        display: flex; align-items: center; gap: 8px; pointer-events: none;
        background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); padding: 8px 16px; border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .pulse-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: pulse 2s infinite; }
      @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(74, 222, 128, 0); } 100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); } }
    </style>
  </head><body>
    <div id="header">
      <h2>${repoName}</h2>
      <p>Last Code Update: ${lastUpdated}</p>
    </div>

    <div id="btn-group">
      <button id="view-toggle-btn" class="nav-btn active">📐 Isometric View</button>
      <a href="/" class="nav-btn">← Neighborhood</a>
    </div>

    <div id="live-indicator"><div class="pulse-dot"></div>GITHUB LIVE SYNCED</div>
    <div id="tooltip"><h3 id="tt-name">File.js</h3><p>Size: <span id="tt-size">0 KB</span></p><p>Commits: <span id="tt-commits" class="badge">0</span></p></div>

    <script src="${THREE_CDN}"><\/script>
    <script src="${ORBIT_CONTROLS_CDN}"><\/script>
    <script>
      const scene = new THREE.Scene(); 
      scene.background = new THREE.Color(0x04060a); 
      scene.fog = new THREE.FogExp2(0x04060a, 0.002);

      const files = ${JSON.stringify(files)}; 
      const commitHeatmap = ${JSON.stringify(commitHeatmap)}; 
      const maxCommits = ${maxCommits};
      
      const aspect = window.innerWidth / window.innerHeight;
      const perspCamera = new THREE.PerspectiveCamera(45, aspect, 1, 2000);
      perspCamera.position.set(160, 140, 160);

      const frustumSize = Math.max(120, Math.sqrt(files.length) * 18);
      const orthoCamera = new THREE.OrthographicCamera(
        (frustumSize * aspect) / -2, (frustumSize * aspect) / 2,
        frustumSize / 2, frustumSize / -2,
        -500, 2000
      );
      orthoCamera.position.set(220, 220, 220);
      orthoCamera.lookAt(0, 0, 0);

      let isIsometric = true;
      let activeCamera = orthoCamera;

      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" }); 
      renderer.setSize(window.innerWidth, window.innerHeight); 
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.toneMapping = THREE.ACESFilmicToneMapping; 
      renderer.toneMappingExposure = 1.25; 
      document.body.appendChild(renderer.domElement);

      const controls = new THREE.OrbitControls(activeCamera, renderer.domElement); 
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      const viewToggleBtn = document.getElementById('view-toggle-btn');
      viewToggleBtn.addEventListener('click', () => {
        isIsometric = !isIsometric;
        const targetCam = isIsometric ? orthoCamera : perspCamera;
        
        if (isIsometric) {
          viewToggleBtn.innerText = '📐 Isometric View';
          viewToggleBtn.classList.add('active');
        } else {
          viewToggleBtn.innerText = '🎥 Perspective View';
          viewToggleBtn.classList.remove('active');
        }

        targetCam.position.copy(activeCamera.position);
        targetCam.lookAt(controls.target);
        activeCamera = targetCam;
        controls.object = activeCamera;
        controls.update();
      });

      scene.add(new THREE.AmbientLight(0x38bdf8, 0.45)); 
      const dl = new THREE.DirectionalLight(0xffeedd, 1.2); 
      dl.position.set(80, 180, 100); 
      dl.castShadow = true;
      scene.add(dl);

      // BASE GROUND & CURVED ROADS
      const ground = new THREE.Mesh(
        new THREE.CylinderGeometry(150, 150, 2, 64), 
        new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.8, roughness: 0.2 })
      ); 
      ground.position.y = -1;
      ground.receiveShadow = true; 
      scene.add(ground);

      // CURVED SPIRAL CITY LAYOUT & WINDING ROAD
      const roadPoints = [];
      const numFiles = files.length;
      const spiralRadius = Math.max(30, Math.sqrt(numFiles) * 8);
      
      for (let i = 0; i <= 36; i++) {
        const t = i / 36;
        const angle = t * Math.PI * 4;
        const r = 10 + t * spiralRadius;
        roadPoints.push(new THREE.Vector3(Math.cos(angle)*r, 0.05, Math.sin(angle)*r));
      }
      const spiralRoadCurve = new THREE.CatmullRomCurve3(roadPoints);
      const roadGeo = new THREE.TubeGeometry(spiralRoadCurve, 120, 1.8, 8, false);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
      const cityRoad = new THREE.Mesh(roadGeo, roadMat);
      scene.add(cityRoad);

      // Glowing Center Curve Line
      const cityLine = new THREE.Mesh(
        new THREE.TubeGeometry(spiralRoadCurve, 120, 0.2, 6, false),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      cityLine.position.y = 0.1;
      scene.add(cityLine);

      function createWindowTexture(heat) {
          const c = document.createElement('canvas'); c.width = 256; c.height = 512; const ctx = c.getContext('2d');
          ctx.fillStyle = '#0b0f19'; ctx.fillRect(0, 0, 256, 512);
          const wSize = 16; const gap = 10; const cols = 7; const rows = 16;
          for(let i=0; i<cols; i++) { 
            for(let j=0; j<rows; j++) { 
              const px = i * (wSize + gap) + gap; const py = j * (wSize + gap) + gap;
              if(Math.random() < heat) { 
                const lightVariety = Math.random(); 
                if (lightVariety > 0.8) ctx.fillStyle = '#38bdf8'; 
                else if (lightVariety > 0.5) ctx.fillStyle = '#4ade80'; 
                else ctx.fillStyle = '#facc15'; 
                ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle; 
                ctx.fillRect(px, py, wSize, wSize); 
                ctx.shadowBlur = 0; 
              } else { 
                ctx.fillStyle = '#06080e'; 
                ctx.fillRect(px, py, wSize, wSize); 
              }
            }
          }
          const tex = new THREE.CanvasTexture(c); 
          tex.magFilter = THREE.LinearFilter; 
          tex.minFilter = THREE.LinearMipmapLinearFilter; 
          return tex;
      }

      // BUILDINGS (FILES) PLACED ALONG CURVED SPIRAL
      const buildings = [];
      files.forEach((file, index) => { 
          const t = (index + 1) / (numFiles + 1);
          const angle = t * Math.PI * 4;
          const r = 16 + t * spiralRadius;
          const targetX = Math.cos(angle) * r;
          const targetZ = Math.sin(angle) * r;

          const height = Math.max(4, Math.log2(file.size + 1) * 1.8); 
          const heat = Math.max(0.15, (commitHeatmap[file.path] || 0) / maxCommits); 
          const tex = createWindowTexture(heat); 
          
          const mat = new THREE.MeshPhysicalMaterial({ 
            map: tex, 
            emissiveMap: tex, 
            emissive: new THREE.Color(0xffffff), 
            emissiveIntensity: 0.9, 
            metalness: 0.2, 
            roughness: 0.2, 
            clearcoat: 0.8 
          }); 
          
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(4.5, height, 4.5), mat); 
          mesh.position.set(targetX, 40 + Math.random()*20, targetZ); 
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.userData = { 
            name: file.path, 
            size: (file.size/1024).toFixed(2) + ' KB', 
            commits: commitHeatmap[file.path] || 0,
            targetY: height/2,
            targetScale: 1.0,
            currentScale: 0.01
          }; 
          mesh.scale.set(0.01, 0.01, 0.01);
          scene.add(mesh); 
          buildings.push(mesh); 
      });
      
      const raycaster = new THREE.Raycaster(); 
      const mouse = new THREE.Vector2(); 
      const tooltip = document.getElementById('tooltip');
      let hoveredObj = null;

      window.addEventListener('mousemove', e => { 
          mouse.x = (e.clientX / window.innerWidth) * 2 - 1; 
          mouse.y = -(e.clientY / window.innerHeight) * 2 + 1; 
          raycaster.setFromCamera(mouse, activeCamera); 
          
          const intersects = raycaster.intersectObjects(buildings); 
          if (intersects.length > 0) { 
            const obj = intersects[0].object; 
            document.body.style.cursor = 'pointer'; 
            if (hoveredObj !== obj) {
              if (hoveredObj) hoveredObj.userData.targetScale = 1.0;
              hoveredObj = obj;
              hoveredObj.userData.targetScale = 1.15;
            }
            document.getElementById('tt-name').textContent = obj.userData.name; 
            document.getElementById('tt-size').textContent = obj.userData.size; 
            document.getElementById('tt-commits').textContent = obj.userData.commits; 
            tooltip.style.display = 'block'; 
            tooltip.style.left = (e.clientX + 16) + 'px'; 
            tooltip.style.top = (e.clientY + 16) + 'px'; 
          } else { 
            document.body.style.cursor = 'default'; 
            if (hoveredObj) {
              hoveredObj.userData.targetScale = 1.0;
              hoveredObj = null;
            }
            tooltip.style.display = 'none'; 
          } 
      });
      
      const clock = new THREE.Clock();

      const animate = () => { 
        requestAnimationFrame(animate); 
        const delta = clock.getDelta();
        controls.update(); 

        // Smooth Building Drop-in & Hover Interpolation
        buildings.forEach(b => {
          if (b.position.y > b.userData.targetY + 0.05) {
            b.position.y += (b.userData.targetY - b.position.y) * 0.08;
          } else {
            b.position.y = b.userData.targetY;
          }

          b.userData.currentScale += (b.userData.targetScale - b.userData.currentScale) * 0.12;
          b.scale.set(b.userData.currentScale, b.userData.currentScale, b.userData.currentScale);
        });

        renderer.render(scene, activeCamera); 
      }; 

      animate();

      window.addEventListener('resize', () => { 
        const newAspect = window.innerWidth / window.innerHeight;
        perspCamera.aspect = newAspect; 
        perspCamera.updateProjectionMatrix(); 

        orthoCamera.left = (-frustumSize * newAspect) / 2;
        orthoCamera.right = (frustumSize * newAspect) / 2;
        orthoCamera.top = frustumSize / 2;
        orthoCamera.bottom = -frustumSize / 2;
        orthoCamera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight); 
      });

      // GitHub Live Synced Indicator
    </script>
  </body></html>`;
}
