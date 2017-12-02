module.exports = (event, context, callback) => {
	
	var eventObj = event;
	eventObj.iteration.needsUpdating = false;
	eventObj.mode = "UpdateTask";
	
	//Make sure we have tasks to work with
	if( ! event.taskInfo || event.checkInboxTaskStatus.length <= 0 ) {
		callback(null, i);
	} else {
		
		//See if the task needs updating
		const info = event.taskInfo;
		if( info.assignee_status !== "inbox" ) {
			//not in the inbox. Skip.
			callback(null, eventObj);
		}
		else if( ( info.projects && info.projects.length > 0 ) || ( info.tags && info.tags.length > 0 ) ) {
			//this has already been put in a project or tag, so it's probably not a dynamically created task. Skip it.
			callback(null, eventObj);
		}
		else {
			i.needsUpdating = true;
			callback(null, eventObj);
		}
	}
	
};