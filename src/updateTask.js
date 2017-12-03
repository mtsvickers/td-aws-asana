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
		if( event.modifications ) {
			
			var mods = {};
			
			//Loop through allowed mods and set values for any we have in the mods object.
			var allowedMods = ["assignee", "notes", "due_on", "name"];
			for( var i = 0; i < allowedMods.length; i++ ) {
				var modType = allowedMods[i];
				if( event.modifications[modType] ) {
					mods[modType] = event.modifications[modType]
				}
				
			}			
			
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
		}
		else {
			//no changes requested.
			callback( null );
		}
		
	} //we have what looks like a valid task id
	
}; //end module.exports