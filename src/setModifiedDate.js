module.exports = (event, context, callback) => {
	
	if( ! event.hasOwnProperty('modified_since') ) {
		
		//if modified since isn't provided, set it to three hours ago.
		var d = new Date();
		d.setHours( d.getHours() - 3 );
		
		var updatedEvent = event;
		updatedEvent.modified_since = d;
		
		callback(null, updatedEvent);
		
	} else {
		callback(null, event);
	}
	
}; //end module.exports