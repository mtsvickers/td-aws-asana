module.exports = (event, context, callback) => {
	
	var iteration = {
		execute: false,
		mode: "UpdateTaskWithID"
	};
	
	//Make sure we have tasks to work with
	if( ! event.hasOwnProperty('foundTasks') || ! event.hasOwnProperty('iteration') || ! event.iteration.hasOwnProperty('index') ) {
		var error = new Error("Invalid Data given to iterate tasks");
		callback(error);
	} else {
		
		//save errorReport if one exists.
		if( event.iteration.hasOwnProperty('errorReport') ) {
			iteration.errorReport = event.iteration.errorReport+"\n ----------------------- \n";
		}
		
		var index = event.iteration.index;
		index++;
		
		if( index < event.foundTasks.length ) {
			iteration.index = index;
			iteration.execute = true;
			iteration.taskID = event.foundTasks[index].id;
			
			
			callback(null, iteration);
		}else {
			callback(null, iteration);
		}
		
	}
	
};