require('dotenv').config();

const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.TD_ASANA_ACCESS_TOKEN);

module.exports = (event, context, callback) => {

	if( ! event.hasOwnProperty('taskID') ) {
		callback(null, event);
	} else {
		
		var iteration = event;
		const taskID = event.taskID;
		var mods = {};
		
		
		if( isNaN( taskID ) ) {
			var errorReport = "\n Could not get ID for task: "+taskID;
			if( iteration.hasOwnProperty('errorReport') ) {
				iteration.errorReport += errorReport;
			} else {
				iteration.errorReport = errorReport;
			}
			callback(null, iteration);
		}
		else {
			if( event.hasOwnProperty('modifications') ) {
							
				//Loop through allowed mods and set values for any we have in the mods object.
				var allowedMods = ["assignee", "notes", "due_on", "name"];
				for( var i = 0; i < allowedMods.length; i++ ) {
					var modType = allowedMods[i];
					if( event.modifications[modType] ) {
						mods[modType] = event.modifications[modType]
					}
					
				}			
				
				//If we are appending notes and we have the current task notes, let's update our notes var to reflect that.
				if( mods.hasOwnProperty('notes') && mods.notes.charAt(0) === "&" && event.hasOwnProperty('taskInfo') && event.taskInfo.hasOwnProperty('notes') ) {
					var temp = event.taskInfo.notes + "\n" + mods.notes.slice(1);
					mods.notes = temp;
				}
				
				client.tasks.update(taskID, mods)
				.then(function(response) {
					iteration.result = response.id;
					callback(null, iteration);
				})
				.catch(function(error) {
			        var errorReport = "\n Could not Update Task: ";
			        if( iteration.hasOwnProperty('taskInfo') && iteration.taskInfo.hasOwnProperty('name') ) {
				        errorReport += iteration.taskInfo.name+"\n"+error;
				    } else {
					    errorReport += iteration.taskID+"\n"+error;
				    }
				    
					if( iteration.hasOwnProperty('errorReport') ) {
						iteration.errorReport += errorReport;
					} else {
						iteration.errorReport = errorReport;
					}
					callback(null, iteration);
			    });
			}
			else {
				//no changes requested.
				callback( null, iteration );
			}
			
		} //we have what looks like a valid task id
	}
	
}; //end module.exports