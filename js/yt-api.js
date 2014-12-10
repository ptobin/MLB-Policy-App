
// Some variables to remember state.
var playlistId, nextPageToken, prevPageToken;
var contentOwner;

var ONE_MONTH_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 30;

// Keeps track of the currently authenticated user's YouTube user ID.
var channelId;

// For information about the Google Chart Tools API, see
// https://developers.google.com/chart/interactive/docs/quick_start
google.load('visualization', '1.0', {'packages': ['corechart']});

// Once the api loads call a function to get the uploads playlist id.
function handleAPILoaded() {

  $('#button-container').append('<button id="prev-button" data-inline="true" data-icon="arrow-l" data-iconpos="left" onclick="previousPage();" >Prev</button>');
  $('#button-container').append('<button id="next-button" data-inline="true" data-icon="arrow-r" data-iconpos="right" onclick="nextPage();" >Next</button>').trigger('create');
  
  requestUserUploadsPlaylistId();

  var requestOptions = {
	fetchMine: true,
	onBehalfOfContentOwner: 'mlbam'

  };
  var request = gapi.client.youtubePartner.contentOwners.list(requestOptions);
  request.execute(function(response) {
  	  if ('error' in response) {
		alert('contentOwner list error: ' + response.error.message);
	  } else {
	  	//console.log(response.result);
	    //contentOwner = response.result.items[0].id;
	    contentOwner = 'mlbam';
	  }
  });
}

//Retrieve the uploads playlist id.
function requestUserUploadsPlaylistId() {
  // https://developers.google.com/youtube/v3/docs/channels/list
  var request = gapi.client.youtube.channels.list({
    //mine: true,
    
    part: 'snippet, contentDetails',

    onBehalfOfContentOwner: 'mlbam',
    managedByMe: true

  });
  request.execute(function(response) {
    var channelListItems = response.result.items;
    
	jQuery.each(channelListItems, function(index, item) {
		var title = item.snippet.title;
		if (title == 'MLB') {
			playlistId = item.contentDetails.relatedPlaylists.uploads;
		}
	});
    
    
    createUploadMetaData(playlistId);
    //playlistId = response.result.items[0].contentDetails.relatedPlaylists.uploads;
    requestVideoPlaylist(playlistId);
  });
}


// create a metadata of videos.
function createUploadMetaData(playlistId, pageToken) {

  var requestOptions = {
    playlistId: playlistId,
    part: 'snippet, status, contentDetails',
    onBehalfOfContentOwner: 'mlbam',
    managedByMe: true,
    maxResults: 50
  };
  if (pageToken) {
    requestOptions.pageToken = pageToken;
  }
  var request = gapi.client.youtube.playlistItems.list(requestOptions);
  request.execute(function(response) {
  	console.log(response.result.pageInfo.totalResults, 'num items=' + response.result.items.length);
   	var nextPageToken = response.result.nextPageToken;
  	if (nextPageToken) {
  		createUploadMetaData(playlistId, nextPageToken) 
  	}
 	
  });
  
}
 



// Retrieve a playist of videos.
function requestVideoPlaylist(playlistId, pageToken) {
  $('#video-container').html('');
  var requestOptions = {
    playlistId: playlistId,
    part: 'snippet, status, contentDetails',
    onBehalfOfContentOwner: 'mlbam',
    managedByMe: true,
    maxResults: 12
  };
  if (pageToken) {
    requestOptions.pageToken = pageToken;
  }
  var request = gapi.client.youtube.playlistItems.list(requestOptions);
  request.execute(function(response) {
    // Only show the page buttons if there's a next or previous page.
    nextPageToken = response.result.nextPageToken;
    var nextVis = nextPageToken ? 'enable' : 'disable';
    $('#next-button').button(nextVis);
    prevPageToken = response.result.prevPageToken
    var prevVis = prevPageToken ? 'enable' : 'disable';
    $('#prev-button').button(prevVis);
 	$('#video-totals').text(response.result.pageInfo.totalResults);
    var playlistItems = response.result.items;
    if (playlistItems) {

      var videolist = $('#video-list');
      var html = '<ul data-role="listview" data-inset="true">';

      // For each result lets show a thumbnail.
      jQuery.each(playlistItems, function(index, item) {
          var title = item.snippet.title;
          var thumbnailUrl = item.snippet.thumbnails.medium.url;
          var vid = item.snippet.resourceId.videoId;
          var privacy = item.status.privacyStatus;
          var publishedAt = item.snippet.publishedAt;
          var pubdate = new Date (publishedAt);
          var descr = '<p><b>Published On: </b>' + pubdate.toDateString() + '</p>';         
          html += '<li><a href="#details" onClick="videoSelected(\'' + vid + '\');"><img src="' + thumbnailUrl + '"><h4>' + title+ '</h4>' + descr + '<p class="ui-li-aside">' + privacy + '</p></a></li>';
      });
      html += '</ul>';
      videolist.html(html).trigger('create');
    } else {
      $('#video-container').html('Sorry you have no uploaded videos');
    }
  });
}

