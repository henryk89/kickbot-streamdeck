function ClearChatPI(inContext, inLanguage, inStreamDeckVersion, inPluginVersion) {
    // Init clearChatPI
    let instance = this;
  
    // Inherit from PI
    PI.call(this, inContext, inLanguage, inStreamDeckVersion, inPluginVersion);
  
    // Before overwriting parent method, save a copy of it
    let piLocalize = this.localize;
  
    // Localize the UI
    this.localize = () => {
        // Call PIs localize method
        piLocalize.call(instance);
  
    };
  
  }