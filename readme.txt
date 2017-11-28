/** General Usage Notes **/

- All functions are case insensitive except for the TDAsana at the beginning.
- All functions must start with the call to TDAsana and be immediately followed by the function name
- the order of the statements in the function call are important.



/**********************
	ARGUMENTS
***********************/
+ = Projects
@ = tags
# = Due
> = Assignee
< = Followers
* = Workspace  //if none is provided your default will be used.

/**********************
	GET TASK(S)
***********************/
/**
 * taskname is optional
 * Arguments are optional and follow the symbol pattern above. 
 *
 * info arguments are optional. If left blank this will return all information about the task(s)
 * Possible info values:
 *		- id
 *		- name
 *		- projects
 *		- assignee
 *		- assignee_status
 *		- created_at
 *		- completed_at
 *		- due_at
 *		- notes
 *		- completed
 */
 
USAGE:
TDAsana GetTasks [arguments] [RETURN info1 info2 info3]

EXAMPLES:
TDAsana GetTasks								//gets all tasks assigned to you in your default workspace
TDAsana GetTasks +My Project return name id 	//gets names and ids of all tasks in MyProject

