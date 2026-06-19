/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useRef, useState, forwardRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../Theme.tsx';
import { Sliders, HandPointing, ArrowClockwise, ArrowsLeftRight, Info } from 'phosphor-react';

interface GalleryItem {
  id: string;
  url: string;
  title: string;
  color: string;
  description: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    title: 'NEO-BRUTALISM CONCRETE',
    color: '#ff5555',
    description: 'Sparsely lit solid cast concrete block architecture with severe structural angles.'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    title: 'ABSTRACT CHROME WAVES',
    color: '#55ff55',
    description: 'Highly reflective iridescent liquid metallic surfaces rippling under cool studio lamps.'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    title: 'ARCHITECTURAL RECTILINEAR',
    color: '#5555ff',
    description: 'Extreme perspective lines of modernist high-rises and deep shadowy glass voids.'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    title: 'GENERATIVE GLASS MATRIX',
    color: '#ffff55',
    description: 'Refined workspace geometries with frosted glass dividers, warm wood grain, and sun shadow grids.'
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
    title: 'SURREAL METALLIC SINE',
    color: '#ff55ff',
    description: 'Generative numeric sine function sculpted into floating physical liquid chrome structures.'
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    title: 'SURREAL TWILIGHT COVE',
    color: '#55ffff',
    description: 'Deep purple twilight fog hanging over static oceanic waves and basalt rock pillars.'
  },
  {
    id: '7',
    url: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=800&q=80',
    title: 'CYBER CHROMA PORTAL',
    color: '#ff9955',
    description: 'Ultra-saturated gaseous magenta and deep indigo nebula particles captured inside solid acrylic.'
  },
  {
    id: '8',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    title: 'SLATE MINIMAL PORTAL',
    color: '#ff5599',
    description: 'Low-lit geometric void portal framing a monochromatic clean desk layout.'
  }
];

// Double the items array to allow high infinity recycling bounds
const COMBINED_ITEMS = [...GALLERY_ITEMS, ...GALLERY_ITEMS];

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

// Helper to create offline canvas textures
const createPlaceholderTexture = (colorString: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = colorString;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(i * 90, 0, 45, canvas.height);
    }
  }
  return new THREE.CanvasTexture(canvas);
};

// GLSL Shaders from payload
const vertexShader = `
varying vec2 vUv;
varying vec3 vWorldPosition;
#define PI 3.14159265359

uniform float uScrollSpeed;

void main() {
    vUv = uv;
    vec3 newPosition = position;
    
    // Local physical plane curvature rounding
    newPosition.z += sin(uv.x * PI) * 0.2;
    
    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vWorldPosition = worldPosition;
    
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    
    // The Cinematic Secrets: View-space parabolic global bowing distortion
    viewPosition.x += pow(worldPosition.y, 2.0) * 0.1;
    
    // Dynamic scroll lag weight deformation
    viewPosition.x += sin(uv.y * PI) * uScrollSpeed * 2.0;
    
    gl_Position = projectionMatrix * viewPosition;
}
`;

const fragmentShader = `
precision highp float;

varying vec2 vUv;
varying vec3 vWorldPosition;

uniform sampler2D uTexture;
uniform float uColorStrength;
uniform float uZoom;
uniform vec2 uPlaneSizes;
uniform vec2 uImageSizes;
uniform float uRevealProgress;

#define PI 3.14159265359

float roundedRectSDF(vec2 uv, vec2 size, float radius) {
    vec2 d = abs(uv - 0.5) - size * 0.5 + radius;
    return length(max(d, 0.0)) - radius;
}

void main() {
    // Precise Aspect-Ratio Safety Fit (GPU Object-fit Cover)
    vec2 ratio = vec2(
        min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
        min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
    );
    vec2 uv = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
    
    vec2 zoomedUv = (uv - 0.5) / uZoom + 0.5;
    vec4 color = texture2D(uTexture, zoomedUv);
    
    // Mix dark layer on hover selection strength
    color = mix(color, vec4(0.0, 0.0, 0.0, 1.0), uColorStrength);
    
    // Dynamic SDF Rounded Corners
    float baseRadius = 0.05;
    float radius = baseRadius * uRevealProgress;
    float sdf = roundedRectSDF(vUv, vec2(uRevealProgress), radius);
    
    float edge = 0.002;
    float alpha = 1.0 - smoothstep(0.0, edge, sdf);
    
    gl_FragColor = vec4(color.rgb, alpha);
}
`;

