// Global web socket
var websocket = null;

// Global cache
var cache = {};

// Global settings
var globalSettings = {};

const throttleDialRotate = Utils.throttle((fn) => {
  if (fn) fn();
}, 60);

const debounceDialRotate = Utils.debounce((jsonObj) => {
  console.log('debounceDialRotate', jsonObj);
}, 300);

// Setup the websocket and handle communication
function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo) {
    // Create array of currently used actions
    let actions = {};
    window.MACTIONS = actions;
    // Create a cache
    cache = new Cache();

    // Open the web socket to Stream Deck
    // Use 127.0.0.1 because Windows needs 300ms to resolve localhost
    websocket = new WebSocket(`ws://127.0.0.1:${inPort}`);

    // Web socket is connected
    websocket.onopen = () => {
        // Register plugin to Stream Deck
        registerPluginOrPI(inRegisterEvent, inPluginUUID);

        // Request the global settings of the plugin
        requestGlobalSettings(inPluginUUID);
    }

    document.addEventListener('updateActions', (e) => {
      // updateAction carries the sender of the event so we can skip it
      const sender = e.detail?.sender;
      Object.keys(actions).forEach(inContext => {
        if(actions[inContext].updateAction) {
          // don't update the sender
          if(actions[inContext] === sender) return;
          actions[inContext].updateAction();
        }
      });
    }, false);

    // Add event listener
    document.addEventListener('newCacheAvailable', () => {
        // When a new cache is available
        Object.keys(actions).forEach(inContext => {
            // Inform all used actions that a new cache is available
            actions[inContext].newCacheAvailable(() => {
                let action;

                if (actions[inContext] instanceof ClearChat) {
                    action = 'app.kickbot.kickbot.clear';
                }
                else if (actions[inContext] instanceof SlowMode) {
                    action = 'app.kickbot.kicbot.slow';
                }
                else if (actions[inContext] instanceof CreateClip) {
                    action = 'app.kickbot.kickbot.clip';
                }

                // Inform PI of new cache
                sendToPropertyInspector(action, inContext, cache.data);
            });
        });
    }, false);

    // Web socked received a message
    websocket.onmessage = inEvent => {
        // Parse parameter from string to object
        let jsonObj = JSON.parse(inEvent.data);

        // Extract payload information
        let event = jsonObj['event'];
        let action = jsonObj['action'];
        let context = jsonObj['context'];
        let jsonPayload = jsonObj['payload'];
        let settings;

        if(event === 'dialRotate') {
          if(actions[context]?.onDialRotate) {
            throttleDialRotate(() => {
              actions[context].onDialRotate(jsonObj);
            });
          }
        } else if(event === 'dialPress') {
          if(actions[context]?.onDialPress) {
            actions[context].onDialPress(jsonObj);
          }
        } else if(event === 'touchTap') {
          if(actions[context]?.onTouchTap) {
            actions[context].onTouchTap(jsonObj);
          }
        } else if (event === 'keyUp') {
            settings = jsonPayload['settings'];
            let coordinates = jsonPayload['coordinates'];
            let userDesiredState = jsonPayload['userDesiredState'];
            let state = jsonPayload['state'];

            // Send onKeyUp event to actions
            if (context in actions) {
                actions[context].onKeyUp(context, settings, coordinates, userDesiredState, state);
            }
        }
        else if (event === 'willAppear') {
            settings = jsonPayload['settings'];

            // Add current instance is not in actions array
            if (!(context in actions)) {
                // Add current instance to array
                if (action === 'app.kickbot.kickbot.clear') {
                    actions[context] = new ClearChat(context, settings);
                }
                else if (action === 'app.kickbot.kickbot.slow') {
                    actions[context] = new SlowMode(context, settings);
                }
                else if (action === 'app.kickbot.kickbot.clip') {
                    actions[context] = new CreateClip(context, settings);
                }
            }
        }
        else if (event === 'willDisappear') {
            // Remove current instance from array
            if (context in actions) {
                delete actions[context];
            }
        }
        else if (event === 'didReceiveGlobalSettings') {
            // Set global settings
            globalSettings = jsonPayload['settings'];
        }
        else if (event === 'didReceiveSettings') {
            settings = jsonPayload['settings'];

            // Set settings
            if (context in actions) {
                actions[context].setSettings(settings);
            }
        }
        else if (event === 'propertyInspectorDidAppear') {
            // Send cache to PI
            sendToPropertyInspector(action, context, cache.data);
        }
    };
}