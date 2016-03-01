// Creates application component
var todo = {};

// Todos have a description, a status (done or not), a creation date and a due date
todo.Todo = function(data) {
    this.description = m.prop(data.description);
    this.status = m.prop(data.status ? true : false);
    this.dateCreated = m.prop(data.dateCreated ? data.dateCreated : new Date().toDateString());
    this.dueDate = m.prop(data.dueDate);
    this.category = m.prop(data.category);
};

// A TodoList is an array of Todo's
todo.TodoList = Array;

// The Todo model is responsible for adding and storing new todo's
todo.model = (function() {
    var model = {}

    model.init = function(){
        // The list of current tasks (loads from local storage if it exists already)
        model.list = new todo.TodoList();
        if (localStorage.getItem("tasklist")) {
            var data = JSON.parse(localStorage.getItem("tasklist"));

            data.map(function(task) {
                model.list.push(new todo.Todo(task))
            });
        } else {
            localStorage.setItem("tasklist", JSON.stringify(model.list));
        }

        // Storage of new todo description before it is created
        model.description = m.prop("");

        // Storage of new todo due date before it is created
        model.dueDate = m.prop("");

        // Storage of task category before it is created
        model.category = m.prop("");

        // Storage for searchbox text
        model.searchbox = m.prop("");

        // Storage for currently selected filter (all, completed, uncompleted)
        model.selectFilter = m.prop("all"); // All tasks by default

        // Sorts, updates and stores the list (should be called at the end of every function that changes the list)
        model.updateList = function() {
            model.list.sort(model.compareFunction);
            localStorage.setItem("tasklist", JSON.stringify(model.list));
        }

        // Returns an array containing all the categories the user has created
        model.allCategories = function() {
            var categoryList = [];
            model.list.map(
                function(task) {
                    if (!categoryList.includes(task.category())) {
                        categoryList.push(task.category());
                    }
                }
            );
            return categoryList;
        };

        // Function with which our todo list is sorted with (returns 0 at first because user has not selected a sort method)
        model.compareFunction = function(a, b) {
            return 0;
        };

        // Sets the compare function to comapare by category
        model.sortByCategory = function() {
            model.compareFunction = function(task1, task2) {
                // Checks whether the tasks are catergorized
                // Needed as they will be compared as strings otherwise
                var task1Uncategorized = (task1.category() == "Uncategorized");
                var task2Uncategorized = (task2.category() == "Uncategorized");

                // Compare by whether they are catergorized first
                if (task1Uncategorized || task2Uncategorized) {
                    // task1 should be before task2
                    if (!task1Uncategorized) {
                        return -1
                    }

                    // task2 should be before task1
                    if (!task2Uncategorized) {
                        return 1;
                    }

                    // tasks are both uncategorized
                    return 0;
                }

                // Compare by category if both are catergorized
                if (task2.category() > task1.category()) { // task1 should be before task2
                    return -1;
                }

                // task2 should be before task 1
                if (task1.category() > task2.category()) {
                    return 1;
                }

                // They have the same category
                return 0;
            }
            model.updateList();
        }

        // Sets the compare function to compare by status
        model.sortByStatus = function() {
            model.compareFunction = function(task1, task2) {
                // task1 is uncomplete and task2 is complete
                if (!task1.status() && task2.status()) {
                    return -1;
                }

                // task2 is uncomplete and task1 is complete
                if (!task2.status() && task1.status()) {
                    return 1;
                }

                // tasks are equal
                return 0;
            };
            model.updateList();
        }

        // Sets the compare function to compare by task description
        model.sortByDescription = function() {
            model.compareFunction = function(task1, task2) {
                // task1 description should be before task2 description
                if (task1.description() < task2.description()) {
                    return -1;
                }

                // task2 should be before task1
                if (task1.description() > task2.description()){
                    return 1;
                }

                // They are equal
                return 0;
            };
            model.updateList();
        }

        // Sets the compare function to sort by the date the task was created
        model.sortByCreationDate = function() {
            model.compareFunction = function(task1,task2) {
                // Convert date string to Dates
                var date1 = new Date(task1.dateCreated());
                var date2 = new Date(task2.dateCreated());

                // Compares the dates
                if (date1 === date2) {
                    return 0; // Returns 0 if dates are equal
                } else if (date1 > date2) {
                    return 1; // task1 should be after task2
                } else {
                    return -1; // task1 should be before task2
                }
            }
            model.updateList();
        };

        // Sets the compare function to sort by due date
        model.sortByDueDate = function() {
            model.compareFunction = function(task1,task2) {
                // Convert date strings to Dates
                var date1 = new Date(task1.dueDate());
                var date2 = new Date(task2.dueDate());

                // Compares the dates
                if (date1 === date2) {
                    return 0; // Return 0 if dates are equal (they stay in the same place)
                } else {
                    return (date1 > date2 ? 1 : -1); // Returns -1 if task1 should be before task2, 1 otherwise
                }
            }
            model.updateList();
        }

        // Adds a todo to the list, alerts if the description box was empty
        model.addTask = function() {
            if (model.description() && model.dueDate()) {
                // Sets category to "Uncategorized" if not category is given
                var category = (model.category() ? model.category() : "Uncategorized");

                // date input is a string not a Date, so some conversion is needed
                model.list.push(new todo.Todo({description: model.description(),
                                               dueDate: new Date(model.dueDate()).toDateString(),
                                               category: category}));

                model.description(""); // Clears the description field
                model.dueDate("");
                model.updateList();
            }
        };

        // Returns true if a task should be visible according to search and filtering options, false otherwise
        model.taskIsVisible = function(task) {
            // True if the searchbox text is in the tasks description
            var matchesSearchBox = task.description().toLowerCase().includes(model.searchbox().toLowerCase());

            // True if the task should be visible according to the filter the user has selected
            var matchesFilter;
            if (model.selectFilter() === "all") {
                matchesFilter = true;
            } else if (model.selectFilter() === "completed") {
                matchesFilter = task.status();
            } else if (model.selectFilter() === "uncompleted") {
                matchesFilter = !task.status();
            }

            return (matchesSearchBox && matchesFilter);
        }

        // Returns true if task in uncompleted, false otherwise
        model.uncompleteTask = function(task) {
            return !task.status();
        };

        // Removes all tasks which have been marked as completed
        model.removeCompleteTasks = function() {
            model.list = model.list.filter(model.uncompleteTask);
            model.updateList();
        };

        // Removes a task at a given index in the task list
        model.removeTaskAtIndex = function(taskIndex) {
            model.list.splice(taskIndex,1);
            todo.model.updateList();
        }
    };

    return model
}());

