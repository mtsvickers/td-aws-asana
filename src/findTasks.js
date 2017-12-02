/**
 * Gets a task or tasks from Asana based on various filters.
 *
 * Returns an object containing the tasks names and ids
 */

require('dotenv').config();

const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.TD_ASANA_ACCESS_TOKEN);

module.exports = (event, context, callback) => {
	
	var getTaskMeta = event.request;
	
	//If we don't have a project or tag, make sure we have an assignee and workspace.
	if( ! getTaskMeta.project && ! getTaskMeta.tag ) {
		
		if( ! getTaskMeta.assignee ) {
			getTaskMeta.assignee = "me";
		}
		
		if( ! getTaskMeta.workspace ) {
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
			
};