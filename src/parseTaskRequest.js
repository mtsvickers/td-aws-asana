/**
 * Parses a String Request related to tasks.
 * Passes the formatted data to the appropriate next Lambda.
 *
 * ex data: getTask maybe a name ^option +other option
 */
 
require('dotenv').config();

const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.TD_ASANA_ACCESS_TOKEN);

module.exports = ({ data }, context, callback) => {
	
	/**
	 * Returns the ID of a task, project, user, etc. from Asana based on a typeahead search.
	 *
	 * @param string name - the name to search
	 * @param string type - the type of search (task, project, etc)
	 * @param int workspace - the workspace ID
	 */
	function searchByName( name, type, workspace ) {
		
		if( ! workspace ) { workspace = process.env.TD_DEFAULT_WORKSPACE; }
		
		var params = {
			type: type,
			query: name,
			count: 1
		}
		
		client.workspaces.typeahead(workspace, params)
		.then(function(response) {
			return response.id;
		})
		.catch(function(error) {
	        var error = new Error(error);
			callback(error);
			return false;
	    });
		
	} //End searchByName()
	
	/**
	 * Parses a string of arguments into an object based and returns it.
	 *
	 * @param string argString - the string of arguments to parse.
	 */
	function parseArguments( argString, exemptions ) {
		var symbols = [ "+", "@", "#", ">", "<", "!", "$", "^", "*", "~", "|" ];
		var argNames = [ "project", "tag", "due_date", "assignee", "followers", "completed_since", "modified_since", "parent", "workspace", "notes", "opt_fields"];
		
		var parsedData = {};
		var moreData = true;
		var offset = 0;
		
		//See if we are starting with an identifier or an argument.
		var firstChar = argString.charAt(0);
		var symbolIndex = symbols.indexOf(firstChar);
		var contentType = "identifier";
		if( symbolIndex >= 0 ) {
			contentType = argNames[symbolIndex];
		}
		
		//loop through all arguments and set metadata accordingly.
		while( moreData ) {
			moreData = false;
			var nextContentType = "";
			
			//if this isn't an identifier, don't count the current symbol in the offset.
			if( contentType != "identifier" ) { offset++; }
			
			//Find the next argument so we know where this one ends.
			var nextIndex = argString.length;
			for( var i = 0; i < symbols.length; i++ ) {
				var x = argString.indexOf( symbols[i], offset );
				if( x >= 0 && x < nextIndex ) {
					nextIndex = x;
					moreData = true;
					nextContentType = argNames[i];
				}
			}
			
			//Get the unformatted value for this item.
			var itemVal = argString.substring( offset, nextIndex ).trim();
			
			//See if this has sections
			var parseSections = false;
			if( contentType == "project" && itemVal.indexOf(':') >= 0 ) { parseSections = true; }
			
			//take any comma separated arguments and put them into arrays.
			if( itemVal.indexOf(',') >= 0 && contentType != "notes" ) {
				itemVal = itemVal.split(',');
			}
			
			//parse project arrays farther to account for sections.
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
					parsedData.memberships = memberships;
				}
				
			} //If we needed to parse sections
			
			//If this is an identifier, find out what kind.
			if( contentType == "identifier" ) {
				if( isNaN( itemVal ) ) { contentType = "name"; }
				else { contentType = "id"; }
			}
			
			//Go ahead and set the value.
			if( itemVal ) {
				parsedData[contentType] = itemVal;
			}
			
			//Set counter and content type for the next argument in our string.
			contentType = nextContentType; 
		    offset = nextIndex;
			
		}//while we have data in our string
		
		//We needed to wait to swap names for IDs in case we were given a workspace to use. Let's swap them now.
		var argsWithIDs = ["name", "project", "section", "tag","assignee","followers", "parent", "memberships.project", "memberships.section"];
		var lookupTypes = ["task", "project", "section", "tag", "user", "user", "task", "project", "section"]
		var workspace = "";
		if( parsedData.workspace ) { workspace = parsedData.workspace; }
		
		//for each argument which exists, is not a number, and is not exempt, try to convert them to ids.
		for( var i = 0; i < lookupTypes.length; i++) {
			var arg = argsWithIDs[i];
			if( parsedData[arg] && isNaN(parsedData[arg]) && ( exemptions.indexOf(argsWithIDs[i]) < 0 ) ) {
				var dataID = searchByName( parsedData[arg], lookupTypes[i], workspace );
				if( dataID ) {
					parsedData[arg] = dataID;
				}
			}
		}
		
		//Return our parsed data.
		return parsedData;
		
	} //parse Arguments function

	/* The Main Code */
	const requestData = data.trim();
	var formattedRequest = {};
	
	//If we weren't sent any data, throw an error.
	if( ! requestData ) {
		var error = new Error("No Data provided");
		callback(error);
	}
	else {
	
		//Since we can't check in the step function if the next step exists
		const knownLambdas = [ "FindTasks", "GetTask", "AddTask", "UpdateTask" ]
		
		//The first thing should always be the mode/request type
		var i = requestData.indexOf(' ');
		if( i <= 0 ) { i = requestData.length; }
		var mode = requestData.substring( 0, i );
		formattedRequest.mode = mode;
	
		//If the function doesn't exist, throw an error.
		if( knownLambdas.indexOf(mode) < 0 ) {
			var error = new Error("Call to unknown function "+mode);
			callback(error);
		}
		else {
			
			//If we have more data to parse, let's do that.
			if( requestData.length > (i+1) ) {
				
				var dataString = requestData.substring( i+1 );
				
				//If this is an update, we need to separate old data from new.
				if( dataString.indexOf("%") >= 0 ) {
					var dataArray = dataString.split("%");
					dataString = dataArray[0].trim();
					var modifications = dataArray[1].trim();
					
					//make new task name exempt from the "names should be ids" logic.
					var exempt = ['name'];
					var parsedMod = parseArguments(modifications, exempt);
					if( parsedMod ) {
						formattedRequest.modifications = parsedMod;
					}
				}
				
				//don't try to find an id on a new task name.
				var exemptions = [];
				if( mode == "AddTask" ) { exemptions.push("name"); }
				
				
				parsedData = parseArguments( dataString, exemptions );
				if( parsedData ) {
					formattedRequest.request = parsedData;
				}
				
				//Task IDs are used often. If we have that, let's store it higher up in the object hierarchy to make it easy to access.
				if( formattedRequest.request.id ) {
					formattedRequest.taskID = formattedRequest.request.id;
				}
					
			} //If we had data to parse.
			
			console.log(formattedRequest);
			return formattedRequest;
		} //Function name was valid
	} //We had some data
};
