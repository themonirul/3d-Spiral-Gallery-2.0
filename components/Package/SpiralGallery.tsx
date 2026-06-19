/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @framerDisableUnlink
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 800
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

import React, { useEffect, useRef, useState, useMemo, forwardRef } from 'react';
import * as THREE from 'https://esm.sh/three@0.160.0';
import { addPropertyControls, ControlType } from 'framer';
import { motion, AnimatePresence } from 'framer-motion';

// Self-contained Theme fallback to ensure robust integration directly into Framer
const THEME_TOKEN = {
  radius: {
    'Radius.S': '4px',
    'Radius.M': '8px',
    'Radius.L': '12px',
    'Radius.XL': '16px',
    'Radius.Full': '9999px'
  },
  effects: {
    'Effect.Shadow.Drop.1': '0 2px 4px rgba(0,0,0,0.1)',
    'Effect.Shadow.Drop.2': '0 4px 8px rgba(0,0,0,0.12)',
    'Effect.Shadow.Drop.3': '0 8px 16px rgba(0,0,0,0.15)',
    'Effect.Shadow.Inset.1': 'inset 0 1px 2px rgba(0,0,0,0.1)'
  },
  space: {
    'Space.2XS': '2px',
    'Space.XS': '4px',
    'Space.S': '8px',
    'Space.M': '12px',
    'Space.L': '16px',
    'Space.XL': '24px',
    'Space.2XL': '32px',
    'Space.3XL': '40px'
  },
  border: {
    getBorder1px: (color: string) => ({
      border: 'none',
      boxShadow: `0 0 1px 0px ${color}, inset 0 0 1px 0px ${color}`
    }),
    getOutline2px: (color: string) => ({
      border: 'none',
      outline: `2px solid ${color}`,
      outlineOffset: '-2px'
    })
  },
  Type: {
    Expressive: {
      Data: {
        fontSize: '12px',
        lineHeight: '12px',
        fontWeight: 400,
        letterSpacing: '0.03em',
        fontFamily: "'JetBrains Mono', monospace"
      },
      Headline: {
        S: {
          fontSize: '24px',
          lineHeight: '24px',
          fontWeight: 400,
          letterSpacing: '0em',
          fontFamily: "'Bebas Neue', sans-serif"
        },
        XS: {
          fontSize: '14px',
          lineHeight: '18px',
          fontWeight: 700,
          letterSpacing: '0.02em',
          fontFamily: "'Inter', sans-serif"
        }
      }
    },
    Readable: {
      Body: {
        S: {
          fontSize: '12px',
          lineHeight: '16px',
          fontWeight: 400,
          letterSpacing: '0.01em',
          fontFamily: "'Inter', sans-serif"
        }
      }
    }
  },
  Color: {
    Base: {
      Surface: {
        '1': '#121212',
        '2': '#1E1E1E',
        '3': '#333333'
      },
      Content: {
        '1': '#E0E0E0',
        '2': '#AAAAAA',
        '3': '#777777'
      }
    },
    Warning: {
      Content: {
        '1': '#FF9800'
      }
    }
  }
};

const useTheme = () => {
  return { theme: THEME_TOKEN as any };
};

// Self-contained Icon components for zero external dependencies in Framer
const HandPointingIcon = ({ size = 14, style = {} }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" style={{ display: "inline-block", fill: "currentColor", ...style }}>
    <path d="M200,88a32,32,0,0,0-47.53-28A32,32,0,0,0,104,48a32.06,32.06,0,0,0-15.53,4A32,32,0,0,0,40,84v68a76.08,76.08,0,0,0,76,76h44c35.35,0,64-24.18,64-54V120A32,32,0,0,0,200,88Zm16,94c0,23.35-21.36,38-48,38H124A60.07,60.07,0,0,1,64,160V100a16,16,0,0,1,32,0v44a8,8,0,0,0,16,0V80a16,16,0,0,1,32,0v20a8,8,0,0,0,16,0,16,16,0,0,1,32,0v12a8,8,0,0,0,16,0,16,16,0,0,1,32,0Z" />
  </svg>
);

