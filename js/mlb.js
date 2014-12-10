var oTable = null;
var giRedraw = false;

var itemsReceived = 0;
var progress = '';
// Some variables to remember state.
var playlistId, nextPageToken, prevPageToken;
var contentOwner;

// Keeps track of the currently authenticated user's YouTube user ID.
var channelId;
var tableofvideos, t_videos;
var tablebody, t_body;
var v_uploads = [];
var DAYSBACK = 1;
var EMBARGOHOURS = 40;

var giRedraw = false;
var bAutoRun = false;

function AutoRun() {

	//console.log("AutoRun");
	if (oTable) { 
		oTable.fnDestroy();
		oTable = null;
	}
	//Remove all the DOM elements
	$('#video-details').empty();
	$('#channel-container').empty();
	$("#autorun-message").html ('<b> AUTORUN IS ACTIVE - Restriction policy on expired videos will be lifted </b>');

	v_uploads = [];
	loadTable();

}


$(document).ready(function() {


	$('#autorun').change(function() {
		AUTORUNMINS = $('#autorun').val();
		
		if (AUTORUNMINS > 0) {
			//console.log(AUTORUNMINS);
			$("#autorun-message").html ('<b> AUTORUN IS ACTIVE - Restriction policy on expired videos will be lifted </b>');
			bAutoRun = true;
			setInterval(AutoRun, AUTORUNMINS * 60000);
		}
/*
    	if (oTable != null) {
    	
    	    if (confirm("Load videos from " + DAYSBACK + " days back") == true) {
        		//alert('table' + oTable);
				oTable.fnDestroy();
				//Remove all the DOM elements
				$('#video-details').empty();
				$('#channel-container').empty();
				v_uploads = [];
				loadTable();

    		} 
      	}

*/
	});

	
	$('#myLookback').change(function() {
		DAYSBACK = $('#myLookback').val();
    	//alert('Retrieving videos for the last ' + DAYSBACK + 'days');

    	if (oTable != null) {
    	
    	    if (confirm("Load videos from " + DAYSBACK + " days back") == true) {
        		//alert('table' + oTable);
				oTable.fnDestroy();
				//Remove all the DOM elements
				$('#video-details').empty();
				$('#channel-container').empty();
				v_uploads = [];
				loadTable();

    		} 
      	}


	});


	var policyupdate = [];

	$('#apply-policy-monetize').button().click(function() {

		$('#video-details').find('input[type="checkbox"]:checked').each(function () {
		   //this is the current checkbox
		   //console.log(this.id);
		   //$('#policy-update').html ('
		   
		   policyupdate.push(this.id);
		   
		});
		
		$('#policy-update').html ('Preparing to update ' + policyupdate.length + ' videos with "Monetize all countries"');
		
		jQuery.each(policyupdate, function (index, value) {
			//console.log(policyupdate);
			$('#policy-update').append ('<br>Updating video' + value + '. Video ' + (index+1) + ' of ' + (policyupdate.length));
				cidUnblock (value);
		
			setTimeout(function() {
      			console.log("1 sec wait");
			}, 1000);

		
		
			if ((index+1) == (policyupdate.length)) {
			
				setTimeout(function() {
      				//location.reload();
				}, 4000);

			
			}
		
		
		});
		policyupdate = [];

	});	
	
	$('#apply-policy-restrict').button().click(function() {

		$('#video-details').find('input[type="checkbox"]:checked').each(function () {
		   //this is the current checkbox
		   //console.log(this.id);
		   //$('#policy-update').html ('
	   
		   policyupdate.push(this.id);
	   
		});
	
		$('#policy-update').html ('Preparing to update ' + policyupdate.length + ' videos with "Monetize all countries"');
	
		jQuery.each(policyupdate, function (index, value) {
			$('#policy-update').append ('<br>Updating video' + value + '. Video ' + (index+1) + ' of ' + (policyupdate.length));
			cidblock (value);
			
		});
		policyupdate = [];
	});	
	
	
	
});


function convert_time(duration) {
    var a = duration.match(/\d+/g);

    if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
    }

    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    return duration
}


function handleAPILoaded() {
	
	$("#channel-container").show();
	$("#input-container").show();
	$("#notifications").show();
	$("#actions").show();
	 loadTable();
}


