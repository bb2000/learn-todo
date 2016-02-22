// Creates application component
var todo = {};

// Todos have a description and a status (done or not)
// Due Dates will be added at a later date
todo.Todo = function(data) {
    this.description = m.prop(data.description);
    this.status = m.prop(false); // Tasks will be not finished by default
};

// A TodoList is an array of Todo's
todo.TodoList = Array;

// The Todo model is responsible for adding and storing new todo's
todo.model = (function() {
    var model = {}

    model.init = function(){
        // The list of current tasks
        model.list = new todo.TodoList();

        // Storage of new todo description before it is created
        model.description = m.prop("");

        // Adds a todo to the list, alerts if the description box was empty
        model.add_task = function() {
            if (model.description()) {
                model.list.push(new todo.Todo({description: model.description()}));
                model.description(""); // Clears the description field
            }
        };
    };

    return model
}());

// This controller defines what models are relevant for the current page
// As we only have one model, we only have to init it
todo.controller = function() {
    todo.model.init()
}

// This renders the header
todo.headerView = function() {
    return m("h1", "Code Club Todo Application")
}

// This renders all current tasks
todo.tasksView = function() {
    return m("span" , [
        m("h2", "Current Tasks"),
        m("table", [
            todo.model.list.map(function(task) {
                return m("tr", [
                    m("td", [
                        m("input[type=checkbox]", {onclick: m.withAttr("checked", task.status), checked: task.status()}),
                        m("td", {style: {textDecoration: task.status() ? "line-through" : "none" }}, task.description())
                    ])
                ])
            })
        ])
    ])
}

// This renders the new task menu
todo.newTaskView = function() {
    return m("span", [
        m("h2", "Add new task"),
        m("input", {onchange: m.withAttr("value", todo.model.description), value: todo.model.description()}),
        m("input[type=button]", {onclick: todo.model.add_task, value:"Add task"})
    ])
}

// This handles rendering the entire application
todo.view = function() {
    return m("html", [
        m("head", [
            m("title", "Code Club ToDo Application")
        ]),
        m("body", [
            todo.headerView(),
            todo.tasksView(),
            todo.newTaskView()
        ])
    ])
}

// Starts rendering the application
m.mount(document, {controller: todo.controller, view: todo.view});
