require('dotenv').config();

const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.TD_ASANA_ACCESS_TOKEN);

module.exports = (event, context, callback) => {
	
	//See if we encountered any errors during this execution. If so, add them to a new task so we know.
	if( event.hasOwnProperty('iteration') && event.iteration.hasOwnProperty('errorReport') && event.iteration.errorReport.length > 0 ) {
		
		var d = new Date();
		var createTaskMeta = {
			name: "Error Report "+d,
			notes: event.iteration.errorReport
		};
		
		//set assignee and workspace, either from request object or from defaults
		if( ! event.hasOwnProperty('request') ) {
			createTaskMeta.assignee = "me";
			createTaskMeta.workspace = process.env.TD_DEFAULT_WORKSPACE;
		} else {
			if ( ! event.request.hasOwnProperty('workspace') ) {
				createTaskMeta.workspace = process.env.TD_DEFAULT_WORKSPACE;
			} else {
				createTaskMeta.workspace = event.request.workspace;
			}
			
			if( ! event.request.hasOwnProperty('assignee') ) {
				createTaskMeta.assignee = "me";
			} else {
				createTaskMeta.assignee = event.request.assignee;
			}
		}
		
		//Create the task.
		client.tasks.create(createTaskMeta)
		.then(function(response) {
			callback(null, "Finished with errors. Errors can be found in task "+response.id);
		})
		.catch(function(error) {
	        var error = new Error(error);
			callback(error);
	    });
		
	} else {
		callback(null, "Finished Without Errors.");
	}
	
}; //end module.exports