// Once the api loads call a function to get the uploads playlist id.
function loadTable() {
  
	// https://developers.google.com/youtube/v3/docs/channels/list
  	var request = gapi.client.youtube.channels.list({
    	part: 'snippet, contentDetails, statistics',
    	onBehalfOfContentOwner: 'mlbam',
    	managedByMe: true,

  	});
  	request.execute(function(response) {
		var channelListItems = response.result.items;
		var thumbnailUrl = response.items[0].snippet.thumbnails.default.url;
		var channel_title = "";
		var channel_desc = "";
		var channel_viewcount = "";
		var channel_date;
		var channel_videos;
		jQuery.each(channelListItems, function(index, item) {
			if (item.snippet.title == 'MLB') {
				playlistId = item.contentDetails.relatedPlaylists.uploads;
				thumbnailUrl = item.snippet.thumbnails.default.url;
				channel_title = item.snippet.title;
				channel_desc = item.snippet.description;
				channel_viewcount = item.statistics.viewCount;
				channel_subcount = item.statistics.subscriberCount;
				channel_date = new Date(item.snippet.publishedAt);
				channel_videoscount = item.statistics.videoCount;
				return;
			}
		});
		var channel_html = '<b> ' +  channel_title + '</b>';
		var imgEl = $('<img>');
		imgEl.attr('src', thumbnailUrl);
		$('#channel-container').append(imgEl);
		channel_html += '<br><small> view count: ' + $.number(channel_viewcount);
		channel_html += '<br> subscribers: ' + $.number(channel_subcount); 	
		channel_html += '<br> videos: ' + $.number(channel_videoscount);	
		//channel_html += '<br> created: ' + channel_date.toDateString() + '</small><br><br>';  
		//channel_html += '<br> looking back ' + DAYSBACK + ' days</small><br>';
		$('#channel-container').addClass('channel-content');
		$('#channel-container').append(channel_html);	
		$('#table-container').spin();
		$('#message').html('Requesting Uploads...');
		requestUserUploadsPlaylistId();	
  	});
}



//Retrieve the uploads playlist id.
function requestUserUploadsPlaylistId() {
  // https://developers.google.com/youtube/v3/docs/channels/list
  var request = gapi.client.youtube.channels.list({
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

  });
  

}





