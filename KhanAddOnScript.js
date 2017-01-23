function onOpen() {
  var exercises = getExercises();                             // Get the exercises JSON from Khan API
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheets(); // Gets a list of sheets from the Google Sheets file
  for (i = 1; i < ss.length; i++) {                           // Loop through each sheet and update
    updateSheet(ss[i], exercises);
  }
}

// Update an individual sheet within the Sheet document
function updateSheet(sheet, exercises) {
  var cells = sheet.getSheetValues(1, 1, -1, -1);  // Get all the values and store them as an array
 
  var length = cells.length;
  var width = cells[0].length;
  
  for (var i = 1; i < length; i++) {               // Loop through each element in the array (not including first row)
    for (var j = 0; j < width; j++) {
      var exercise = cells[i][j];
      if (sheet.getRange(i+1,j+1).getFormulas()) {    // Check if the cell is a hyperlink; if not, getFormulas will return Null; getRange indices start at 1, not 0, so need to add 1 to i and j
        var level = getLevel(exercise, exercises);
        var cell = sheet.getRange(i+1, j+1, 1);
        cell.setBackground(color(level));
      }
    }
  }
}


// Return a list of all exercises for a specific user by accessing the Khan API
function getExercises() {
    var service = getService();
    if (service.hasAccess()) {
      var url = 'https://api.khanacademy.org/api/v1/user/exercises';
      var response = service.fetch(url);
      var result = JSON.parse(response.getContentText());
      return result
    } else {
       var authorizationUrl = service.authorize();
       Logger.log('Open the following URL and re-run the script: %s', authorizationUrl);
    }
}


// Return current level for an individual exercise
function getLevel(exerciseName, exerciseList) {
  for (var i = 0; i < exerciseList.length; i++) {
    if (exerciseList[i].exercise_model.translated_title == exerciseName) {
      return exerciseList[i].exercise_progress.level
    }
  }
}


// Returns the color for each progress level
function color(level) {
  var colors = {'unstarted' : "#efefef",
                'endangered': "orange",
                'practiced' : "#cfe2f3",
                'masterered' : "light blue 1",
                };
  return colors[level]
}



// Adapted from apps-script-oauth1/samples/KhanAcademy.gs on googlesamples (github)

var CONSUMER_KEY = '3kM5tPhNerjTGsuE';
var CONSUMER_SECRET = 'SzxZQF9sfbdNfbrM';

/**
 * Authorizes and makes a request to the Khan API.
 */


/**
 * Reset the authorization state, so that it can be re-tested.
 */
function reset() {
  var service = getService();
  service.reset();
}

/**
 * Configures the service.
 */
function getService() {
  return OAuth1.createService('Khan')
      // Set the endpoint URLs.
      .setRequestTokenUrl('https://www.khanacademy.org/api/auth2/request_token')
      .setAuthorizationUrl('https://www.khanacademy.org/api/auth2/authorize')
      .setAccessTokenUrl('https://www.khanacademy.org/api/auth2/access_token')

      // Set the consumer key and secret.
      .setConsumerKey(CONSUMER_KEY)
      .setConsumerSecret(CONSUMER_SECRET)

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties())
  
      // Specify that the OAuth parameters should be passed as query parameters.
      .setParamLocation('uri-query');
}

/**
 * Handles the OAuth2 callback.
 */
function authCallback(request) {
  var service = getService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success!');
  } else {
    return HtmlService.createHtmlOutput('Denied');
  }
}


