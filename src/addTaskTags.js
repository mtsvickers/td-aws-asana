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

		if( iteration.hasOwnProperty('modifications') && iteration.modifications.hasOwnProperty('tags') && iteration.modifications.tags.length > 0 ) {
			
			var tags = iteration.modifications.tags;
			var tName = taskID;
			if( iteration.hasOwnProperty('taskInfo') && iteration.taskInfo.hasOwnProperty('name') ) {
				tName = iteration.taskInfo.name;	
			}
			
			//for each tag in the array, add the task to that.
			var Promise = require('bluebird');
			Promise.all(tags.map(function(instance) {
				
				var data = { tag: instance };
				
				return client.tasks.addTag(taskID, data)
				.then(function(response) {
					return;
				})
				.catch(function(error) {
			        var errorReport = "\n Could not add task "+tName+" to Tag "+instance+"\n"+error;
					if( iteration.hasOwnProperty('errorReport') ) {
						iteration.errorReport += errorReport;
					} else {
						iteration.errorReport = errorReport;
					}
					callback(null, iteration);
					return;
			    });
				
			}))
			.then(function(response) {
				callback(null, iteration);
			})
			.catch(function(error) {
				var errorReport = "\n An error occurred attempting to add tags to "+tName+"\n"+error;
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
			
	}
	
}; //end module.exports