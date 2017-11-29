require('dotenv').config();

const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.TD_ASANA_ACCESS_TOKEN);

module.exports = ({ data }, context, callback) => {

	const dataArray = data.trim().split(" ");

	
	/* GET TASK */
			
	//Setup Default Metadata  
	var getTaskMeta = {
		opt_fields: 'id,name,projects,assignee,assignee_status,created_at,completed_at,completed,due_at,notes',
	};
	
	if( dataArray.length > 2 ) {
		//arrays stored separately because of concern with using symbols as object property names
		var symbols = [ '+', '@', '!', '$', '>', '*' ];
		var argumentNames = [ 'project', 'tag', 'completed_since', 'modified_since', 'assignee', 'workspace' ];
		var needArgs = true;
		var contentType = "";
		var sep = " ";
		
		//loop through all arguments and set metadata accordingly.
		for( var i = 2; i < dataArray.length; i++ ) {
			
			var elem = dataArray[i];
			if( ! elem ) { continue; }
			
			var elemFirstChar = elem.charAt(0);
			var symbolIndex = symbols.indexOf(elemFirstChar);
			
			if( symbolIndex >= 0 ) {
				//New Argument. Set content type and put it in our object without the symbol.
				contentType = argumentNames[symbolIndex];
				getTaskMeta[contentType] = elem.slice(1);
				sep = " ";
			}
			else if( elem.toLowerCase() == 'return' ) {
				//Optional Arguments Ahead.
				contentType = "opt_fields";
				getTaskMeta.opt_fields = "";
				sep = ",";
			}
			else {
				//this is a continuation of a previous argument. Just append it.
				getTaskMeta[contentType] += sep + elem;
			}
			
		}//for each word in string
	} //If we have arguments
	
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
		console.log( response.data );
		return response.data;
	});
			
};