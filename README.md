# Experiment Dashboard

Experiment Dashboard is a simple jQuery app that loads data from a Google spreadsheet and displays a table of ideas and their corresponding experiments to help track progress and iterations.

Experiment Dashboard requires jQuery and Mustache.js

## Getting Started

### Create a Google Spreadsheet

Experiment Dashboard was developed to read data from a Google spreadsheet. You must first create a spreadsheet in order use Experiment Dashboard. A sample spreadsheet can be found [here](https://docs.google.com/spreadsheets/d/11dvwPQYjgzmSATMDpJi2c0il6rib-XDaZz-0dR--SHI). Please note that the sample spreadsheet actually contains 4 subsheets. The first two subsheets are editable, while the the 3rd and 4th subsheets are hidden, locked and transposed copies of the 1st and 2nd, respectively. The 3rd and 4th subsheets are where Experiment Dashboard actually makes its API calls, and they will automatically reflect any edits you make to the first two subsheets.

1. Make your own copy of the [sample spreadsheet](https://docs.google.com/spreadsheets/d/11dvwPQYjgzmSATMDpJi2c0il6rib-XDaZz-0dR--SHI)
2. Make sure your spreadsheet is public. Go to Share -> Advanced, and change the access to "Anyone with the link can view" or "Public on the web".
3. Also make sure that you publish your spreadsheet by going to File -> Publish to the web.

### Set up the pages

Experiment Dashboard is designed to work across 3 pages:
- Dashboard page
- Idea template page
- Experiment template page

#### Dashboard Page

```html
<!DOCTYPE html>
<html lang="en">

	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<title>Experiment Dashboard</title>

		<link rel="stylesheet" type="text/css" href="css/exdashboard.css">

	</head>

	<body>

		<div id="ed-dashboard-table-container"></div>

		<script type="text/javascript" src="bower_components/jquery/dist/jquery.min.js"></script>
		<script type="text/javascript" src="bower_components/mustache.js/mustache.min.js"></script>
		<script type="text/javascript" src="js/exdashboard.js"></script>

		<script type="text/javascript">

		(function($){

			$( document ).ready(function() {

				// Set up the dashboard params
				var params = { sheet_id             : '', // Unique id of your Google spreadsheet
				               dashboard_page_url   : '', // URL for your dashboard page
				               experiment_page_url  : '', // URL for your experiment template page
				               idea_page_url        : '' }; // URL for your experiment template page

				// Create a new dashboard object
				var dashboard = new $.exDashboard(params);

				// Assemble the table and inject it into the DOM
				dashboard.makeTable('#ed-dashboard-table-container');

			}); /*-- Ready --*/

		})(jQuery); /*-- jQuery --*/

		</script>
	</body>
</html>

```

#### Idea Template Page

```html
<!DOCTYPE html>
<html lang="en">

	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<title>Idea</title>

		<link rel="stylesheet" type="text/css" href="css/exdashboard.css">

	</head>

	<body>

		<div id="ed-header"></div>
		<div id="main-content"></div>
		<div id="meta"></div>

		<script type="text/javascript" src="bower_components/jquery/dist/jquery.min.js"></script>
		<script type="text/javascript" src="bower_components/mustache.js/mustache.min.js"></script>
		<script type="text/javascript" src="js/exdashboard.js"></script>

		<script type="text/javascript">

		(function($){

			$( document ).ready(function() {

				// Set up the dashboard params
				var params = { sheet_id             : '', // Unique id of your Google spreadsheet
				               dashboard_page_url   : '', // URL for your dashboard page
				               experiment_page_url  : '', // URL for your experiment template page
				               idea_page_url        : '' }; // URL for your experiment template page

				// Create a new dashboard object
				var dashboard = new $.exDashboard(params);

				// Add the experiment alerts to the element
				dashboard.insertHeader('#ed-header');

				// Add the idea main content to the element
				dashboard.insertIdeaMainContent('#main-content');

				// Add the idea main content to the element
				dashboard.insertIdeaMeta('#meta');

			}); /*-- Ready --*/

		})(jQuery); /*-- jQuery --*/

		</script>
	</body>
</html>

```

#### Experiment Template Page

```html
<!DOCTYPE html>
<html lang="en">

	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<title>Experiment</title>

		<link rel="stylesheet" type="text/css" href="css/exdashboard.css">

	</head>

	<body>

		<div id="ed-header"></div>
		<div id="main-content"></div>
		<div id="meta"></div>
		<div id="alerts"></div>

		<script type="text/javascript" src="bower_components/jquery/dist/jquery.min.js"></script>
		<script type="text/javascript" src="bower_components/mustache.js/mustache.min.js"></script>
		<script type="text/javascript" src="js/exdashboard.js"></script>

		<script type="text/javascript">

		(function($){

			$( document ).ready(function() {

				// Set up the dashboard params
				var params = { sheet_id             : '', // Unique id of your Google spreadsheet
				               dashboard_page_url   : '', // URL for your dashboard page
				               experiment_page_url  : '', // URL for your experiment template page
				               idea_page_url        : '' }; // URL for your experiment template page

				// Create a new dashboard object
				var dashboard = new $.exDashboard(params);

				// Add the experiment alerts to the element
				dashboard.insertHeader('#ed-header');

				// Add the experiment main content to the element
				dashboard.insertExperimentMainContent('#main-content');

				// Add the experiment meta content to the element
				dashboard.insertExperimentMeta('#meta');

				// Add the experiment alerts to the element
				dashboard.insertExperimentAlerts('#alerts');
				 
			}); /*-- Ready --*/

		})(jQuery); /*-- jQuery --*/

		</script>
	</body>
</html>

```

### Optional Parameters

####idea_sheet_pos

Optional parameter to change the subsheet position of the Ideas sub sheet. Default is '3'. The [sample spreadsheet](https://docs.google.com/spreadsheets/d/11dvwPQYjgzmSATMDpJi2c0il6rib-XDaZz-0dR--SHI) contains a hidden and locked subsheet 

#####Example

```javascript

var params = { sheet_id             : '11dvwPQYjgzmSATMDpJi2c0il6rib-XDaZz-0dR--SHI',   
			   idea_sheet_pos       : '7', // Optional, Default is '3'
               dashboard_page_url   : 'dashboard.html',
               experiment_page_url  : 'experiment.html',
		       idea_page_url        : 'idea.html' };

var dashboard = new $.exDashboard(params);

```

####experiment_sheet_pos

Optional parameter to change the subsheet position of the Experiments sub sheet. Default is '4'. The [sample spreadsheet](https://docs.google.com/spreadsheets/d/11dvwPQYjgzmSATMDpJi2c0il6rib-XDaZz-0dR--SHI) contains a hidden and locked subsheet 

#####Example

```javascript

var params = { sheet_id             : '11dvwPQYjgzmSATMDpJi2c0il6rib-XDaZz-0dR--SHI',   
			   experiment_sheet_pos : '8', // Optional, Default is '4'
               dashboard_page_url   : 'dashboard.html',
               experiment_page_url  : 'experiment.html',
		       idea_page_url        : 'idea.html' };

var dashboard = new $.exDashboard(params);

```

