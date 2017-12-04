module.exports = (event, context, callback) => {
	
	var iteration = {
		execute: false,
		mode: "UpdateTaskWithID"
	};
	
	//Make sure we have tasks to work with
	if( ! event.hasOwnProperty('foundTasks') || ! event.hasOwnProperty('iteration') || ! event.iteration.hasOwnProperty('index') ) {
		callback(null, iteration);
	} else {
		
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