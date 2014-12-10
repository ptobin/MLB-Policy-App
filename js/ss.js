var ssid = 'none'; 


// Once the api loads call a function to get the uploads playlist id.
function handleAPILoaded() {
  	//displayMessage('YouTube APIs Loaded'); 
  
  
	// https://developers.google.com/youtube/v3/docs/channels/list
  	var request = gapi.client.youtube.channels.list({
    	mine: true,
    	part: 'snippet,statistics,contentDetails'

  	});
  	request.execute(function(response) {
  	
        var thumbnailUrl = response.items[0].snippet.thumbnails.default.url;
 	    
  	    
  	    var imgEl = $('<img>');
  		//div.addClass('video-content');
  		
  		imgEl.attr('src', thumbnailUrl);
        //div.css('backgroundImage', 'url("' + thumbnailUrl + '")');
   		$('#channel-container').append(imgEl);


        var d = new Date(response.items[0].snippet.publishedAt);		
   		var channel_html = '<b> ' +  response.items[0].snippet.title + '</b>';
   		
  		channel_html += '<br><small> ' + response.items[0].snippet.description + '<br>';
   		channel_html += '<br> view count: ' + response.items[0].statistics.viewCount;
   		channel_html += '<br> subscribers: ' + response.items[0].statistics.subscriberCount; 		
   		channel_html += '<br> created: ' + d.toDateString() + '</small>';   		
  		
  		//div.html(channel_html);
  		
  		$('#channel-container').addClass('channel-content');

 		$('#channel-container').append(channel_html);		 	
  	});

  	$('#events-button').attr('disabled', false);
  	$('#events-ss-button').attr('disabled', false);
  	$('#events-ss-insert-button').attr('disabled', false);  
  	//$("#events-ss-insert-button").addClass('ui-icon');
  	$('#events-ss-insert-button').button({
      icons: {
        primary: "ui-icon-plus"
        }
    });
   $( "#events-ss-insert-button" ).button({ label: "Add Events to YouTube" });
   
   $('#events-button').button({
      icons: {
        primary: "ui-icon-arrowthick-1-s"
        }
    });
   $( "#events-button" ).button({ label: "List Your Live Events" });
   
   $('#events-ss-button').button({
      icons: {
        primary: "ui-icon-arrowthick-1-s"
        }
    });
   $( "#events-ss-button" ).button({ label: "List Your SS Events" });
   
   $('#events-button').css('visibility', 'visible');
   $('#events-ss-button').css('visibility', 'visible');  
   $('#events-ss-insert-button').css('visibility', 'visible');
   $('#queryss').css('visibility', 'visible');
   

}
// Get uploads request from button UI
function getEvents() {
  hideMessage();
  $('#my-ytevents').html('');
  requestEvents();
}

// Get uploads request from button UI
function getSSEvents() {
  hideMessage();
  $('#my-spreadsheet').html('');
  requestSSEvents();
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
//  Events
//
//

//Request all live broadcasts
function requestEvents() {

	// https://developers.google.com/youtube/v3/docs/liveBroadcasts/list
  	var request = gapi.client.youtube.liveBroadcasts.list({
    	mine: true,
		maxResults: 50,
    	part: 'snippet,status,contentDetails,id'

  	});
  	request.execute(function(response) {
  
    	var listitems = response.result.items;

    	$('#my-ytevents').append('Total Results: ' + response.result.pageInfo.totalResults);        // For each result lets show a thumbnail.

    	jQuery.each(listitems, function(index, item) {
    	
    		var title = item.snippet.title;
    		var vid = item.id;
    		
    		var lifeCycleStatus = item.status.lifeCycleStatus;
    		var privacyStatus = item.status.privacyStatus;
    		var recordingStatus = item.status.recordingStatus;
    		var boundStreamId = item.contentDetails.boundStreamId;    		
    		
    		
       		
      		var request = gapi.client.youtube.liveStreams.list({
    			id: item.contentDetails.boundStreamId,
    			part: 'snippet,id,status'

  			});
  			request.execute(function(response) {
  				var myEvents_html = '<br><br>Title: ' + title +
                      '<br>video id : ' + vid +
      		          '<br>lifeCycleStatus: ' + lifeCycleStatus +
                      '<br>privacyStatus: ' + privacyStatus +
                      '<br>recordingStatus: ' + recordingStatus +
                      '<br><b>Stream</b>: ' + response.items[0].snippet.title +
                      '<br>streamStatus</b>: ' + response.items[0].status.streamStatus;                    
                      //'<br>streamDescription: ' + response.items[0].snippet.description +
                      //'<br>bound to StreamID: ' + boundStreamId;
                      
                      
      			$('#my-ytevents').append(myEvents_html);
   			});
     	});  
  	});
}

//
//  Spreadsheet
//
//
function requestSSEvents() {

 var ssid = $('#queryss').val();

 $.getJSON( "https://spreadsheets.google.com/feeds/list/" + ssid + "/od6/public/values?alt=json-in-script&callback=?",
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
 var ssid = $('#queryss').val();

 $.getJSON( "https://spreadsheets.google.com/feeds/list/" + ssid + "/od6/public/values?alt=json-in-script&callback=?",


//$.getJSON( "https://spreadsheets.google.com/feeds/list/0Aq3HoBrqezGPdF9STDZ3cTJ4cWc2c0tXdmxFQVVueUE/od6/public/values?alt=json-in-script&callback=?",
	function (data) {	

		$.each(data.feed.entry, function(i,entry) {	
			
			//$('#video-container').append('<br>Title: ' + entry.title.$t + '<br> Description: ' + entry.gsx$description.$t + '<br> Start: ' + entry.gsx$scheduledstarttime.$t + '<br> End: ' + entry.gsx$scheduledendtime.$t + '<br>Stream Name: ' + entry.gsx$streamname.$t);

            var request = gapi.client.youtube.liveBroadcasts.insert({
  
               	part: 'snippet,status,contentDetails',
      			resource: {
      				snippet: {
        				scheduledEndTime: entry.gsx$scheduledendtime.$t,
        				scheduledStartTime: entry.gsx$scheduledstarttime.$t,
        				description: entry.gsx$description.$t,
        				title: entry.title.$t
      				},
      				status: {
      					privacyStatus: 'public'
      				},
      				contentDetails: {
      					enableDvr: 'true',
      					monitorStream : {
      						enableMonitorStream: 'true',
      						broadcastStreamDelayMs: 30000
      					}
      				}
     			}
  			});

            request.execute(function(response) {
              	if ('error' in response) {
                	$('#inserted-events').append(response.error.message); 
              	} else {
              	    var vid = response.id;

                	$('#inserted-events').append('<br> Added video: ' + vid);
                	// bind to stream if 
                	if (entry.gsx$streamname.$t != '') {
                	
                 		var request = gapi.client.youtube.liveStreams.list({
							part: 'snippet,id',
							mine: true

						});
						request.execute(function(response) {
						    var listitems = response.result.items;
    						jQuery.each(listitems, function(index, item) {
        						if (item.snippet.title == entry.gsx$streamname.$t) {
        							ssid = item.id;
        							
 									var request = gapi.client.youtube.liveBroadcasts.bind({
										part: 'id,snippet,contentDetails,status',
										id: vid,
										streamId: ssid
									});
									request.execute(function(response) {
										if ('error' in response) {
											$('#inserted-events').append(response.error.message); 
										} else {
											$('#inserted-events').append('<br>Bound video:' + response.id  + ' to stream: ' + response.contentDetails.boundStreamId);
										}
									});
        						}
    						});
						});
	               	}
               	}             
		    });
		});
	});
}



