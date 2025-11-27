// drag-rotate-y.js
AFRAME.registerComponent('drag-rotate-y', {
  schema: {
    rotationFactor: { type: 'number', default: 0.8 },
    enabled: { type: 'boolean', default: true }
  },

  init: function () {
    console.log('Drag rotate initialized for:', this.el.id || this.el.tagName);

    this.isDragging = false;
    this.mode = 'rotate'; // 'rotate' or 'move'
    this.rotationY = 0;    // Y-axis rotation only (per spec)
    this.previousX = 0;
    this.previousY = 0;
    this.currentPos = { x: 0, y: 0, z: 0 };

    // Bind handlers
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    // Listen globally: we only rotate when focused & enabled
    window.addEventListener('mousedown', this.onMouseDown, { passive: false });
    window.addEventListener('mousemove', this.onMouseMove, { passive: false });
    window.addEventListener('mouseup', this.onMouseUp, { passive: false });
    
    // Touch events for mobile support
    window.addEventListener('touchstart', this.onTouchStart, { passive: false });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd, { passive: false });
  },

  // Start drag only if this ring is the active focused one
  onMouseDown: function (evt) {
    if (!this.data.enabled) return;

    const scene = this.el.sceneEl;
    if (!scene || !scene.systems['ring-manager']) return;
    const ringManager = scene.systems['ring-manager'];

    if (!ringManager.isActiveRing || !ringManager.isActiveRing(this.el)) return;

    evt.preventDefault();

    this.isDragging = true;
    this.mode = evt.shiftKey ? 'move' : 'rotate';
    this.previousX = evt.clientX;
    this.previousY = evt.clientY;

    const rotation = this.el.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
    this.rotationY = rotation.y || 0;

    // Starting position for move mode
    const pos = this.el.getAttribute('position') || { x: 0, y: 0, z: 0 };
    this.currentPos = { x: pos.x, y: pos.y, z: pos.z };

    document.body.style.userSelect = 'none';
    document.body.style.touchAction = 'none';
  },

  onMouseMove: function (evt) {
    if (!this.isDragging || !this.data.enabled) return;

    evt.preventDefault();

    const currentX = evt.clientX;
    const currentY = evt.clientY;
    if (currentX == null || currentY == null) return;

    const deltaX = currentX - this.previousX;
    const deltaY = currentY - this.previousY;
    this.previousX = currentX;
    this.previousY = currentY;

    if (this.mode === 'rotate') {
      // Spec: Y-axis only. Use horizontal drag for yaw; ignore vertical for rotation.
      this.rotationY += deltaX * this.data.rotationFactor;

      this.el.setAttribute('rotation', {
        x: 0,
        y: this.rotationY,
        z: 0
      });
    } else if (this.mode === 'move') {
      // Move in screen plane while focused (X/Y in world space).
      // Update from the current position so motion feels precise and continuous.
      const moveFactor = 0.025;
      this.currentPos.x += deltaX * moveFactor;
      this.currentPos.y -= deltaY * moveFactor;

      this.el.setAttribute('position', {
        x: this.currentPos.x,
        y: this.currentPos.y,
        z: this.currentPos.z
      });
    }
  },

  onMouseUp: function () {
    if (!this.isDragging) return;

    this.isDragging = false;
    document.body.style.userSelect = '';
    document.body.style.touchAction = '';
  },

  // Touch support for mobile
  onTouchStart: function (evt) {
    if (!this.data.enabled) return;

    const scene = this.el.sceneEl;
    if (!scene || !scene.systems['ring-manager']) return;
    const ringManager = scene.systems['ring-manager'];

    if (!ringManager.isActiveRing || !ringManager.isActiveRing(this.el)) return;

    if (!evt.touches || evt.touches.length === 0) return;

    evt.preventDefault();

    this.isDragging = true;
    this.mode = evt.touches.length > 1 ? 'move' : 'rotate'; // 2-finger for move
    this.previousX = evt.touches[0].clientX;
    this.previousY = evt.touches[0].clientY;

    const rotation = this.el.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
    this.rotationY = rotation.y || 0;

    // Starting position for move mode
    const pos = this.el.getAttribute('position') || { x: 0, y: 0, z: 0 };
    this.currentPos = { x: pos.x, y: pos.y, z: pos.z };

    document.body.style.userSelect = 'none';
    document.body.style.touchAction = 'none';
  },

  onTouchMove: function (evt) {
    if (!this.isDragging || !this.data.enabled) return;

    if (!evt.touches || evt.touches.length === 0) return;

    evt.preventDefault();

    const currentX = evt.touches[0].clientX;
    const currentY = evt.touches[0].clientY;
    if (currentX == null || currentY == null) return;

    const deltaX = currentX - this.previousX;
    const deltaY = currentY - this.previousY;
    this.previousX = currentX;
    this.previousY = currentY;

    if (evt.touches.length === 1 && this.mode === 'rotate') {
      // Single touch: rotate on Y-axis
      this.rotationY += deltaX * this.data.rotationFactor;

      this.el.setAttribute('rotation', {
        x: 0,
        y: this.rotationY,
        z: 0
      });
    } else if (evt.touches.length > 1 && this.mode === 'move') {
      // Multi-touch: move in screen plane
      const moveFactor = 0.025;
      this.currentPos.x += deltaX * moveFactor;
      this.currentPos.y -= deltaY * moveFactor;

      this.el.setAttribute('position', {
        x: this.currentPos.x,
        y: this.currentPos.y,
        z: this.currentPos.z
      });
    }
  },

  onTouchEnd: function () {
    if (!this.isDragging) return;

    this.isDragging = false;
    document.body.style.userSelect = '';
    document.body.style.touchAction = '';
  },

  remove: function () {
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    document.body.style.userSelect = '';
    document.body.style.touchAction = '';
  }
});