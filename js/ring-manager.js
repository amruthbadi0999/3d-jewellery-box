// ring-manager.js
AFRAME.registerSystem('ring-manager', {
  init: function() {
    console.log('Ring Manager initialized');
    this.isBusy = false;
    this.activeRing = null;
    this.closeBtn = null;
    
    // Wait for scene to be loaded
    this.el.addEventListener('loaded', () => {
      this.initializeCloseButton();
      this.setupEventListeners();
    });
  },
  
  initializeCloseButton: function() {
    this.closeBtn = document.getElementById('closeBtn');
    
    if (this.closeBtn) {
      this.closeBtn.style.display = 'none';
      this.closeBtn.onclick = (e) => {
        e.stopPropagation();
        console.log('Close button clicked');
        if (this.activeRing && this.activeRing.components['ring-focus']) {
          this.activeRing.components['ring-focus'].onClose(e);
        }
      };
    } else {
      console.error('Close button not found');
      // Create close button if it doesn't exist
      this.createCloseButton();
    }
  },
  
  createCloseButton: function() {
    const btn = document.createElement('button');
    btn.id = 'closeBtn';
    btn.className = 'close-btn';
    btn.textContent = '× Close';
    btn.style.display = 'none';
    btn.style.position = 'fixed';
    btn.style.top = '20px';
    btn.style.right = '20px';
    btn.style.padding = '10px 20px';
    btn.style.background = 'rgba(0,0,0,0.7)';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';
    btn.style.zIndex = '9999';
    
    btn.onclick = (e) => {
      e.stopPropagation();
      if (this.activeRing && this.activeRing.components['ring-focus']) {
        this.activeRing.components['ring-focus'].onClose(e);
      }
    };
    
    document.body.appendChild(btn);
    this.closeBtn = btn;
  },
  
  setupEventListeners: function() {
    // Handle escape key to close ring view
    this.onEscape = (e) => {
      if (e.key === 'Escape' && this.activeRing) {
        console.log('Escape key pressed');
        this.activeRing.components['ring-focus'].onClose(e);
      }
    };
    
    // Prevent default drag behavior on window
    this.onDragStart = (e) => {
      if (this.isBusy) {
        e.preventDefault();
        return false;
      }
    };
    
    document.addEventListener('keydown', this.onEscape);
    window.addEventListener('dragstart', this.onDragStart);
  },
  
  setBusy: function(isBusy, ring) {
    console.log(`Setting busy state: ${isBusy}`, ring);
    
    // If we're already in the desired state, do nothing
    if (this.isBusy === isBusy && this.activeRing === ring) return;
    
    // If we're trying to focus a new ring while one is already focused, return the current one first
    if (isBusy && this.isBusy && this.activeRing && this.activeRing !== ring) {
      this.activeRing.components['ring-focus'].returnToBox();
      // Wait for the return animation to complete
      return new Promise(resolve => {
        setTimeout(() => {
          this.doSetBusy(isBusy, ring);
          resolve();
        }, 500); // Match this with your animation duration
      });
    }
    
    return this.doSetBusy(isBusy, ring);
  },
  
  doSetBusy: function(isBusy, ring) {
    this.isBusy = isBusy;
    this.activeRing = isBusy ? ring : null;
    
    // Update cursor style
    document.body.style.cursor = isBusy ? 'grab' : '';
    
    // Update close button visibility
    if (this.closeBtn) {
      this.closeBtn.style.display = isBusy ? 'block' : 'none';
      if (isBusy) {
        setTimeout(() => this.closeBtn.focus(), 10);
      }
    }
    
    // Emit events for state changes
    if (isBusy) {
      this.el.emit('ring-focused', { ring: ring });
    } else {
      this.el.emit('ring-returned', { ring: ring });
    }
  },
  
  // Helper method to check if a ring is the active one
  isActiveRing: function(ring) {
    return this.activeRing === ring;
  },
  
  // Clean up method
  remove: function() {
    if (this.closeBtn) {
      this.closeBtn.onclick = null;
    }
    document.removeEventListener('keydown', this.onEscape);
    window.removeEventListener('dragstart', this.onDragStart);
    
    // Clean up dynamically created button if it exists
    if (this.closeBtn && this.closeBtn.parentNode) {
      this.closeBtn.parentNode.removeChild(this.closeBtn);
    }
  }
});