/**********************
 ARGUMENT KEY (GENERAL)
***********************/
+ = Projects
: = Section
@ = Tags
# = Due Date
> = Assignee
< = Followers
! = Completed Since
$ = Modified Since
^ = Parent
* = Workspace  
~ = Notes
% = Modifications
| = Return

/**********************
	GET TASK BY ID
***********************/
/**
 * Task ID is required.
 *
 * 
 * Return arguments are optional. If not included this will return all information about the task
 * 		| = Return				//The comma separated args to return. See possible values below. Usage: |info1,info2,info3
 * Possible Return values:
 *		- id
 *		- name
 *		- projects
 *		- assignee
 *		- assignee_status
 *		- created_at
 *		- completed_at
 *		- due_at
 *		- due_on
 *		- notes
 *		- completed
 */
 
 USAGE
GetTask [task id] [return args optional]

EXAMPLES
//get all information about task 1234567
GetTask 1234567

//Get Name and Due Date of task 1234567
GetTask 1234567 |name,due_date

/**********************
	FIND TASK(S)
***********************/
/**
 * Available Arguments 
 * 		! = Completed Since		// Returns incomplete or completed since the given time. (optional)
 *		$ = Modified Since		// Returns tasks modified since date. (optional)
 *
 *		AND
 *
 * 		* = Workspace			// The ID. Default is set in .env (optional if project or tag is provided)
 *		> = Assignee			// Default is your user. (optional if project or tag is provided)
 *		OR
 *		+ = Project				// A single project ID (optional)
 *		OR
 * 		@ = tag					// A single tag ID (optional)
 * 
 *  If you specify project or tag you must NOT specify workspace or assignee.
 *  If no arguments are provided your default workspace and user will be used.
 */
 
USAGE:
TDAsana FindTasks [arguments]

EXAMPLES:
TDAsana FindTasks								//gets all tasks assigned to you in your default workspace
TDAsana FindTasks +My Project |name,id			//gets names and ids of all tasks in MyProject
TDAsana FindTasks !now							//returns all incomplete tasks assigned to you in your default workspace
TDAsana FindTasks $2012-02-22T02:06:58.158Z		//returns all your tasks in default workspace modified since Feb 22, 2012 6:58


/**********************
	CREATE A TASK
***********************/
/**
 * taskname is required.
 *
 * All new tasks must specify either a Workspace, a Project, or a Parent.
 * If none of these are provided the task will be created in your default workspace.
 * 
 * Arguments (all optional)
 * 		+ = Project				// A single project ID or a comma separated list of IDs
 *		: = Section				// this should come right after the project id.
 *		@ = tags				// A single tag ID or a comma separated list of IDs
 *		^ = Parent				// A parent task ID
 *		> = Assignee			// Default is your user.
 *		< = Followers			// A single user or a comma separated list of users
 * 		* = Workspace			// The ID. Default is set in .env
 *		~ = Notes				// Notes should not contain any of the argument characters.
 *		# = Due Date			// In the format: #YYYY-MM-DD
 */

 
 USAGE
 TDAsana AddTask [taskname] [arguments]
 
 EXAMPLES
 //Add a task in your default workspace assigned to you called "My New Task"
 TDAsana AddTask My New Task
 
 //Add a task to Section 1 in Project 1, and also add it to Project 2.
TDAsana AddTask My Dynamic Task +Project 1:Section 1,Project 2