function loadVideoTable() {

  	t_videos = $('<table>');
  	t_videos.attr('id','vid-tab2');
  	t_videos.addClass('display');

  	var thead = $('<thead>');
  	var row = $('<tr>');
  	var cellhead = $('<th>');
  	
  	cellhead.append('Published At');
  	row.append (cellhead);

  	var cellhead = $('<th>');
  	cellhead.append('Title');
  	row.append (cellhead);
  	
  	var cellhead = $('<th>');
  	cellhead.append('VideoID');
  	row.append (cellhead);

    var cellhead = $('<th>');
  	cellhead.append('Privacy');
  	row.append (cellhead);

    var cellhead = $('<th>');
  	cellhead.append('Duration');
  	row.append (cellhead);

    var cellhead = $('<th>');
  	cellhead.append('Embargo Time Left');
  	row.append (cellhead);

    var cellhead = $('<th>');
  	cellhead.append('Embargo Time Left Sort');
  	row.append (cellhead);
 
    var cellhead = $('<th>');
    cellhead.append('<input id="checkall" class="checkall" type="checkbox"></input>');
  	cellhead.append('Region Restriction');
  	row.append (cellhead);

  	var cellhead = $('<th>');
  	cellhead.append('Tags');
  	row.append (cellhead);

	// header
	thead.append(row);
	t_videos.append(thead);
	$('#video-details').append(thead);
	
	
	// main table
	oTable = $('#video-details').dataTable({
		   		"fnInitComplete": function(oSettings, json) {
      				$("#checkall").on('click',function(e){
          				var chk = $(this).prop('checked');
          		 			$('input', oTable.$('tbody tr', {"filter": "applied"} )).prop('checked',chk);
							e.stopPropagation();
      				});
    			},
    			"bDestroy": true,
				"bJQueryUI": true,
	         	"bAutoWidth": false,
	         	"iDisplayLength": 25,
	         	"aaSorting": [[ 6, "asc" ]],
        		"sPaginationType": "full_numbers",
        		"aoColumns": [ null, null, null, null, null, null, {"sType": "numeric", "bVisible": false }, null, { "bVisible": false }],
   	});

	//console.log(v_uploads.length);

	jQuery.each(v_uploads, function(index, videoId) {
	
		var expiredvideo = false;
		var restrictedvideo = 0;
		
		requestOptions = {
			mine: true,
			part: 'id, snippet, status, contentDetails, statistics',
			id: videoId,
			onBehalfOfContentOwner: 'mlbam'
  		};
  		var request = gapi.client.youtube.videos.list(requestOptions);
  		request.execute(function(response) {
  			//console.log(response);
  			
  			if (!response.result) return;
  			
			item = response.result.items[0];


			var publish_date = new Date(item.snippet.publishedAt);
			var embargo_date = new Date(item.snippet.publishedAt);
			
			embargo_date.setHours(publish_date.getHours()+EMBARGOHOURS);
			

			r_html = '<input id="' + item.id + '" type="checkbox">';
			
			if ('regionRestriction' in item.contentDetails) {
   
				
				//r_html = '<region>' + item.contentDetails.regionRestriction.blocked + '</region>';
				//r_html += ' <button onclick="cidUnblock(\'' + item.id + '\');">Unblock</button>';
				
				r_html += '<region><label for="' + item.id + '">' + item.contentDetails.regionRestriction.blocked +  '</label></region>';
   				restrictedvideo = videoId;
			}
			else {
			
				r_html += '<label for="' + item.id + '">None</label>'
			
			}
  
		
			var v3duration = item.contentDetails.duration;
				 	
				 	//console.log(v3duration);
			if (v3duration.indexOf('S') == -1) {
				 	v3duration += '0S';
			}
			
			var watch_url = "http://www.youtube.com/watch?v=" + item.id;
				 	
			var id_link = '<a href="'+ watch_url + '" >' + item.id + '</a>';
			
			var tags_html = '<tags>' + item.snippet.tags + '</tags>';
			today = new Date();
			time_left = embargo_date - today;
			
			var strTimeLeft = 'expired';
			if (time_left > 0) {
			
			 	strTimeLeftHours = Math.floor(time_left / (1000*60*60));
			 	strTimeLeftMins = time_left % (1000*60*60);
			 	strTimeLeft = strTimeLeftHours + ' hours ' + Math.round(strTimeLeftMins / (60000)) + ' mins';
			}
			
			if (time_left < 0) time_left = EMBARGOHOURS * 60 * 60 * 1000;
			
			
			if ((strTimeLeft == 'expired') && (restrictedvideo != 0)) { 
			
				//console.log("AutoRun = " + bAutoRun);
				if (bAutoRun == false) {
					$('#message').append("<br>" + restrictedvideo + " has expired and is restricted");
				}
				else {
					cidUnblock(restrictedvideo);
					//console.log("Autorun against " + restrictedvideo);
				
				}
				
			}
			
			$('#video-details').dataTable().fnAddData ( [
				//'<small>' + publish_date.toDateString() + ' ' + publish_date.toTimeString()+'</small>',
				publish_date.toLocaleString(),
				item.snippet.title,
				id_link,
				item.status.privacyStatus,
				convert_time(v3duration) + 's',
				//item.status.embeddable,
				strTimeLeft,
				//t_left.getHours(),
				time_left,
				r_html,
				tags_html

				 ]
			);
			
		});
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
    //console.log(response.result);

	if (!response.result) return;	
  	
  	var playListItems = response.result.items;
  	var season_date = new Date();
  	var publish_date;
  	season_date.setDate(season_date.getDate()-DAYSBACK);
  	
  	if (itemsReceived > 900) {
  		console.log(response);
  		//console.log(response.result.items);
  	
  	}
  	
  	if (!response.result.items) {
  		$('#message').html('API result undefined ' + itemsReceived + ' items received');  	
  		  	    $('#table-container').spin(false);	
  	    loadVideoTable();  	
  		return;
  		
  	}
  	
  	itemsReceived += response.result.items.length;
  	progress += '.';
  	
  	$('#message').html('Reading ' + itemsReceived + ' items' + progress);
  	

	jQuery.each(playListItems, function(index, item) {
	
		publish_date = new Date(item.snippet.publishedAt);	

		v_uploads.push(item.contentDetails.videoId);
			
		if (publish_date < season_date) {
			return;
		}
		
	});  	
  	
  	if (publish_date < season_date) {

  	    $('#table-container').spin(false);
  	    loadVideoTable();
  	    now = new Date();
		$('#message').html('Received ' + itemsReceived + ' items at ' + now.toLocaleString());
		itemsReceived = 0;
		progress = '';
	
		return;
	}

  	//var list_html = title + '<br>' + description
  	
   	var nextPageToken = response.result.nextPageToken;
  	if (nextPageToken) {
  		createUploadMetaData(playlistId, nextPageToken) 
  	}

  });
  
}