const ArrowsLeftRightIcon = ({ size = 12, style = {} }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" style={{ display: "inline-block", fill: "currentColor", ...style }}>
    <path d="M85.66,82.34a8,8,0,0,1,0,11.32L59.31,120H216a8,8,0,0,1,0,16H59.31l26.35,26.34a8,8,0,0,1-11.32,11.32l-40-40a8,8,0,0,1,0-11.32l40-40A8,8,0,0,1,85.66,82.34Zm144,40-40-40a8,8,0,0,0-11.32,11.32L196.69,120H56v16H196.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z" />
  </svg>
);

const InfoIcon = ({ size = 12, style = {} }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" style={{ display: "inline-block", fill: "currentColor", ...style }}>
    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h8V128H120a8,8,0,0,1,0-16h16a8,8,0,0,1,8,8v40Z" />
  </svg>
);

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
    title: 'SLATE PORTAL',
    color: '#ff5599',
    description: 'Low-lit geometric void portal framing a monochromatic clean desk layout.'
  }
];

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

// GLSL Shaders
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
    
    // View-space parabolic global bowing distortion
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
uniform float uFocalY;

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
    
    // GPU color falloff vignette calculation disabled to ensure all starting and ending card images are 100% bright and clearly visible
    float vignetteFalloff = 1.0;
    
    // Dim the color rgb based on focal falloff (multiplied by 1.0, preserving perfect brightness)
    color.rgb *= vignetteFalloff;
    
    // Dynamic SDF Rounded Corners
    float baseRadius = 0.05;
    float radius = baseRadius * uRevealProgress;
    float sdf = roundedRectSDF(vUv, vec2(uRevealProgress), radius);
    
    float edge = 0.002;
    float alpha = (1.0 - smoothstep(0.0, edge, sdf)) * (0.2 + 0.8 * vignetteFalloff);
    
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
  
  isTouchDevice = typeof window !== "undefined" && ("ontouchstart" in window || (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0));
  isDragging = false;
  isPaused = false;
  
  touchStartY = 0;
  lastTouchY = 0;
  touchVelocityY = 0;

  scrollSensitivity: number;
  dragMultiplier: number;

  // Event handler references for cleanup
  private _handleWheel: (e: WheelEvent) => void;
  private _handleMouseMove: (e: MouseEvent) => void;
  private _handleMouseDown: (e: MouseEvent) => void;
  private _handleMouseUp: () => void;
  private _handleTouchStart: (e: TouchEvent) => void;
  private _handleTouchMove: (e: TouchEvent) => void;
  private _handleTouchEnd: () => void;
  private _handleKeyDown: (e: KeyboardEvent) => void;

  constructor(container: HTMLDivElement, scrollSensitivity = 0.00015, dragMultiplier = 0.05) {
    this.container = container;
    this.scrollSensitivity = scrollSensitivity;
    this.dragMultiplier = dragMultiplier;
    
    this._handleWheel = (e: WheelEvent) => {
      if (this.isPaused) return;
      this.targetWheelDeltaY += e.deltaY * this.scrollSensitivity; 
      this.targetWheelDeltaY = Math.min(Math.max(this.targetWheelDeltaY, -2), 2);
      this.wheelDirection = e.deltaY > 0 ? 1 : -1;
    };

    this._handleMouseMove = (e: MouseEvent) => {
      const rect = this.container.getBoundingClientRect();
      this.normalizedMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.normalizedMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
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
        this.targetWheelDeltaY -= this.touchVelocityY * this.dragMultiplier;
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
        e.preventDefault(); 
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
        this.targetWheelDeltaY -= this.touchVelocityY * this.dragMultiplier;
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

// Subordinate forwarding component to handle React 18/19 ref integration seamlessly
const SpiralGalleryComponent = forwardRef<HTMLDivElement, any>((props, ref) => {
  const { theme } = useTheme();

  // Read directly from properties or fallback to optimal defaults
  const { 
    items = GALLERY_ITEMS,
    visibleCount = 13,
    baseRadius = 2.0, 
    verticalGap = 1.1, 
    angleGap = 0.85, 
    planeWidth = 1.7, 
    planeHeight = 1.0,
    scrollSensitivity = 0.00015, 
    dragMultiplier = 0.05, 
    springStiffness = 180.0, 
    springDamping = 12.0 
  } = props;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<HelixControls | null>(null);
  const hoveredIdxRef = useRef<number | null>(null);
  
  // React State for interactive HUD readout and popup detail overlay
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [velocity, setVelocity] = useState(0);
  const [activeProject, setActiveProject] = useState<{ title: string; url: string } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Store properties inside a mutable ref to enjoy zero-lag slider interactions
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  // Clean, memoized propagation mapping of items to prevent canvas teardown
  const normalizedItems = useMemo(() => {
    const rawList = items && items.length > 0 ? items : GALLERY_ITEMS;
    return rawList.map((item: any, i: number) => ({
      id: item.id || String(i),
      url: item.image || item.url || '',
      title: item.title || `Project ${i + 1}`,
      color: item.color || `hsl(${(i * 360) / rawList.length}, 70%, 40%)`,
      description: item.description || 'Interactive showcase of curated 3D designs.'
    }));
  }, [items]);

  useEffect(() => {
    if (!isClient) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. SETUP THREE SCENE
    const scene = new THREE.Scene();

    // Sniff mobile viewport conditions (under 768px width)
    const isMobileViewport = container.clientWidth < 768;
    const initialFov = isMobileViewport ? 45 : 32;
    const camera = new THREE.PerspectiveCamera(initialFov, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = isMobileViewport ? 7.8 : 9.5;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const controls = new HelixControls(container, scrollSensitivity, dragMultiplier);
    controlsRef.current = controls;
    const texturesToDispose: THREE.Texture[] = [];

    interface SpringMesh extends THREE.Mesh {
      [key: string]: any;
      zoomVelocity: number;
      revealVelocity: number;
      projectTitle?: string;
      thumbSrc?: string;
    }

    // Create plane meshes based on dynamic items
    const meshes: SpringMesh[] = [];
    const totalCards = visibleCount;
    
    // 32 Width cuts allow flexible bending without tearing edges
    let geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 32, 2);
    const textureLoader = new THREE.TextureLoader();

    // Generate exactly the number of cards chosen in the slider panel
    for (let i = 0; i < totalCards; i++) {
      // Loop data back to index 0 safely if dataset size is less than track count
      const item = normalizedItems[i % normalizedItems.length];
      if (!item) continue;

      const placeholderTexture = createPlaceholderTexture(item.color);
      texturesToDispose.push(placeholderTexture);

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTexture: { value: placeholderTexture },
          uColorStrength: { value: 0.0 },
          uZoom: { value: 1.0 },
          uPlaneSizes: { value: new THREE.Vector2(planeWidth, planeHeight) },
          uImageSizes: { value: new THREE.Vector2(512, 384) },
          uRevealProgress: { value: 1.0 },
          uScrollSpeed: { value: 0.0 },
          uFocalY: { value: -0.2 }
        },
        side: THREE.DoubleSide,
        transparent: true
      });

      const mesh = (new THREE.Mesh(geometry, material) as unknown) as SpringMesh;
      mesh.zoomVelocity = 0;
      mesh.revealVelocity = 0;
      mesh.userData = { id: item.id, index: i };
      mesh.projectTitle = item.title;
      mesh.thumbSrc = item.url;
      
      scene.add(mesh);
      meshes.push(mesh);

      if (item.url) {
        textureLoader.load(item.url, (loadedTex) => {
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
        }, undefined, () => {});
      }
    }

    const raycaster = new THREE.Raycaster();

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      camera.aspect = width / height;
      
      const isMobile = width < 768;
      camera.fov = isMobile ? 45 : 32;
      camera.position.z = isMobile ? 7.8 : 9.5;
      
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    let animationFrameId: number;
    let tickCount = 0;

    const tick = () => {
      tickCount++;

      controls.wheelDeltaY += (controls.targetWheelDeltaY - controls.wheelDeltaY) * controls.easing;
      controls.scrollOffset += controls.wheelDeltaY;

      if (Math.abs(controls.targetWheelDeltaY) < controls.minWheelSpeed) {
        controls.targetWheelDeltaY = controls.wheelDirection * controls.minWheelSpeed;
      }
      controls.targetWheelDeltaY *= 0.9; 

      if (tickCount % 4 === 0) {
        setVelocity(controls.wheelDeltaY);
      }

      const centerIndex = Math.floor(totalCards / 2);
      
      const currentScrollSensitivity = propsRef.current.scrollSensitivity ?? 0.00015;
      const currentDragMultiplier = propsRef.current.dragMultiplier ?? 0.05;
      controls.scrollSensitivity = currentScrollSensitivity;
      controls.dragMultiplier = currentDragMultiplier;

      const isMobile = container.clientWidth < 768;
      const sizeScale = isMobile ? 0.75 : 1.0;

      const currentVerticalGap = (propsRef.current.verticalGap ?? 0.5) * (isMobile ? 0.75 : 1.0);
      const currentAngleGap = (propsRef.current.angleGap ?? 0.85) * (isMobile ? 1.05 : 1.0);
      const currentBaseRadius = (propsRef.current.baseRadius ?? 2.0) * (isMobile ? 1.1 : 1.0) * sizeScale;

      const currentWidth = (propsRef.current.planeWidth ?? 1.7) * sizeScale;
      const currentHeight = (propsRef.current.planeHeight ?? 1.0) * sizeScale;

      if (geometry.parameters.width !== currentWidth || geometry.parameters.height !== currentHeight) {
        geometry.dispose();
        geometry = new THREE.PlaneGeometry(currentWidth, currentHeight, 32, 2);
        meshes.forEach((mesh) => {
          mesh.geometry = geometry;
          const mat = mesh.material as THREE.ShaderMaterial;
          mat.uniforms.uPlaneSizes.value.set(currentWidth, currentHeight);
        });
      }

      raycaster.setFromCamera(controls.normalizedMouse, camera);
      const intersects = raycaster.intersectObjects(meshes);

      let validIntersection = false;
      let targetHitMesh: SpringMesh | null = null;

      if (intersects.length > 0) {
        const candidateMesh = intersects[0].object as SpringMesh;
        if (candidateMesh.position.y >= -0.55 && candidateMesh.position.y <= 1.55) {
          validIntersection = true;
          targetHitMesh = candidateMesh;
        }
      }

      meshes.forEach((mesh) => {
        const isTarget = (validIntersection && mesh === targetHitMesh);
        
        const targetZoom = isTarget ? 1.05 : 1.0;
        const targetReveal = isTarget ? 0.95 : 1.0;

        const mat = mesh.material as THREE.ShaderMaterial;
        const springST = propsRef.current.springStiffness ?? 180.0;
        const springDP = propsRef.current.springDamping ?? 12.0;

        // CALIBRATION FIX: Removed edge distance-based darkening to ensure cards are completely bright and visible
        let targetColor = isTarget ? 0.2 : 0.0;

        // Execute Spring Animations
        const zoomForce = (targetZoom - mat.uniforms.uZoom.value) * springST - mesh.zoomVelocity * springDP;
        mesh.zoomVelocity += zoomForce * 0.016; 
        mat.uniforms.uZoom.value += mesh.zoomVelocity * 0.016;

        const revealForce = (targetReveal - mat.uniforms.uRevealProgress.value) * springST - mesh.revealVelocity * springDP;
        mesh.revealVelocity += revealForce * 0.016;
        mat.uniforms.uRevealProgress.value += mesh.revealVelocity * 0.016;

        // Apply final smooth mix
        mat.uniforms.uColorStrength.value = THREE.MathUtils.lerp(mat.uniforms.uColorStrength.value, targetColor, 0.1);
      });

      const activeHoveredIdx = (validIntersection && targetHitMesh) ? targetHitMesh.userData.index : null;
      if (hoveredIdxRef.current !== activeHoveredIdx) {
        hoveredIdxRef.current = activeHoveredIdx;
        setHoveredIdx(activeHoveredIdx);
        
        if (activeHoveredIdx !== null) {
          const item = normalizedItems[activeHoveredIdx % normalizedItems.length];
          setActiveProject({
            title: item?.title || '',
            url: item?.url || ''
          });
        } else {
          setActiveProject(null);
        }
      }

      if (validIntersection && targetHitMesh) {
        document.body.style.cursor = "pointer";
      } else {
        document.body.style.cursor = "default";
      }

      let currentCentralIndex = 0;
      let minDeviation = Infinity;

      meshes.forEach((mesh, i) => {
        let N = i - controls.scrollOffset;
        N = (N % totalCards + totalCards) % totalCards;
        const B = N - centerIndex;

        const U = B * currentVerticalGap - 0.5;
        const V = B * currentAngleGap;

        mesh.position.set(Math.cos(V) * currentBaseRadius, U, Math.sin(V) * currentBaseRadius);
        mesh.rotation.y = -V + Math.PI / 2;

        const mat = mesh.material as THREE.ShaderMaterial;
        mat.uniforms.uScrollSpeed.value = controls.wheelDeltaY;

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

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.destroy();

      geometry.dispose();
      meshes.forEach((mesh) => {
        const mat = mesh.material as THREE.ShaderMaterial;
        mat.dispose();
      });
      texturesToDispose.forEach((tex) => tex.dispose());
      renderer.dispose();
    };
  }, [normalizedItems, isClient, visibleCount]);

  const activeItem = normalizedItems[currentIdx % normalizedItems.length] || normalizedItems[0];
  const itemNo = (currentIdx % normalizedItems.length) + 1;
  const absVel = Math.abs(velocity * 100).toFixed(1);

  // JS Styles following Shade DSL instructions (strictly no Tailwind classes)
  const styles: Record<string, React.CSSProperties> = {
    root: {
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'transparent',
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
      backgroundColor: 'rgba(10,10,10,0.85)',
      backdropFilter: 'blur(20px)',
      '-webkit-backdrop-filter': 'blur(20px)',
      padding: theme.space['Space.L'],
      borderRadius: theme.radius['Radius.M'],
      boxShadow: theme.effects['Effect.Shadow.Drop.2'],
      ...theme.border.getBorder1px('rgba(255,255,255,0.08)'),
      maxWidth: '380px',
      width: '100%'
    },
    cardIndex: {
      ...theme.Type.Expressive.Data,
      color: '#00ff66',
      fontSize: '10px',
      marginBottom: theme.space['Space.XS'],
      textShadow: '0 0 4px rgba(0,255,102,0.4)',
      textTransform: 'uppercase'
    },
    cardTitle: {
      margin: 0,
      color: '#ffffff',
      fontSize: '20px',
      fontWeight: 'bold',
      letterSpacing: '-0.2px',
      marginBottom: theme.space['Space.XS'],
      textTransform: 'uppercase',
      lineHeight: '1.2'
    },
    cardDesc: {
      margin: 0,
      ...theme.Type.Readable.Body.S,
      color: theme.Color.Base.Content[2],
      fontSize: '11px',
      lineHeight: '1.5',
      marginBottom: theme.space['Space.M'],
      opacity: 0.85
    },
    instructionBar: {
      borderTop: '1px solid rgba(255,255,255,0.08)',
      paddingTop: theme.space['Space.S'],
      display: 'flex',
      justifyContent: 'space-between',
      gap: theme.space['Space.S']
    },
    instructionItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: '#777',
      fontSize: '9px',
      textTransform: 'uppercase',
      fontWeight: '600'
    },
    detailPopup: {
      position: 'absolute',
      bottom: '120px',
      left: '50%',
      backgroundColor: '#0c0c0c',
      padding: '12px 16px',
      borderRadius: theme.radius['Radius.M'],
      display: 'flex',
      alignItems: 'center',
      gap: theme.space['Space.M'],
      zIndex: 20,
      pointerEvents: 'none',
      width: '320px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      ...theme.border.getBorder1px('rgba(255,255,255,0.12)')
    },
    popupThumb: {
      width: '64px',
      height: '48px',
      objectFit: 'cover',
      borderRadius: '4px',
      ...theme.border.getBorder1px('rgba(255,255,255,0.15)')
    },
    popupTextWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    popupLabel: {
      fontSize: '9px',
      color: '#00ff66',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    popupTitle: {
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: 'bold',
      letterSpacing: '-0.2px',
      ...theme.Type.Expressive.Headline?.XS || {},
    }
  };

  if (!isClient) {
    // Beautiful SSR fallback layout
    return (
      <div ref={ref} style={{ ...styles.root, ...props.style }}>
        <div style={{ color: '#aaa', fontSize: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '40px', height: '40px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#00ff66', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span>INITIALIZING HELIX SPACE...</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} style={{ ...styles.root, ...props.style }}>
      {/* 1. Primary WebGL Drawing Canvas */}
      <div ref={containerRef} style={styles.canvasContainer}>
         <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      {/* 2. Active item popup detail overlay */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0, y: 100, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 100, x: '-50%' }}
            transition={{ type: 'spring', stiffness: springStiffness, damping: springDamping }}
            style={styles.detailPopup}
          >
            {activeProject.url ? (
              <img style={styles.popupThumb} src={activeProject.url} alt="Thumbnail" referrerPolicy="no-referrer" />
            ) : (
              <div style={{ ...styles.popupThumb, backgroundColor: '#333' }} />
            )}
            <div style={styles.popupTextWrapper}>
              <span style={styles.popupLabel}>Active Focus</span>
              <span style={styles.popupTitle}>{activeProject.title}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Master default wrapper with exact filename component matching for seamless Framer parsing
export default function SpiralGallery(props: any) {
  return <SpiralGalleryComponent {...props} />;
}

// Aligned helper for Framer properties parsing
const controlsSchema = {
    // 1. Data Source Binding
    items: {
        type: ControlType.Array,
        title: "CMS Collection",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title" },
                image: { type: ControlType.Image, title: "Image Asset" },
            }
        }
    },
    
    // 2. Spatial Geometry Track Group
    visibleCount: {
        type: ControlType.Number,
        title: "Visible Card Density",
        min: 4,
        max: 24,
        step: 1,
        defaultValue: 13,
        displaySteppers: true,
        group: "Geometry Layout"
    },
    baseRadius: {
        type: ControlType.Number,
        title: "Track Radius",
        min: 0.5, max: 5.0, step: 0.1,
        defaultValue: 2.0,
        group: "Geometry Layout"
    },
    verticalGap: {
        type: ControlType.Number,
        title: "Vertical Spacing",
        min: 0.1, max: 2.5, step: 0.05,
        defaultValue: 1.1,
        group: "Geometry Layout"
    },
    angleGap: {
        type: ControlType.Number,
        title: "Angular Separation",
        min: 0.2, max: 2.0, step: 0.05,
        defaultValue: 0.85,
        group: "Geometry Layout"
    },
    planeWidth: {
        type: ControlType.Number,
        title: "Card Width",
        min: 0.5, max: 4.0, step: 0.1,
        defaultValue: 1.7,
        group: "Geometry Layout"
    },
    planeHeight: {
        type: ControlType.Number,
        title: "Card Height",
        min: 0.3, max: 3.0, step: 0.1,
        defaultValue: 1.0,
        group: "Geometry Layout"
    },

    // 3. Kinetic Physics Settings Group
    scrollSensitivity: {
        type: ControlType.Number,
        title: "Wheel Sensitivity",
        min: 0.00005, max: 0.001, step: 0.00005,
        defaultValue: 0.00015,
        group: "Physics & Inertia"
    },
    dragMultiplier: {
        type: ControlType.Number,
        title: "Drag Friction Weight",
        min: 0.01, max: 0.2, step: 0.01,
        defaultValue: 0.05,
        group: "Physics & Inertia"
    },

    // 4. Elastic Spring Hover Settings Group
    springStiffness: {
        type: ControlType.Number,
        title: "Bounce Stiffness",
        min: 50, max: 400, step: 10,
        defaultValue: 180,
        group: "Hover Springs"
    },
    springDamping: {
        type: ControlType.Number,
        title: "Bounce Damping",
        min: 5, max: 40, step: 1,
        defaultValue: 12,
        group: "Hover Springs"
    }
};

addPropertyControls(SpiralGallery, controlsSchema as any);

// Additional exports to map any naming selected on Framer canvas to our property controls
export const HelixGallery = SpiralGallery;
export const SpiralHelix = SpiralGallery;

addPropertyControls(HelixGallery, controlsSchema as any);
addPropertyControls(SpiralHelix, controlsSchema as any);
