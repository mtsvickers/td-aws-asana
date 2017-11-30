/**
* Does a typeahead lookup on named object properties which Asana will want as IDs
* Replaces the names in the object with the IDs.
* Note typeahead has the potential for high inaccuracy, especially when tasks have similar names or only a portion of the name was given.
*
*/

require('dotenv').config();
const util = require('util');

const asana = require('asana');
const client = asana.Client.create().useAccessToken(process.env.TD_ASANA_ACCESS_TOKEN);

module.exports = (event, context, callback) => {
	
	var inputObject = event;
	var mode = event.mode;
	
	var argsWithIDs = ["name", "project", "section", "tag","assignee","followers", "parent", "memberships"];
	var lookupTypes = ["task", "project", "section", "tag", "user", "user", "task", "project"]
	var workspace = process.env.TD_DEFAULT_WORKSPACE;
	if( event.request.workspace ) { event.request.workspace; }
	
	//if this is in addTask mode, skip name, since it will be new and not have an id.
	if( mode == "addTask" ) {
		argsWithIDs.splice(0,1);
		lookupTypes.splice(0,1);
	}
	
	//Save any objects in events we want to look through.
	var childObjects = [
		{ obj: event.request, path: "request" }
	];
	if( event.modifications ) {
		childObjects.push( { obj: event.modifications, path: "modifications" } );
	}
	
	//Let's find anything we need to convert in the request and/or modifications objects, and put it in an array.
	var instances = [];
	for( var i = 0; i < lookupTypes.length; i++) {
		var arg = argsWithIDs[i];
		for( var j = 0; j < childObjects.length; j++ ) {
			
			var obj = childObjects[j].obj;
			var path = childObjects[j].path;
						
			//Names are tricky. If this is a name and should stay a name, skip it.
			if( arg == "name" && ( path != "request" || mode == "AddTask") ) { continue; }
			
			//if property exists, is not a number, and is not assignee with value me.
			if( obj[arg] && isNaN( obj[arg] ) && ! (arg == "assignee" && obj[arg] == "me") ) {
				var instance = {
					type: lookupTypes[i],
					path: path,
					arg: arg
				};
				if( Array.isArray(obj[arg]) && obj[arg].length > 0 ) {
					//This is an array. Go ahead and loop through it.
					for( var k = 0; k < obj[arg].length; k++ ) {
						if( isNaN( obj[arg][k] ) ) {
							var thisInstance = {
								type: lookupTypes[i],
								path: path,
								arg: arg,
								query: obj[arg][k],
								index: k,
							};
							instances.push(thisInstance);
						}
					}
				} else {
					//Not an array. Just add it.
					instance.query = obj[arg];
					instances.push(instance);
				}
				
			} //if we have stuff to save.
			
		} //For each child object of event
	} //for each potentially named arg
				
	var Promise = require('bluebird');
	Promise.all(instances.map(function(instance) {
		
		var params = {
			type: instance.type,
			query: instance.query,
			count: 1
		};
		
		//handle membership which needs two calls.
		if( instance.arg == "memberships" ) {
			params.query = instance.query.project,
			params.next = instance.query.section
		}
		
		return client.workspaces.typeahead(workspace, params)
		.then(function(response) {
			if( response.data[0] && response.data[0].id ) {
				var thisID = response.data[0].id.toString();
				return thisID;
			} else {
				console.log(params.query+" not found.");
				return false;
			}
			
		})
		.then(function(response) {
			if( ! params.next || ! response ) { return response; }
			else {
				//grab some tasks which match our section query
				var pID = response;
				var secondParams = {
					type: "task",
					query: params.next,
					count: 20,
					opt_fields: "projects"
				};
				return client.workspaces.typeahead(workspace, secondParams)
				.then(function(response) {
					if( response.data && response.data.length > 0 ) {
						
						var sID = false;
						//find first task matching our project.
						for( var i = 0; i < response.data.length; i++ ) {
							if( response.data[i].projects.length > 0 ) {
								for( var j = 0; j < response.data[i].projects.length; j++ ) {
									if( response.data[i].projects[j].id == pID ) {
										sID = response.data[i].id;
										break;
									}
								}
							}
						}
						return { project:pID.toString(), section: sID.toString() };
						
					}
					else { return { project:pID.toString(), section: false}; }
				})
				.catch(function(error) {
			        console.log(error);
					return false;
			    });
			}
		})
		.catch(function(error) {
	        console.log(error);
			return false;
	    });
		
	}))
	.then(function(response) {
		var results = response;
		
		//use any valid data to replace names in the main object and return it.
		for( var i = 0; i < instances.length; i++ ) {
			if( results[i] ) {
				var instance = instances[i];
				var val = results[i];
				
				//converted names are IDs. Store them there, and in the top level of the object.
				if( instance.arg == "name" ) {
					inputObject[instance.path].id = val;
					inputObject.taskID = val;
				}
				else if ( 'index' in instance ) {
					inputObject[instance.path][instance.arg][instance.index] = val;
				}
				else {
					inputObject[instance.path][instance.arg] = val;
				}
			}
		}
		//console.log(inputObject);
		callback(null, inputObject);
	});
	
};