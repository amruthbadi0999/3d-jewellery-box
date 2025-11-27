// sound-manager.js - Sound effects for interactions
AFRAME.registerComponent('sound-manager', {
  init: function() {
    console.log('Sound Manager initialized');
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.enabled = true;

    // Listen for interaction events
    this.el.addEventListener('ring-focused', this.onRingFocused.bind(this));
    this.el.addEventListener('ring-returned', this.onRingReturned.bind(this));
  },

  playTone: function(frequency, duration, volume) {
    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const now = this.audioContext.currentTime;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;

      gainNode.gain.setValueAtTime(volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(now);
      oscillator.stop(now + duration);

      console.log(`Playing tone: ${frequency}Hz for ${duration}s at volume ${volume}`);
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  },

  onRingFocused: function() {
    // Play a pleasant chime sound (C5 note)
    this.playTone(523.25, 0.4, 0.3);
  },

  onRingReturned: function() {
    // Play a lower return sound (G4 note)
    this.playTone(392, 0.35, 0.25);
  },

  remove: function() {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
});
