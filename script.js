import * as THREE from 'three';
import * as GLTFLoader from 'GLTFLoader';

document.addEventListener('DOMContentLoaded', () => {
  const initialize = async () => {
    const arButton = document.querySelector('#ar-button');

    const supported = await navigator.xr?.isSessionSupported('immersive-ar');

    if (!supported) {
      arButton.textContent = 'Not Supported';
      arButton.disabled = true;
      return;
    }

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      500
    );
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();

    const loader = new GLTFLoader.GLTFLoader();
    loader.load('models/shiba/scene.gltf', (shiba) => {
      scene.scale.set(1, 1, 1);
      scene.add(shiba.scene);
      renderer.render(scene, camera);
    });

    let currentSession = null;
    const start = async () => {
      let currentSession = await navigator.xr.requestSession('immersive-ar', {
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body },
      });

      renderer.xr.enabled = true;
      renderer.xr.setReferenceSpaceType('local');
      await renderer.xr.setSession(currentSession);

      arButton.textContent = 'End';

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
    };

    const end = async () => {
      currentSession.end();
      renderer.clear();
      renderer.setAnimationLoop(null);

      arButton.style.display = 'none';
    };

    arButton.addEventListener('click', () => {
      if (currentSession) {
        end();
      } else {
        start();
      }
    });
  };

  initialize();
});
