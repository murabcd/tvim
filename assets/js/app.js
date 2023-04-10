// Load sidebar HTML code into the sidebar div
document.addEventListener("DOMContentLoaded", function () {
  fetch("/pages/sidebar.html")
    .then((response) => response.text())
    .then((html) => {
      const sidebar = document.querySelector("#sidebar");
      if (sidebar) {
        sidebar.innerHTML = html;
      }
    });
});

// Get DOM elements
const taskInput = document.getElementById("taskInput");
const ongoingTasks = document.getElementById("ongoingTasks");
const completedTasks = document.getElementById("completedTasks");

// Add a new task
function addTask() {
  const taskName = taskInput.value.trim();
  if (taskName) {
    const task = createTaskElement(taskName);
    ongoingTasks.appendChild(task);
    taskInput.value = "";
  }
}

// Create a task element
function createTaskElement(taskName) {
  const task = document.createElement("div");
  task.className = "task";

  const name = document.createElement("span");
  name.textContent = taskName;
  task.appendChild(name);

  const renameButton = document.createElement("button");
  renameButton.textContent = "Rename";
  renameButton.onclick = () => renameTask(task);
  task.appendChild(renameButton);

  const completeButton = document.createElement("button");
  completeButton.textContent = "Complete";
  completeButton.onclick = () => completeTask(task);
  task.appendChild(completeButton);

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.onclick = () => deleteTask(task);
  task.appendChild(deleteButton);

  return task;
}

// Rename a task
function renameTask(task) {
  const newName = prompt("Enter the new task name:");
  if (newName) {
    task.querySelector("span").textContent = newName;
  }
}

// Complete a task
function completeTask(task) {
  task.querySelector("button:nth-child(2)").textContent = "Redo";
  task.querySelector("button:nth-child(2)").onclick = () => redoTask(task);
  completedTasks.appendChild(task);
}

// Redo a task
function redoTask(task) {
  task.querySelector("button:nth-child(2)").textContent = "Complete";
  task.querySelector("button:nth-child(2)").onclick = () => completeTask(task);
  ongoingTasks.appendChild(task);
}

// Delete a task
function deleteTask(task) {
  task.remove();
}

// Add event listener for the Enter key
if (taskInput) {
  taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addTask();
    }
  });
}