class HelixControls {
  container: HTMLDivElement;
  easing = 0.1;
  minWheelSpeed = 0.002;
  wheelDirection = 1;
  DRAG_THRESHOLD = 8;
  
  wheelDeltaY = 0;
  targetWheelDeltaY = 0;
  scrollOffset = 0;
  normalizedMouse = new THREE.Vector2(0, 0);
  
  isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  isDragging = false;
  isPaused = false;
  
  touchStartY = 0;
  lastTouchY = 0;
  touchVelocityY = 0;

  // Event handler references for cleanup
  private _handleWheel: (e: WheelEvent) => void;
  private _handleMouseMove: (e: MouseEvent) => void;
  private _handleMouseDown: (e: MouseEvent) => void;
  private _handleMouseUp: () => void;
  private _handleTouchStart: (e: TouchEvent) => void;
  private _handleTouchMove: (e: TouchEvent) => void;
  private _handleTouchEnd: () => void;
  private _handleKeyDown: (e: KeyboardEvent) => void;

  constructor(container: HTMLDivElement) {
    this.container = container;
    
    // Bind handlers to preserve 'this' context
    this._handleWheel = (e: WheelEvent) => {
      if (this.isPaused) return;
      this.targetWheelDeltaY += e.deltaY * 0.00015; 
      this.targetWheelDeltaY = Math.min(Math.max(this.targetWheelDeltaY, -2), 2);
      this.wheelDirection = e.deltaY > 0 ? 1 : -1;
    };

    this._handleMouseMove = (e: MouseEvent) => {
      // 1. Raycaster normalized mouse mapping using container bounding box
      const rect = this.container.getBoundingClientRect();
      this.normalizedMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.normalizedMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      // 2. Click-drag track velocity updates (Vertical movement only)
      if (this.isDragging) {
        const movementY = -(e.clientY - this.lastTouchY) * 0.5;
        this.targetWheelDeltaY -= movementY * 0.003;
        this.targetWheelDeltaY = Math.min(Math.max(this.targetWheelDeltaY, -2), 2);
        this.wheelDirection = movementY < 0 ? 1 : -1;
        this.touchVelocityY = movementY;
      }
      this.lastTouchY = e.clientY;
    };

    this._handleMouseDown = (e: MouseEvent) => {
      if (this.isPaused) return;
      this.isDragging = true;
      this.touchStartY = e.clientY;
      this.lastTouchY = e.clientY;
      this.touchVelocityY = 0;
    };

    this._handleMouseUp = () => {
      if (this.isDragging) {
        this.targetWheelDeltaY -= this.touchVelocityY * 0.05;
        this.targetWheelDeltaY = Math.min(Math.max(this.targetWheelDeltaY, -2), 2);
      }
      this.isDragging = false;
      this.touchVelocityY = 0;
    };

    this._handleTouchStart = (e: TouchEvent) => {
      if (this.isPaused) return;
      const touch = e.touches[0];
      if (touch) {
        this.touchStartY = touch.clientY;
        this.lastTouchY = touch.clientY;
        this.touchVelocityY = 0;
        this.isDragging = false;
      }
    };

    this._handleTouchMove = (e: TouchEvent) => {
      if (this.isPaused) return;
      const touch = e.touches[0];
      if (!touch) return;

      const deltaY = touch.clientY - this.touchStartY;
      
      if (!this.isDragging && Math.abs(deltaY) > this.DRAG_THRESHOLD) {
        this.isDragging = true;
      }
      
      if (this.isDragging) {
        e.preventDefault(); // Lock viewport scrolling while dragging the WebGL canvas
        const movementY = -(touch.clientY - this.lastTouchY) * 0.5;
        
        this.targetWheelDeltaY -= movementY * 0.003;
        this.targetWheelDeltaY = Math.min(Math.max(this.targetWheelDeltaY, -2), 2);
        this.wheelDirection = movementY < 0 ? 1 : -1;
        this.touchVelocityY = movementY;
      }
      this.lastTouchY = touch.clientY;
    };

    this._handleTouchEnd = () => {
      if (this.isDragging) {
        this.targetWheelDeltaY -= this.touchVelocityY * 0.05;
        this.targetWheelDeltaY = Math.min(Math.max(this.targetWheelDeltaY, -2), 2);
      }
      this.isDragging = false;
      this.touchVelocityY = 0;
    };

    this._handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        this.targetWheelDeltaY += 0.35;
        this.wheelDirection = 1;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        this.targetWheelDeltaY -= 0.35;
        this.wheelDirection = -1;
      }
    };

    this.initListeners();
  }

  initListeners() {
    this.container.addEventListener("wheel", this._handleWheel, { passive: true });
    this.container.addEventListener("mousedown", this._handleMouseDown);
    window.addEventListener("mousemove", this._handleMouseMove);
    window.addEventListener("mouseup", this._handleMouseUp);
    window.addEventListener("keydown", this._handleKeyDown);

    this.container.addEventListener("touchstart", this._handleTouchStart, { passive: true });
    window.addEventListener("touchmove", this._handleTouchMove, { passive: false });
    window.addEventListener("touchend", this._handleTouchEnd);
  }

  destroy() {
    this.container.removeEventListener("wheel", this._handleWheel);
    this.container.removeEventListener("mousedown", this._handleMouseDown);
    window.removeEventListener("mousemove", this._handleMouseMove);
    window.removeEventListener("mouseup", this._handleMouseUp);
    window.removeEventListener("keydown", this._handleKeyDown);

    this.container.removeEventListener("touchstart", this._handleTouchStart);
    window.removeEventListener("touchmove", this._handleTouchMove);
    window.removeEventListener("touchend", this._handleTouchEnd);
  }

  update() {
    if (this.isPaused) return;
    
    this.wheelDeltaY += (this.targetWheelDeltaY - this.wheelDeltaY) * this.easing;
    this.scrollOffset += this.wheelDeltaY;
    
    if (Math.abs(this.targetWheelDeltaY) < this.minWheelSpeed) {
      this.targetWheelDeltaY = this.wheelDirection * this.minWheelSpeed;
    }
    this.targetWheelDeltaY *= 0.9; 
  }
}

