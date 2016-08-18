/* eslint-disable no-param-reassign */

import THREE from 'three';
import sortBy from 'lodash/sortBy';
import clamp from 'lodash/clamp';
import raf from 'raf';

import { PARAMS_DEFAULT } from 'constants/panophoto';
import { isMobile } from 'lib/devices';
import { getPosition } from 'lib/events/click';
import EVENTS from 'constants/events';

const SPHERE_RADIUS = 1000;
const LAT_MAX = 85;
const LAT_MIN = -85;

export default class PanophotoPlayer {
  constructor(params) {
    // Read only member variables
    this.container = params.container;
    this.photosSrcUrl = params.photosSrcUrl;
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
      virtualLat: 0,
      lng: 0,
      phi: 0,
      theta: 0,
    };
    // Swipe position and delta of swipe
    this.swipe = {
      lastPos: null,
      curPos: null,
      lastDelta: {
        x: 0,
        y: 0,
      },
    };
    // The timer for re-rendering
    this.animationTimer = null;
    // The timer for updating pixel delta
    this.updateTimer = null;
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
    this.addSwipeHandlers();
    if (!isMobile()) {
      this.addWheelHandlers();
    }
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

  // Setup (perspective) camera
  setupCamera() {
    const dimension = this.getContainerDimension();

    this.camera.instance = new THREE.PerspectiveCamera(
      Math.round((PARAMS_DEFAULT.FOV_MIN + PARAMS_DEFAULT.FOV_MAX) / 2), // field of view (vertical)
      dimension.width / dimension.height, // aspect ratio
      0.1, // near plane
      SPHERE_RADIUS + 100 // far plane
    );
    // Change position of camera
    this.camera.instance.target = new THREE.Vector3(SPHERE_RADIUS, SPHERE_RADIUS, SPHERE_RADIUS);
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
    // The dimension for rendering
    const dimension = this.getContainerDimension();

    // TODO: Use CanvasRenderer for browser without WebGL support
    this.renderer = new THREE.WebGLRenderer(webGLRendererParams);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.autoClear = false;
    // this.renderer.autoClearColor = false;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(dimension.width, dimension.height);

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
    const newLng = this.camera.lng + (this.swipe.lastDelta.x * 0.1);
    const newLat = this.camera.lat + (this.swipe.lastDelta.y * 0.1);
    this.camera.lng = (newLng + 360) % 360;
    this.camera.lat = clamp(newLat, LAT_MIN, LAT_MAX);
    this.camera.phi = THREE.Math.degToRad(90 - this.camera.lat);
    this.camera.theta = THREE.Math.degToRad(this.camera.lng);

    // y: up
    this.camera.instance.target.x = Math.sin(this.camera.phi) * Math.cos(this.camera.theta);
    this.camera.instance.target.y = Math.cos(this.camera.phi);
    this.camera.instance.target.z = Math.sin(this.camera.phi) * Math.sin(this.camera.theta);
    this.camera.instance.lookAt(this.camera.instance.target);

    const vectTargetOnXZ =
      new THREE.Vector3(this.camera.instance.target.x, 0, this.camera.instance.target.z);
    const vectCameraUp = new THREE.Vector3(0, 1, 0);
    let normalVect = new THREE.Vector3();
    normalVect.crossVectors(vectTargetOnXZ, vectCameraUp);
    normalVect = normalVect.normalize();
    vectCameraUp.applyAxisAngle(normalVect, (Math.PI / 180) * (this.camera.lat));

    /*
    vectCameraUp.applyAxisAngle(
      this.camera.instance.target,
      (Math.PI / 180) * this.gyro.screenRotationAngle
    );
    */
    this.camera.instance.up.x = vectCameraUp.x;
    this.camera.instance.up.y = vectCameraUp.y;
    this.camera.instance.up.z = vectCameraUp.z;

    // mainly for changing this.camera.instance.fov
    this.camera.instance.updateProjectionMatrix();

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
    if (this.swipe.curPos !== null && this.swipe.lastPos !== null) {
      this.swipe.lastDelta = {
        x: this.swipe.curPos.x - this.swipe.lastPos.x,
        y: this.swipe.curPos.y - this.swipe.lastPos.y,
      };
    } else {
      this.swipe.lastDelta = {
        x: 0,
        y: 0,
      };
    }
    this.swipe.lastPos = this.swipe.curPos;
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
