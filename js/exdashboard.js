/*---------------------------------------------------------------------------------------------------
    
    Experiment Dashboard JS, v0.5

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

	console.log(dir);

	$.exDashboard = function (sheetID, experimentSheetPos, ideaSheetPos) {

		// Store a reference to this object prototype to
		// use as a reference within the methods
		var thisExDashboard = this;
	    
	    // The unique ID for the Google master spreadsheet
	    this.sheetID = sheetID;

	    // The position (left to right) of the Idea and Experiment sub sheets
	    this.experimentSheetPos = experimentSheetPos;
	    this.ideaSheetPos       = ideaSheetPos;
	    
	    // Arrays
	    this.ideas         = [];
	    this.experiments   = [];
	    this.activeIdeas   = [];
	    this.inactiveIdeas = [];

	    // Construct urls for the spreadsheets
		this.ideasUrl = 'https://spreadsheets.google.com/feeds/list/' + this.sheetID + '/' + ideaSheetPos + '/public/values?alt=json';
		this.experimentsUrl = 'https://spreadsheets.google.com/feeds/list/' + this.sheetID + '/' + experimentSheetPos + '/public/values?alt=json';
		
		// Experiment and Idea detail page urls
		this.experimentPageUrl = 'experiment.html';
		this.ideaPageUrl = 'idea.html';

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
						var bigBetTruncated = thisExDashboard.trimText(this.gsx$bigbet.$t, 110);

						ideaVars = {
						    bigidea: this.gsx$bigidea.$t,
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
						var helpClass = 'ed-help';
						var endDate = this.gsx$enddate.$t;
						var mvpTruncated = thisExDashboard.trimText(this.gsx$mvp.$t, 110);	

						// CSS class and number for stage
						if (this.gsx$stage.$t == 'Design') {
							stageClass = 'ed-td-stage-design';
							stageNum   = '1';
						} else if (this.gsx$stage.$t == 'Running') {
							stageClass = 'ed-td-stage-running';
							stageNum   = '2';

						} else if (this.gsx$stage.$t == 'Debrief') {
							stageClass = 'ed-td-stage-debrief';
							stageNum   = '3';
						}

						// If an endDate exists, use a different CSS class
						if (endDate != '') {
							stageClass = 'ed-td-stage-complete';
						}

						if (this.gsx$helpneeded.$t != '') {
							helpClass += ' needed';
						}

						// Replace spaces in experiment name with hyphens
						// for the url parameters
						var experimentParam = thisExDashboard.paramString(this.gsx$experimentcodename.$t);
						var experimentIdea = this.gsx$idea.$t;
						var experimentStartDate = this.gsx$startdate.$t;

						experimentVars = {
						    idea: experimentIdea,
						    bigbet: this.gsx$bigbet.$t,
						    experimentcodename: this.gsx$experimentcodename.$t,
						    experimentparam: experimentParam,
						    stage: this.gsx$stage.$t,
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
		}
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
		}
		/*- getRecentDates ----------------------------*/


		/*-----------------------------------------------
		   Returns trimed paragraph text
		-----------------------------------------------*/
		this.trimText = function(paragraphString, charLimit) {

			var trimmed = paragraphString;
			
			// If not empty string, trim text and add a right arrow
			if (trimmed != '') {
				trimmed = $.trim(paragraphString).substring(0, charLimit) + '&nbsp;&rarr;';
			}
			
			return trimmed;
		}
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
		}
		/*- paramString -------------------------------*/


		/*-----------------------------------------------
		    Parse a date in mm/dd/yyyy format
		-----------------------------------------------*/
		this.parseDate = function (input) {
		  var parts = input.split('/');
		  // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
		  return new Date(parts[2], parts[0]-1, parts[1]); // Note: months are 0-based
		}
		/*- parseDate ---------------------------------*/


		/*-----------------------------------------------
		    Creates idea/experiment(s) rows
		    	for the Dashboard table
		-----------------------------------------------*/
		this.insertRows = function (objectArrayRef, cssRowClass) {

			var htmlString = '';

			$.each( objectArrayRef, function() {

				var bigidea = this.bigidea;
				var emptyClass = 'ed-td-idea-empty' // Default to empty;
				var experimentCells = [];

				htmlString += '<tr class="' + cssRowClass + '">';

			    // Add each experiments for this idea to a cell
			    $.each( thisExDashboard.experiments, function() {
			    	if (this.idea == bigidea) {

			    		// Experiment(s) exists, so use full class name
			    		emptyClass = 'ed-td-idea-full';

			    		// Add the experiment cell to the row
				    	exTemplate = $('#experimentTableCell').html();
				    	experimentCells += Mustache.to_html(exTemplate, this);
			    	}
			    });

			    // Add the class name to the JSON object
			    this.emptyclass = emptyClass;

			    template = $('#ideaTableCell').html();
				cell = Mustache.to_html(template, this);
			    htmlString += cell;
			    htmlString += experimentCells;
			    htmlString += '</tr>';

			});

			$('.ed-table-dashboard > tbody:last-child').append(htmlString);
		}
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
		}
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

		  	
		}
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
		}
		/*- sortDesc ----------------------------------*/

		/*-----------------------------------------------
		    Sorts the ideas in descending order
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
		}
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
		}
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
		}
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
		}
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
		
		}
		/*- insertWidget ------------------------------*/


		/*-----------------------------------------------
		    Read a page's GET URL variables and return
		    	them as an associative array.
		-----------------------------------------------*/
		this.getUrlVars = function () {
		    var vars = [], hash;
		    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		    for(var i = 0; i < hashes.length; i++)
		    {
		        hash = hashes[i].split('=');
		        vars.push(hash[0]);
		        vars[hash[0]] = hash[1];
		    }
		    return vars;
		}
		/*- getUrlVars --------------------------------*/


		/*-----------------------------------------------
		    Creates an idea table
		-----------------------------------------------*/
		this.insertIdea = function (elementID) {
			$.getJSON( thisExDashboard.ideasUrl, function( data ) {
				
				var template      = '';
				var templateHTML  = '';
				var entryVars     = {};
				var ideaParam     = thisExDashboard.getUrlVars()['idea'];
				var ideaName      = ''


				$.each( data.feed.entry, function() {

					/*--------------------------------------------------------
					   Compare the url param with each converted 
					   idea name string
					--------------------------------------------------------*/
					if ( thisExDashboard.paramString(this.gsx$bigidea.$t) == ideaParam ) {

						var folderLink = '';

						/*-- Set the idea name for the h1 --*/
						ideaName = this.gsx$bigidea.$t;

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

						// Load the mustache templates
					 	$( '<div/>', { 'id': 'mustache-templates'})
							.appendTo( 'body' )
							.css('visibility','hidden')
							.load(thisExDashboard.templateURL, function() {

							// Templates have loaded. Now...

							// Populate the template
							template = $('#ideaTable').html();
							templateHTML = Mustache.to_html(template, entryVars);

							// Insert HTML into the DOM
							$(elementID).html(templateHTML);

							// Break the .each loop
							return false;

						});

					} /*-- $.each --*/

				});

				$('.entry-title').html(ideaName);
														 
			  	

			}); /*-- .getJSON --*/
		}
		/*- insertIdea --------------------------------*/


		/*-----------------------------------------------
		    Creates an experiment table
		-----------------------------------------------*/
		this.insertExperiment = function (elementID) {
			// Parse the JSON
			$.getJSON( thisExDashboard.experimentsUrl, function( data ) {
				
				var template      = '';
				var templateHTML  = '';
				var entryVars     = {};
				var experimentParam = thisExDashboard.getUrlVars()['ex'];
				var experimentName = '';

				$.each( data.feed.entry, function() {

					/*--------------------------------------------------------
					   Compare the url param with each converted 
					   experiment name string
					--------------------------------------------------------*/
					if ( thisExDashboard.paramString(this.gsx$experimentcodename.$t) == experimentParam ) {
						
						var folderLink = '';

						/*-- Set the experiment name for the h1 --*/
						experimentName = this.gsx$experimentcodename.$t;

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
						    nextsteps: thisExDashboard.insertBreaks(this.gsx$nextsteps.$t, false),
						    mvp: thisExDashboard.insertBreaks(this.gsx$mvp.$t, false),
						    hypothesis: thisExDashboard.insertBreaks(this.gsx$hypothesis.$t, false),
						    mvpdesign: thisExDashboard.insertBreaks(this.gsx$mvpdesign.$t, false),
						    helpneeded: thisExDashboard.insertBreaks(this.gsx$helpneeded.$t, false),
						    keylearnings: thisExDashboard.insertBreaks(this.gsx$keylearnings.$t, false),
						    folderurl: folderLink,
						    documents: documentList,
						    blogposts: blogList,
						    team: this.gsx$team.$t,
						    googlegroup: this.gsx$googlegroup.$t,
						    contact: this.gsx$contact.$t
						};

						// Load the mustache templates
						$( '<div/>', { 'id': 'mustache-templates'})
							.appendTo( 'body' )
							.css('visibility','hidden')
							.load(thisExDashboard.templateURL, function() {

							// Templates have loaded. Now...

							// Populate the template
							template = $('#experimentTable').html();
							templateHTML = Mustache.to_html(template, entryVars);

							// Insert HTML into the DOM
							$(elementID).html(templateHTML);

							// Break the .each loop
							return false;

						});

					} /*-- $.each --*/

				});

				$('.entry-title').html(experimentName)
														 
			}); /*-- .getJSON --*/
		}
		/*- insertExperiment --------------------------*/


		/*-----------------------------------------------
		    Returns string with line breaks
		    	replaced with break tags
		-----------------------------------------------*/
		this.insertBreaks = function (str, is_xhtml) {   
		    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';    
		    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
		}

		// Grab all the data from the spreadsheets
		this.initializeDashboard();

	} /*- $.exDashboard -------------------------------*/
 
}( jQuery ));