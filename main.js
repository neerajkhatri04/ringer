import "./style.css";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import SplitType from "split-type";
import * as dat from "dat.gui";
import * as THREE from "three";
import Lenis from "lenis";

gsap.registerPlugin(TextPlugin);
gsap.registerPlugin(ScrollTrigger);

const loader = new GLTFLoader();
let model = null;
let contactRotation = false;
let renderer, scene, camera;

function initThreeJS() {
  //Debugger
  const gui = new dat.GUI();
  dat.GUI.toggleHide();

  //Canvas
  const canvas = document.querySelector("canvas.webgl");

  //Scene
  scene = new THREE.Scene();

  //Middle

  loader.load("model.glb", function (gltf) {
    model = gltf.scene;
    model.position.set(0, 0, 0);
    model.scale.set(0.5, 0.5, 0.5);
    scene.add(model);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "section.details",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
      defaults: {
        ease: "power1.out",
        duration: 3,
      },
    });

    tl.to(model.position, {
      z: 5,
      y: -2,
    });
    tl.to(
      model.rotation,
      {
        z: 1,
      },
      "<"
    );

    function toggleWireframe(model, isWireframe, opacity) {
      model.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.wireframe = isWireframe;
          child.material.opacity = opacity;
          child.material.transparent = true;
        }
      });
    }

    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: "section.contact",
        start: "top 80%",
        end: "bottom 30%",
        scrub: true,
        onEnter: () => {
          toggleWireframe(model, true, 0.1);
          contactRotation = true;
        },
        onLeave: () => {
          toggleWireframe(model, false, 1);
        },
        onEnterBack: () => {
          toggleWireframe(model, true, 0.1);
          contactRotation = true;
        },
        onLeaveBack: () => {
          toggleWireframe(model, false, 1);
        },
      },
    });

    tl2.to(model.position, {
      z: -0.5,
      x: 0.5,
      y: 0.6,
    });

    const directionalLight = new THREE.DirectionalLight("silver", 10);
    directionalLight.position.y = 50;
    // directionalLight.position.z = 100;
    directionalLight.position.x = 90;
    scene.add(directionalLight);
  });

  /**
   * Sizes
   */
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  /**
   * Camera
   */
  // Base camera
  camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 2;
  scene.add(camera);

  /**
   * Renderer
   */
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function wordAnimation() {
  const words = ["Romance", "Rings", "Relationships"];
  let currIndex = 0;
  let split;
  const text = document.querySelector(".primary-h1 span");

  function updateText() {
    text.textContent = words[currIndex];
    split = new SplitType(text, { type: "chars" });
    animateChars(split.chars);
    currIndex = (currIndex + 1) % words.length;
  }

  function animateChars(chars) {
    gsap.from(chars, {
      y: -100,
      opacity: 0,
      // scale: 3,
      stagger: 0.05,
      duration: 0.5,
      ease: "power4.out",
      onComplete: () => {
        if (split) {
          split.revert();
        }
      },
    });
  }

  setInterval(updateText, 3000);
}

function initRenderLoop() {
  const clock = new THREE.Clock();

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update objects
    if (model) {
      if (!contactRotation) {
        model.rotation.y = 0.5 * elapsedTime;
        model.rotation.x = 0;
        model.rotation.z = 0;
      } else {
        model.rotation.y = 0;
        model.rotation.x = 0.2 * elapsedTime;
        model.rotation.z = 0.2 * elapsedTime;
      }
    }

    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();
}

function detailSection() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".inspection",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  tl.to(".inspection h2", {
    opacity: 0,
    y: -300,
  }).to(
    ".ring-bg",
    {
      y: -50,
      height: 200,
    },
    "<"
  );

  gsap.from(".marquee h3", {
    scrollTrigger: {
      trigger: ".marquee h3",
      start: "top 80%",
      end: "bottom top",
      scrub: true,
    },
    opacity: 0,
    x: 1000,
    color: "#f472b6",
  });
}

function horizontalSection() {
  let mm = gsap.matchMedia();

  mm.add("(min-width: 768px)", () => {
    let slider = document.querySelector(".slider");
    let sliderSections = gsap.utils.toArray(".slide");

    let tl = gsap.timeline({
      defaults: {
        ease: "none",
      },
      scrollTrigger: {
        trigger: slider,
        pin: true,
        scrub: 1,
        end: () => "+=" + slider.offsetWidth,
      },
    });

    tl.to(
      slider,
      {
        xPercent: -66,
      },
      "<"
    ).to(
      ".progress",
      {
        width: "100%",
      },
      "<"
    );

    sliderSections.forEach((stop, index) => {
      const slideText = new SplitType(stop.querySelector(".slide-p"), {
        types: "chars",
      });
      tl.from(slideText.chars, {
        opacity: 0,
        y: 10,
        stagger: 0.03,
        scrollTrigger: {
          trigger: stop.querySelector(".slide-p"),
          start: "top bottom",
          end: "bottom center",
          containerAnimation: tl,
          scrub: true,
        },
      });
    });
  });
}

function contactSection() {
  gsap.set("h4, .inner-contact span", {
    yPercent: 100,
  });
  gsap.set(".inner-contact p", {
    opacity: 0,
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".inner-contact",
      start: "-20% center",
      end: "10% 40%",
      scrub: true,
    },
  });

  tl.to(".line-top, .line-bottom", {
    width: "100%",
  })
    .to("h4, .inner-contact span", {
      yPercent: 0,
    })
    .to(".inner-contact p", {
      opacity: 1,
    });
}

function smoothScroll() {
  const lenis = new Lenis();
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

document.addEventListener("DOMContentLoaded", () => {
  initThreeJS();
  initRenderLoop();
  wordAnimation();
  detailSection();
  horizontalSection();
  contactSection();
  smoothScroll();
});
