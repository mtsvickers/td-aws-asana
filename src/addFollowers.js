require('dotenv').config();

const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.TD_ASANA_ACCESS_TOKEN);

module.exports = (event, context, callback) => {

	var iteration = event;
	
	if( ! iteration.hasOwnProperty('taskID') || isNaN( iteration.taskID ) ) {
		callback(null, iteration);
	} else {
		
		const taskID = iteration.taskID;
		var mods = {};

		if( iteration.hasOwnProperty('modifications') && iteration.modifications.hasOwnProperty('followers') && iteration.modifications.followers.length > 0 ) {
			
			var data = { followers: iteration.modifications.followers };
			var tName = taskID;
			if( iteration.hasOwnProperty('taskInfo') && iteration.taskInfo.hasOwnProperty('name') ) {
				tName = iteration.taskInfo.name;	
			}
			
			client.tasks.addFollowers(taskID, data)
			.then(function(response) {
				callback(null, iteration);
			})
			.catch(function(error) {
		        var errorReport = "\n An error occurred attempting to add followers to "+tName+"\n"+error;
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
	
}; //end module.exports