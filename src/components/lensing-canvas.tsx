"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { SimulationParameters } from './chrono-lens';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D tDiffuse;
  uniform float mass;
  uniform vec2 resolution;
  varying vec2 vUv;

  void main() {
    vec2 p = -1.0 + 2.0 * vUv;
    p.x *= resolution.x / resolution.y;

    vec2 q = p;
    float len = length(p);
    
    // Gravitational lensing effect approximation
    if (len > 0.0) {
      float schwarzschildRadius = mass * 0.005; 
      // Avoid division by zero and extreme distortion at the center
      if (len > schwarzschildRadius) {
        float distortion = schwarzschildRadius / len;
        q -= p / len * distortion;
      } else {
        // Inside the radius, just show black
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }
    }
    
    vec2 newUv = q;
    newUv.x *= resolution.y / resolution.x;
    newUv = newUv * 0.5 + 0.5;

    if (newUv.x < 0.0 || newUv.x > 1.0 || newUv.y < 0.0 || newUv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black space if ray goes off-texture
    } else {
        gl_FragColor = texture2D(tDiffuse, newUv);
    }
  }
`;

const diskVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const diskFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  
  // Perlin noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    float angle = atan(p.y, p.x);

    float noise = snoise(vec3(p * 5.0, uTime * 0.2));
    noise = (noise + 1.0) * 0.5;

    float rNormalized = (r - 0.5) / 0.5;
    
    vec3 color1 = vec3(1.0, 0.8, 0.2); // Yellow
    vec3 color2 = vec3(1.0, 0.2, 0.0); // Orange
    vec3 color = mix(color1, color2, rNormalized);

    float intensity = pow(1.0 - rNormalized, 2.0);
    intensity *= (0.5 + noise * 0.5);
    
    float alpha = smoothstep(1.0, 0.95, r) * smoothstep(0.5, 0.55, r);

    gl_FragColor = vec4(color * intensity, alpha * 0.9);
  }
`;

type LensingCanvasProps = {
  parameters: SimulationParameters;
  setCameraControls: (controls: { reset: () => void }) => void;
};

export default function LensingCanvas({ parameters, setCameraControls }: LensingCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Set background to black
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 100;
    
    setCameraControls({
        reset: () => {
          controls.reset();
          camera.position.set(0, 0, 30);
          controls.update();
        }
    });

    // Stars
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        const distanceSq = x*x + y*y + z*z;
        if(distanceSq > 100*100) { // only add stars outside a certain radius
            starVertices.push(x, y, z);
        }
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.5,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Black Hole
    const blackHoleGeometry = new THREE.SphereGeometry(2, 64, 64);
    const blackHoleMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
    scene.add(blackHole);
    
    // Accretion Disk
    const diskGeometry = new THREE.RingGeometry(2.5, 5, 64);
    const diskMaterial = new THREE.ShaderMaterial({
      vertexShader: diskVertexShader,
      fragmentShader: diskFragmentShader,
      uniforms: {
        uTime: { value: 0 },
      },
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const accretionDisk = new THREE.Mesh(diskGeometry, diskMaterial);
    accretionDisk.rotation.x = Math.PI / 2;
    scene.add(accretionDisk);

    camera.position.z = 30;

    // Post-processing
    const renderTarget = new THREE.WebGLRenderTarget(currentMount.clientWidth, currentMount.clientHeight);

    const postProcessScene = new THREE.Scene();
    const postProcessCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postProcessMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tDiffuse: { value: renderTarget.texture },
        mass: { value: parameters.mass },
        resolution: { value: new THREE.Vector2(currentMount.clientWidth, currentMount.clientHeight) },
      },
    });
    
    const postProcessQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postProcessMaterial);
    postProcessScene.add(postProcessQuad);


    // Handle resize
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      renderTarget.setSize(currentMount.clientWidth, currentMount.clientHeight);
      postProcessMaterial.uniforms.resolution.value.set(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const clock = new THREE.Clock();
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();

      // Update uniforms
      postProcessMaterial.uniforms.mass.value = parameters.mass;
      diskMaterial.uniforms.uTime.value = elapsedTime;
      accretionDisk.visible = parameters.showAccretionDisk;
      
      accretionDisk.rotation.z += 0.005;
      stars.rotation.y += 0.0001;

      controls.update();

      // Render scene to target
      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, camera);
      
      // Render post-processing quad to screen
      renderer.setRenderTarget(null);
      renderer.render(postProcessScene, postProcessCamera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      currentMount.removeChild(renderer.domElement);
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      blackHoleGeometry.dispose();
      blackHoleMaterial.dispose();
      diskGeometry.dispose();
      diskMaterial.dispose();
      renderTarget.dispose();
      postProcessMaterial.dispose();
    };
  }, [parameters, setCameraControls]); 

  return <div ref={mountRef} className="absolute top-0 left-0 w-full h-full" />;
}
