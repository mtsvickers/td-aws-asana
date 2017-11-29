require('dotenv').config();

const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.TD_ASANA_ACCESS_TOKEN);

module.exports = ({ data }, context, callback) => {

	const requestData = data;
	var createTaskMeta = {};
	
	//arrays stored separately because of concern with using symbols as object property names
	var symbols = [ '+', '@', '^', '<', '>', '*', '~', '%' ];
	var argumentNames = [ 'projects', 'tags', 'parent', 'followers', 'assignee', 'workspace', 'notes', 'due_date' ];
	var contentType = "name"; //name should always come first
	var moreData = true;
	var offset = 0;
	
	//loop through all arguments and set metadata accordingly.
	while( moreData ) {
		moreData = false;
		var nextContentType = "";
		
		//if this isn't the name, don't count the current symbol in the offset.
		if( offset > 0 ) { offset++; }
		
		//Find the next argument so we know where this one ends.
		var nextIndex = requestData.length;
		for( var i = 0; i < symbols.length; i++ ) {
			var x = requestData.indexOf( symbols[i], offset );
			if( x >= 0 && x < nextIndex ) {
				nextIndex = x;
				moreData = true;
				nextContentType = argumentNames[i];
			}
		}
		
		//Get the unformatted value for this item.
		var itemVal = requestData.substring( offset, nextIndex ).trim();
		
		//See if this has sections
		var parseSections = false;
		if( itemVal.indexOf(':') >= 0 && contentType != "notes" ) { parseSections = true; }
		
		//take any comma separated arguments and put them into arrays.
		if( itemVal.indexOf(',') >= 0 && contentType != "notes" ) {
			itemVal = itemVal.split(',');
		}
		
		//parse array farther to account for sections.
		if( parseSections ) {
			
			//If this isn't an array, make it one.
			if( ! itemVal.isArray ) { itemVal = [itemVal]; }
			
			//projects with sections go in memberships, projects without will be put back into itemVal to be stored in projects.
			var tempVal = itemVal;
			itemVal = []; 
			var memberships = [];
			for( var i = 0; i < tempVal.length; i++) {
				if( tempVal[i].indexOf(':') >= 0 ) {
					var m = tempVal[i].split(':');
					if( m.length == 2 ) {
						var member = {
							'project': m[0],
							'section': m[1]	
						};
						memberships.push(member);
					}
				} else {
					itemVal.push(tempVal[i]);
				}
			}
			if( memberships ) {
				createTaskMeta.memberships = memberships;
			}
			
		} //If we needed to parse sections
		
		//Go ahead and set the value.
		if( itemVal ) {
			createTaskMeta[contentType] = itemVal;
		}
		
		//Set counter and content type for the next argument in our string.
		contentType = nextContentType; 
	    offset = nextIndex;
		
	}//while we have data in our string
	
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
		console.log(response);
		return response.id;
	});
			
};