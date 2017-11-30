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
	
	var argsWithIDs = ["name", "project", "section", "tag","assignee","followers", "parent"];
	var lookupTypes = ["task", "project", "section", "tag", "user", "user", "task"]
	var workspace = process.env.TD_DEFAULT_WORKSPACE;
	if( event.request.workspace ) { event.request.workspace; }
	
	//if this is in addTask mode, skip name, since it will be new and not have an id.
	if( mode == "addTask" ) {
		argsWithIDs.splice(0,1);
		lookupTypes.splice(0,1);
	}
	
	//Let's find anything we need to convert in the request and/or modifications objects, and put it in an array.
	var instances = [];
	for( var i = 0; i < lookupTypes.length; i++) {
		
		var arg = argsWithIDs[i];
		
		//if property exists, is not a number, and is not property assignee with value me.
		if( event.request[arg] && isNaN( event.request[arg] ) && ! (arg == "assignee" && event.request[arg] == "me") ) {
			var instance = {
				type: lookupTypes[i],
				query: event.request[arg],
				path: "request",
				arg: arg
			}
			instances.push(instance);
		}
		if( event.modifications && event.modifications[arg] && "name" != arg && isNaN( event.modifications[arg] ) && ! (arg == "assignee" && event.modifications[arg] == "me") ) {
			var instance = {
				type: lookupTypes[i],
				query: event.modifications[arg],
				path: "modifications",
				arg: arg
			}
			instances.push(instance);
		}
		
	} //for each potentially named arg
	
	//Memberships are more complex. Grab them seperately.
	if( event.request.memberships && event.request.memberships.length > 0 ) {
		for( var i = 0; i < event.request.memberships.length; i++ ) {
			if( event.request.memberships[i].project && isNaN(event.request.memberships[i].project) ) {
				var instance = {
					type: "membership",
					query: event.request.memberships[i],
					path: "request",
					arg: i
				}
				instances.push(instance);
			}
		}
	}
	if( event.modifications && event.modifications.memberships && event.modifications.memberships.length > 0 ) {
		for( var i = 0; i < event.modifications.memberships.length; i++ ) {
			if( event.modifications.memberships[i].project && isNaN(event.modifications.memberships[i].project) ) {
				var instance = {
					type: "membership",
					query: event.modifications.memberships[i],
					path: "modifications",
					arg: i
				}
				instances.push(instance);
			}
		}
	}
		
	var Promise = require('bluebird');
	Promise.all(instances.map(function(instance) {
		
		var params = {
			type: instance.type,
			query: instance.query,
			count: 1
		};
		
		//handle membership
		if( instance.type == "membership" ) {
			params.type = "project";
			params.query = instance.query.project,
			params.next = instance.query.section
		}
		
		return client.workspaces.typeahead(workspace, params)
		.then(function(response) {
			if( response.data[0] && response.data[0].id ) {
				var thisID = response.data[0].id
				return thisID;
			} else {
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
						return { project:pID, section: sID };
						
					}
					else { return { project:pID, section: false}; }
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
				
				if( instance.type == "membership" ) {
					inputObject[instance.path].memberships[instance.arg] = results[i];
				}
				else {
					inputObject[instance.path][instance.arg] = results[i];
					if( instance.path == "request" && instance.arg == "name" ) {
						inputObject.taskID = results[i];
					}
				}
			}
		}
		//console.log(inputObject);
		callback(null, inputObject);
	});
	
};