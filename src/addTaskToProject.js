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
		if( event.modifications && ( event.modifications.projects || event.modifications.memberships ) ) {
			
			//store all the projects we want to add this task to in an array.
			var projects = [];
			if( event.modifications.projects && event.modifications.projects.length > 0 ) {
				var singleProjects = event.modifications.projects;
				for( var i = 0; i < singleProjects.length; i++ ) {
					projects.push( { project: singleProjects[i] } );
				}
			}
			if( event.modifications.memberships && event.modifications.memberships.length > 0 ) {
				projects = projects.concat( event.modifications.memberships );
			}
			
			//for each element in the array, add the task to that.
			var Promise = require('bluebird');
			Promise.all(projects.map(function(instance) {
				
				return client.tasks.addProject(taskID, instance)
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