// This controller defines what models are relevant for the current page
// As we only have one model, we only have to init it
todo.controller = function() {
    todo.model.init()
}

// This includes the <head> tag into the application for CSS styling and the title
todo.headView = function() {
    return m("head", [
        m("title", "Code Club ToDo Application"),
        m("link", {rel: "stylesheet", type: "text/css", href: "style.css"})
    ])
}

// This renders the header
todo.headerView = function() {
    return m("div.header", [
        m("h1", "Code Club Todo Application")
    ])
}

// This renders the search bar and filter options for tasks
todo.searchView = function() {
    return m("div.search", [
        m("h2", "Search Tasks"),
        m("input[type=text]", {placeholder: "Search", oninput: m.withAttr("value", todo.model.searchbox)}, todo.model.searchbox()),
        m("br"),
        m("label", "Show:",
          m("select", {onchange: m.withAttr("value", todo.model.selectFilter)}, [
              m("option", {value: "all", selected: true}, "All Tasks"),
              m("option", {value: "completed"}, "Completed Tasks"),
              m("option", {value: "uncompleted"}, "Uncompleted Tasks")
          ]))
    ]);
}

// This renders all current tasks
todo.tasksView = function() {
    return m("div.tasks" , [
        m("h2", "Current Tasks"),
        m("table.tasks-table", [
            m("th", [
                m("input[type=button]", {onclick: todo.model.sortByStatus,
                                         value: "Completed"})]),
            m("th", [
                m("input[type=button]", {onclick: todo.model.sortByCategory,
                                         value: "Category"})
            ]),
            m("th", [
                m("input[type=button]", {onclick: todo.model.sortByDescription,
                                         value: "Description"})
            ]),
            m("th", [
                m("input[type=button]", {onclick: todo.model.sortByCreationDate,
                                         value: "Date Created"})
            ]),
            m("th", [
                m("input[type=button]", {onclick: todo.model.sortByDueDate,
                                         value: "Due Date"})
            ]),
            todo.model.list.map(function(task, taskindex) {
                if (todo.model.taskIsVisible(task)) {
                    return m("tr", {key: task.description()},  [
                        m("td", [
                            m("input[type=checkbox]", {onclick: function(){task.status(!task.status()); todo.model.updateList()}, checked: task.status()})]),
                        m("td", task.category()),
                        m("td", {style: {textDecoration: task.status() ? "line-through" : "none" }}, task.description()),
                        m("td", task.dateCreated()),
                        m("td", {style: {color: (Date.parse(task.dueDate()) > Date.now()) ? "green" : "red"}} ,task.dueDate()),
                        m("td", [
                            m("button.remove_task", {onclick: function(){todo.model.removeTaskAtIndex(taskindex)}}, "✘")
                        ])
                    ])
                }
            })
        ]),
        m("input[type=button]", {onclick: todo.model.removeCompleteTasks,
                                 value: "Remove complete tasks"})
    ]);
}

// This renders the new task menu
todo.newTaskView = function() {
    return m("div", [
        m("h2", "Add new task"),
        m("label", "Description:",
          m("input", {oninput: m.withAttr("value", todo.model.description), value: todo.model.description()})),
        m("br"),
        m("label", "Category:",
          m("input", {oninput: m.withAttr("value", todo.model.category),
                      value: todo.model.category(),
                      list: "category-list"})),
        // List of catergories for the input
        m("datalist", {id: "category-list"},
            todo.model.allCategories().map(
                function(category) {
                    return m("option", {value: category})
                })
        ),
        m("br"),
        m("label", "Due Date:",
          m("input[type=date]", {onchange: m.withAttr("value", todo.model.dueDate), value: todo.model.dueDate()})),
        m("br"),
        m("input[type=button]", {onclick: todo.model.addTask,
                                 value: "Add task"})
    ])
}

// This handles rendering the entire application
todo.view = function() {
    return m("html", [
        todo.headView(),
        m("body", [
            todo.headerView(),
            todo.searchView(),
            todo.tasksView(),
            todo.newTaskView()
        ])
    ])
}

// Starts rendering the application
m.mount(document, {controller: todo.controller, view: todo.view});
