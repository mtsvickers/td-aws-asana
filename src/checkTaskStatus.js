module.exports = (event, context, callback) => {
	
	var eventObj = event;
	eventObj.needsUpdating = false;
	
	//Make sure we have a task to work with
	if( ! event.hasOwnProperty('taskInfo') || ! event.taskInfo.hasOwnProperty('assignee_status') ) {
		eventObj.errorMsg = "no task info or assignee status";
		callback(null, eventObj);
	} else {
		
		//See if the task needs updating
		const info = eventObj.taskInfo;
		if( info.assignee_status !== "inbox" ) {
			//not in the inbox. Skip.
			eventObj.errorMsg = "not in inbox";
			callback(null, eventObj);
		}
		else if( ( info.hasOwnProperty('projects') && info.projects.length > 0 ) || ( info.hasOwnProperty('tags') && info.tags.length > 0 ) ) {
			//this has already been put in a project or tag, so it's probably not a dynamically created task. Skip it.
			eventObj.errorMsg = "has project or tag";
			callback(null, eventObj);
		}
		else if( ! info.hasOwnProperty('name') || info.name.length <= 0 ) {
			//no valid task name. Skip.
			eventObj.errorMsg = "no name";
			callback(null, eventObj);
		}
		else {
			eventObj.needsUpdating = true;
			eventObj.data = info.name;
			
			callback(null, eventObj);
		}
	}
	
};