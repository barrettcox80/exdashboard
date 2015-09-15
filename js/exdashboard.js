/*---------------------------------------------------------------------------------------------------
    
    Experiment Dashboard JS, v0.7

	Authors     : Barrett Cox, http://barrettcox.com
	              Amy Wu, http://duende.us

	Description : Loads data from a Google spreadsheet and displays
	              a dashboard UI for experiment iteration

---------------------------------------------------------------------------------------------------*/


;(function ( $ ) {

	/* Find the absolute path to the JS directory */
	var scripts = document.getElementsByTagName("script");
	var scriptSrc = scripts[scripts.length-1].src;
	var dir = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));

	$.exDashboard = function (params) {

		// Store a reference to this object prototype to
		// use as a reference within the methods
		var thisExDashboard = this;
	    
	    // The unique ID for the Google master spreadsheet
	    this.sheetID = params.sheet_id;

	    // The position (left to right) of the Idea and Experiment sub sheets
	    this.experimentSheetPos = params.experiment_sheet_pos;
	    this.ideaSheetPos       = params.idea_sheet_pos;
	    
	    // Arrays
	    this.ideas         = [];
	    this.experiments   = [];
	    this.activeIdeas   = [];
	    this.inactiveIdeas = [];

	    // Construct urls for the spreadsheets
		this.ideasUrl = 'https://spreadsheets.google.com/feeds/list/' + this.sheetID + '/' + this.ideaSheetPos + '/public/values?alt=json';
		this.experimentsUrl = 'https://spreadsheets.google.com/feeds/list/' + this.sheetID + '/' + this.experimentSheetPos + '/public/values?alt=json';
		
		// Page urls
		this.dashboardPageUrl  = params.dashboard_page_url;
		this.experimentPageUrl = params.experiment_page_url;
		this.ideaPageUrl       = params.idea_page_url;

		// The url for the Mustache.js templates
		this.templateURL = dir + '/mustache-templates/templates.html';
		

		/*-----------------------------------------------
		    Organize the sheet data into separate arrays
		-----------------------------------------------*/
		this.initializeDashboard = function () {

			/*-------------------------------------------
			    AJAX request for the ideas and
			    push them onto ideas[] array
			-------------------------------------------*/
			$.ajax({
			    async: false, //So the global variables are updated before moving on
			    url: thisExDashboard.ideasUrl,
			    success: function(data) {

				 	// Create a JSON object for each idea and add it to an array
					$.each( data.feed.entry, function() {

						// Replace spaces in experiment name with hyphens
						// for the url parameters
						var bigideaParam = thisExDashboard.paramString(this.gsx$bigidea.$t);
						var bigBetTruncated = thisExDashboard.trimText(this.gsx$bigbet.$t, 50);
						var tweetableHeadline = this.gsx$tweetableheadline.$t + '&nbsp;&rarr;';

						ideaVars = {
						    bigidea: this.gsx$bigidea.$t,
						    tweetableheadline: tweetableHeadline,
						    bigideaparam: bigideaParam,
						    imageurl: this.gsx$imageurl.$t,
						    createddate: this.gsx$createddate.$t,
						    status: this.gsx$status.$t, 
						    idea: this.gsx$idea.$t,
						    outcome: this.gsx$outcome.$t,
						    bigbet: this.gsx$bigbet.$t,
						    bigbettruncated: bigBetTruncated,
						    assumptions: this.gsx$assumptions.$t,
						    questions: this.gsx$questions.$t,
						    folderurl: this.gsx$folderurl.$t,
						    ststrategyatus: this.gsx$strategy.$t,
						    emptyclass: 'ed-td-idea-empty', // Default to empty
						    lastexperimentdate: '',
						    detailpageurl: thisExDashboard.ideaPageUrl
						};

						// Push onto ideas[] array
					    thisExDashboard.ideas.push(ideaVars);

					}); /*-- $.each() --*/
				} /*-- success --*/
			}); /*-- $.ajax --*/

			
			/*-------------------------------------------
			    Create separate arrays for
			    	active/inactive arrays
			-------------------------------------------*/
			$.each( thisExDashboard.ideas, function(index, value) {

				if (value.status.toLowerCase() == 'inactive') {
					thisExDashboard.inactiveIdeas.push(value);
				} else {
					thisExDashboard.activeIdeas.push(value);
				}
			}); /*-- $.each --*/


			/*-------------------------------------------
			    AJAX request for the experiments and
			    push them onto experiments[] array
			-------------------------------------------*/
			$.ajax({
			    async: false, //So the global variables are updated before moving on
			    url: thisExDashboard.experimentsUrl,
			    success: function(data) {
				
				 	// Create a JSON object for each idea and add it to an array
					$.each( data.feed.entry, function() {

						var stageClass = '';
						var stageNum = '';
						var stageText = this.gsx$stage.$t;
						var helpClass = 'ed-help';
						var endDate = this.gsx$enddate.$t;
						var endDateObject = thisExDashboard.parseDate(endDate);
						var mvpTruncated = thisExDashboard.trimText(this.gsx$mvp.$t, 50);
						var today = new Date();

						// CSS class and number for stage
						if (stageText == 'Design') {
							stageClass = 'ed-td-stage-design';
							stageNum   = ' 1';
						} else if (stageText == 'Running') {
							stageClass = 'ed-td-stage-running';
							stageNum   = ' 2';

						} else if (stageText == 'Debrief') {
							stageClass = 'ed-td-stage-debrief';
							stageNum   = ' 3';
						} else {
							stageClass = 'ed-td-stage-complete';
							stageNum   = '';

						}

						// If an endDate is valid, and endDate is today or earlier,
						// then use a different CSS class
						if (thisExDashboard.isValidDate(endDateObject) != false) {
							if (thisExDashboard.parseDate(endDate) <= today) {
								stageClass = 'ed-td-stage-complete';
								stageText  = 'Done';
								stageNum   = '';

							}
						}

						if (this.gsx$helpneeded.$t != '') {
							helpClass += ' needed';
						}

						// Replace spaces in experiment name with hyphens
						// for the url parameters
						var experimentParam = thisExDashboard.paramString(this.gsx$experimentcodename.$t);
						var experimentIdea = this.gsx$idea.$t;
						var experimentStartDate = this.gsx$startdate.$t;
						var tweetableHeadline = this.gsx$tweetableheadline.$t + '&nbsp;&rarr;';

						experimentVars = {
						    idea: experimentIdea,
						    bigbet: this.gsx$bigbet.$t,
						    tweetableheadline: tweetableHeadline,
						    experimentcodename: this.gsx$experimentcodename.$t,
						    experimentparam: experimentParam,
						    stage: stageText,
						    startdate: experimentStartDate,
						    enddate: endDate,
						    nextsteps: this.gsx$nextsteps.$t,
						    mvp: this.gsx$mvp.$t,
						    mvptruncated: mvpTruncated,
						    stagecssclass: stageClass,
						    stagenum : stageNum,
						    helpclass : helpClass,
						    detailpageurl: thisExDashboard.experimentPageUrl
						};

						// Add experiemnt to the experiments array
					    thisExDashboard.experiments.push(experimentVars);

					}); /*-- $.each() --*/
				} /*-- function --*/
			}); /*-- $.ajax --*/
		};
		/*- initializeDashboard -----------------------*/


		/*-----------------------------------------------
		    Find the most recent date of the experiments
		    	for each idea, add that date value to
		    	the object of each idea, and sort
		    	ideas by date
		-----------------------------------------------*/
		this.getRecentDates = function() {
			
			thisExDashboard.findRecentDates(thisExDashboard.activeIdeas);
			thisExDashboard.findRecentDates(thisExDashboard.inactiveIdeas);

			// Sort the ideas by their most recent experiment date
			thisExDashboard.activeIdeas.sort(thisExDashboard.sortDesc);
			thisExDashboard.inactiveIdeas.sort(thisExDashboard.sortDesc);
		};
		/*- getRecentDates ----------------------------*/


		/*-----------------------------------------------
		   Returns trimed paragraph text
		-----------------------------------------------*/
		this.trimText = function(paragraphString, charLimit) {

			var trimmed = paragraphString;
			
			// If not empty string, trim text and add a right arrow
			if (trimmed != '') {
				// Trim to the charLimit
				trimmed = $.trim(paragraphString).substring(0, charLimit);
				
				// Re-trim if we are in the middle of a word
				trimmed = trimmed.substr(0, Math.min(trimmed.length, trimmed.lastIndexOf(" ")));

				// Add the ellipsis and right arrow
				trimmed += '&#8230;&nbsp;&rarr;';
			}
			
			return trimmed;
		};
		/*- trimText ---------------------------------*/


		/*-----------------------------------------------
		    Prepares strings to be used as url params
		-----------------------------------------------*/
		this.paramString = function (str) {
			str = str.replace(/[^a-z0-9\s]/gi, ''); // Filter the string down to just alphanumeric characters
			str = str.replace(/ +(?= )/g,'');       // Remove occurences of multiple spaces
			str = str.replace(/[_\s]/g, '-');       // Replace underscores and spaces with hyphens
			str = str.toLowerCase();
			return str;
		};
		/*- paramString -------------------------------*/


		/*-----------------------------------------------
		    Parse a date in mm/dd/yyyy format
		-----------------------------------------------*/
		this.parseDate = function (input) {
		  var parts = input.split('/');
		  // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
		  return new Date(parts[2], parts[0]-1, parts[1]); // Note: months are 0-based
		};
		/*- parseDate ---------------------------------*/


		/*-----------------------------------------------
		    Returns true if date is valid
		    Source : http://solvedstack.com/questions/detecting-an-invalid-date-date-instance-in-javascript
		-----------------------------------------------*/
		this.isValidDate = function (d) {
		  if ( Object.prototype.toString.call(d) !== "[object Date]" )
		    return false;
		  return !isNaN(d.getTime());
		};
		/*- isValidDate -------------------------------*/


		/*-----------------------------------------------
		    Creates idea/experiment(s) rows
		    	for the Dashboard table
		-----------------------------------------------*/
		this.insertRows = function (objectArrayRef, cssRowClass) {

			var htmlString = '';

			$.each( objectArrayRef, function() {

				var bigidea = this.bigidea;
				var emptyClass = 'ed-td-idea-empty' // Default to empty;
				var matchingExperiments = [];
				var experimentCells = [];

				htmlString += '<tr class="' + cssRowClass + '">';

			    // Add each experiments for this idea to a cell
			    $.each( thisExDashboard.experiments, function() {
			    	if (this.idea == bigidea) {

			    		// 1 or more experiments exist for this idea, so use full class name for the Idea
			    		emptyClass = 'ed-td-idea-full';

			    		matchingExperiments.push(this);			    		
			    	}
			    });

			    // Sort the experiments by start date
			    matchingExperiments.sort(thisExDashboard.sortExperimentsDesc);

			    $.each( matchingExperiments, function() {
			    	// Add the experiment cell to the row
				    exTemplate = $('#experimentTableCell').html();
				    experimentCells += Mustache.to_html(exTemplate, this);

				});



			    // Add the class name to the JSON object
			    this.emptyclass = emptyClass;

			    template = $('#ideaTableCell').html();
				cell = Mustache.to_html(template, this);
			    htmlString += cell;
			    htmlString += '<td class="ed-experiments-cell">';
			    htmlString += '<div class="ed-experiments-cell-container">';
			    htmlString += experimentCells;
			    htmlString += '</div>';
			    htmlString += '</td>';
			    htmlString += '</tr>';

			});

			$('.ed-table-dashboard > tbody:last-child').append(htmlString);
		};
		/*- insertRows --------------------------------*/


		/*-----------------------------------------------
		    Adds the toggle button row
		-----------------------------------------------*/
		this.insertToggleRow = function () {
			var toggleButtonString = '<tr><td><button id="toggle-ideas" data-toggle="hidden">Show All</button></td></tr>';
			$('.ed-table-dashboard > tbody:last-child').append(toggleButtonString);

			/*---------------------------------------
			    Toggle button click event
			---------------------------------------*/
			$('#toggle-ideas').click(function() {
				thisExDashboard.toggleIdeas();
			}); 
		};
		/*- insertToggleRow ---------------------------*/


		/*-----------------------------------------------
		    Creates the Dashboard table
		-----------------------------------------------*/
		this.makeTable = function (elementID) {

			var items     = [];
			var row       = '';
			var cell      = '';
			var template  = '';
			var exTemplate = '';
			//var templateContainerID = 'mustache-templates';

			// Sort ideas by their most recent experiment
			thisExDashboard.getRecentDates();

			items.push('<thead>');
			items.push('<th>Ideas</th>');
		    items.push('<th>Experiments</th>');
			items.push('</thead>');
		    items.push('<tbody>');

			items.push('</tbody>');

		  	// Load the mustache templates
			$( '<div/>', { 'id': 'mustache-templates'})
				.appendTo( 'body' )
				.css('visibility','hidden')
				//.load(thisExDashboard.templateURL, function() {

				.load( thisExDashboard.templateURL, function( response, status, xhr ) {
				  if ( status == "error" ) {
				    var msg = "Sorry but there was an error: ";
				    $( "#error" ).html( msg + xhr.status + " " + xhr.statusText );
				  }
				
				// Templates have loaded. Now...

				// Append the table
				$( '<table/>', {
			    	'class': 'ed-table-dashboard',
			    	html: items.join( '' )
			  	}).appendTo( elementID );

				// Insert active idea rows
				thisExDashboard.insertRows(thisExDashboard.activeIdeas, 'idea-active');
				
				// Insert row for toggle button
				thisExDashboard.insertToggleRow();

			});
		};
		/*- makeTable ---------------------------------*/


		/*-----------------------------------------------
		    Sorts the ideas in descending order
		-----------------------------------------------*/
		this.sortDesc = function (a,b) {
			if (a.lastexperimentdate > b.lastexperimentdate)
		    	return -1;
			if (a.lastexperimentdate < b.lastexperimentdate)
		    	return 1;
			return 0;
		};
		/*- sortDesc ----------------------------------*/


		/*-----------------------------------------------
		    Sort experiments by start date in
		    	descending order
		-----------------------------------------------*/
		this.sortExperimentsDesc = function (a,b) {
			if (a.startdate > b.startdate)
		    	return -1;
			if (a.startdate < b.startdate)
		    	return 1;
		  	return 0;
		};
		/*- sortExperimentsDesc -----------------------*/


		/*-----------------------------------------------
		    Find the most recent date in the experiments
		    	for each idea
		-----------------------------------------------*/
		this.findRecentDates = function (ideaArrayRef) {
			$.each( ideaArrayRef, function() {
												
				var bigidea = this.bigidea;
				var maxDate = '';

				// Find the experiment(s) for this idea
				$.each( thisExDashboard.experiments, function() {

			    	if (this.idea == bigidea) {

			    		var otherDate = thisExDashboard.parseDate(this.startdate);

			    		if (maxDate == '') {
			    			maxDate = otherDate;
			    		} else {
			    			maxDate = new Date(Math.max.apply(null,[maxDate,otherDate]));
			    		}
			    	}

				});

				// Add the most recent epxperiment dates to the idea objects
				this.lastexperimentdate = maxDate;

			});
		};
		/*- findRecentDates ---------------------------*/


		/*-----------------------------------------------
		    Shows the inactive ideas
		-----------------------------------------------*/
		this.toggleIdeas = function () {
			if ($('#toggle-ideas').attr( 'data-toggle') == 'hidden') {
				$('#toggle-ideas').attr( 'data-toggle', 'visible' );
				$('#toggle-ideas').text('Hide Inactive');
				thisExDashboard.insertRows(thisExDashboard.inactiveIdeas, 'idea-inactive');
			} else {
				$('#toggle-ideas').attr( 'data-toggle', 'hidden' );
				$('#toggle-ideas').text('Show All');
				$('tr.idea-inactive').remove();
			}
		};
		/*- toggleIdeas -------------------------------*/


		/*-----------------------------------------------
		    Returns an HTML list of links
		-----------------------------------------------*/
		this.listLinks = function (linkString) {
			var linkArray = linkString.split(']'); // Divide the link string
			var linkItems = '<ul>'; // A place to store the HTML list

			(function($){

				linkArray = linkArray.slice(0,-1); // Remove the last empty item from the array

				$.each( linkArray, function() {
					var str = this.replace('[', '');
					var linkAndText = str.split(',');
					str = '<li><a href="'+linkAndText[1].replace(' ', '')+'" target="_blank">'+linkAndText[0]+'</a></li>';
					linkItems += str;
				});

				linkItems += '</ul>';

			})(jQuery); /*-- jQuery --*/

			return linkItems;
		};
		/*- listLinks ---------------------------------*/


		/*-----------------------------------------------
		    Returns the number of experiments
		    that require help
		-----------------------------------------------*/
		this.helpNeededCount = function () {

			var helpNeededCount = 0;

		 	// For each experiment that requires help, increment helpNeededCount
			$.each( thisExDashboard.experiments, function() {
				if (this.helpclass == 'ed-help needed') {
					helpNeededCount++;
				}
			});

			return helpNeededCount;
		};
		/*- helpNeededCount --------------------------*/


		/*-----------------------------------------------
		    Appends the widget to the element
		-----------------------------------------------*/
		this.insertWidget = function () {

			var widgetVars = {
				activeideacount : thisExDashboard.activeIdeas.length,
				experimentcount : thisExDashboard.experiments.length,
				helpneededcount : thisExDashboard.helpNeededCount()
			}

			// Load the mustache templates
			$( '<div/>', { 'id': 'mustache-templates'})
				.appendTo( 'body' )
				.css('visibility','hidden')
				.load(thisExDashboard.templateURL, function() {

				// Templates have loaded. Now...

				// Populate the template
				var template = $('#experimentWidgetTable').html();
				var templateHTML = Mustache.to_html(template, widgetVars);

				// Insert HTML into the DOM
				$('#ed-widget').html(templateHTML);

			});
		};
		/*- insertWidget ------------------------------*/

		/*-----------------------------------------------
		    Return UTM variables as an
		    associative array
		-----------------------------------------------*/
		this.parseUrlString = function(urlString) {
			var vars = [], hash;
		    var hashes = urlString.slice(urlString.indexOf('?') + 1).split('&');
		    for(var i = 0; i < hashes.length; i++) {
		        hash = hashes[i].split('=');
		        vars.push(hash[0]);
		        vars[hash[0]] = hash[1];
		    	
		    }
		    return vars;
		};
		/*- getUrlVars --------------------------------*/

		/*-----------------------------------------------
		    Read a page's GET URL variables and return
		    	them as an associative array.
		-----------------------------------------------*/
		this.getUrlVars = function () {
		    var vars = [], hash;
		    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		    for(var i = 0; i < hashes.length; i++) {
		        hash = hashes[i].split('=');
		        vars.push(hash[0]);
		        vars[hash[0]] = hash[1];
		    }
		    return vars;
		};
		/*- getUrlVars --------------------------------*/


		/*-----------------------------------------------
		    Returns Drive ID from url string
		-----------------------------------------------*/
		this.getDriveId = function (urlString) {
			var childDir = 0;
			var directories = urlString.split('/');
			for(var i = 0; i < directories.length; i++) {
		    	if (directories[i] == 'd') {
		    		childDir = i + 1;
		    		return directories[childDir];
		    	}
		    }
		    return false;
		};
		/*- getDriveId --------------------------------*/


		/*-----------------------------------------------
		    Loads the mustache templates, inserts the
		    	data, and adds the html to the DOM
		-----------------------------------------------*/
		this.populateTemplate = function(elementID, entryVars, templateId) {
				//var template      = '';
				var templateHTML  = '';
				//var entryVars     = {};
				//var utmParam = thisExDashboard.getUrlVars()['ex'];
				//var experimentName = '';

				// Load the mustache templates
				$( '<div/>', { 'id': 'mustache-templates'})
					.appendTo( 'body' )
					.css('visibility','hidden')
					.load(thisExDashboard.templateURL, function() {

					// Templates have loaded. Now...

					// Populate the template
					template = $(templateId).html();
					templateHTML = Mustache.to_html(template, entryVars);

					// Insert HTML into the DOM
					$(elementID).html(templateHTML);

					// Break the .each loop
					return false;
				});
		};
		/*- populateTemplate --------------------------*/


		/*-----------------------------------------------
		    Grabs the main content for a particular
		    	experiment and then calls
		    	populateTemplate to inject
		    	it in the DOM
		-----------------------------------------------*/
		this.insertExperimentMainContent = function(elementID) {

			var templateId = '#experimentMainContent';

			$.getJSON( thisExDashboard.experimentsUrl, function( data ) {
				
				var entryVars       = {};
				var experimentParam = thisExDashboard.getUrlVars()['ex'];

				$.each( data.feed.entry, function() {

					/*--------------------------------------------------------
					   If the utm param matches the experiment name string
					--------------------------------------------------------*/
					if ( thisExDashboard.paramString(this.gsx$experimentcodename.$t) == experimentParam ) {

						entryVars = {
						    tweetableheadline: this.gsx$tweetableheadline.$t,
						    mvp: thisExDashboard.insertBreaks(this.gsx$mvp.$t, false),
						    hypothesis: thisExDashboard.insertBreaks(this.gsx$hypothesis.$t, false),
						    mvpdesign: thisExDashboard.insertBreaks(this.gsx$mvpdesign.$t, false),
						    keylearnings: thisExDashboard.insertBreaks(this.gsx$keylearnings.$t, false)
						};

					} 

				}); /*-- $.each --*/

				thisExDashboard.populateTemplate(elementID, entryVars, templateId);
														 
			}); /*-- .getJSON --*/
		};
		/*- insertExperimentMainContent ---------------*/


		/*-----------------------------------------------
		    Grabs the meta content for a particular
		    	experiment and then calls
		    	populateTemplate to inject
		    	it in the DOM
		-----------------------------------------------*/
		this.insertExperimentMeta = function(elementID) {

			var templateId = '#experimentMeta';

			$.getJSON( thisExDashboard.experimentsUrl, function( data ) {
				
				var entryVars       = {};
				var utmParam = thisExDashboard.getUrlVars()['ex'];

				$.each( data.feed.entry, function() {

					/*--------------------------------------------------------
					   If the utm param matches the experiment name string
					--------------------------------------------------------*/
					if ( thisExDashboard.paramString(this.gsx$experimentcodename.$t) == utmParam ) {
						
						var folderLink = '';

						/*-- Set the experiment name for the h1 --*/
						//experimentName = this.gsx$experimentcodename.$t;

						/*-- Create a list of document links --*/
						var documentList = thisExDashboard.listLinks(this.gsx$documents.$t);

						/*-- Create a list of blog links --*/
						var blogList = thisExDashboard.listLinks(this.gsx$blogposts.$t);

						/*-- Create a link to the experimentcodename folder --*/
						folderLink = '<a href="'+this.gsx$folderurl.$t+'" target="_blank">'+this.gsx$folderurl.$t+'</a>';

						entryVars = {
						    stage: this.gsx$stage.$t,
						    startdate: this.gsx$startdate.$t,
						    enddate: this.gsx$enddate.$t,
						    folderurl: folderLink,
						    documents: documentList,
						    blogposts: blogList,
						    team: this.gsx$team.$t,
						    googlegroup: this.gsx$googlegroup.$t,
						    contact: this.gsx$contact.$t
						};

					} 

				}); /*-- $.each --*/

				thisExDashboard.populateTemplate(elementID, entryVars, templateId);
														 
			}); /*-- .getJSON --*/
		};
		/*- insertExperimentMeta ---------------*/


		/*-----------------------------------------------
		    Grabs the meta content for a particular
		    	experiment and then calls
		    	populateTemplate to inject
		    	it in the DOM
		-----------------------------------------------*/
		this.insertExperimentAlerts = function(elementID) {

			var templateId = '#experimentAlerts';

			$.getJSON( thisExDashboard.experimentsUrl, function( data ) {
				
				var entryVars = {};
				var utmParam  = thisExDashboard.getUrlVars()['ex'];

				$.each( data.feed.entry, function() {

					/*--------------------------------------------------------
					   If the utm param matches the experiment name string
					--------------------------------------------------------*/
					if ( thisExDashboard.paramString(this.gsx$experimentcodename.$t) == utmParam  ) {

						entryVars = {
						    nextsteps: thisExDashboard.insertBreaks(this.gsx$nextsteps.$t, false),
			    			helpneeded: thisExDashboard.insertBreaks(this.gsx$helpneeded.$t, false)		 
						};

					} 

				}); /*-- $.each --*/

				thisExDashboard.populateTemplate(elementID, entryVars, templateId);
														 
			}); /*-- .getJSON --*/
		};
		/*- insertExperimentAlerts --------------------*/


		/*-----------------------------------------------
		    Grabs the main content for a particular
		    	idea and then calls populateTemplate
		    	to inject it in the DOM
		-----------------------------------------------*/
		this.insertIdeaMainContent = function(elementID) {

			var templateId = '#ideaMainContent';

			$.getJSON( thisExDashboard.ideasUrl, function( data ) {
				
				var entryVars = {};
				var utmParam  = thisExDashboard.getUrlVars()['idea'];

				$.each( data.feed.entry, function() {

					/*--------------------------------------------------------
					   If the utm param matches the experiment name string
					--------------------------------------------------------*/
					if ( thisExDashboard.paramString(this.gsx$bigidea.$t) == utmParam ) {

						var folderLink = '';

						/*-- Set the idea name for the h1 --*/
						//ideaName = this.gsx$bigidea.$t;

						/*-- Create a link to the experiment folder --*/
						folderLink = '<a href="'+this.gsx$folderurl.$t+'" target="_blank">'+this.gsx$folderurl.$t+'</a>';

						entryVars = {
							bigidea: this.gsx$bigidea.$t,
							imageurl: this.gsx$imageurl.$t,
						    createddate: this.gsx$createddate.$t,
						    idea: this.gsx$idea.$t,
						    outcome: thisExDashboard.insertBreaks(this.gsx$outcome.$t, false),
						    bigbet: thisExDashboard.insertBreaks(this.gsx$bigbet.$t, false),
						    assumptions: thisExDashboard.insertBreaks(this.gsx$assumptions.$t, false),
						    questions: thisExDashboard.insertBreaks(this.gsx$questions.$t, false),
						    folderurl: folderLink,
						    strategy: this.gsx$strategy.$t,
						};
					} 

				}); /*-- $.each --*/

				thisExDashboard.populateTemplate(elementID, entryVars, templateId);
														 
			}); /*-- .getJSON --*/
		};
		/*- insertIdeaMainContent ---------------------*/

		/*-----------------------------------------------
		    Grabs the meta content for a particular
		    	idea and then calls populateTemplate
		    	to inject it in the DOM
		-----------------------------------------------*/
		this.insertIdeaMeta = function(elementID) {

			var templateId = '#ideaMeta';

			$.getJSON( thisExDashboard.ideasUrl, function( data ) {
				
				var entryVars       = {};
				var utmParam = thisExDashboard.getUrlVars()['idea'];

				$.each( data.feed.entry, function() {

					/*--------------------------------------------------------
					   If the utm param matches the experiment name string
					--------------------------------------------------------*/
					if ( thisExDashboard.paramString(this.gsx$bigidea.$t) == utmParam ) {
						
						var folderLink = '';

						/*-- Create a link to the experimentcodename folder --*/
						folderLink = '<a href="'+this.gsx$folderurl.$t+'" target="_blank">'+this.gsx$folderurl.$t+'</a>';

						entryVars = {
						    createddate: this.gsx$createddate.$t,
						    folderurl: folderLink,
						    strategy: this.gsx$strategy.$t,
						};

					} 

				}); /*-- $.each --*/

				thisExDashboard.populateTemplate(elementID, entryVars, templateId);
														 
			}); /*-- .getJSON --*/
		};
		/*- insertIdeaMeta ---------------*/


		/*-----------------------------------------------
		    Adds the header experiment/idea page
		-----------------------------------------------*/
		this.insertHeader = function(elementID) {

			var sheetUrl      = '';
			var utmParam      = '';
			var entryVars     = {};
			var categoryTitle = '';

			if (thisExDashboard.getUrlVars()['idea'] != null) {
				sheetUrl  = thisExDashboard.ideasUrl;
				utmParam  = thisExDashboard.getUrlVars()['idea'];
				categoryTitle = "Idea";

				$.getJSON( sheetUrl, function( data ) {

					$.each( data.feed.entry, function() {

						var imageUrl = this.gsx$imageurl.$t;
						var htmlString = '';
						var display = "block";

						// If idea matches idea UTM param
						if ( thisExDashboard.paramString(this.gsx$bigidea.$t) == utmParam ) {
							
							// If imageUrl exists
							if ( imageUrl != '' ) {
								// If url contains 'drive.google.com'
								if ( imageUrl.search('drive.google.com') != -1) {
									imageUrl = 'https://drive.google.com/uc?export=view&id='+thisExDashboard.parseUrlString(imageUrl)['id'];
								}
								
							} else {
								display : 'none';
							}

							entryVars = {
								categorytitle: categoryTitle,
								title: this.gsx$bigidea.$t,
								imageurl: imageUrl,
								display: display,
							    dashboardurl: thisExDashboard.dashboardPageUrl

							};

							// Populate the template 
							thisExDashboard.populateTemplate(elementID, entryVars, '#pageHeader');

						}

					}); /*-- $.each --*/

				}); /*-- .getJSON --*/

			} else if (thisExDashboard.getUrlVars()['ex'] != null) {

				sheetUrl = thisExDashboard.experimentsUrl;
				utmParam = thisExDashboard.getUrlVars()['ex'];
				categoryTitle = "Experiment";

				$.getJSON( sheetUrl, function( data ) {

					$.each( data.feed.entry, function() {

						var imageUrl = this.gsx$coverimageurl.$t;

						// If idea matches idea UTM param
						if ( thisExDashboard.paramString(this.gsx$experimentcodename.$t) == utmParam ) {

							// If url contains 'drive.google.com'
							if ( imageUrl.search('drive.google.com') != -1) {
								imageUrl = 'https://drive.google.com/uc?export=view&id='+thisExDashboard.parseUrlString(imageUrl)['id'];
								console.log(imageUrl);
							}

							entryVars = {
								categorytitle: categoryTitle,
								title: this.gsx$experimentcodename.$t,
								imageurl: imageUrl,
							    dashboardurl: thisExDashboard.dashboardPageUrl
							};

							// Populate the template 
							thisExDashboard.populateTemplate(elementID, entryVars, '#pageHeader');
						}

					}); /*-- $.each --*/

				}); /*-- .getJSON --*/

			} else {

				// End the function if there is no 'idea' or 'ex' params
				return false;

			}
		};
		/*- insertHeader ------------------------------*/
		

		/*-----------------------------------------------
		    Returns string with line breaks
		    	replaced with break tags
		-----------------------------------------------*/
		this.insertBreaks = function (str, is_xhtml) {   
		    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';    
		    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
		};

		// Grab all the data from the spreadsheets
		this.initializeDashboard();

	} /*- $.exDashboard -------------------------------*/
 
}( jQuery ));