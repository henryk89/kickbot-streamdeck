function ClipLengthPI(inContext, inLanguage, inStreamDeckVersion, inPluginVersion) {
  // Init clipLengthPI
  let instance = this;

  // Inherit from PI
  PI.call(this, inContext, inLanguage, inStreamDeckVersion, inPluginVersion);

  // Before overwriting parent method, save a copy of it
  let piLocalize = this.localize;

  // Localize the UI
  this.localize = () => {
      // Call PIs localize method
      piLocalize.call(instance);

      // Localize the length label
      document.getElementById('clip-length-label').innerHTML = instance.localization['ClipLength'];

  };

  // Add clip length input
  document.getElementById('placeholder').innerHTML = `
    <div type="range" class="sdpi-item">
      <div class="sdpi-item-label" id="clip-length-label">Clip Length</div>
      <div class="sdpi-item-value">
          <input class="floating-tooltip" data-suffix="%" type="number" id="clip-length-input" min="1" max="120" value="${settings.clipLength || 30}" required>
      </div>
    </div>
    `;


  // Add event listener
  document.getElementById('clip-length-input').addEventListener('change', clipLengthChanged);

  // Clip length changed
  function clipLengthChanged(inEvent) {
      // Save the new clip length settings
      settings.clipLength = inEvent.target.value;
      instance.saveSettings();

      // Inform the plugin that a new clip length is set
      instance.sendToPlugin({
          piEvent: 'valueChanged',
      });
  }

}