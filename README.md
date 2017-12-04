# Tyler Digital Asana Lambdas
Lambda functions which make calls to the Asana API to run various tasks such as updating tasks, adding tasks, and retrieving information from a workspace.

## Table Of Contents
[Argument Key](#argkey) - a list of available argument symbols<br/>
[Parse Request](#parseRequest) - parses a string of arguments into an object of argumentName:argumentValue<br/>
[Find Tasks](#findTasks) - returns data on all tasks matching given filtering parameters<br/>
[Get Task by id](#getTask) - get data about specific task by task id.<br/>
[Convert Names to IDs](#convertNames) - takes an object and replaces certain named properties with their IDs based on a typeahead search.<br/>
[Get ID by Name](#getID) - takes a single string name and a type (project, tag, etc) and returns the id based on a typeahead search<br/>
[Add Task](#addTask) - adds a new Asana task based on given parameters<br/>
[Update Task](#updateTask) - updates a task based on a given task ID and update parameters<br/>
[Add Followers](#addFollowers) - adds followers to an existing task<br/>
[Add Task to Projects](#addToProjects) - adds a task to projects and/or sections.
[Add Tags to Task](#addTagsToTask) - adds tags to a given task.
[Comment On Task](#commentTask) - adds a given comment to the task with the given ID<br/>
[setModifiedDate](#setModDate) - if no modification date is given, this function sets it to three hours ago.

## <a name="argkey"></a>Argument Key
These are all of the available argument symbols used by these functions.
Not all of the arguments are available on all functions.
Please see the function documentation to view the arguments available to that function.

```
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
```

## <a name="parseRequest"></a>Parse Request
parses a string of arguments into an object of argumentName:argumentValue
This function will parse all symbol arguments listed above.
If the first element in the string is not prefixed with a symbol, it is assumed to be the task ID or name.

### Input Parameters
string `data` - the string containing the arguments to be parsed.
string `mode` - the mode to run this function in.
Allowed Modes:
* `AddTask`
* `GetTask`
* `FindTasks`
* `UpdateTask`
	

### Output
Object containing the parsed data as properties.

### Example Add Task Request
#### INPUT
```
{
	"data": "New Task Name +Project Name:Section Name @tag1,tag2 ^Parent Task #2018-12-25 ~This makes a new task and these will be the notes. >me"
}
```
#### OUTPUT
```
{
	"request": {
		"name": "New Task Name",
	    "memberships": [
		    {
		    "project": "Project Name",
			"section": "Section Name"
			}
	    ],
		"tag": [ "tag1", "tag2" ],
	    "parent": "Parent Task",
	    "due_on": "2018-12-25",
	    "notes": "This makes a new task and these will be the notes.",
	    "assignee": "me"	
	} 
}
```

### Example Update Task Request
#### INPUT
```
{
	"data": "UpdateTask My Current Task Name % New Task Name ~&These are notes I want to append to my task. #2017-12-25"
}
```
#### OUTPUT
```
{
	"modifications": { 
		"name": "New Task Name",
		"notes": "&These are notes I want to append to my task.",
		"due_date": "2017-12-25" 
	},
	"request": { 
		"id": "My Current Task Name", 
	},
	"taskID": "My Current Task Name"
}
```

### Example Get Task Request
#### INPUT
```
{
	"data": "1234567 |name,due_date"
}
```
#### Output
```
{
	"request": { "id": "490979385512957", "opt_fields": [ "name", "due_on" ] },
	"taskID": "490979385512957" 
}
```

## <a name="findTasks"></a>Find Tasks
returns data on all tasks matching given filtering parameters

### Input Parameters
Object `request` containing properties which represent the parameters which limit the search.

#### Avalable Properties
If you specify project or tag you must NOT specify workspace or assignee.
If no arguments are provided this will return all tasks in the default workspace assigned to the API token's user.

`completed_since` - Returns incomplete tasks or tasks completed since the given time.<br/>
`modified_since` - Returns tasks modified since this date.

 AND
 
`workspace` - The workspace ID<br/>
`assignee` - The Assignee's ID or 'me' for the API user, which is the default.

OR

`project` - the project ID

OR

`tag` - the tag ID

### Output
an array of the IDs and names of the tasks found based on the filters.

### Example Input
```
{ 
    "request": {
      "project": "490764297621890"
    }
}
```

### Example Output
```
[ 
  { id: 490764297621893, name: 'Testing Append' },
  { id: 490764297621898, name: 'MSV:' },
  { id: 490764297621891, name: 'Dummy Task In Section' },
  { id: 490979385512957, name: 'TDAsana AddTask All Options' },
  { id: 491409630211014, name: 'All Options' },
  { id: 491992396087549, name: 'Task created from state machine' }
]
```

## <a name="getTask"></a>Get Task by ID
return all or some information about a task based on a given task ID

### Input
`taskID` - Required. The ID of the task to get information about.<br/>
`opt_fields` - Optional. An array of fields to return. Default is all of them<br/>
Available `opt_field` args:
* `id`
* `name`
* `projects`
* `assignee`
* `assignee_status`
* `created_at`
* `completed_at`
* `due_at`
* `due_on`
* `notes`
* `completed`

### Output
An Object with the task information requested (or all information by default)

### Example Input
```
{
	"request": { "opt_fields": [ "name", "due_on" ] },
	"taskID": "490979385512957" 
}
```

### Example Output
```
{
    "name": "TDAsana AddTask All Options",
    "due_on": "2017-12-29"
    
}
```
	

## <a name="convertNames"></a>Convert Names To IDs
searches for named properties in event.request and event.modifications which Asana will want as IDs in other functions
does a typeahead search on each of these properties and replaces the names with the corresponding IDs in the original input object

### Input
an object containing various asana argument properties in the .request and .modification properties.

#### Converted Properies
`request`
* `name`	//unless event.mode is set to AddTask
* `project`
* `section`
* `tag`
* `assignee`
* `followers`
* `parent`
* `memberships.project`
* `memberships.section`

`modifications`
* `project`
* `section`
* `tag`
* `assignee`
* `followers`
* `parent`
* `memberships.project`
* `memberships.section`

### Output
The input object with any of the properties above which contained names replaced with IDs.

### Example Input
```
{
	"modifications": { 
		"name": "My New Task Name",
		"notes": "These are notes I want to put in the task.",
		"due_date": "2017-12-25",
		"assignee": "marissa"
	},
	"request": { 
		"name": "Dummy",
		"project": "Tester",
		"tag": "msv",
		"memberships": [
			{
				"project": "MSV",
				"section": "Another"
			}
		]
	}
}
```

### Example Output
```
{
    "modifications": {
        "name": "My New Task Name",
        "notes": "These are notes I want to put in the task.",
        "due_date": "2017-12-25",
        "assignee": "32140157319985"
    },
    "request": {
        "name": "Dummy",
        "project": "118986067959815",
        "tag": "490864456721253",
        "memberships": [
            {
                "project": "490764297621890",
                "section": "490764297621896"
            }
        ],
        "id": "490764297621891"
    },
    "taskID": "490764297621891"
}
```

## <a name="getID"></a>Get ID by name
Takes at minimum a name string and does a typeahead search to find the matching ID

### Input
`data` - Required. String. The Name of the element to find.<br/>
`type` - Optional. String. The type of element to find. Default is 'project'

Allowed Type Values:
* `project`
* `tag`
* `task`
* `user`

`workspace` - Optional. The ID of the workspace to search in. If not specified the default will be used.

### Output

The ID of the element, if found.

### Example Input
```
{
	"data": "asana auto",
	"type": "project"
}
```

### Example Output
`490764297621890`

## <a name="addTask"></a>Add Task
Adds a new Asana Task based on given parameters.

### Input
A `request` object containing properties determining what to add to the task.

Available Request Parameters:

* `name` 		- Required. The new tasks's name.
* `projects` 	- Optional. A single project ID or array of IDs
* `tags` 		- Optional. A single tag ID or array of IDs
* `parent` 		- Optional. A parent task ID
* `assignee` 	- Optional. Default is your user.
* `followers` 	- Optional. A single user ID or array of IDs
* `workspace` 	- Optional. The workspace ID.
* `notes` 		- Optional. A string containing the task notes
* `due_on` 		- Optional. In the format: YYYY-MM-DD
* `memberships` - Optional. An array of objects containing project and section pairs.
* `memberships[n].project` - the project id the section is in
* `memberships[n].section` - the section id this task should be added to.

*Note* - You may not have projects and memberships. You must use one or the other.
	
### Output
The task ID

### Example Input
```
{
	"request": {
		"name": "New Task Name",
	    "memberships": [
		    {
		    "project": "490764297621890",
			"section": "490764297621898"
			}
	    ],
		"tags": [ "490864456721252", "490864456721253" ],
	    "parent": "490764297621891",
	    "due_on": "2018-12-25",
	    "notes": "This is a dummy task which we are testing to try to create with lots of options."	
	} 
}
```

### Example Output
`123456789`

## <a name="updateTask"></a>Update Task
Updates an existing task based on the given parameters.

### Input
`taskID` - Required. The ID of the task to update<br/>
`taskInfo` - Optional. An object containing the current task information. Needed if you want to append to notes.<br/>
`modifications` - Required. At least one of the modifications properties must be set and non-empty.

Available Modification Properties
* `name` - the new task name
* `notes` - the new task notes. If the first character in notes is `&` these will be appended to the current task notes.
* `assignee` - the user ID or 'me' the task should be assigned to.
* `due_on` - the new due date.
	
### Output
None if successful. Error message if not.

### Example Input
```
{
	"modifications": { 
		"name": "My New Task Name",
		"notes": "&These are notes I want to append to the current task notes.",
		"due_date": "2017-12-25",
		"assignee": "32140157319985" 
	},
	"taskID": "490764297621893",
	"taskInfo": {
      "id": "490764297621893",
      "name": "Testing All Allowed updates",
      "projects": [
        {
          "id": 490764297621890,
          "name": "MSV Testing"
        }
      ],
      "assignee": {
        "id": 32140157319985,
        "name": "Marissa Solomon"
      },
      "assignee_status": "inbox",
      "created_at": "2017-11-29T15:03:48.117Z",
      "completed_at": null,
      "completed": false,
      "due_on": "2017-12-25",
      "due_at": null,
      "notes": "These are notes I want to put in my task."
    }
}
```

## <a name="addFollowers"></a>Add Followers
Adds followers to an existing Task

### Input
`taskID` - Required. The ID of the task to add the followers to<br/>
`modifications.followers` - An array of follower IDs. If none are provided this function does nothing.

### Output
The ID of the task we added followers to.

### Example Input
```
{
	"taskID": "490764297621893",
	"modifications": { 
		"followers": ["123456789", "45678909"]
	}
}
```

## <a name="addToProjects"></a>Add Task To Projects
Adds an existing task to projects and/or sections

### Input
`taskID` - Required. The ID of the task to add to these projects/sections<br/>
`modifications.projects` - An array of project IDs.<br/>
`modifications.memberships` - an array of objects containing project:section associations (when adding task to a section)<br/>
`modifications.memberships[0].project` - the ID of the project this section is in<br/>
`modifications.memberships[0].section` - the ID of the section to add this task to.<br/>
If neither .projects nor .memberships properties are set, this function does nothing.

### Output
None.

### Example Input
```
{
	"taskID": "490764297621893",
	"modifications": { 
		"projects": ["123456789", "45678909"],
		"memberships": [
			{
				"project": "1234567",
				"section": "8901234"
			},
			{
				"project": "0987654",
				"section": "3210987"
			}
		]
	}
}
	
```


## <a name="addTagsToTask"></a>Add Tags to Task
Adds existing tags to a given task.

### Input
`taskID` - Required. The task to add the tags to
`modifications.tags` - An array of tag IDs to add to the task. If not provided, this function does nothing.

### Output
None.

### Example Input
```
{
	"taskID": "490764297621893",
	"modifications": { 
		"tags": [123456789, 45678909]
	}
}
```

## <a name="commentTask"></a>Comment On Task
Add a comment to an existing task.

### Input
`taskID` - Required. The ID of the task to comment on.<br/>
`comment`- Required. A string containing the comment to add.

### Output
The comment ID.

### Example Input
```
{
	"taskID": "490764297621893",
	"comment": "This is a comment we added from our lambda."
}
```

### Example Output
`123456789`

## <a name="setModDate"></a>Set Modified Since Date
Adds modified_since property to the input object if it doesn't exist, and sets it to three hours ago.

### Input
Some object. If modified_since is already set, this returns the object as is.

### Output
The input object with a `modified_since` property set to 3 hours ago.

### Example Input
```
{
  "request": {
    "assignee": "32140157319985",
  }
}
```

### Example Output
```
{
  "request": {
    "assignee": "32140157319985",
    "modified_since": "2017-11-22T02:06:58.158Z"
  }
}
```