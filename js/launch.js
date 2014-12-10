// Some variables to remember state.
var q, playlistId, nextPageToken, prevPageToken, searching;

// Once the api loads call a function to get the uploads playlist id.
function handleAPILoaded() {
  displayMessage('YouTube APIs Loaded');
  $('.burning').burn();
  $('#search-button').attr('disabled', false);
  $('#uploads-button').attr('disabled', false);
  $('#events-button').attr('disabled', false);
  $('#events-ss-button').attr('disabled', false);
  $('#events-ss-insert-button').attr('disabled', false);  
  
}
// Search request from button UI
function search() {
  hideMessage();
  searching = true;
  q = $('#query').val();
  requestVideos(q);
}
// Get uploads request from button UI
function getUploads() {
  hideMessage();
  searching = false;
  requestUserUploadsPlaylistId();
}
// Get uploads request from button UI
function getEvents() {
  hideMessage();
  searching = false;
  requestEvents();
}

// Get uploads request from button UI
function getSSEvents() {
  hideMessage();
  searching = false;
  requestSSEvents();
}


// request videos using search query
function requestVideos(q, pageToken) {

  $('#video-container').html('');

  var requestOptions = {
    q: q,
    part: 'snippet',
    maxResults: 9
  };
  if (pageToken) {
    requestOptions.pageToken = pageToken;
  }
  var request = gapi.client.youtube.search.list(requestOptions);
  request.execute(function(response) {
    // Only show the page buttons if there's a next or previous page.
    nextPageToken = response.result.nextPageToken;
    var nextVis = nextPageToken ? 'visible' : 'hidden';
    $('#next-button').css('visibility', nextVis);
    prevPageToken = response.result.prevPageToken
    var prevVis = prevPageToken ? 'visible' : 'hidden';
    $('#prev-button').css('visibility', prevVis);

    $('#search-results-number').html('<small>Results: ' + response.result.pageInfo.totalResults + '</small>');

    var listitems = response.result.items;
    // For each result lets show a thumbnail.
    jQuery.each(listitems, function(index, item) {
        createDisplayThumbnail(item);
    });
  }); 
}

// Create a thumbnail for a video snippet.
function createDisplayThumbnail(item) {
  var videoSnippet = item.snippet;
  var titleEl = $('<h3>');
  titleEl.addClass('video-title');
  //$(titleEl).html(videoSnippet.title);

  var thumbnailUrl = videoSnippet.thumbnails.medium.url;
  var aElement = $('<a>');
  // The dummy href value of '#' ensures that the browser renders the
  // <a> element as a clickable link.
  var link = 'http://www.youtube.com/embed/' + item.id.videoId;
  aElement.attr('href', link);
  aElement.attr('target', 'target="_blank"');
  aElement.text(videoSnippet.title);

  var div = $('<div>');
  div.addClass('video-content');

  div.css('backgroundImage', 'url("' + thumbnailUrl + '")');
  $(titleEl).append(aElement);
  div.append(titleEl);
  $('#video-container').append(div);
}


// Retrieve the next page of videos.
function nextPage() {
  searching ? requestVideos(q, nextPageToken) : requestVideoPlaylist(playlistId, nextPageToken);   
}

// Retrieve the previous page of videos.
function previousPage() {
  searching ? requestVideos(q, prevPageToken) : requestVideoPlaylist(playlistId, prevPageToken);
}

// Helper method to display a message on the page.
function displayMessage(message) {
  $('#message').text(message).show();
}

// Helper method to hide a previously displayed message on the page.
function hideMessage() {
  $('#message').hide();
}

//
//
//  UPLOADS
//
//

//Retrieve the uploads playlist id.
function requestUserUploadsPlaylistId() {

  // https://developers.google.com/youtube/v3/docs/channels/list
  var request = gapi.client.youtube.channels.list({
    mine: true,
    part: 'contentDetails'
  });
  request.execute(function(response) {
    playlistId = response.result.items[0].contentDetails.relatedPlaylists.uploads;
    requestVideoPlaylist(playlistId);
  });
}


// Retrieve a playist of videos.
function requestVideoPlaylist(playlistId, pageToken) {
  $('#video-container').html('');
  var requestOptions = {
    playlistId: playlistId,
    part: 'snippet, status, contentDetails',
    maxResults: 9
  };
    if (pageToken) {
    requestOptions.pageToken = pageToken;
  }
  var request = gapi.client.youtube.playlistItems.list(requestOptions);
  request.execute(function(response) {
    // Only show the page buttons if there's a next or previous page.
    nextPageToken = response.result.nextPageToken;
    var nextVis = nextPageToken ? 'visible' : 'hidden';
    $('#next-button').css('visibility', nextVis);
    prevPageToken = response.result.prevPageToken
    var prevVis = prevPageToken ? 'visible' : 'hidden';
    $('#prev-button').css('visibility', prevVis);
    $('#search-results-number').html('<small>Results: ' + response.result.pageInfo.totalResults + '</small>');

    var listitems = response.result.items;
    // For each result lets show a thumbnail.
    jQuery.each(listitems, function(index, item) {
        createDisplayUploadThumbnail(item);
    });
  }); 
}

