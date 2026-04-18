// Three.js 3D Rendering Module
import { fetchUserRepos, fetchRepoDetails } from './api.js';

// Configuration Constants
const CONFIGS = {
  DE: { 
    lang: { title: 'WILLKOMMEN IN', repos: 'PROJEKTE', climate: 'Bewölkt & Regen' }, 
    arch: 'GERMANY', 
    wallColor: 0x5d4037, 
    roofColor: 0x3e2723, 
    fog: { color: 0x556677, density: 0.015 }, 
    ambient: 0x667788, 
    particle: { color: 0x8888aa, opacity: 0.8 }, 
    road: 0x222222, 
    path: 0x555555, 
    bin: 0x2d4a22 
  },
  JP: { 
    lang: { title: 'ようこそ', repos: 'プロジェクト', climate: '桜 & 晴れ' }, 
    arch: 'JAPAN', 
    wallColor: 0xeeeeee, 
    roofColor: 0x1a1a1a, 
    fog: { color: 0xffeeff, density: 0.004 }, 
    ambient: 0xffffff, 
    particle: { color: 0xff88aa, opacity: 0.6 }, 
    road: 0x333333, 
    path: 0xaaaaaa, 
    bin: 0x444444 
  },
  IN: { 
    lang: { title: 'स्वागत है', repos: 'रिपॉजिटरी', climate: 'धूप और गर्मी' }, 
    arch: 'INDIA', 
    wallColor: 0xf5f5dc, 
    roofColor: 0xcccccc, 
    fog: { color: 0xffccaa, density: 0.003 }, 
    ambient: 0xffddbb, 
    particle: { color: 0xddccaa, opacity: 0.4 }, 
    road: 0x554433, 
    path: 0x998877, 
    bin: 0x665544 
  },
  US: { 
    lang: { title: 'WELCOME TO', repos: 'REPOSITORIES', climate: 'Cyberpunk Night' }, 
    arch: 'MODERN', 
    wallColor: 0x1a1a1a, 
    roofColor: 0x222222, 
    fog: { color: 0x010104, density: 0.008 }, 
    ambient: 0x404060, 
    particle: { color: 0xaaaaaa, opacity: 0.5 }, 
    road: 0x111111, 
    path: 0x444444, 
    bin: 0x888888 
  },
  GB: { 
    lang: { title: 'WELCOME TO', repos: 'REPOSITORIES', climate: 'Overcast & Drizzle' }, 
    arch: 'UK', 
    wallColor: 0x8d6e63, 
    roofColor: 0x37474f, 
    fog: { color: 0x445566, density: 0.012 }, 
    ambient: 0x778899, 
    particle: { color: 0x8899aa, opacity: 0.7 }, 
    road: 0x222222, 
    path: 0x555555, 
    bin: 0x2d4a22 
  }
};

// Layout Constants
const LAYOUT = {
  HOUSE_SPACING: 14,
  HOUSE_SIZE: 5,
  ROAD_WIDTH: 4,
  GRID_OFFSET: 7,
  TREE_OFFSET: 3,
  TREE_RANDOM_RANGE: 2,
  PATH_SIZE: 8,
  BIN_RADIUS: 0.3,
  BIN_HEIGHT: 0.9,
  BIN_OFFSET: 4.2,
  MAX_REPO_DISPLAY: 30
};

// Three.js CDN Configuration (can be overridden via environment)
const THREE_CDN = process.env.THREE_CDN || 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const ORBIT_CONTROLS_CDN = process.env.ORBIT_CONTROLS_CDN || 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';

/**
 * Detect environment based on IP
 * @returns {Promise<Object>} Environment configuration
 */
async function detectEnvironment() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return CONFIGS[data.country_code] || CONFIGS.US;
  } catch (error) {
    console.log('⚠️  Could not detect location, using default (US)');
    return CONFIGS.US;
  }
}

/**
 * Generate home page HTML with 3D neighborhood
 * @param {string} username - GitHub username
 * @returns {Promise<string>} HTML string
 */