// display information about video
function videoSelected(vid){
  var request = gapi.client.youtube.videos.list({
      id: vid,
      onBehalfOfContentOwner: 'mlbam',
      part: 'id,contentDetails,snippet,statistics,status,player'
  });

  request.execute(function(response) {
  
    $('#player').html(response.result.items[0].player.embedHtml + '<br><br>');

    var contentdetails_html = '<b>Title: </b>' + response.result.items[0].snippet.title;
    contentdetails_html += '<br><b>Channel: </b>' + response.result.items[0].snippet.channelTitle;
    contentdetails_html += '<br><b>Video ID: </b>' + response.result.items[0].id;
    contentdetails_html += '<br><b>Published At: </b>' + new Date(response.result.items[0].snippet.publishedAt).toString();
    
    contentdetails_html += '<br><b>Duration: </b>' + response.result.items[0].contentDetails.duration;
    contentdetails_html += '<br><b>Dimension: </b>' + response.result.items[0].contentDetails.dimension;
    contentdetails_html += '<br><b>Definition: </b>' + response.result.items[0].contentDetails.definition;   
    contentdetails_html += '<br><b>Caption: </b>' + response.result.items[0].contentDetails.caption;   
    contentdetails_html += '<br><b>Licensed Content: </b>' + response.result.items[0].contentDetails.licensedContent;   
    
    console.log (response.result.items[0].contentDetails);
    if ('regionRestriction' in response.result.items[0].contentDetails) {
    
        contentdetails_html += '<br><b>Region Restriction: </b> Allowed:' + response.result.items[0].contentDetails.regionRestriction.allowed;   
        contentdetails_html += '<br><b>Region Restriction: </b> Blocked:' + response.result.items[0].contentDetails.regionRestriction.blocked;   
    
    }
    else {
    	//contentdetails_html += '<br><b>Region Restriction: </b> none';   
       //contentdetails_html += '<br><b>Region Restriction: </b> Allowed:' + response.result.items[0].contentDetails.regionRestriction.allowed;   
        //contentdetails_html += '<br><b>Region Restriction: </b> Blocked:' + response.result.items[0].contentDetails.regionRestriction.blocked;   
    
    }
	
    
    
    
    $('#contentdetails').html(contentdetails_html);
    
       
    $('#description').html(response.result.items[0].snippet.description);

    $('#tags').text(response.result.items[0].snippet.tags);

	//console.log(response);
    channelId = response.result.items[0].snippet.channelId;
    //displayVideoAnalytics(vid);
    
    var stats_html = 'View Count: ' + response.result.items[0].statistics.viewCount;
    stats_html += '<br>Like Count: ' + response.result.items[0].statistics.likeCount;
    stats_html += '<br>Comment Count: ' + response.result.items[0].statistics.commentCount;       
    $('#statistics').html(stats_html);

    var status_html = 'Upload Status: ' + response.result.items[0].status.uploadStatus;
    status_html += '<br>Privacy Status: ' + response.result.items[0].status.privacyStatus;
    status_html += '<br>License: ' + response.result.items[0].status.license;      
    status_html += '<br>embeddable: ' + response.result.items[0].status.embeddable;        
    status_html += '<br>Public Stats Viewable: ' + response.result.items[0].status.publicStatsViewable;    
    
    $('#status').html(status_html);
    
    var contentid_html = 'Content Owner: ' + contentOwner;

    
    var requestOptions = {
	  q: vid,
	  onBehalfOfContentOwner: contentOwner
    };
    var request = gapi.client.youtubePartner.claimSearch.list(requestOptions);
    request.execute(function(response) {
  	  if ('error' in response) {
		alert('claimSearch list error: ' + response.error.message);
	  } else {
        var num = response.result.pageInfo.totalResults;
	    contentid_html += '<br>Number of Claims on video: ' + num;
	    if (num > 0) {
		  contentid_html += '<br>id first claim: ' + response.result.items[0].id;
		  contentid_html += '<br>status first claim: ' + response.result.items[0].status;
		  contentid_html += '<br>Type of Claim: ' + response.result.items[0].contentType;	   
		
		  var claimDate = new Date (response.result.items[0].timeCreated);       

	      contentid_html += '<br>Claim created: ' + claimDate.toDateString();	
	    }    	    
	  }
	$('#contentid').html(contentid_html);
    });
  });
}

