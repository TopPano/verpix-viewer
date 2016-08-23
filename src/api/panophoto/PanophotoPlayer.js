/* eslint-disable no-param-reassign */

import THREE from 'three';
import sortBy from 'lodash/sortBy';
import clamp from 'lodash/clamp';
import fill from 'lodash/fill';
import raf from 'raf';

import { PARAMS_DEFAULT } from 'constants/panophoto';
import { isMobile, isIOS } from 'lib/devices';
import { getPosition } from 'lib/events/click';
import EVENTS from 'constants/events';
import GyroNorm from 'external/gyronorm';

const SPHERE_RADIUS = 1000;
const LAT_MAX = 85;
const LAT_MIN = -85;

const SWIPE = {
  BUFFER_SIZE: 20,
  DELTA_FACTOR: 0.0008,
  SMOOTH_DELTA_THRESHOLD: 0.000001,
  PREVENT_STOP_MAGIC_NUMBER: 0.95,
};

const ROTATION = {
  // TODO: test for more devices, to use different factor
  DELTA_FACTOR: isIOS() ? 0.00025 : 0.0125,
};

export default class PanophotoPlayer {
  constructor(params) {
    isIOS();
    // Read only member variables
    this.container = params.container;
    this.photosSrcUrl = params.photosSrcUrl;
    this.swipeDeltaMagicNumber = PARAMS_DEFAULT.SWIPE_SENSITIVITY * SWIPE.DELTA_FACTOR;
    this.rotationDeltaMagicNumber = PARAMS_DEFAULT.ROTATION_SENSITIVITY * ROTATION.DELTA_FACTOR;
  }

  // Entry function for starting
  start = () => {
    this.resetMemberVars();
    this.startPlay();
  }

  // Entry function for stopping
  stop = () => {
    this.stopPlay();
  }

  // Initialize or reset writable member variables
  resetMemberVars() {
    // Scene for rendering
    this.scene = null;
    // Renderer
    this.renderer = null;
    // Camera and its related variables
    this.camera = {
      instance: null,
      lat: 0,
      lng: 0,
    };
    // Position and delta of swipe
    this.swipe = {
      lastPos: null,
      curPos: null,
      lastDeltas: fill(Array(SWIPE.BUFFER_SIZE), {
        x: 0,
        y: 0,
      }),
    };
    // Position and delta of rotation
    this.rotation = {
      gyro: null,
      lastDelta: {
        x: 0,
        y: 0,
      },
    };
    // The timer for re-rendering
    this.animationTimer = null;
    // The timer for updating pixel delta
    this.updateTimer = null;
    // Dimension includes width and height of container, window orientation (portrait or landscape)
    this.updateDimension();
  }

  // Start playing
  startPlay() {
    this.setup();
    this.buildScene(this.photosSrcUrl, () => {
      this.addEventHandlers();
      this.animationTimer = raf(this.onAnimationFrame);
    });
  }

  // Stop playing
  stopPlay() {
  }

  // Setup variables about Three
  setup() {
    this.setupCamera();
    this.setupScene();
    this.setupRenderer();
  }

  // Add handlers for DOM events
  addEventHandlers() {
    this.addCommonHandlers();
    this.addSwipeHandlers();
    if (!isMobile()) {
      this.addWheelHandlers();
    } else {
      // TODO: also add handlers for adjusting fov
      this.addRotationHandlers();
    }
  }

  // Add handlers for common events, such as device orientation
  addCommonHandlers() {
    window.addEventListener('deviceorientation', this.handleDeviceOrientation);
  }

  // Add handlers for swipe (click or touch)
  addSwipeHandlers() {
    this.container.addEventListener(EVENTS.CLICK_START, this.handleSwipeStart);
    this.container.addEventListener(EVENTS.CLICK_MOVE, this.handleSwipeMove);
    this.container.addEventListener(EVENTS.CLICK_END, this.handleSwipeEnd);
    this.container.addEventListener(EVENTS.CLICK_CANCEL, this.handleSwipeEnd);
    this.updateTimer = raf(this.onUpdate);
  }

  // Add handlers for mouse wheel
  addWheelHandlers() {
    EVENTS.WHEEL.forEach((wheelEvent) => {
      this.container.addEventListener(wheelEvent, this.handleWheel);
    });
  }

