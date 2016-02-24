// Creates application component
var todo = {};

// Todos have a description and a status (done or not)
// Due Dates will be added at a later date
todo.Todo = function(data) {
    this.description = m.prop(data.description);
    if (data.status === true) {
        this.status = m.prop(true);
    } else {
        this.status = m.prop(false);
    }
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

        // Adds a todo to the list, alerts if the description box was empty
        model.addTask = function() {
            if (model.description()) {
                model.list.push(new todo.Todo({description: model.description()}));
                model.description(""); // Clears the description field
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
                                         value: "Completed"}),
                m("input[type=button]", {onclick: todo.model.sortByDescription,
                                         value: "Description"})
            ]),
            todo.model.list
                .map(function(task) {
                    return m("tr", [
                        m("td", [
                            m("input[type=checkbox]", {onclick: function() {
                                task.status(!task.status());
                                todo.model.updateList();
                            },
                                                       checked: task.status()})]),
                        m("td", {style: {textDecoration: task.status() ? "line-through" : "none" }}, task.description())
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
