require('dotenv').config();

const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.TD_ASANA_ACCESS_TOKEN);
const allowedArgs = ["memberships", "projects", "sections", "tags", "parent", "assignee", "followers", "workspace", "notes", "due_date", "name"];

module.exports = (event, context, callback) => {

	const createTaskMeta = event.request;
	
	if( ! createTaskMeta || ! createTaskMeta.name ) {
		var error = new Error("Not enough information to create a task.");
		callback(error);
	}
	else {
		
		//This requires certain properties to be pluralized. Let's do that if they didn't come in that way. 
		if( createTaskMeta.project ) {
			createTaskMeta.projects = createTaskMeta.project;
			delete createTaskMeta.project;
		}
		if( createTaskMeta.section ) {
			createTaskMeta.sections = createTaskMeta.section;
			delete createTaskMeta.section;
		}
		if( createTaskMeta.tag ) {
			createTaskMeta.tags = createTaskMeta.tag;
			delete createTaskMeta.tag;
		}
		
	
		//If we don't have a project or parent, make sure we have a workspace.
		if( ! createTaskMeta.projects && ! createTaskMeta.parent && ! createTaskMeta.workspace ) {
			createTaskMeta.workspace = process.env.TD_DEFAULT_WORKSPACE;
		}
		
		//if we don't have an assignee, assign it to self.
		if( ! createTaskMeta.assignee ) {
			createTaskMeta.assignee = "me";
		}
			
		//Try to create the tasks and return the response.
		client.tasks.create(createTaskMeta)
		.then(function(response) {
			return response.id;
		})
		.catch(function(error) {
	        var error = new Error(error);
			callback(error);
			return false;
	    });
	}		
};