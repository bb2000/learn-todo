// Creates application component
var todo = {};

// Todos have a description and a status (done or not)
// Due Dates will be added at a later date TODO
todo.Todo = function(data) {
    this.description = m.prop(data.description);
    this.status = m.prop(data.status ? true : false);
    this.dateCreated = m.prop(data.dateCreated ? data.dateCreated : new Date().toDateString());
    this.dueDate = m.prop(data.dueDate)
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

        // Sorts, updates and stores the list (should be called at the end of every function that changes the list)
        model.updateList = function() {
            model.list.sort(model.compareFunction);
            localStorage.setItem("tasklist", JSON.stringify(model.list));
        }

        // Function with which our todo list is sorted with (returns 0 at first because user has not selected a sort method)
        model.compareFunction = function(a, b) {
            return 0;
        };

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
                // date input is a string not a Date, so some conversion is needed
                model.list.push(new todo.Todo({description: model.description(), dueDate: new Date(model.dueDate()).toDateString()}));

                model.description(""); // Clears the description field
                model.dueDate("");
                model.updateList();
            }
        };

        // Returns true if task in uncompleted, false otherwise
        model.uncompleteTask = function(task) {
            return !task.status();
        };

        // Removes all tasks which have been marked as completed
        model.removeCompleteTasks = function() {
            model.list = model.list.filter(model.uncompleteTask);
            model.updateList();
        };
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

// This renders all current tasks
todo.tasksView = function() {
    return m("div.tasks" , [
        m("h2", "Current Tasks"),
        m("table.tasks-table", [
            m("th", [
                m("input[type=button]", {onclick: todo.model.sortByStatus,
                                         value: "Completed"})]),
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
          todo.model.list
          .map(function(task) {
              return m("tr", [
                  m("td", [
                      m("input[type=checkbox]", {onclick: function(){task.status(!task.status()); todo.model.updateList()}, checked: task.status()})]),
                  m("td", {style: {textDecoration: task.status() ? "line-through" : "none" }}, task.description()),
                  m("td", task.dateCreated()),
                  m("td", {style: {color: (Date.parse(task.dueDate()) > Date.now()) ? "green" : "red"}} ,task.dueDate())
              ])
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
        m("input", {onchange: m.withAttr("value", todo.model.description), value: todo.model.description()}),
        m("input[type=date]", {onchange: m.withAttr("value", todo.model.dueDate), value: todo.model.dueDate()}),
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
            todo.tasksView(),
            todo.newTaskView()
        ])
    ])
}

// Starts rendering the application
m.mount(document, {controller: todo.controller, view: todo.view});
