import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function HeroScene() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const hero = host.closest<HTMLElement>(".hero-experience");
    const visual = host.closest<HTMLElement>(".hero-visual--3d");

    host.style.cursor = "grab";
    host.style.touchAction = "pan-y";

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.1, 7.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    host.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    // Lighting: neutral key + cooler rim + subtle urban olive accent.
    scene.add(new THREE.HemisphereLight(0xffffff, 0x303030, 2.2));

    const key = new THREE.DirectionalLight(0xffffff, 4.8);
    key.position.set(4.5, 5.5, 6);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xb9c9ff, 2.8);
    rim.position.set(-4.5, 2.5, -4);
    scene.add(rim);

    const accent = new THREE.PointLight(0xb7c2a5, 18, 12);
    accent.position.set(-2.5, -1.5, 3.5);
    scene.add(accent);

    let model: THREE.Object3D | null = null;
    let disposed = false;

    const loader = new GLTFLoader();

    loader.load(
      "/models/fashion_figure_base.glb",
      (gltf) => {
        if (disposed) return;

        model = gltf.scene;

        // Preserve the model's materials, but make sure they respond nicely
        // to the hero lighting.
        model.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;

          object.castShadow = false;
          object.receiveShadow = false;

          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => {
            if (
              material instanceof THREE.MeshStandardMaterial ||
              material instanceof THREE.MeshPhysicalMaterial
            ) {
              material.envMapIntensity = 1.1;
              material.needsUpdate = true;
            }
          });
        });

        // Normalize any GLB size automatically.
        const initialBounds = new THREE.Box3().setFromObject(model);
        const initialSize = initialBounds.getSize(new THREE.Vector3());

        const targetHeight = 3.4;
        const scale = targetHeight / Math.max(initialSize.y, 0.001);

        model.scale.setScalar(scale);
        model.updateMatrixWorld(true);

        // Recalculate after scaling and center the real geometry.
        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());

        model.position.x -= center.x;
        model.position.y -= center.y;
        model.position.z -= center.z;

        root.add(model);

        root.rotation.set(-0.04, -0.35, 0);

        // Only remove the static fallback after the GLB really loaded.
        hero?.classList.add("hero-experience--fashion-model");
        visual?.classList.add("hero-visual--fashion-model");
        host.dataset.model = "ready";
      },
      undefined,
      (error) => {
        console.error("Could not load fashion figure GLB:", error);
        host.dataset.model = "error";
      },
    );

    let dragging = false;
    let previousX = 0;
    let previousY = 0;
    let targetX = -0.04;
    let targetY = -0.35;
    let velocityX = 0;
    let velocityY = 0;

    const pointerDown = (event: PointerEvent) => {
      dragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
      velocityX = 0;
      velocityY = 0;

      host.style.cursor = "grabbing";
      host.setPointerCapture?.(event.pointerId);
    };

    const pointerMove = (event: PointerEvent) => {
      if (!dragging) return;

      const deltaX = event.clientX - previousX;
      const deltaY = event.clientY - previousY;

      previousX = event.clientX;
      previousY = event.clientY;

      targetY += deltaX * 0.008;
      targetX += deltaY * 0.0025;

      targetX = THREE.MathUtils.clamp(targetX, -0.22, 0.18);

      velocityY = deltaX * 0.00065;
      velocityX = deltaY * 0.00016;
    };

    const pointerUp = (event: PointerEvent) => {
      dragging = false;
      host.style.cursor = "grab";

      if (host.hasPointerCapture?.(event.pointerId)) {
        host.releasePointerCapture(event.pointerId);
      }
    };

    host.addEventListener("pointerdown", pointerDown);
    host.addEventListener("pointermove", pointerMove);
    host.addEventListener("pointerup", pointerUp);
    host.addEventListener("pointercancel", pointerUp);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const clock = new THREE.Clock();
    let visible = true;
    let pageVisible = !document.hidden;

    const render = () => {
      const time = clock.getElapsedTime();

      if (!dragging && !reducedMotion) {
        targetY += 0.0018 + velocityY;
        targetX += velocityX;

        velocityY *= 0.94;
        velocityX *= 0.92;
      }

      root.rotation.y += (targetY - root.rotation.y) * 0.08;
      root.rotation.x += (targetX - root.rotation.x) * 0.08;

      if (!reducedMotion) {
        root.position.y = Math.sin(time * 0.7) * 0.035;
      }

      renderer.render(scene, camera);
    };

    const syncLoop = () => {
      renderer.setAnimationLoop(visible && pageVisible ? render : null);
    };

    const resize = () => {
      const width = host.clientWidth || 1;
      const height = host.clientHeight || 1;
      const mobile = width < 768;

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, mobile ? 1.1 : 1.5),
      );
      renderer.setSize(width, height, false);

      camera.aspect = width / height;
      camera.fov = mobile ? 36 : 30;
      camera.position.z = mobile ? 7.8 : 7.2;

      root.scale.setScalar(mobile ? 0.82 : 1);
      root.position.x = mobile ? 0 : 0.08;

      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncLoop();
      },
      { threshold: 0.05 },
    );

    intersectionObserver.observe(host);

    const visibilityChange = () => {
      pageVisible = !document.hidden;
      syncLoop();
    };

    document.addEventListener("visibilitychange", visibilityChange);

    resize();
    syncLoop();

    return () => {
      disposed = true;

      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      document.removeEventListener("visibilitychange", visibilityChange);

      host.removeEventListener("pointerdown", pointerDown);
      host.removeEventListener("pointermove", pointerMove);
      host.removeEventListener("pointerup", pointerUp);
      host.removeEventListener("pointercancel", pointerUp);

      hero?.classList.remove("hero-experience--fashion-model");
      visual?.classList.remove("hero-visual--fashion-model");

      if (model) {
        model.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;

          object.geometry.dispose();

          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => {
            const mapped = material as THREE.Material & {
              map?: THREE.Texture;
              normalMap?: THREE.Texture;
              roughnessMap?: THREE.Texture;
              metalnessMap?: THREE.Texture;
              aoMap?: THREE.Texture;
              emissiveMap?: THREE.Texture;
            };

            mapped.map?.dispose();
            mapped.normalMap?.dispose();
            mapped.roughnessMap?.dispose();
            mapped.metalnessMap?.dispose();
            mapped.aoMap?.dispose();
            mapped.emissiveMap?.dispose();

            material.dispose();
          });
        });
      }

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <>
      <div
        ref={hostRef}
        className="hero-scene-canvas hero-fashion-model"
        aria-hidden="true"
      />

      <style jsx global>{`
        .hero-experience--fashion-model,
        .hero-visual--fashion-model {
          background: transparent !important;
        }

        .hero-experience--fashion-model::before,
        .hero-experience--fashion-model::after {
          display: none !important;
        }

        .hero-experience--fashion-model .hero-art-static,
        .hero-experience--fashion-model .fashion-rack-static {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        .hero-visual--fashion-model {
          border-left-color: transparent !important;
        }

        .hero-fashion-model canvas {
          background: transparent !important;
        }
      `}</style>
    </>
  );
}