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
		if( event.hasOwnProperty('modifications') && event.modifications.hasOwnProperty('followers') && event.modifications.followers.length > 0 ) {
			
			var data = { followers: event.modifications.followers };
			
			client.tasks.addFollowers(taskID, data)
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