export async function getHomeHTML(username) {
  const repos = await fetchUserRepos(username);
  const reposData = JSON.stringify(repos.slice(0, LAYOUT.MAX_REPO_DISPLAY).map(r => ({ name: r.name, size: r.size })));

  return `
  <!DOCTYPE html>
  <html><head>
    <meta charset="UTF-8">
    <title>${username}'s Portfolio</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { margin: 0; overflow: hidden; background: #000; font-family: 'Segoe UI', sans-serif; opacity: 0; transition: opacity 1.5s ease; }
      canvas { display: block; }
      #ui-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
      .label { position: absolute; color: white; font-size: 11px; text-align: center; pointer-events: none; text-shadow: 0 2px 4px rgba(0,0,0,1); background: rgba(0,0,0,0.4); padding: 3px 6px; border-radius: 4px; }
      h1 { position: absolute; top: 20px; width: 100%; text-align: center; color: white; font-size: 18px; letter-spacing: 4px; pointer-events: none; text-shadow: 0 0 10px rgba(0,0,0,1);}
      #env-badge { position: absolute; bottom: 20px; right: 20px; color: white; background: rgba(0,0,0,0.7); padding: 10px 15px; border-radius: 20px; font-size: 12px; pointer-events: none; backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.1); text-align: right; line-height: 1.5; }
      #loading-screen { position: absolute; top:0; left:0; width:100%; height:100%; background:#000; display:flex; justify-content:center; align-items:center; color:white; font-size:20px; z-index:9999; flex-direction:column; gap:10px;}
      .spinner { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-left-color: #4ade80; border-radius: 50%; animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  </head><body>
    <div id="loading-screen"><div class="spinner"></div><div>Analyzing Location & Climate...</div></div>
    <h1 id="main-title">LOADING...</h1>
    <div id="env-badge">Detecting environment...</div>
    <div id="ui-layer"></div>
    <script src="${THREE_CDN}"><\/script>
    <script src="${ORBIT_CONTROLS_CDN}"><\/script>
    <script>
      const repos = ${reposData};
      const CONFIGS = ${JSON.stringify(CONFIGS)};
      const LAYOUT = ${JSON.stringify(LAYOUT)};
      let ENV = CONFIGS.US;
      fetch('https://ipapi.co/json/').then(res => res.json()).then(data => { if (CONFIGS[data.country_code]) ENV = CONFIGS[data.country_code]; initScene(); }).catch(err => initScene());

      function initScene() {
          document.getElementById('main-title').innerText = \`\${ENV.lang.title} \${repos[0]?.name.split('/')[0]?.toUpperCase() || 'USER'} // \${ENV.lang.repos}\`;
          document.getElementById('env-badge').innerText = \`🌍 Environment: \${ENV.lang.climate}\`;
          document.getElementById('loading-screen').style.display = 'none';
          document.body.style.opacity = 1;
          
          const scene = new THREE.Scene(); scene.background = new THREE.Color(ENV.fog.color); scene.fog = new THREE.FogExp2(ENV.fog.color, ENV.fog.density);
          const camera = new THREE.PerspectiveCamera(50, innerWidth/innerHeight, 0.1, 1000);
          const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" }); renderer.setSize(innerWidth, innerHeight); renderer.toneMapping = THREE.ACESFilmicToneMapping; document.body.appendChild(renderer.domElement);
          const controls = new THREE.OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.maxPolarAngle = Math.PI / 2.1;
          scene.add(new THREE.AmbientLight(ENV.ambient, 0.6));
          
          // BASE GROUND
          const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({color: 0x222222, roughness: 0.8})); ground.rotation.x = -Math.PI/2; scene.add(ground);
          
          // WEATHER PARTICLES
          const pCount = 5000; const pGeo = new THREE.BufferGeometry(); const pPos = new Float32Array(pCount * 3);
          for(let i=0; i<pCount*3; i+=3) { pPos[i] = (Math.random()-0.5)*200; pPos[i+1] = Math.random()*80; pPos[i+2] = (Math.random()-0.5)*200; }
          pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
          const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({color: ENV.particle.color, size: 0.4, transparent: true, opacity: ENV.particle.opacity})); scene.add(particles);
          
          const wallMeshes = []; const houseData = []; const labels = [];
          const grid = Math.ceil(Math.sqrt(repos.length));

          // ROADS
          const roadMat = new THREE.MeshStandardMaterial({color: ENV.road, roughness: 0.9, metalness: 0.1});
          for(let i=0; i<=grid; i++) {
              const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(4, grid * 16), roadMat);
              vRoad.rotation.x = -Math.PI/2; vRoad.position.set(i * LAYOUT.HOUSE_SPACING - (grid * LAYOUT.GRID_OFFSET) - 3.5, 0.01, 0);
              scene.add(vRoad);
              const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(grid * 16, 4), roadMat);
              hRoad.rotation.x = -Math.PI/2; hRoad.position.set(0, 0.01, i * LAYOUT.HOUSE_SPACING - (grid * LAYOUT.GRID_OFFSET) - 3.5);
              scene.add(hRoad);
          }

          // TREES
          function buildTree(x, z) {
              const group = new THREE.Group();
              const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 3, 6), new THREE.MeshStandardMaterial({color: 0x3e2723}));
              trunk.position.y = 1.5; group.add(trunk);
              let leaves;
              if (ENV.arch === 'JP') { leaves = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 8), new THREE.MeshStandardMaterial({color: 0xff88cc, emissive: 0xff88cc, emissiveIntensity: 0.3})); leaves.position.y = 4; }
              else if (ENV.arch === 'DE' || ENV.arch === 'UK') { leaves = new THREE.Mesh(new THREE.ConeGeometry(2, 5, 6), new THREE.MeshStandardMaterial({color: 0x1a4a1a})); leaves.position.y = 5; }
              else if (ENV.arch === 'IN') { leaves = new THREE.Mesh(new THREE.SphereGeometry(3.5, 8, 8), new THREE.MeshStandardMaterial({color: 0x2d5a27})); leaves.position.y = 4.5; }
              else { leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(2, 1), new THREE.MeshStandardMaterial({color: 0x111111, metalness: 0.5})); leaves.position.y = 4.5; }
              group.add(leaves);
              group.position.set(x + (Math.random()>0.5?1:-1)*(LAYOUT.TREE_OFFSET+Math.random()*LAYOUT.TREE_RANDOM_RANGE), 0, z + (Math.random()>0.5?1:-1)*(LAYOUT.TREE_OFFSET+Math.random()*LAYOUT.TREE_RANDOM_RANGE));
              scene.add(group);
          }

          // HOUSES
          function buildHouse(repo, x, z) {
              const group = new THREE.Group(); const h = Math.max(2, Math.log2(repo.size + 1) * 1.2); 
              const wallMat = new THREE.MeshStandardMaterial({color: ENV.wallColor, roughness: 0.6});
              const walls = new THREE.Mesh(new THREE.BoxGeometry(LAYOUT.HOUSE_SIZE, h, LAYOUT.HOUSE_SIZE), wallMat); walls.position.y = h/2; 
              walls.userData = { type: 'wall', repoName: repo.name, houseGroup: group }; group.add(walls); wallMeshes.push(walls);
              
              // Architecture
              if (ENV.arch === 'GERMANY') { 
                  const roofL = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 5), new THREE.MeshStandardMaterial({color: ENV.roofColor})); roofL.position.set(-1.5, h + 1.5, 0); roofL.rotation.z = 0.7; group.add(roofL); 
                  const roofR = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 5), new THREE.MeshStandardMaterial({color: ENV.roofColor})); roofR.position.set(1.5, h + 1.5, 0); roofR.rotation.z = -0.7; group.add(roofR); 
              } else if (ENV.arch === 'JAPAN') { 
                  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.5, 3, 4), new THREE.MeshStandardMaterial({color: ENV.roofColor})); roof.position.y = h + 1.5; roof.rotation.y = Math.PI/4; group.add(roof); 
              } else if (ENV.arch === 'INDIA') { 
                  const dome = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({color: 0xffffff})); dome.position.set(0, h, 0); group.add(dome); 
              } else { 
                  const balcony = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 0.1), new THREE.MeshPhysicalMaterial({color: 0x88ccff, transparent: true, opacity: 0.5})); balcony.position.set(0, h*0.6, 2.6); group.add(balcony); 
              }

              const door = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.2), new THREE.MeshStandardMaterial({color: 0x111111})); door.position.set(0, 1.1, 2.51); group.add(door);
              const windowMat = new THREE.MeshBasicMaterial({color: 0x000000}); const windows = [];
              [1.5, -1.5].forEach(px => { const win = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.2), windowMat.clone()); win.position.set(px, h*0.6, 2.51); group.add(win); windows.push(win); });
              const light = new THREE.PointLight(0xffdd57, 0, 8); light.position.set(0, h/2, 0); group.add(light);
              
              group.position.set(x, 50 + Math.random()*20, z); group.userData = { targetY: 0, repoName: repo.name, windows, light }; scene.add(group); houseData.push(group);
              
              // FOOTPATH
              const pathMat = new THREE.MeshStandardMaterial({color: ENV.path, roughness: 0.8});
              const path = new THREE.Mesh(new THREE.PlaneGeometry(LAYOUT.PATH_SIZE, LAYOUT.PATH_SIZE), pathMat);
              path.rotation.x = -Math.PI/2;
              path.position.set(x, 0.02, z);
              scene.add(path);

              // DUSTBIN
              const binMat = new THREE.MeshStandardMaterial({color: ENV.bin, roughness: 0.6, metalness: 0.2});
              const bin = new THREE.Mesh(new THREE.CylinderGeometry(LAYOUT.BIN_RADIUS, LAYOUT.BIN_RADIUS+0.05, LAYOUT.BIN_HEIGHT, 8), binMat);
              bin.position.set(x - LAYOUT.BIN_OFFSET, 0.45, z + LAYOUT.BIN_OFFSET); 
              scene.add(bin);

              const div = document.createElement('div'); div.className = 'label'; div.innerText = repo.name; document.getElementById('ui-layer').appendChild(div); labels.push({ div, mesh: group, baseY: h + 3 });
          }

          // Generate Layout
          repos.forEach((repo, i) => { 
              const row = Math.floor(i/grid), col = i%grid; 
              const x = col * LAYOUT.HOUSE_SPACING - (grid * LAYOUT.GRID_OFFSET), z = row * LAYOUT.HOUSE_SPACING - (grid * LAYOUT.GRID_OFFSET); 
              buildHouse(repo, x, z); 
              buildTree(x, z); 
          });

          camera.position.set(grid * 12, grid * 10, grid * 12); camera.lookAt(0,0,0);
          
          // INTERACTION
          let hoveredHouse = null, isEntering = false, enterTarget = null; const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2();
          window.addEventListener('mousemove', e => { if(isEntering) return; mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = -(e.clientY / innerHeight) * 2 + 1; raycaster.setFromCamera(mouse, camera); const intersects = raycaster.intersectObjects(wallMeshes); if (intersects.length > 0) { const newHouse = intersects[0].object.userData.houseGroup; document.body.style.cursor = 'pointer'; if (hoveredHouse !== newHouse) { if (hoveredHouse) { hoveredHouse.userData.windows.forEach(w => w.material.color.setHex(0x000000)); hoveredHouse.userData.light.intensity = 0; } hoveredHouse = newHouse; hoveredHouse.userData.windows.forEach(w => w.material.color.setHex(0xffdd57)); hoveredHouse.userData.light.intensity = 2; } } else { document.body.style.cursor = 'default'; if (hoveredHouse) { hoveredHouse.userData.windows.forEach(w => w.material.color.setHex(0x000000)); hoveredHouse.userData.light.intensity = 0; hoveredHouse = null; } } });
          window.addEventListener('click', e => { if(isEntering || !hoveredHouse) return; isEntering = true; controls.enabled = false; enterTarget = new THREE.Vector3(hoveredHouse.position.x, 1.5, hoveredHouse.position.z); });
          
          const clock = new THREE.Clock();
          const animate = () => { requestAnimationFrame(animate); const delta = clock.getDelta(); controls.update();
              houseData.forEach(h => { if(h.position.y > h.userData.targetY + 0.1) h.position.y -= (h.position.y - h.userData.targetY) * 0.05; else h.position.y = h.userData.targetY; });
              const pos = particles.geometry.attributes.position.array; for(let i=1; i<pos.length; i+=3) { pos[i] -= 30 * delta; if(ENV.arch === 'JP') pos[i] += Math.sin(Date.now() + i) * 0.05; if(pos[i] < 0) pos[i] = 80; } particles.geometry.attributes.position.needsUpdate = true;
              if (isEntering && enterTarget) { camera.position.lerp(enterTarget, 0.04); camera.lookAt(enterTarget.x, 1.5, enterTarget.z); if (camera.position.distanceTo(enterTarget) < 1.5) { document.body.style.opacity = 0; setTimeout(() => window.location.href = '/view?repo=' + hoveredHouse.userData.repoName, 1000); } }
              labels.forEach(l => { const vector = new THREE.Vector3(); l.mesh.getWorldPosition(vector); vector.y += l.baseY; vector.project(camera); l.div.style.left = ((vector.x * 0.5 + 0.5) * innerWidth) + 'px'; l.div.style.top = ((-vector.y * 0.5 + 0.5) * innerHeight) + 'px'; l.div.style.opacity = isEntering ? '0' : '1'; });
              renderer.render(scene, camera); }; animate();
          window.addEventListener('resize', () => { camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
      }
    <\/script>
  </body></html>`;
}