  // Add handlers for gyroscope rotation
  addRotationHandlers() {
    const args = {
      frequency: 70,
      orientationBase: GyroNorm.WORLD,
      screenAdjusted: true,
    };
    this.rotation.gyro = new GyroNorm();
    this.rotation.gyro.init(args).then(() => {
      this.rotation.gyro.start((data) => {
        let delta;
        // TODO: in fact, data.dm is acceleration, not rotation delta
        if (this.dimension.isPortrait) {
          delta = {
            x: data.dm.beta,
            y: data.dm.alpha,
          };
        } else {
          delta = {
            x: data.dm.alpha,
            y: -data.dm.gamma,
          };
        }
        this.updateRotation(delta);
      });
    }).catch(() => {
      // TODO: error handling
    });
  }

  // Setup (perspective) camera
  setupCamera() {
    this.camera.instance = new THREE.PerspectiveCamera(
      Math.round((PARAMS_DEFAULT.FOV_MIN + PARAMS_DEFAULT.FOV_MAX) / 2), // field of view (vertical)
      this.dimension.width / this.dimension.height, // aspect ratio
      0.1, // near plane
      SPHERE_RADIUS + 100 // far plane
    );
  }

  // Setup scene for rendering
  setupScene() {
    this.scene = new THREE.Scene();
  }

  // Setup renderer object
  setupRenderer() {
    // WebGLRenderer for better quality if browser supports WebGL
    const webGLRendererParams = {
      preserveDrawingBuffer: true,
      autoClearColor: false,
      alpha: true,
    };

    // TODO: Use CanvasRenderer for browser without WebGL support
    this.renderer = new THREE.WebGLRenderer(webGLRendererParams);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.autoClear = false;
    // this.renderer.autoClearColor = false;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.dimension.width, this.dimension.height);

    this.container.appendChild(this.renderer.domElement);
  }

  // Generate textrues from images.
  buildScene(imgs, callback) {
    const loader = new THREE.TextureLoader();
    const sortedImgs = sortBy(imgs, (img) => {
      const subIndex = img.srcUrl.indexOf('equirectangular');
      return img.srcUrl.slice(subIndex);
    });
    let count = 0;

    loader.crossOrigin = '';
    sortedImgs.forEach((img, index) => {
      loader.load(img.srcUrl, (texture) => {
        // TODO: How to pass the no-param-reassign rule from eslint ?
        texture.minFilter = THREE.LinearFilter;
        this.addMesh(texture, index);
        count++;
        if (count === imgs.length) {
          callback();
        }
      }, () => {
        // TODO: function called when download progresses
      }, () => {
        // TODO: Error handling.
      });
    });
  }

