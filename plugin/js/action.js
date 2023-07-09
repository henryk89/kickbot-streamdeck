// Prototype which represents an action
function Action(inContext, inSettings, jsn) {
    // Init Action
    let instance = this;

    // Private variable containing the context of the action
    let context = inContext;
    this.isEncoder = jsn?.payload?.controller == 'Encoder';
    this.isInMultiAction = jsn?.payload?.isInMultiAction;

    this.savedValue = -1;
    this.savedPower = null;
    // Private variable containing the settings of the action
    let settings = inSettings;
    
    let updateActionsEvent = new CustomEvent('updateActions', {detail: {sender: this}} );

    // Set the default values
    setDefaults();

    // Public function returning the context
    this.getContext = () => {
        return context;
    };

    // Public function returning the settings
    this.getSettings = () => {
        return settings;
    };

    // Public function for settings the settings
    this.setSettings = inSettings => {
        settings = inSettings;
    };

    // Public function called when new cache is available
    this.newCacheAvailable = inCallback => {
        // Set default settings
        setDefaults(inCallback);
    };

    this.updateAllActions = () => {
      document.dispatchEvent(updateActionsEvent);
    };

    this.updateActionIfCacheAvailable = (ctx) => {
        // update the action and its display
      const cacheSize = Object.keys(cache.data).length;
      if(cacheSize === 0) {
        // after a willAppear event, the cache is not yet available
        wait(1000).then(() => {
          this.updateAction();
        });
      } else {
        this.updateAction();
      }
    }

    this.setFeedback = (context, value, opacity) => {
      console.assert(websocket, 'no connection to websocket');
      if(websocket && this.isEncoder) {
        // send the values to the encoder  (SD+)
        setFeedback(context, {
          value: {
            value,
            opacity
          },
          indicator: {
            value,
            opacity
          }
        });
      }
    };

    this.getVerifiedSettings = function(inContext, requiredPropertySetting = null) {

      if(requiredPropertySetting) {
        if(!(requiredPropertySetting in settings)) {
          log(`No ${requiredPropertySetting} configured`);
          showAlert(inContext);
          return;
        }
      }
  
      return settings;
    };

    // Private function to set the defaults
    function setDefaults(inCallback) {
        if (!(Object.keys(cache.data).length > 0)) {
            // If a callback function was given
            if (inCallback !== undefined) {
                // Execute the callback function
                inCallback();
            }
            return;
        }

        // Find out type of action
        let action;
        if (instance instanceof SlowMode) {
            action = 'app.kickbot.kickbot.slow';
        }
        else if (instance instanceof CreateClip) {
            action = 'app.kickbot.kickbot.clip';
        }
        else if (instance instanceof ClearChat) {
            action = 'app.kickbot.kickbot.clear';
        }

        // If a callback function was given
        if (inCallback !== undefined) {
            // Execute the callback function
            inCallback();
        }
    }
}
