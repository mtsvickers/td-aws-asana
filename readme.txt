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
! = Completed Since
$ = Modified Since
^ = Parent
* = Workspace  
~ = Notes
% = Due Date

/**********************
	GET TASK(S)
***********************/
/**
 * Arguments 
 * 		+ = Project				// A single project ID (optional)
 * 		@ = tag					// A single tag ID (optional)
 * 		> = Assignee			// Default is your user. (optional if project or tag is provided)
 * 		! = Completed Since		// Returns incomplete or completed since the given time. (optional)
 *		$ = Modified Since		// Returns tasks modified since date. (optional)
 * 		* = Workspace			// The ID. Default is set in .env (optional if project or tag is provided)
 *	If you do not specify a project or tag, this will pull by workspace and assignee. 
 *  If none are provided your defaults will be used.
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
TDAsana GetTasks !now							//returns all incomplete tasks assigned to you in your default workspace
TDAsana GetTasks $2012-02-22T02:06:58.158Z		//returns all your tasks in default workspace modified since Feb 22, 2012 6:58


/**********************
	CREATE A TASK
***********************/
/**
 * taskname is required
 *
 * All new tasks must specify either a Workspace, a Project, or a Parent.
 * If none of these are provided the task will be created in your default workspace.
 * 
 * Arguments (all optional)
 * 		+ = Project				// A single project ID or a comma separated list of IDs
 *		@ = tags				// A single tag ID or a comma separated list of IDs
 *		^ = Parent				// A parent task ID
 *		> = Assignee			// Default is your user.
 *		< = Followers			// A single user or a comma separated list of users
 * 		* = Workspace			// The ID. Default is set in .env
 *		~ = Notes				// Notes should not contain any of the argument characters.
 *		% = Due Date			// In the format: %YYYY-MM-DD
 */

 
 USAGE
 TDAsana AddTask [taskname] [arguments]