function cidUnblock (v_id) {

	var cur_asset;
	var cur_claimid;
	var new_policy;

	//GET https://www.googleapis.com/youtube/partner/v1/claimList
	var requestOptions = {
		videoId: v_id,
    	onBehalfOfContentOwner: 'mlbam',
   	};

  	var request = gapi.client.youtubePartner.claims.list(requestOptions);
  	request.execute(function(response) {
		console.log("claims list + " + response.result.pageInfo.totalResults);
		
		if (response.result.pageInfo.totalResults == 0 ) {
			error_html = "<br>video " + v_id + "has no claims";
			
			$('#policy-update').append( error_html );
			return;
		
		}
		
		
  		claimListItems = response.result.items;

		jQuery.each(claimListItems, function(index, item) {
			var cid_html = 'Claim id=' + item.id + '<br>Asset id=' + item.assetId + '<br>Status=' + item.status + '<br>Policy=' + item.policy.name + '<br>Origin=' + item.origin.source;
			cur_asset = item.assetId;
			cur_claimid = item.id;
			
			cid_html = "Current Policy is " + item.policy.name + '\n\n' + "Change to Monetize in all countries?";
			//var r = confirm(cid_html);
			
			var r = true;
			
			if (r==true) {
				//alert('applying "Monetize Everywhere" policy'); 
				
				//GET https://www.googleapis.com/youtube/partner/v1/policies
				var requestOptions = {
					onBehalfOfContentOwner: 'mlbam',
				};
				var request = gapi.client.youtubePartner.policies.list(requestOptions);
				request.execute(function(response) {
					//console.log(response.result);
					var policyListItems = response.result.items;
					//var sel_policy = '<select>';
					jQuery.each(policyListItems, function(index, item) {
	  
						//sel_policy += '<option value=' + item.id + '>' + item.name + '</option>';
						//console.log("policy ids=" + item.id + ' policy name=' + item.name);
						if (item.name == 'Monetize in all countries') {
							//console.log("policy id to apply 'Monetize in all countries' = " + item.id);
							new_policy = item.id;
							
							
							//GET https://www.googleapis.com/youtube/partner/v1/claims.patch
							var requestOptions = {
								onBehalfOfContentOwner: 'mlbam',
								claimId: cur_claimid,
								resource: {
									assetId: cur_asset,
									id: cur_claimid,
									videoId: v_id,
									policy: {
										id: new_policy,
									}
								}
							};
							console.log("patch request" + requestOptions);
							//console.log(requestOptions);
							var request = gapi.client.youtubePartner.claims.patch(requestOptions);
							request.execute(function(response) {
								//console.log(response.timeCreated);
								//$('#policy-update').html('video ' + response.id + ' updated at ' + response.timeCreated);
								
								var policy_date_update = new Date();
								
								$('#policy-update').append( '<br>' + policy_date_update.toLocaleString() + ':' + v_id + ' updated');
	
							});

						}
					});
				});
			}
		});
	});
}


function cidblock (v_id) {

	var cur_asset;
	var cur_claimid;
	var new_policy;

	//GET https://www.googleapis.com/youtube/partner/v1/claimList
	var requestOptions = {
		videoId: v_id,
    	onBehalfOfContentOwner: 'mlbam',
   	};

  	var request = gapi.client.youtubePartner.claims.list(requestOptions);
  	request.execute(function(response) {

  		claimListItems = response.result.items;

		jQuery.each(claimListItems, function(index, item) {
			var cid_html = 'Claim id=' + item.id + '<br>Asset id=' + item.assetId + '<br>Status=' + item.status + '<br>Policy=' + item.policy.name + '<br>Origin=' + item.origin.source;
			cur_asset = item.assetId;
			cur_claimid = item.id;
			
			cid_html = "Current Policy is " + item.policy.name + '\n\n' + "Change to mlb-2014-vod?";
			var r = confirm(cid_html);
			
			
			
			if (r==true) {
				//alert('applying "Monetize Everywhere" policy'); 
				
				//GET https://www.googleapis.com/youtube/partner/v1/policies
				var requestOptions = {
					onBehalfOfContentOwner: 'mlbam',
				};
				var request = gapi.client.youtubePartner.policies.list(requestOptions);
				request.execute(function(response) {
					//console.log(response.result);
					var policyListItems = response.result.items;
					//var sel_policy = '<select>';
					jQuery.each(policyListItems, function(index, item) {
	  
						//sel_policy += '<option value=' + item.id + '>' + item.name + '</option>';
						//console.log("policy ids=" + item.id + ' policy name=' + item.name);
						if (item.name == 'mlb-2014-vod') {
							//console.log("policy id to apply 'mlb-2014-vod' = " + item.id);
							new_policy = item.id;
							
							
							//GET https://www.googleapis.com/youtube/partner/v1/claims.patch
							var requestOptions = {
								onBehalfOfContentOwner: 'mlbam',
								claimId: cur_claimid,
								resource: {
									assetId: cur_asset,
									id: cur_claimid,
									videoId: v_id,
									policy: {
										id: new_policy,
									}
								}
							};
							//console.log("patch request" + requestOptions);
							//console.log(requestOptions);
							var request = gapi.client.youtubePartner.claims.patch(requestOptions);
							request.execute(function(response) {
								//console.log(response);
								
								setTimeout(function() {
      								location.reload();

								}, 2000);

							});

						}
					});
				});
			}
		});
	});
}






