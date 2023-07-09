function PI(inContext, inLanguage, inStreamDeckVersion, inPluginVersion) {
    // Init PI
    let instance = this;
    // let settings = {};

    // Public localizations for the UI
    this.localization = {};

    // Add event listener
    document.getElementById('api-key-input').addEventListener('change', apiKeyChanged);

    // Load the localizations
    getLocalization(inLanguage, (inStatus, inLocalization) => {
        if (inStatus) {
            // Save public localization
            instance.localization = inLocalization['PI'];

            // Localize the PI
            instance.localize();
        }
        else {
            console.log(inLocalization);
        }
    });

    // Localize the UI
    this.localize = () => {
        // Check if localizations were loaded
        if (instance.localization == null) {
            return;
        }

        // Localize the API key input
        document.getElementById('api-key-label').innerHTML = instance.localization['ApiKeyLabel'];
        document.getElementById('api-key-input').placeholder = instance.localization['ApiKeyInput'];

        // Load bridges after localizing the UI
        instance.loadKey();
    };

    this.loadKey = () => {
        // Check if settings already contain an API key
        if (settings.apiKey !== undefined) {
            document.getElementById('api-key-input').value = settings.apiKey;
        }

        // Show PI
        document.getElementById('pi').style.display = 'block';
    };

    function apiKeyChanged(inEvent) {
        settings.apiKey = inEvent.target.value;
        instance.saveSettings();
    }

    // Private function to return the action identifier
    function getAction() {
        let action;

        if (instance instanceof ClipLengthPI) {
            action = 'app.kickbot.kickbot.clip';
        } else if (instance instanceof SlowModePI) {
            action = 'app.kickbot.kickbot.slow';
        } else if (instance instanceof ClearChatPI) {
            action = 'app.kickbot.kickbot.clear';
        }

        return action;
    }

    // Public function to save the settings
    this.saveSettings = () => {
        saveSettings(getAction(), inContext, settings);
    };

    // Public function to send data to the plugin
    this.sendToPlugin = inData => {
        sendToPlugin(getAction(), inContext, inData);
    };
}
