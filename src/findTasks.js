require('dotenv').config();

const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.TD_ASANA_ACCESS_TOKEN);

module.exports = (event, context, callback) => {
	
	var getTaskMeta = event.request;
	
	//If we don't have a project or tag, make sure we have an assignee and workspace.
	if( ! getTaskMeta.project && ! getTaskMeta.tag ) {
		
		if( ! getTaskMeta.assignee ) {
			getTaskMeta.assignee = "me";
		}
		
		if( ! getTaskMeta.workspace ) {
			getTaskMeta.workspace = process.env.TD_DEFAULT_WORKSPACE;
		}
		
	}
	
	//Find out what we should return.  
	var returnFields = ['id','name','projects','assignee','assignee_status','created_at','completed_at','completed','due_on','due_at','notes'];
	if( event.request.opt_fields && ( event.request.opt_fields.length > 0 ) ) {
		returnFields = event.request.opt_fields;
	}
	
	//Try to get the tasks and return the response.
	client.tasks.findAll(getTaskMeta)
	.then(function(response) {
		
		var returnObj = [];
		//loop through the tasks returned and store what we need to return
		for( var j = 0; j < response.data.length; j++) {
			var taskData = {};
			var task = response.data[j];
			for( var i = 0; i < returnFields.length; i++) {
				var field = returnFields[i];
				taskData[field] = task[field];
			}
			returnObj.push(taskData);
		}
		console.log(returnObj);
		callback(null, returnObj);
		
	})
	.catch(function(error) {
        var error = new Error(error);
		callback(error);
		return false;
    });
			
};