/**********************
	Update A TASK
***********************/
/**
 * taskname is required. Can be either the name or the id.
 *
 * filter arguments : Arguments Used To Help Find the Task when searching by name (optional)
 * 		Arguments 
 * 		+ = Project				// A single project ID (optional)
 * 		@ = tag					// A single tag ID (optional)
 * 		> = Assignee			// Default is your user. (optional if project or tag is provided)
 * 		! = Completed Since		// Returns incomplete or completed since the given time. (optional)
 *		$ = Modified Since		// Returns tasks modified since date. (optional)
 * 		* = Workspace			// The ID. Default is set in .env (optional if project or tag is provided)
 *		| = Return				//The comma separated args to return. See possible values below. Default is all. Usage: |info1,info2,info3
 *	If you do not specify a project or tag, this will pull by workspace and assignee. 
 *  If none are provided your defaults will be used.
 *
 * update arguments : Arguments Used to Modify the Task (at least one required)
 *		If you are changing the task name the new name must be the first argument after the % sign.
 *		>  = Assignee			// Default is your user. Replaces the current Assignee
 *		~  = Notes				// Replaces the existing notes
 *		~& = Notes				// Appends to the existing notes
 *		#  = Due Date			// Change the due date. In the format: #YYYY-MM-DD
 */
 
 USAGE
 TDAsana UpdateTask [taskname] [filter arguments] % [new name optional] [update arguments]
 
 EXAMPLES
 //change task name to "My New Task Name", append text to notes and reset due date to Christmas 2017
 TDAsana Update 490764297621893 % My New Task Name ~&These are notes I want appended to the current task notes. #2017-12-25
 
 //Find task named "Your Task" in "Your Project" and assign it to myself.
  TDAsana Update Your Task +Your Project % >me
  
/***********************************
	GET ASANA ELEMENT ID BY NAME
***********************************/
/**
* Takes at minimum a name string and returns the id (default is of a project), or false if not found.
*
* Optional: A named type may be provided. Allowed types are as follows
*	- project
*	- tag
*	- task
*	- user
*
* Optional: A workspace id may be provided. Otherwise default workspace from .env will be used.
*/

SAMPLE JSON:
//Search default workspace for project matching partial string "asana auto", case insensitive.
{ "data": "asana auto" }

//Search given workspace for tag matching partial string "my tag"
{
	"data": "my tag",
	"workspace": "123456789",
	"type": "tag",
}

/**********************
	PARSE TASK REQUEST
***********************/
/**
 * Takes a string where the first word is the function type and everything following is function arguments
 * parses string into an object with properties for the given arguments and returns this object.
 *
 * If names are given instead of IDs, the result of this function should be passed to "namesToIDs", which will replace them with ids based on a typeahead search.
 */
 
 SAMPLE JSON
{
	"data": "UpdateTask 490764297621893 % Testing Append ~&These are notes I want to append to my task. #2017-12-25 >me"
}

RETURNS
{
	"modifications": { 
		"name": "My New Task Name",
		"notes": "&These are notes I want to append to the current task notes.",
		"due_date": "2017-12-25" 
	},
	"request": { "id": "490764297621893" },
	"taskID": "490764297621893"
}

/**********************
	NAMES TO IDS
***********************/
/**
 * takes an object, searches for names properties in event.request and event.modifications which asana will want as IDs in other functions
 * does a typeahead search on each of these properties and replaces the names with the corresponding IDs in the original input object
 * returns the updated input object
 */
 
 SAMPLE JSON INPUT (ADD TASK)
{
  "mode": "AddTask",
  "request": {
    "name": "Naming Test 2",
    "parent": "Naming Test",
    "tag": "msv tag 2",
    "due_on": "2018-12-25",
    "notes": "This is a dummy test which should be a child of the first test"
  }
}

SAMPLE JSON OUTPUT (ADD TASK)
{
  "mode": "AddTask",
  "request": {
    "name": "Naming Test 2",
    "parent": "492529593750754",
    "tag": "490864456721253",
    "due_on": "2018-12-25",
    "notes": "This is a dummy test which should be a child of the first test"
  }
}

SAMPLE JSON INPUT 2 (UPDATE TASK)
{
  "mode": "UpdateTask",
  "modifications": {
    "name": "Naming Test 1 Updated",
    "notes": "These are notes I want to put in my task now that it is updated.",
    "due_on": "2017-12-26",
    "assignee": "me"
  },
  "request": {
    "name": "Naming Test"
  }
}

SAMPLE JSON OUTPUT 2 (UPDATE TASK)
{
  "mode": "UpdateTask",
  "modifications": {
    "name": "Naming Test 1 Updated",
    "notes": "These are notes I want to put in my task now that it is updated.",
    "due_on": "2017-12-26",
    "assignee": "me"
  },
  "request": {
    "name": "Naming Test",
    "id": "492530216356253"
  },
  "taskID": "492530216356253"
}