export const SpiralGallery = forwardRef<HTMLDivElement>((_, ref) => {
  const { theme } = useTheme();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<HelixControls | null>(null);
  
  // React State for interactive HUD readout
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [velocity, setVelocity] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. SETUP THREE SCENE
    const scene = new THREE.Scene();

    // Exact 32 FOV Lens mapping
    const camera = new THREE.PerspectiveCamera(32, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 9.5;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const controls = new HelixControls(container);
    controlsRef.current = controls;
    const texturesToDispose: THREE.Texture[] = [];

    interface SpringMesh extends THREE.Mesh {
      zoomVelocity: number;
      revealVelocity: number;
    }

    // Create plane meshes
    const meshes: SpringMesh[] = [];
    const totalCards = COMBINED_ITEMS.length;
    // 32 Width cuts allow flexible bending without tearing edges
    const geometry = new THREE.PlaneGeometry(1.7, 1.0, 32, 2);
    const textureLoader = new THREE.TextureLoader();

    COMBINED_ITEMS.forEach((item, index) => {
      // 1. Instantly create a colored placeholder texture
      const placeholderTexture = createPlaceholderTexture(item.color);
      texturesToDispose.push(placeholderTexture);

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTexture: { value: placeholderTexture },
          uColorStrength: { value: 0.0 },
          uZoom: { value: 1.0 },
          uPlaneSizes: { value: new THREE.Vector2(1.7, 1.0) },
          uImageSizes: { value: new THREE.Vector2(512, 384) },
          uRevealProgress: { value: 1.0 },
          uScrollSpeed: { value: 0.0 }
        },
        side: THREE.DoubleSide,
        transparent: true
      });

      const mesh = new THREE.Mesh(geometry, material) as SpringMesh;
      mesh.zoomVelocity = 0;
      mesh.revealVelocity = 0;
      // Cache the local index for raycast matching
      mesh.userData = { id: item.id, index };
      scene.add(mesh);
      meshes.push(mesh);

      // 2. Load high-fidelity Unsplash photo asynchronously
      textureLoader.load(item.url, (loadedTex) => {
        // Safe check for disposal boundaries
        if (!mesh || mesh.parent === null) {
          loadedTex.dispose();
          return;
        }
        loadedTex.generateMipmaps = true;
        loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
        texturesToDispose.push(loadedTex);
        
        material.uniforms.uTexture.value = loadedTex;
        material.uniforms.uImageSizes.value.set(loadedTex.image.width, loadedTex.image.height);
        material.uniforms.uTexture.value.needsUpdate = true;
      });
    });

    const raycaster = new THREE.Raycaster();

    // 2. EVENT BINDINGS (Now fully managed internally by HelixControls)

    // 3. RESPONSIVE RESIZE OBSERVEE
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    // 4. TICK ANIMATION LOOP
    let animationFrameId: number;
    let tickCount = 0;

    const tick = () => {
      tickCount++;

      // Decelerate physical velocity controls
      controls.wheelDeltaY += (controls.targetWheelDeltaY - controls.wheelDeltaY) * controls.easing;
      controls.scrollOffset += controls.wheelDeltaY;

      if (Math.abs(controls.targetWheelDeltaY) < controls.minWheelSpeed) {
        controls.targetWheelDeltaY = controls.wheelDirection * controls.minWheelSpeed;
      }
      controls.targetWheelDeltaY *= 0.9; // 10% structural decay rate

      // Throttle React state updates to protect framerate
      if (tickCount % 4 === 0) {
        setVelocity(controls.wheelDeltaY);
      }

      const centerIndex = Math.floor(totalCards / 2);
      const verticalGap = 0.5;
      const angleGap = 0.85;
      const baseRadius = 2.0;

      // Cursor hover updates
      raycaster.setFromCamera(controls.normalizedMouse, camera);
      const intersects = raycaster.intersectObjects(meshes);

      let validIntersection = false;
      let targetHitMesh: SpringMesh | null = null;

      if (intersects.length > 0) {
        const candidateMesh = intersects[0].object as SpringMesh;
        // Filter: Exclude bottom-most card (Y ≈ -0.7) so the zone starts higher up (from Y >= -0.25)
        if (candidateMesh.position.y >= -0.25 && candidateMesh.position.y <= 1.85) {
          validIntersection = true;
          targetHitMesh = candidateMesh;
        }
      }

      // Establish targets and animate spring dynamics for all meshes
      meshes.forEach((mesh) => {
        const isTarget = (validIntersection && mesh === targetHitMesh);
        
        // Exact Pacome targets: card shrinks to 0.95, texture grows to 1.05
        const targetZoom = isTarget ? 1.05 : 1.0;
        const targetReveal = isTarget ? 0.95 : 1.0;
        const targetColor = isTarget ? 0.2 : 0.0;

        const mat = mesh.material as THREE.ShaderMaterial;

        // 2. Elite Spring Dynamics Formula (Stiffness = 180, Damping = 12)
        // Zoom Spring
        const zoomForce = (targetZoom - mat.uniforms.uZoom.value) * 180 - mesh.zoomVelocity * 12;
        mesh.zoomVelocity += zoomForce * 0.016; // Based on average frame clock step delta
        mat.uniforms.uZoom.value += mesh.zoomVelocity * 0.016;

        // Reveal Boundary Contract Spring
        const revealForce = (targetReveal - mat.uniforms.uRevealProgress.value) * 180 - mesh.revealVelocity * 12;
        mesh.revealVelocity += revealForce * 0.016;
        mat.uniforms.uRevealProgress.value += mesh.revealVelocity * 0.016;

        // Standard Smooth Shadow Blend Overlay Lerp
        mat.uniforms.uColorStrength.value = THREE.MathUtils.lerp(mat.uniforms.uColorStrength.value, targetColor, 0.1);
      });

      // Update interactive HUD state triggers
      const activeHoveredIdx = (validIntersection && targetHitMesh) ? targetHitMesh.userData.index : null;
      if (hoveredIdx !== activeHoveredIdx) {
        setHoveredIdx(activeHoveredIdx);
      }

      // Update standard canvas cursor state metrics based on active hits
      if (validIntersection && targetHitMesh) {
        document.body.style.cursor = "pointer";
      } else {
        document.body.style.cursor = "default";
      }

      // Track card coordinates / rotation wrapping
      let currentCentralIndex = 0;
      let minDeviation = Infinity;

      meshes.forEach((mesh, i) => {
        let N = i - controls.scrollOffset;
        N = (N % totalCards + totalCards) % totalCards;
        const B = N - centerIndex;

        const U = B * verticalGap - 0.2;
        const V = B * angleGap;

        mesh.position.set(Math.cos(V) * baseRadius, U, Math.sin(V) * baseRadius);
        mesh.rotation.y = -V + Math.PI / 2;

        const mat = mesh.material as THREE.ShaderMaterial;
        mat.uniforms.uScrollSpeed.value = controls.wheelDeltaY;

        // Trace the closest card to the exact front-center (Z position closest to baseRadius)
        const deviation = Math.abs(B);
        if (deviation < minDeviation) {
          minDeviation = deviation;
          currentCentralIndex = i;
        }
      });

      if (tickCount % 5 === 0) {
        setCurrentIdx(currentCentralIndex);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    // 5. TEARDOWN ON UNMOUNT
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      controls.destroy();

      // Recursive GPU memory release
      geometry.dispose();
      meshes.forEach((mesh) => {
        const mat = mesh.material as THREE.ShaderMaterial;
        mat.dispose();
      });
      texturesToDispose.forEach((tex) => tex.dispose());
      renderer.dispose();
    };
  }, []);

  // Compute values for UI presentation
  const activeItem = COMBINED_ITEMS[currentIdx] || COMBINED_ITEMS[0];
  const itemNo = (currentIdx % GALLERY_ITEMS.length) + 1;
  const absVel = Math.abs(velocity * 100).toFixed(1);

  // JS Styles following Shade DSL instructions (strictly no Tailwind classes)
  const styles: Record<string, React.CSSProperties> = {
    root: {
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#050505',
      borderRadius: theme.radius['Radius.L'],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: theme.Type.Expressive.Data.fontFamily,
      boxShadow: theme.effects['Effect.Shadow.Drop.3'],
      ...theme.border.getBorder1px(theme.Color.Base.Surface[3])
    },
    canvasContainer: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      cursor: 'grab',
      zIndex: 1
    },
    uiHeader: {
      position: 'absolute',
      top: theme.space['Space.XL'],
      left: theme.space['Space.XL'],
      right: theme.space['Space.XL'],
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      pointerEvents: 'none',
      zIndex: 10,
      textTransform: 'uppercase',
      letterSpacing: '0.15em'
    },
    uiTitle: {
      ...theme.Type.Expressive.Data,
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      gap: theme.space['Space.S'],
      opacity: 0.9,
      textShadow: '0 2px 8px rgba(0,0,0,0.8)'
    },
    badge: {
      padding: `${theme.space['Space.2XS']} ${theme.space['Space.S']}`,
      borderRadius: '4px',
      backgroundColor: 'rgba(255,255,255,0.08)',
      fontSize: '10px',
      fontWeight: 'bold',
      border: '1px solid rgba(255,255,255,0.15)'
    },
    activeBadge: {
      color: '#00ff66',
      borderColor: 'rgba(0, 255, 102, 0.4)',
      backgroundColor: 'rgba(0, 255, 102, 0.05)'
    },
    hudFooter: {
      position: 'absolute',
      bottom: theme.space['Space.XL'],
      left: theme.space['Space.XL'],
      right: theme.space['Space.XL'],
      display: 'flex',
      flexDirection: 'column',
      gap: theme.space['Space.S'],
      pointerEvents: 'none',
      zIndex: 10
    },
    readoutCard: {
      backgroundColor: 'rgba(5, 5, 5, 0.7)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: theme.space['Space.L'],
      borderRadius: theme.radius['Radius.M'],
      display: 'flex',
      flexDirection: 'column',
      gap: theme.space['Space.XS'],
      maxWidth: '420px',
      boxShadow: '0 12px 36px rgba(0,0,0,0.6)'
    },
    cardIndex: {
      ...theme.Type.Expressive.Data,
      fontSize: '11px',
      color: theme.Color.Warning.Content[1] || '#ff9955',
      letterSpacing: '0.2em',
      textTransform: 'uppercase'
    },
    cardTitle: {
      ...theme.Type.Expressive.Headline.S,
      fontFamily: theme.Type.Expressive.Headline.S.fontFamily,
      fontSize: '20px',
      color: '#ffffff',
      margin: 0,
      letterSpacing: '0.05em'
    },
    cardDesc: {
      ...theme.Type.Readable.Body.S,
      color: '#aaaaaa',
      lineHeight: '1.4',
      margin: 0
    },
    instructionBar: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.space['Space.M'],
      opacity: 0.6,
      ...theme.Type.Expressive.Data,
      fontSize: '10px',
      color: '#ffffff',
      letterSpacing: '0.08em',
      marginTop: theme.space['Space.XS']
    },
    instructionItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }
  };

  return (
    <div ref={ref} style={styles.root}>
      {/* 1. Header Readout Header */}
      <div style={styles.uiHeader}>
        <div style={styles.uiTitle}>
          <HandPointing size={14} style={{ color: '#00ffbf' }} />
          <span>Spiral Helix Track</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ ...styles.badge, ...styles.activeBadge }}>
            LIVE FEEDBACK
          </div>
          <div style={styles.badge}>
            VELOCITY: {absVel}
          </div>
        </div>
      </div>

      {/* 2. Primary WebGL Drawing Canvas */}
      <div ref={containerRef} style={styles.canvasContainer}>
         <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      {/* 3. Footer Descriptive UI */}
      <div style={styles.hudFooter}>
        <div style={styles.readoutCard}>
          <div style={styles.cardIndex}>
            TRACK ITEM 0{itemNo} // INDEX {currentIdx}
          </div>
          <h3 style={styles.cardTitle}>
            {activeItem?.title || 'LOADING...'}
          </h3>
          <p style={styles.cardDesc}>
            {activeItem?.description || 'Synchronizing buffer values with graphic card render stack.'}
          </p>
          
          <div style={styles.instructionBar}>
            <div style={styles.instructionItem}>
              <ArrowsLeftRight size={12} />
              <span>Drag to Spin</span>
            </div>
            <div style={styles.instructionItem}>
              <ArrowsLeftRight size={12} style={{ transform: 'rotate(90deg)' }} />
              <span>Wheel to Scroll</span>
            </div>
            <div style={styles.instructionItem}>
              <Info size={12} />
              <span>Hover to Zoom</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SpiralGallery.displayName = 'SpiralGallery';

export default SpiralGallery;