/**
 * Generate repository city view HTML
 * @param {string} username - GitHub username
 * @param {string} repoName - Repository name
 * @returns {Promise<string>} HTML string
 */
export async function getCityHTML(username, repoName) {
  const { files, commitHeatmap, maxCommits, lastUpdated, rawTimestamp } = await fetchRepoDetails(username, repoName);
  
  return `
  <!DOCTYPE html>
  <html><head>
    <meta charset="UTF-8">
    <title>${repoName} - City View</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { margin: 0; overflow: hidden; background: #050505; font-family: 'Segoe UI', sans-serif; opacity: 0; animation: fadeIn 1.5s forwards; }
      @keyframes fadeIn { to { opacity: 1; } }
      canvas { display: block; }
      #header { position: absolute; top: 20px; left: 30px; color: white; z-index: 10; pointer-events: none; }
      #header h2 { margin: 0; font-size: 28px; color: #4ade80; }
      #header p { margin: 5px 0 0 0; color: #94a3b8; font-size: 14px; }
      #back-btn { position: absolute; top: 25px; right: 30px; color: white; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; text-decoration: none; backdrop-filter: blur(5px);}
      #back-btn:hover { background: rgba(255,255,255,0.2); }
      #tooltip { position: absolute; background: rgba(15, 15, 20, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 15px 20px; border-radius: 12px; pointer-events: none; display: none; box-shadow: 0 20px 50px rgba(0,0,0,0.5); z-index: 100; }
      #tooltip h3 { margin: 0 0 10px 0; font-size: 14px; color: #e2e8f0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; word-break: break-all;}
      #tooltip p { margin: 5px 0; font-size: 13px; display: flex; justify-content: space-between; color: #94a3b8; }
      #tooltip span { color: #fff; font-weight: 600; }
      .badge { background: #22c55e; color: #000; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;}
      #live-indicator { position: absolute; bottom: 20px; left: 30px; color: #4ade80; font-size: 12px; display: flex; align-items: center; gap: 8px; pointer-events: none; }
      .pulse-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: pulse 2s infinite; }
      @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(74, 222, 128, 0); } 100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); } }
    </style>
  </head><body>
    <div id="header"><h2>${repoName}</h2><p>Last Updated: ${lastUpdated}</p></div>
    <a href="/" id="back-btn">← Back to Neighborhood</a>
    <div id="live-indicator"><div class="pulse-dot"></div>SYNCED LIVE</div>
    <div id="tooltip"><h3 id="tt-name">File.js</h3><p>Size: <span id="tt-size">0 KB</span></p><p>Commits: <span id="tt-commits" class="badge">0</span></p></div>
    <script src="${THREE_CDN}"><\/script>
    <script src="${ORBIT_CONTROLS_CDN}"><\/script>
    <script>
      const scene = new THREE.Scene(); scene.background = new THREE.Color(0x050505); scene.fog = new THREE.FogExp2(0x050505, 0.0015);
      const files = ${JSON.stringify(files)}; const commitHeatmap = ${JSON.stringify(commitHeatmap)}; const maxCommits = ${maxCommits};
      const gridSize = Math.ceil(Math.sqrt(files.length)); const camDist = gridSize * 8;
      const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 1, 2000); camera.position.set(camDist, camDist * 1.3, camDist); camera.lookAt(0,0,0);
      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" }); renderer.setSize(innerWidth, innerHeight); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2; document.body.appendChild(renderer.domElement);
      const controls = new THREE.OrbitControls(camera, renderer.domElement); controls.enableDamping = true;
      scene.add(new THREE.AmbientLight(0x404060, 0.4)); const dl = new THREE.DirectionalLight(0xffeedd, 0.6); dl.position.set(50, 150, 100); scene.add(dl);
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshStandardMaterial({color: 0x0a0a0a, metalness: 0.9, roughness: 0.1})); ground.rotation.x = -Math.PI/2; scene.add(ground);
      
      function createWindowTexture(heat) {
          const c = document.createElement('canvas'); c.width = 512; c.height = 1024; const ctx = c.getContext('2d');
          ctx.fillStyle = '#0f1015'; ctx.fillRect(0, 0, 512, 1024);
          const wSize = 25; const gap = 15; const cols = 6; const rows = 14;
          for(let i=0; i<cols; i++) { for(let j=0; j<rows; j++) { const px = i * (wSize + gap) + gap; const py = j * (wSize + gap) + gap;
              if(Math.random() < heat) { const lightVariety = Math.random(); if (lightVariety > 0.8) ctx.fillStyle = '#ffe4b5'; else if (lightVariety > 0.5) ctx.fillStyle = '#fffacd'; else ctx.fillStyle = '#f0f8ff'; ctx.shadowBlur = 12; ctx.shadowColor = ctx.fillStyle; ctx.fillRect(px, py, wSize, wSize); ctx.shadowBlur = 0; } 
              else { ctx.fillStyle = '#08090c'; ctx.fillRect(px, py, wSize, wSize); }
          }}
          const tex = new THREE.CanvasTexture(c); tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); return tex;
      }

      const buildings = [];
      files.forEach((file, index) => { 
          const row = Math.floor(index/gridSize), col = index%gridSize; const height = Math.max(2, Math.log2(file.size + 1) * 1.5); 
          const heat = Math.max(0.1, (commitHeatmap[file.path] || 0) / maxCommits); const tex = createWindowTexture(heat); 
          const mat = new THREE.MeshPhysicalMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color(0xffffff), emissiveIntensity: 1.0, metalness: 0.1, roughness: 0.2, transparent: true, opacity: 0.95, clearcoat: 1.0 }); 
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(4, height, 4), mat); mesh.position.set(col*6 - (gridSize*3), height/2, row*6 - (gridSize*3)); 
          mesh.userData = { name: file.path, size: (file.size/1024).toFixed(2) + ' KB', commits: commitHeatmap[file.path] || 0 }; scene.add(mesh); buildings.push(mesh); 
      });
      
      const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2(); const tooltip = document.getElementById('tooltip');
      window.addEventListener('mousemove', e => { 
          mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = -(e.clientY / innerHeight) * 2 + 1; raycaster.setFromCamera(mouse, camera); 
          const intersects = raycaster.intersectObjects(buildings); 
          if (intersects.length > 0) { const obj = intersects[0].object; document.body.style.cursor = 'pointer'; document.getElementById('tt-name').textContent = obj.userData.name; document.getElementById('tt-size').textContent = obj.userData.size; document.getElementById('tt-commits').textContent = obj.userData.commits; tooltip.style.display = 'block'; tooltip.style.left = (e.clientX + 15) + 'px'; tooltip.style.top = (e.clientY + 15) + 'px'; } 
          else { document.body.style.cursor = 'default'; tooltip.style.display = 'none'; } 
      });
      
      const animate = () => { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }; animate();
      window.addEventListener('resize', () => { camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

      const REPO_OWNER = "${username}"; const REPO_NAME = "${repoName}"; const INITIAL_TIMESTAMP = "${rawTimestamp}";
      setInterval(async () => {
          try {
              const res = await fetch(\`https://api.github.com/repos/\${REPO_OWNER}/\${REPO_NAME}\`); const data = await res.json();
              if (data.pushed_at !== INITIAL_TIMESTAMP) { document.body.style.transition = 'opacity 1s ease'; document.body.style.opacity = '0'; setTimeout(() => window.location.reload(), 1000); }
          } catch (error) { }
      }, 60000);
    <\/script>
  </body></html>`;
}
