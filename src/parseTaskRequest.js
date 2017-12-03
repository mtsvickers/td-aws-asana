/**
 * Parses a String Request related to tasks.
 * Passes the formatted data to the appropriate next Lambda.
 *
 * ex data: getTask maybe a name ^option +other option
 */
 
require('dotenv').config();

const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.TD_ASANA_ACCESS_TOKEN);

module.exports = (event, context, callback) => {
	
	/**
	 * Parses a string of arguments into an object and returns it.
	 *
	 * @param string argString - the string of arguments to parse.
	 */
	function parseArguments( argString, mode ) {
		var symbols = [ "+", "@", "#", ">", "<", "!", "$", "^", "*", "~", "|" ];
		var argNames = [ "project", "tag", "due_on", "assignee", "followers", "completed_since", "modified_since", "parent", "workspace", "notes", "opt_fields"];
		
		//Pluralize if we're going to need arrays
		if( mode === "AddTask" || mode === "UpdateTask" || mode === "UpdateTaskWithID" ) {
			argNames[0] = "projects";
			argNames[1] = "tags"
		}
		
		var parsedData = {};
		var moreData = true;
		var offset = 0;
		
		//See if we are starting with an identifier or an argument.
		var firstChar = argString.charAt(0);
		var symbolIndex = symbols.indexOf(firstChar);
		var contentType = "id";
		if( symbolIndex >= 0 ) {
			contentType = argNames[symbolIndex];
		} else if ( mode === "AddTask" || mode === "UpdateTaskWithID") {
			contentType = "name";
		}
		
		//loop through all arguments and set metadata accordingly.
		while( moreData ) {
			moreData = false;
			var nextContentType = "";
			
			//if this isn't an identifier, don't count the current symbol in the offset.
			if( contentType != "id" && contentType != "name" ) { offset++; }
			
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
			if( ( contentType == "project" || contentType == "projects" ) && itemVal.indexOf(':') >= 0 ) { parseSections = true; }
			
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
							itemVal.push(m[0]);
							
						}
					} else {
						itemVal.push(tempVal[i]);
					}
				}
				if( memberships ) {
					if( parsedData.memberships ) {
						parsedData.memberships = parsedData.memberships.concat(memberships);
					} else {
						parsedData.memberships = memberships;
					}
				}
				
			} //If we needed to parse sections
			
			//Go ahead and set the value.
			if( itemVal ) {
				
				//if this is a potential array type, add it as an array, otherwise add it as it is.
				if( contentType !== "notes" && contentType.charAt(contentType.length-1) === "s" ) {
					if( ! Array.isArray(itemVal) ) {
						itemVal = [itemVal];
					}
					if( parsedData[contentType] ) {
						parsedData[contentType] = parsedData[contentType].concat(itemVal);
					} else {
						parsedData[contentType] = itemVal;
					}
					
				} else {
					//Not an array element. Just add it.
					parsedData[contentType] = itemVal;
				}

			} //if we have a value.
			
			//Set counter and content type for the next argument in our string.
			contentType = nextContentType; 
		    offset = nextIndex;
			
		}//while we have data in our string
						
		//Return our parsed data.
		return parsedData;
		
	} //parse Arguments function

	/*************
	The Main Code 
	**************/
	
	//If we weren't sent any data, throw an error.
	if( ! event.data ) {
		var error = new Error("No Data provided");
		callback(error);
	}
	else if( ! event.mode ) {
		var error = new Error("No Mode provided");
		callback(error);
	}
	else {
		
		const dataString = event.data.trim();
		const mode = event.mode;
		var formattedRequest = event;
			
		//If we have data to parse, let's do that.
		if( dataString.length > 0 ) {
									
			//If this is an update, we need to separate old data from new.
			if( dataString.indexOf("%") >= 0 ) {
				var dataArray = dataString.split("%");
				dataString = dataArray[0].trim();
				var modifications = dataArray[1].trim();
				
				var parsedMod = parseArguments(modifications, mode);
				if( parsedMod ) {
					formattedRequest.modifications = parsedMod;
					//new task name would have gone into ID. Store it in name instead.
					if( formattedRequest.modifications.id ) {
						formattedRequest.modifications.name = formattedRequest.modifications.id;
						delete formattedRequest.modifications.id;
					}
				}
			}
			
			parsedData = parseArguments( dataString, mode );
			if( parsedData ) {
				if( mode === "UpdateTaskWithID" && ! formattedRequest.modifications ) {
					//if we had an id, we probably didn't use a % because everything is likely a modification. Just store this in mod.
					formattedRequest.modifications = parsedData;
				} 
				else {
					formattedRequest.request = parsedData;
				}
			}
			
			//Task IDs are used often. If we have that, let's store it higher up in the object hierarchy to make it easy to access.
			if( formattedRequest.request && ! event.taskID && formattedRequest.request.id ) {
				formattedRequest.taskID = formattedRequest.request.id;
			}
				
		} //If we had data to parse.		
		
		callback(null, formattedRequest);

	} //We had some data
};
