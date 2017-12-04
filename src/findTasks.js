/**
 * Gets a task or tasks from Asana based on various filters.
 *
 * Returns an object containing the tasks names and ids
 */

require('dotenv').config();

const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.TD_ASANA_ACCESS_TOKEN);

module.exports = (event, context, callback) => {
	
	if( ! event.hasOwnProperty( 'request' ) ) {
		var error = new Error("No Request Object Found");
		callback(error);
	} else {
	
		var getTaskMeta = event.request;
		
		//If we don't have a project or tag, make sure we have an assignee and workspace.
		if( ! getTaskMeta.hasOwnProperty('project') && ! getTaskMeta.hasOwnProperty('tag') ) {
			
			if( ! getTaskMeta.hasOwnProperty('assignee') ) {
				getTaskMeta.assignee = "me";
			}
			
			if( ! getTaskMeta.hasOwnProperty('workspace') ) {
				getTaskMeta.workspace = process.env.TD_DEFAULT_WORKSPACE;
			}
			
		}
			
		//Try to get the tasks and return the response.
		client.tasks.findAll(getTaskMeta)
		.then(function(response) {
			callback(null, response.data);
		})
		.catch(function(error) {
	        var error = new Error(error);
			callback(error);
	    });
	    
	}
};