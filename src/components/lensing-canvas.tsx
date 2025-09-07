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

    // Background
    const loader = new THREE.TextureLoader();
    const bgTexture = loader.load('https://storage.googleapis.com/maker-studio-5287a.appspot.com/assets/milky-way-2695569_1280.jpg', () => {
        bgTexture.mapping = THREE.EquirectangularReflectionMapping;
        bgTexture.colorSpace = THREE.SRGBColorSpace;
        scene.background = bgTexture;
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
    const diskGeometry = new THREE.TorusGeometry(5, 1.5, 2, 100);
    const diskMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x6FF2E4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
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
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Update uniforms
      postProcessMaterial.uniforms.mass.value = parameters.mass;
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
      bgTexture.dispose();
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

  return <div ref={mountRef} className="absolute top-0 left-0 w-full h-full" data-ai-hint="milky way galaxy" />;
}
