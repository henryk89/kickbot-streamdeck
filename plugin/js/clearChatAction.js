function ClearChat(inContext, inSettings) {
    console.log("clear chat init");
    let instance = this;
    Action.call(this, inContext, inSettings);

    this.onKeyUp = (inContext, inSettings, inCoordinates, inUserDesiredState, inState) => {
        console.log("clear chat keyDown");

        console.log(inSettings)

        let api_key = inSettings.apiKey;
        
        // Create a new XMLHttpRequest object
        const xhr = new XMLHttpRequest();
        
        // Set up the API request
        xhr.open('POST', 'https://kickbot.app/api/sd_clear', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        // Define the callback function to handle the API response
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 400) {
            // Request was successful
            const data = JSON.parse(xhr.responseText);
            console.log(data);
            // Process the response data here
          } else {
            // Request was unsuccessful
            console.error('API request failed');
            // Handle the error here
          }
        };
        
        // Handle any errors that occurred during the API request
        xhr.onerror = function() {
          console.error('An error occurred during the API request');
        };
        
        // Create the request body
        const requestBody = JSON.stringify({
          api_key: api_key
        });
        
        // Send the API request with the request body
        xhr.send(requestBody);
        
    };
}
