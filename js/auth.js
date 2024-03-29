// The client id is obtained from the Google APIs Console at https://code.google.com/apis/console
// If you run access this code from a server other than http://localhost, you need to register
// your own client id.
//var OAUTH2_CLIENT_ID = '949234218660.apps.googleusercontent.com';
var OAUTH2_CLIENT_ID = '839098018660.apps.googleusercontent.com';
var OAUTH2_SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'https://www.googleapis.com/auth/youtubepartner'
];

// This callback is invoked by the Google APIs JS client automatically when it is loaded.
googleApiClientReady = function() {
  gapi.auth.init(function() {
    window.setTimeout(checkAuth, 1);
  });
}

// Attempt the immediate OAuth 2 client flow as soon as the page is loaded.
// If the currently logged in Google Account has previously authorized OAUTH2_CLIENT_ID, then
// it will succeed with no user intervention. Otherwise, it will fail and the user interface
// to prompt for authorization needs to be displayed.
function checkAuth() {
  gapi.auth.authorize({
    client_id: OAUTH2_CLIENT_ID,
    scope: OAUTH2_SCOPES,
    immediate: true
  }, handleAuthResult);
}

// Handles the result of a gapi.auth.authorize() call.
function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    // Auth was successful; hide the things related to prompting for auth and show the things
    // that should be visible after auth succeeds.
    $('.pre-auth').hide();
    loadAPIClientInterfaces();
  } else {
    // Make the #login-link clickable, and attempt a non-immediate OAuth 2 client flow.
    // The current function will be called when that flow is complete.
    $('#login-link').click(function() {
      gapi.auth.authorize({
        client_id: OAUTH2_CLIENT_ID,
        scope: OAUTH2_SCOPES,
        immediate: false
        }, handleAuthResult);
    });
  }
}

// Loads the client interface for the YouTube Analytics, Partner and Data APIs.
// This is required before using the Google APIs JS client; more info is available at
// http://code.google.com/p/google-api-javascript-client/wiki/GettingStarted#Loading_the_Client
function loadAPIClientInterfaces() {
  gapi.client.load('youtube', 'v3', function() {
    gapi.client.load('youtubeAnalytics', 'v1', function() {
      gapi.client.load('youtubePartner', 'v1', function() { 
        handleAPILoaded();
      });   
    });
  });
}
