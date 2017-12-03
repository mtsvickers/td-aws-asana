module.exports = (event, context, callback) => {
	
	var iteration = {
		execute: false,
		mode: "UpdateTaskWithID"
	};
	
	//Make sure we have tasks to work with
	if( ! event.foundTasks || event.foundTasks.length <= 0 || ! event.iteration || ! event.iteration.index ) {
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