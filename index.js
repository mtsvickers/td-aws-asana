'use strict';
//require('dotenv').config();

const asana = require('asana');
const client = asana.Client.create().useAccessToken('0/12009f5040317e5c2b0235da5e178a9d'); //process.env.TD_ASANA_ACCESS_TOKEN

//exports.handler = (event, context, callback) => {
	

/*
	var dataArray = event.data.trim().split(" ");
	var functType = dataObj[1]; //second word will always be the function name
*/
	
	var eData = {
		data: "TDAsana GetTasks"
	};
	var dataArray = eData.data.trim().split(" ");

	
	/* GET TASK */
			
	//Setup Default Metadata  
	var getTaskMeta = {
		workspace: 498346170860, //process.env.TD_DEFAULT_WORKSPACE
		opt_fields: 'id,name,projects,assignee,assignee_status,created_at,completed_at,completed,due_at,notes',
		assignee: 'me'
	};
	
	if( dataArray.length > 2 ) {
		//arrays stored separately because of concern with using symbols as object property names
		var symbols = [ '+', '@', '#', '>', '<', '*' ];
		var argumentNames = [ 'projects', 'tags', 'due_on', 'assignee', 'followers', 'workspace'];
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
				needArgs = false;
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
	
	//console.log(getTaskMeta);

	//Try to get the tasks and return the response.
	client.tasks.findAll(getTaskMeta)
	.then(function(response) {
		console.log( response.data );
	});
			
//};
