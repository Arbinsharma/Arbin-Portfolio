import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('bg');
if (canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.1, 500);
  camera.position.set(0, 2, 12);
  camera.lookAt(0, 0, 0);

  const ink = 0x0c0c0c;
  const accent = 0xff3d00;

  /* ── grid floor ── */
  const grid = new THREE.GridHelper(60, 30, ink, ink);
  grid.material.opacity = 0.09;
  grid.material.transparent = true;
  grid.position.y = -5;
  scene.add(grid);

  /* ── grid ceiling (mirrored) ── */
  const grid2 = new THREE.GridHelper(60, 30, ink, ink);
  grid2.material.opacity = 0.04;
  grid2.material.transparent = true;
  grid2.position.y = 8;
  scene.add(grid2);

  /* ── thin ring ── */
  const ringPts = [];
  const R = 5;
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    ringPts.push(new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R));
  }
  const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
  const ringMat = new THREE.LineBasicMaterial({ color: accent, transparent:true, opacity:0.35 });
  const ring = new THREE.Line(ringGeo, ringMat);
  ring.position.y = -2;
  scene.add(ring);

  /* ── second thin ring ── */
  const ring2 = new THREE.Line(ringGeo, new THREE.LineBasicMaterial({ color: ink, transparent:true, opacity:0.12 }));
  ring2.position.y = 1.5;
  ring2.scale.setScalar(1.4);
  scene.add(ring2);

  /* ── drifting points ── */
  const N = 500;
  const pos = new Float32Array(N * 3);
  const rnd = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 60;
    pos[i*3+1] = (Math.random() - 0.5) * 20;
    pos[i*3+2] = (Math.random() - 0.5) * 40;
    rnd[i] = Math.random();
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pg.setAttribute('aR', new THREE.BufferAttribute(rnd, 1));

  const pm = new THREE.ShaderMaterial({
    transparent:true, depthWrite:false,
    uniforms:{ uT:{value:0} },
    vertexShader:`
      attribute float aR; uniform float uT; varying float vA;
      void main(){
        vA = aR;
        vec3 p = position;
        p.y += sin(uT*0.4 + aR*6.28) * 0.6;
        p.x += cos(uT*0.3 + aR*6.28) * 0.4;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        gl_PointSize = (1.2 + aR * 1.8) * (300.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader:`
      varying float vA;
      void main(){
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float a = smoothstep(0.5, 0.15, d);
        gl_FragColor = vec4(0.05, 0.05, 0.05, a * (0.3 + vA * 0.3));
      }`
  });
  const points = new THREE.Points(pg, pm);
  scene.add(points);

  /* ── mouse + scroll ── */
  const mouse = { x:0, y:0 }, sm = { x:0, y:0 };
  addEventListener('mousemove', e => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  });
  let scroll = 0;
  addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    scroll = h > 0 ? window.scrollY / h : 0;
  }, { passive:true });

  const clock = new THREE.Clock();
  (function loop(){
    const t = clock.getElapsedTime();
    sm.x += (mouse.x - sm.x) * 0.05;
    sm.y += (mouse.y - sm.y) * 0.05;

    camera.position.x = sm.x * 1.4;
    camera.position.y = 2 + sm.y * 0.8 + scroll * 2;
    camera.position.z = 12 - scroll * 3;
    camera.lookAt(0, -1 + scroll * 2, 0);

    ring.rotation.y = t * 0.15;
    ring2.rotation.y = -t * 0.1;

    grid.position.z = (t * 0.4) % 2;
    grid2.position.z = -(t * 0.25) % 2;

    pm.uniforms.uT.value = t;
    points.rotation.y = t * 0.01;

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  })();

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}
