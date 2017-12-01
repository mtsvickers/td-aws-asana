require('dotenv').config();

const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.TD_ASANA_ACCESS_TOKEN);

module.exports = (event, context, callback) => {

	const taskID = event.taskID;
	var mods = {};
	
	
	if( ! taskID || isNaN( taskID ) ) {
		var error = new Error("Invalid task identifier: '"+taskID+'.');
		callback(error);
	}
	else {
				
		//Lets make sure we're actually sending some changes
		var hasChanges = false;
		if( event.modifications ) {
			mods = event.modifications;
			if( mods.assignee || mods.notes || mods.due_date || mods.name ) { hasChanges = true; }
		}
		
		if( ! hasChanges ) {
			var error = new Error("No valid changes were requested.");
			callback(error);
		}
		else {
			
			//If we are appending notes and we have the current task notes, let's update our notes var to reflect that.
			if( mods.notes && mods.notes.charAt(0) === "&" && event.taskInfo && event.taskInfo.notes ) {
				var temp = event.taskInfo.notes + "\n" + mods.notes.slice(1);
				mods.notes = temp;
			}
			
			client.tasks.update(taskID, mods)
			.then(function(response) {
				console.log(response);
				callback(null, response.id);
			})
			.catch(function(error) {
		        var error = new Error(error);
				callback(error);
		    });
			
		} //We have changes to make.
		
	} //we have what looks like a valid task id
	
}; //end module.exports