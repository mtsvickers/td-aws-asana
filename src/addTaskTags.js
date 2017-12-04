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
		if( event.hasOwnProperty('modifications') && event.modifications.hasOwnProperty('tags') && event.modifications.tags.length > 0 ) {
			var tags = event.modifications.tags;
			
			//for each tag in the array, add the task to that.
			var Promise = require('bluebird');
			Promise.all(tags.map(function(instance) {
				
				var data = { tag: instance };
				
				return client.tasks.addTag(taskID, data)
				.then(function(response) {
					return;
				})
				.catch(function(error) {
			        console.log(error);
					return;
			    });
				
			}))
			.then(function(response) {
				callback(null);
			})
			.catch(function(error) {
		        console.log(error);
				callback(null);
		    });
			
		}
		else {
			//no changes requested.
			callback( null );
		}
		
	} //we have what looks like a valid task id
	
}; //end module.exports