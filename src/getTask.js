require('dotenv').config();

const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.TD_ASANA_ACCESS_TOKEN);

module.exports = (event, context, callback) => {
	
	var iteration = event;
	
	if( ! iteration.hasOwnProperty('taskID') ) {
		callback(null);
	} else {
		const taskID = iteration.taskID;
		var returnFields = ['id','name','projects','assignee','assignee_status','created_at','completed_at','completed','due_on','due_at','notes'];
		if( iteration.hasOwnProperty('request') && iteration.request.hasOwnProperty('opt_fields') && ( iteration.request.opt_fields.length > 0 ) ) {
			returnFields = event.request.opt_fields;
		}
		
		//Try to create the tasks and return the response.
		client.tasks.findById(taskID)
		.then(function(response) {
			//return the right fields.
			var returnObj = {};
			for( var i = 0; i < returnFields.length; i++) {
				var field = returnFields[i];
				returnObj[field] = response[field];
			}
			iteration.taskInfo = returnObj;
			callback(null, iteration);
		})
		.catch(function(error) {
			var errorReport = "\n Could not get task information for task "+taskID+"\n"+error;
			if( iteration.hasOwnProperty('errorReport') ) {
				iteration.errorReport += errorReport;
			} else {
				iteration.errorReport = errorReport;
			}
			callback(null, iteration);
	    });
	}
	
}; //end module.exports