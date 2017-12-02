module.exports = (event, context, callback) => {
	
	//Make sure we have tasks to work with
	if( ! event.foundTasks || event.foundTasks.length <= 0 || ! event.iteration.index ) {
		callback(null, "No Tasks to Update");
	} else {
		
		var iteration = event.iteration.index;
		iteration++;
		
		if( event.iteration < event.foundTasks.length ) {
			
			var result = {
				index: iteration,
				execute: true,
				taskID: event.foundTasks[iteration].id
			};
			
			callback(null, result);
		}else {
			var result = {
				execute: false
			};
			callback(null, result);
		}
		
	}
	
};