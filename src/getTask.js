require('dotenv').config();

const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.TD_ASANA_ACCESS_TOKEN);

module.exports = (event, context, callback) => {

	const taskID = event.taskID;
	var returnFields = ['id','name','projects','assignee','assignee_status','created_at','completed_at','completed','due_on','due_at','notes'];
	if( event.request.opt_fields && ( event.request.opt_fields.length > 0 ) ) {
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
		console.log(returnObj);
		return returnObj;
	})
	.catch(function(error) {
        var error = new Error(error);
		callback(error);
		return false;
    });
};