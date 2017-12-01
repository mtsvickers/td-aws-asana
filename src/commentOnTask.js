require('dotenv').config();

const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.TD_ASANA_ACCESS_TOKEN);

module.exports = (event, context, callback) => {
	
	//Send errors if we got invalid input.
	if( ! event.taskID ) {
		var error = new Error("No task ID given.");
		callback(error);
	}
	else if( isNaN(event.taskID) ) {
		var error = new Error("Invalid task identifier. Expected int or string int, got "+typeof event.taskID+" '"+event.taskID+'.');
		callback(error);
	}
	else if( ! event.comment ) {
		var error = new Error("No comment provided");
		callback(error);
	}
	else if ( ( typeof event.comment !== 'string' && ! event.comment instanceof String ) ) {
		var error = new Error("Invalid comment. Expected string, got "+typeof event.comment+" '"+event.comment+'.');
		callback(error);
	}
	else {
		
		//Valid Input. Let's try to add the comment.
		var taskID = event.taskID;
		var comment = { text: event.comment };
		
		client.stories.createOnTask(taskID, comment)
		.then(function(response) {
			var r = response; 
			if( r && r.id ) {
				callback(null, r.id); //We seem to have a valid id. Return it.
			}
			else {
				callback(null, false); //something strange went wrong.
			}
		})
		.catch(function(error) {
	        var error = new Error(error);
			callback(error);
	    });
		
	}
	
}; //end module.exports