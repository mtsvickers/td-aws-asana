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

		if( event.hasOwnProperty('modifications') ) {
			
			var tName = taskID;
			if( iteration.hasOwnProperty('taskInfo') && iteration.taskInfo.hasOwnProperty('name') ) {
				tName = iteration.taskInfo.name;	
			}
			
			//store all the projects we want to add this task to in an array.
			var projects = [];
			if( event.modifications.hasOwnProperty('projects') && event.modifications.projects.length > 0 ) {
				var singleProjects = event.modifications.projects;
				for( var i = 0; i < singleProjects.length; i++ ) {
					projects.push( { project: singleProjects[i] } );
				}
			}
			if( event.modifications.hasOwnProperty('memberships') && event.modifications.memberships.length > 0 ) {
				projects = projects.concat( event.modifications.memberships );
			}
			
			//for each element in the array, add the task to that.
			if( projects.length > 0 ) {
				var Promise = require('bluebird');
				Promise.all(projects.map(function(instance) {
					
					return client.tasks.addProject(taskID, instance)
					.then(function(response) {
						return;
					})
					.catch(function(error) {
						var errorReport = "\n Could not add task "+tName+" to Project "+instance.project+"\n"+error;
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
					var errorReport = "\n An error occurred attempting to add projects to "+tName+"\n"+error;
					if( iteration.hasOwnProperty('errorReport') ) {
						iteration.errorReport += errorReport;
					} else {
						iteration.errorReport = errorReport;
					}
					callback(null, iteration);
			    });
			} else {
				callback(null, iteration) //nothing to update
			}
			
		}
		else {
			//no changes requested.
			callback( null, iteration );
		}
		
	} //we have what looks like a valid task id
	
}; //end module.exports