  // "Stick" mesh onto scene
  addMesh(texture, index) {
    const j = parseInt(index / 4, 10);
    // TODO: Do we need heading offset ?
    const headingOffset = 0;
    const geometry = new THREE.SphereGeometry(
      SPHERE_RADIUS,
      20,
      20,
      ((Math.PI / 2) * index) - ((headingOffset * Math.PI) / 180),
      Math.PI / 2,
      (Math.PI / 2) * j,
      Math.PI / 2
    );
    geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      overdraw: true,
      transparent: true,
      opacity: 1,
    });
    const mesh = new THREE.Mesh(geometry, material);

    this.scene.add(mesh);
  }

  // Update camera related variables and re-render
  onAnimationFrame = () => {
    // Update longitude and latitude
    const swipeDelta = this.getSmoothSwipeDelta();
    const rotationDelta = this.getRotationDelta();
    const newLng =
      this.camera.lng
      - (swipeDelta.x * this.swipeDeltaMagicNumber)
      - (rotationDelta.x * this.rotationDeltaMagicNumber);
    const newLat =
      this.camera.lat
      + (rotationDelta.y * this.rotationDeltaMagicNumber)
      + (swipeDelta.y * this.swipeDeltaMagicNumber);
    this.camera.lng = (newLng + 360) % 360;
    this.camera.lat = clamp(newLat, LAT_MIN, LAT_MAX);

    // Get theta (from longitude) and phi (from latitude)
    const theta = THREE.Math.degToRad(this.camera.lng);
    const phi = THREE.Math.degToRad(90 - this.camera.lat);

    // Change look position of camera
    const target = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta), // x
      Math.cos(phi), // y
      Math.sin(phi) * Math.sin(theta) // z
    );
    this.camera.instance.lookAt(target);

    // Re-render
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera.instance);
    this.renderer.clearDepth();

    this.animationTimer = raf(this.onAnimationFrame);
  }

  // Update last position and delta of swipe and rotation
  onUpdate = () => {
    this.updateSwipe();
    // this.updateRotation();
    this.updateTimer = raf(this.onUpdate);
  }

  // Update last position and delta of swipe
  updateSwipe() {
    let lastDelta;
    if (this.swipe.curPos !== null && this.swipe.lastPos !== null) {
      lastDelta = {
        x: this.swipe.curPos.x - this.swipe.lastPos.x,
        y: this.swipe.curPos.y - this.swipe.lastPos.y,
      };
    } else {
      lastDelta = {
        x: 0,
        y: 0,
      };
    }
    this.updateSwipeDelta(lastDelta);
    this.swipe.lastPos = this.swipe.curPos;
  }

  // Push last swipe delta to buffer
  updateSwipeDelta(lastDelta) {
    const newDelta = {
      x: lastDelta.x,
      y: lastDelta.y,
    };

    // Prevent suddently stopping
    if (newDelta.x === 0 && Math.abs(this.swipe.lastDeltas[0].x) > SWIPE.SMOOTH_DELTA_THRESHOLD) {
      newDelta.x = this.swipe.lastDeltas[0].x * SWIPE.PREVENT_STOP_MAGIC_NUMBER;
    }
    if (newDelta.y === 0 && Math.abs(this.swipe.lastDeltas[0].y) > SWIPE.SMOOTH_DELTA_THRESHOLD) {
      newDelta.y = this.swipe.lastDeltas[0].y * SWIPE.PREVENT_STOP_MAGIC_NUMBER;
    }

    // Remove the oldest swipe delta
    this.swipe.lastDeltas.pop();
    // Add the newest swipe delta
    this.swipe.lastDeltas.unshift(newDelta);
  }

  // Get smooth swipe delta
  getSmoothSwipeDelta() {
    const sum = this.swipe.lastDeltas.reduce((previous, current) => ({
      x: current.x + previous.x,
      y: current.y + previous.y,
    }));
    const length = this.swipe.lastDeltas.length;
    const avg = {
      x: sum.x / length,
      y: sum.y / length,
    };

    return avg;
  }

  // Update last delta of rotation
  updateRotation(delta) {
    this.rotation.lastDelta = delta;
  }

  // Get rotation delta
  getRotationDelta() {
    return this.rotation.lastDelta;
  }

  // Handler for swipe starting
  handleSwipeStart = (e) => {
    if (this.isHold(e)) {
      this.swipe.curPos = null;
    }
  }

  // Handler for swipe moving
  handleSwipeMove = (e) => {
    if (this.isHold(e)) {
      this.swipe.curPos = getPosition(e);
    }
  }

  // Handler for swipe ending
  handleSwipeEnd = () => {
    this.swipe.curPos = null;
  }

  // handler for mouse wheel
  handleWheel = (e) => {
    let delta = 0;
    if (e.wheelDeltaY) {
      // WebKit (Safari / Chrome)
      delta = -e.wheelDeltaY * 0.05;
    } else if (e.wheelDelta) {
      // Opera / IE 9
      delta -= e.wheelDelta * 0.05;
    } else if (e.detail) {
      // Firefox
      delta += e.detail * 1.0;
    }
    const newFov = this.camera.instance.fov + delta;
    this.camera.instance.fov = clamp(newFov, PARAMS_DEFAULT.FOV_MIN, PARAMS_DEFAULT.FOV_MAX);
    this.camera.instance.updateProjectionMatrix();
  }

  // Handler for device orientation event
  handleDeviceOrientation = () => {
    this.updateDimension();
  }

  // Update container width, height, and window orientation
  updateDimension() {
    const isPortrait = this.isPortrait();
    const containerDimension = this.getContainerDimension();
    this.dimension = {
      isPortrait,
      width: containerDimension.width,
      height: containerDimension.height,
    };
  }

  // Return the window orientation is portrait or not
  isPortrait() {
    let isPortrait = true;

    if (window.orientation) {
      isPortrait = (window.orientation === 0 || window.orientation === 180);
    } else if (window.innerHeight !== null && window.innerWidth !== null) {
      isPortrait = window.innerHeight > window.innerWidth;
    } else {
      // TODO: any other case ?
    }

    return isPortrait;
  }

  // Get the dimension (width and height) of container
  getContainerDimension() {
    const width = parseInt(this.container.style.width, 10);
    const height = parseInt(this.container.style.height, 10);

    return {
      width,
      height,
    };
  }

  // Check whether left button is clicked (for mouse) or finger is pressed (for touch)
  isHold(e) {
    return (
      isMobile() ?
      true :
      (e.which && e.button === 0) || (e.button && e.button === 0)
    );
  }
}
