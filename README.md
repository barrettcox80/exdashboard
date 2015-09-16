# Experiment Dashboard

Experiment Dashboard is a simple jQuery app that loads data from a Google spreadsheet and displays a table of ideas and their corresponding experiments to help track progress and iterations.

Experiment Dashboard requires jQuery and Mustache.js

## Getting Started

### Create a Google Spreadsheet

Experiment Dashboard was developed to read data from a Google spreadsheet. You must first create a spreadsheet in order use Experiment Dashboard. A sample spreadsheet can be found [here](http://).

1. Download the [sample spreadsheet](https://docs.google.com/spreadsheets/d/1fdn-MHi6SyjFE0hARBUZ-yNnn47ttib2IPXfBRJTBBw) and upload it to your own account.
2. Make sure your spreadsheet is public. Go to Share -> Advanced, and change the access to "Public on the web".
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
				               experiment_sheet_pos : '', // Integer representing the position of your Experiments sub sheet
				               idea_sheet_pos       : '', // Integer representing the position of your Ideas sub sheet
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
				               experiment_sheet_pos : '', // Integer representing the position of your Experiments sub sheet
				               idea_sheet_pos       : '', // Integer representing the position of your Ideas sub sheet
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
				               experiment_sheet_pos : '', // Integer representing the position of your Experiments sub sheet
				               idea_sheet_pos       : '', // Integer representing the position of your Ideas sub sheet
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
