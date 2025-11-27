// ring-focus.js
AFRAME.registerComponent('ring-focus', {
  schema: {
    isFocused: { type: 'boolean', default: false },
    focusPosition: { type: 'vec3', default: { x: 0, y: 1.5, z: -2 } },
    focusScale: { type: 'vec3', default: { x: 2, y: 2, z: 2 } },
    animationDuration: { type: 'number', default: 800 },
    originalPosition: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    originalRotation: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    originalScale: { type: 'vec3', default: { x: 1, y: 1, z: 1 } }
  },

  init: function() {
    console.log('Ring focus initialized for:', this.el.id);
    
    // Store original transform data in component state
    this.data.originalPosition = {
      x: this.el.getAttribute('position').x,
      y: this.el.getAttribute('position').y,
      z: this.el.getAttribute('position').z
    };
    
    this.data.originalRotation = {
      x: this.el.getAttribute('rotation').x || 0,
      y: this.el.getAttribute('rotation').y || 0,
      z: this.el.getAttribute('rotation').z || 0
    };
    
    this.data.originalScale = {
      x: 1,
      y: 1,
      z: 1
    };
    
    // Bind methods
    this.onClick = this.onClick.bind(this);
    this.onClose = this.onClose.bind(this);
    
    // Add event listener (click only; avoid mousedown/touchstart to not clash with drag)
    this.el.addEventListener('click', this.onClick);
    
    // Get close button reference
    this.closeBtn = document.getElementById('closeBtn');

    // Reference to camera to toggle look-controls during focus
    this.cameraEl = document.querySelector('#camera');
    this.cameraLookWasEnabled = true;
    
    // Drag target is the child that actually has drag-rotate-y (fallback to self)
    this.dragTarget = this.el.querySelector('[drag-rotate-y]') || this.el;
    
    // Add class for styling
    this.el.classList.add('ring-entity');
  },

  onClick: function(evt) {
    console.log('Click detected on:', this.el.id);
    evt.stopPropagation();
    
    // Get the ring manager system
    const ringManager = document.querySelector('a-scene').systems['ring-manager'];
    if (!ringManager) {
      console.error('Ring manager system not found');
      return;
    }
    
    // If another ring is animating or this one is already focused, ignore extra clicks.
    if (ringManager.isBusy || this.data.isFocused) {
      console.log('System is busy or ring already focused, ignoring click');
      return;
    }

    // If another ring is focused, return it first
    if (ringManager.activeRing && ringManager.activeRing !== this.el) {
      ringManager.activeRing.components['ring-focus'].returnToBox();
    }

    // Bring this ring into focus
    this.bringToFocus();
  },

  bringToFocus: function() {
    console.log('Bringing to focus:', this.el.id);
    const scene = this.el.sceneEl;
    const ringManager = scene.systems['ring-manager'];
    if (!ringManager) {
      console.error('Ring manager system not found');
      return;
    }
    
    // Set busy state first
    ringManager.setBusy(true, this.el);
    this.data.isFocused = true;

    // Disable camera look-controls so drag is reserved for ring rotation
    if (this.cameraEl && this.cameraEl.components['look-controls']) {
      const lc = this.cameraEl.getAttribute('look-controls');
      this.cameraLookWasEnabled = (lc && lc.enabled !== undefined) ? lc.enabled : true;
      this.cameraEl.setAttribute('look-controls', 'enabled', false);
    }
    
    // Remove any existing animations
    this.el.removeAttribute('animation');
    this.el.removeAttribute('animation__scale');
    
    // Animate to focus position with easing
    this.el.setAttribute('animation', {
      property: 'position',
      to: `${this.data.focusPosition.x} ${this.data.focusPosition.y} ${this.data.focusPosition.z}`,
      dur: this.data.animationDuration,
      easing: 'easeOutCubic'
    });
    
    // Animate scale with easing
    this.el.setAttribute('animation__scale', {
      property: 'scale',
      to: `${this.data.focusScale.x} ${this.data.focusScale.y} ${this.data.focusScale.z}`,
      dur: this.data.animationDuration,
      easing: 'easeOutCubic'
    });
    
    // Show close button
    if (this.closeBtn) {
      this.closeBtn.style.display = 'block';
      this.closeBtn.onclick = this.onClose;
      setTimeout(() => this.closeBtn.focus(), 50);
    }
    
    // Enable drag rotation
    if (this.dragTarget) {
      this.dragTarget.setAttribute('drag-rotate-y', 'enabled', true);
    }
    
    // Add focused class for styling
    this.el.classList.add('focused');
  },

  onClose: function(evt) {
    if (evt) evt.stopPropagation();
    if (this.data.isFocused) {
      this.returnToBox();
    }
  },
  
  returnToBox: function() {
    console.log('Returning to box:', this.el.id);
    const scene = this.el.sceneEl;
    const ringManager = scene.systems['ring-manager'];
    if (!ringManager) return;
    
    this.data.isFocused = false;
    
    // Remove any existing animations
    this.el.removeAttribute('animation');
    this.el.removeAttribute('animation__scale');
    
    // Animate back to original position with easing
    this.el.setAttribute('animation', {
      property: 'position',
      to: `${this.data.originalPosition.x} ${this.data.originalPosition.y} ${this.data.originalPosition.z}`,
      dur: this.data.animationDuration,
      easing: 'easeInOutCubic'
    });
    
    // Animate scale back to original with easing
    this.el.setAttribute('animation__scale', {
      property: 'scale',
      to: `${this.data.originalScale.x} ${this.data.originalScale.y} ${this.data.originalScale.z}`,
      dur: this.data.animationDuration,
      easing: 'easeInOutCubic'
    });
    
    // Reset rotation to original
    this.el.setAttribute('animation__rotation', {
      property: 'rotation',
      to: `${this.data.originalRotation.x} ${this.data.originalRotation.y} ${this.data.originalRotation.z}`,
      dur: this.data.animationDuration,
      easing: 'easeInOutCubic'
    });
    
    // Hide close button
    if (this.closeBtn) {
      this.closeBtn.style.display = 'none';
    }
    
    // Disable drag rotation
    if (this.dragTarget) {
      this.dragTarget.setAttribute('drag-rotate-y', 'enabled', false);
    }

    // Re-enable camera look-controls if we disabled them
    if (this.cameraEl && this.cameraEl.components['look-controls']) {
      this.cameraEl.setAttribute('look-controls', 'enabled', this.cameraLookWasEnabled);
    }
    
    // Remove focused class
    this.el.classList.remove('focused');
    
    // Reset state after animation
    setTimeout(() => {
      ringManager.setBusy(false, null);
      this.el.removeAttribute('animation__rotation');
    }, this.data.animationDuration);
  },

  remove: function() {
    // Remove event listeners
    this.el.removeEventListener('click', this.onClick);
    
    // Remove close button listener
    if (this.closeBtn) {
      this.closeBtn.removeEventListener('click', this.onClose);
    }
    
    // Clean up animations
    this.el.removeAttribute('animation');
    this.el.removeAttribute('animation__scale');
    this.el.removeAttribute('animation__rotation');
  }
});