// Create a thumbnail for a video snippet.
function createDisplayUploadThumbnail(item) {
  var videoSnippet = item.snippet;
  var titleEl = $('<h3>');
  titleEl.addClass('video-title');
  //$(titleEl).html(videoSnippet.title);

  var thumbnailUrl = videoSnippet.thumbnails.medium.url;
  var aElement = $('<a>');
  // The dummy href value of '#' ensures that the browser renders the
  // <a> element as a clickable link.
  var link = 'http://www.youtube.com/embed/' + item.snippet.resourceId.videoId;;
  aElement.attr('href', link);
  aElement.attr('target', 'target="_blank"');
  aElement.text(videoSnippet.title);

  var div = $('<div>');
  div.addClass('video-content');

  div.css('backgroundImage', 'url("' + thumbnailUrl + '")');
  $(titleEl).append(aElement);
  div.append(titleEl);
  $('#video-container').append(div);
}


//
//
//  Events
//
//

//Request all live broadcasts
function requestEvents() {

  // https://developers.google.com/youtube/v3/docs/channels/list
  var request = gapi.client.youtube.liveBroadcasts.list({
    mine: true,
    part: 'snippet,status'

  });
  request.execute(function(response) {
  
    var listitems = response.result.items;

    
    $('#search-results-number').html();
    // For each result lets show a thumbnail.
    jQuery.each(listitems, function(index, item) {
      //$('#video-container').append('<br>' + item.snippet.title);
      var myEvents_html = 'Total Results: ' + response.result.pageInfo.totalResults +
      
                      '<br><br>Title: ' + item.snippet.title +
                      '<br>id : ' + item.id +
      		          '<br>lifeCycleStatus: ' + item.status.lifeCycleStatus +
                      '<br>privacyStatus: ' + item.status.privacyStatus +
                      '<br>recordingStatus: ' + item.status.recordingStatus;
                       
      $('#my-ytevents').append(myEvents_html);
    });  
  });
}


//Retrieve events from SS.
function requestSSEvents() {

$.getJSON( "https://spreadsheets.google.com/feeds/list/0Aq3HoBrqezGPdF9STDZ3cTJ4cWc2c0tXdmxFQVVueUE/od6/public/values?alt=json-in-script&callback=?",
	function (data) {	
		$('#my-spreadsheet').append('Spreadsheet entries:' + data.feed.openSearch$totalResults.$t);
		
		$.each(data.feed.entry, function(i,entry) {	
			
			$('#my-spreadsheet').append('<br><br>Title: ' + entry.title.$t + 
			                           '<br> Description: ' + entry.gsx$description.$t + 
			                           '<br> Start: ' + entry.gsx$scheduledstarttime.$t + 
			                           '<br> End: ' + entry.gsx$scheduledendtime.$t + 
			                           '<br>Stream Name: ' + entry.gsx$streamname.$t);

		});

	});
}

//Retrieve events from SS.
function insertSSEvents() {

$.getJSON( "https://spreadsheets.google.com/feeds/list/0Aq3HoBrqezGPdF9STDZ3cTJ4cWc2c0tXdmxFQVVueUE/od6/public/values?alt=json-in-script&callback=?",
	function (data) {	

		$.each(data.feed.entry, function(i,entry) {	
			
			//$('#video-container').append('<br>Title: ' + entry.title.$t + '<br> Description: ' + entry.gsx$description.$t + '<br> Start: ' + entry.gsx$scheduledstarttime.$t + '<br> End: ' + entry.gsx$scheduledendtime.$t + '<br>Stream Name: ' + entry.gsx$streamname.$t);

            var request = gapi.client.youtube.liveBroadcasts.insert({
  
               	part: 'snippet,status',
      			resource: {
      				snippet: {
        				scheduledEndTime: entry.gsx$scheduledendtime.$t,
        				scheduledStartTime: entry.gsx$scheduledstarttime.$t,
        				description: entry.gsx$description.$t,
        				title: entry.title.$t
      				},
      				status: {
      					privacyStatus: 'unlisted'
      				}
    			}
  			});

            request.execute(function(response) {
              if ('error' in response) {
                $('#inserted-events').append(response.error.message); 
              } else {
                $('#inserted-events').append('<br> Added video: ' + response.id);
              }             
		    });
		});
	});
}



