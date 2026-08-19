import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroScene() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;

    if (!host || !canvas) return;

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      host.dataset.webgl = "fallback";
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
    camera.position.set(0, 0, 6.7);

    const sculpture = new THREE.Group();
    scene.add(sculpture);

    const mainGeometry = new THREE.TorusKnotGeometry(1.34, 0.27, 128, 18, 2, 3);
    const mainMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf4f4ef,
      roughness: 0.36,
      metalness: 0.06,
      clearcoat: 0.38,
      clearcoatRoughness: 0.48,
    });
    const knot = new THREE.Mesh(mainGeometry, mainMaterial);
    knot.rotation.set(-0.24, 0.18, 0.2);
    sculpture.add(knot);

    const wireGeometry = new THREE.WireframeGeometry(mainGeometry);
    const wireMaterial = new THREE.LineBasicMaterial({
      color: 0x151515,
      transparent: true,
      opacity: 0.18,
    });
    const wire = new THREE.LineSegments(wireGeometry, wireMaterial);
    wire.scale.setScalar(1.006);
    knot.add(wire);

    const orbitGeometryA = new THREE.TorusGeometry(1.92, 0.012, 6, 120);
    const orbitMaterialA = new THREE.MeshBasicMaterial({
      color: 0x7b7b77,
      transparent: true,
      opacity: 0.58,
    });
    const orbitA = new THREE.Mesh(orbitGeometryA, orbitMaterialA);
    orbitA.rotation.set(1.03, 0.22, 0.34);
    sculpture.add(orbitA);

    const orbitGeometryB = new THREE.TorusGeometry(1.46, 0.009, 6, 100);
    const orbitMaterialB = new THREE.MeshBasicMaterial({
      color: 0xb8b8b2,
      transparent: true,
      opacity: 0.38,
    });
    const orbitB = new THREE.Mesh(orbitGeometryB, orbitMaterialB);
    orbitB.rotation.set(0.46, 1.08, -0.48);
    sculpture.add(orbitB);

    const hemisphere = new THREE.HemisphereLight(0xffffff, 0x252525, 2.25);
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    const rim = new THREE.DirectionalLight(0xc7c7c7, 1.55);
    key.position.set(3.5, 4.2, 4.4);
    rim.position.set(-4.2, -2.1, 3.2);
    scene.add(hemisphere, key, rim);

    const pointer = new THREE.Vector2();
    const easedPointer = new THREE.Vector2();

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      pointer.set(
        ((event.clientX - rect.left) / rect.width - 0.5) * 2,
        -(((event.clientY - rect.top) / rect.height - 0.5) * 2),
      );
    };

    const onPointerLeave = () => {
      pointer.set(0, 0);
    };

    host.addEventListener("pointermove", onPointerMove, { passive: true });
    host.addEventListener("pointerleave", onPointerLeave);

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(host);
    window.addEventListener("resize", resize, { passive: true });
    resize();

    const render = (time: number) => {
      const seconds = time * 0.001;
      easedPointer.lerp(pointer, 0.045);

      sculpture.rotation.y = seconds * 0.17 + easedPointer.x * 0.18;
      sculpture.rotation.x = Math.sin(seconds * 0.34) * 0.045 - easedPointer.y * 0.08;
      sculpture.rotation.z = Math.cos(seconds * 0.22) * 0.025;
      sculpture.position.y = Math.sin(seconds * 0.45) * 0.045;

      renderer.render(scene, camera);
    };

    let visible = true;

    const start = () => {
      if (visible && document.visibilityState === "visible") {
        renderer.setAnimationLoop(render);
      }
    };

    const stop = () => {
      renderer.setAnimationLoop(null);
    };

    const intersectionObserver =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              visible = entry?.isIntersecting ?? true;
              if (visible) start();
              else stop();
            },
            { rootMargin: "120px" },
          )
        : null;

    intersectionObserver?.observe(host);

    const onVisibilityChange = () => {
      if (visible && document.visibilityState === "visible") start();
      else stop();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    host.dataset.webgl = "ready";
    start();

    return () => {
      stop();
      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", resize);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);

      wireGeometry.dispose();
      wireMaterial.dispose();
      orbitGeometryA.dispose();
      orbitMaterialA.dispose();
      orbitGeometryB.dispose();
      orbitMaterialB.dispose();
      mainGeometry.dispose();
      mainMaterial.dispose();
      renderer.dispose();
      scene.clear();

      delete host.dataset.webgl;
    };
  }, []);

  return (
    <div ref={hostRef} className="hero-scene-canvas">
      <canvas ref={canvasRef} />
    </div>
  );
}
