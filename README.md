# Code Club TODO Application

## What is it?

This is a web application dedicated to helping you organize all the tasks you have to do so you never forget a task or miss a due date again.
The application was made in HTML and Javascript using [mithril.js](http://mithril.js.org).

## How to get it?

To run the application, simply clone the repo and open index.html.
In the future there will be a hosted version of this application online and instructions on how to host it yourself.

## Performance

This applications search function iterates through the whole task list every time the task list changes.
The rendering of the task list should not take very long when dealing with large amounts of data as Mithrils DOM diffing and auto-redraw system should only re-render tasks which have had their data changed.
However, the search/filtering of the whole task list will still occur even if only 1 task changes.

This could be improved by having a tasks visibility status part of it's data and by only updating this tag when different filtering options are set.
This would mean that when adding a new task instead of checking the visibility of the whole list again, only the visibility of the task added would have to be checked.

Another place where performance may be a concern is our process of storing the task list.
At the moment, whenever the list changes, we rewrite the LocalStorage with the new list.
This could be done more intelligently by only updating the things that have changed.
While this is not important now as we are only storing the data locally, when we transition to a cloud based system, our current method would transfer more data than required.
