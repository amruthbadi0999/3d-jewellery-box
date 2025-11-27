// hdri-loader.js - High Quality HDRI Environment Loader
AFRAME.registerComponent('hdri-loader', {
  init: function() {
    const scene = this.el.object3D;
    const canvas = this.el.renderer.domElement;

    // Use a high-quality HDRI (this is a free, high-res jewellery shop HDRI)
    // Alternatively, download from: polyhaven.com, ambientcg.com, etc.
    const hdriURL = 'https://cdn.jsdelivr.net/npm/three-hdri@1.0.1/assets/venice_sunset_1k.hdr';

    // Use THREE.RGBELoader if available, otherwise fallback to environment-component
    if (window.THREE && window.THREE.RGBELoader) {
      const loader = new THREE.RGBELoader();
      loader.load(hdriURL, (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.background = texture;

        console.log('HDRI loaded successfully:', hdriURL);
      }, undefined, (error) => {
        console.warn('HDRI load failed, falling back to environment preset:', error);
        this.fallbackEnvironment();
      });
    } else {
      console.warn('THREE.RGBELoader not available, using environment component');
      this.fallbackEnvironment();
    }
  },

  fallbackEnvironment: function() {
    // Fallback to the existing environment preset
    this.el.setAttribute('environment', {
      preset: 'default',
      horizonColor: '#fbe9d7',
      groundColor: '#e2c49f',
      skyType: 'color',
      skyColor: '#fff8e7',
      lighting: 'point',
      lightPosition: '0 4 4',
      fog: 0.1
    });
  }
});