// Retrieve the next page of videos.
function nextPage() {
  requestVideoPlaylist(playlistId, nextPageToken);
}

// Retrieve the previous page of videos.
function previousPage() {
  requestVideoPlaylist(playlistId, prevPageToken);
}

//
//
//   YouTube Analytics
//
//

// Requests YouTube Analytics for a video, and displays results in a chart.
function displayVideoAnalytics(videoId) {
  if (channelId) {
	// To use a different date range, modify the ONE_MONTH_IN_MILLISECONDS
	// variable to a different millisecond delta as desired.
	var today = new Date();
	var lastMonth = new Date(today.getTime() - ONE_MONTH_IN_MILLISECONDS);

	var request = gapi.client.youtubeAnalytics.reports.query({
	  // The start-date and end-date parameters need to be YYYY-MM-DD strings.
	  'start-date': formatDateString(lastMonth),
	  'end-date': formatDateString(today),
	  // A future YouTube Analytics API release should support channel==default.
	  // In the meantime, you need to explicitly specify channel==channelId.
	  // See https://devsite.googleplex.com/youtube/analytics/v1/#ids
	  ids: 'channel==' + channelId,
	  dimensions: 'day',
	  // See https://developers.google.com/youtube/analytics/v1/available_reports for details
	  // on different filters and metrics you can request when dimensions=day.
	  metrics: 'views',
	  sort: 'day',
	  filters: 'video==' + videoId,

	});

	request.execute(function(response) {
	  // This function is called regardless of whether the request succeeds.
	  // The response either has valid analytics data or an error message.
	  if ('error' in response) {
	  console.log(response);
		displayMessage(response.error.message);
	  } else {
		displayChart(videoId, response);
	  }
	});
  } else {
	displayMessage('The YouTube user id for the current user is not available.');
  }
}

// Boilerplate code to take a Date object and return a YYYY-MM-DD string.
function formatDateString(date) {
  var yyyy = date.getFullYear().toString();
  var mm = padToTwoCharacters(date.getMonth() + 1);
  var dd = padToTwoCharacters(date.getDate());

  return yyyy + '-' + mm + '-' + dd;
}

// If number is a single digit, prepend a '0'. Otherwise, return it as a string.
function padToTwoCharacters(number) {
  if (number < 10) {
	return '0' + number;
  } else {
	return number.toString();
  }
}

// Calls the Google Chart Tools API to generate a chart of analytics data.
function displayChart(videoId, response) {
  displayMessage('about to draw-' + videoId);
  if ('rows' in response) {
	hideMessage();

	// The columnHeaders property contains an array of objects representing
	// each column's title – e.g.: [{name:"day"},{name:"views"}]
	// We need these column titles as a simple array, so we call jQuery.map()
	// to get each element's "name" property and create a new array that only
	// contains those values.
	var columns = $.map(response.columnHeaders, function(item) {
	  return item.name;
	});
  

	// The google.visualization.arrayToDataTable() wants an array of arrays.
	// The first element is an array of column titles, calculated above as
	// "columns". The remaining elements are arrays that each represent
	// a row of data. Fortunately, response.rows is already in this format,
	// so it can just be concatenated.
	// See https://developers.google.com/chart/interactive/docs/datatables_dataviews#arraytodatatable
	var chartDataArray = [columns].concat(response.rows);
 
	var chartDataTable = google.visualization.arrayToDataTable(chartDataArray);

	var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

	chart.draw(chartDataTable, {
	  // Additional options can be set if desired.
	  // See https://developers.google.com/chart/interactive/docs/reference#visdraw
	  title: 'Views per Day of Video ' + videoId,
	  backgroundColor: { fill:'transparent'},
	  titleTextStyle: {color: 'white'},
	  vAxis: {baselineColor:  'white', textStyle: {color:'white'}},       
	  hAxis: {baselineColor:  'white', textStyle: {color:'white'}},
	  legend: {textStyle: {color:'white'}, position: 'none'},
	  width: 1024,
	  height: 300
	});

  } else {
	displayMessage('No data available for video ' + videoId);
  }
}

// Helper method to display a message on the page.
function displayMessage(message) {
  $('#message').text(message).show();
}

// Helper method to hide a previously displayed message on the page.
function hideMessage() {
  $('#message').hide();
}


