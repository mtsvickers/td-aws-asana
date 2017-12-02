/**
 * Takes a string containing the full or partial project or tag name
 * Does a typeahead search and returns the id of the first result, or false if none is found.
 *
 * ex data: getTask maybe a name ^option +other option
 */
 
require('dotenv').config();

const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.TD_ASANA_ACCESS_TOKEN);

module.exports = (event, context, callback) => {
			
	var searchStr = event.data;
	var type = "project";
	var workspace = process.env.TD_DEFAULT_WORKSPACE;
	
	//If no valid data given, return an error.
	if( ! searchStr || ( typeof searchStr !== 'string' && ! searchStr instanceof String ) ) {
		var error = new Error("No Valid Data Given. Function expects non-empty string."+typeof searchStr+" '"+searchStr+"' given.");
		callback(error);
	} else {
		
		//if we were sent a type and/or workspace, change the defaults.
		if( event.type && event.type.length > 0 ) {
			type = event.type;
		}
		if( event.workspace && ! isNaN( event.workspace ) ) {
			workspace = event.workspace;
		}
	
		//Setup Parameters and do a typeahead search.
		var params = {
			type: type,
			query: searchStr,
			count: 1
		};
		
		client.workspaces.typeahead(workspace, params)
		.then(function(response) {
			var r = response; 
			if( r && r.data && r.data.length > 0 && r.data[0].id ) {
				//We seem to have a valid id. Return it.
				callback(null, r.data[0].id);
			}
			else {
				callback(null, false); //no project/tag found.
			}
		})
		.catch(function(error) {
	        var error = new Error(error);
			callback(error);
	    });

	} //If we had valid data
};