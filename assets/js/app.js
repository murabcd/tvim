import { auth, db } from "/assets/js/firebase.js";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  where,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

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
const addButton = document.getElementById("addButton");

// Add a new task
function addTask() {
  const taskName = taskInput.value.trim();
  if (taskName) {
    // Save the task to Firestore
    const taskDoc = {
      name: taskName,
      completed: false,
      createdAt: new Date(),
      userId: auth.currentUser.uid,
    };

    async function addDataToCollection() {
      try {
        const docRef = await addDoc(collection(db, "tasks"), taskDoc);
        console.log("Document written with ID: ", docRef.id);
        taskInput.value = "";
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
    addDataToCollection();
  }
}

// CreateTaskElement, renameTask, completeTask, redoTask, deleteTask, event listeners)
function createTaskElement(taskId, taskName, isCompleted) {
  const task = document.createElement("div");
  task.className = "task";
  task.dataset.taskId = taskId;

  const name = document.createElement("span");
  name.textContent = taskName;
  task.appendChild(name);

  const renameButton = document.createElement("button");
  renameButton.textContent = "Rename";
  renameButton.onclick = () => renameTask(task);
  task.appendChild(renameButton);

  const actionButton = document.createElement("button");
  actionButton.textContent = isCompleted ? "Redo" : "Complete";
  actionButton.onclick = () =>
    isCompleted ? redoTask(task) : completeTask(task);
  task.appendChild(actionButton);

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.onclick = () => deleteTask(task);
  task.appendChild(deleteButton);

  return task;
}

// Rename task
function renameTask(task) {
  const newName = prompt("Enter the new task name:");
  if (newName) {
    task.querySelector("span").textContent = newName;

    // Update the task name in Firestore
    const taskId = task.dataset.taskId;
    const taskRef = doc(db, "tasks", taskId);
    updateDoc(taskRef, { name: newName });
  }
}

// Complete task
function completeTask(task) {
  task.querySelector("button:nth-child(3)").textContent = "Redo";
  task.querySelector("button:nth-child(3)").onclick = () => redoTask(task);
  completedTasks.appendChild(task);

  // Update the task completion status in Firestore
  const taskId = task.dataset.taskId;
  const taskRef = doc(db, "tasks", taskId);
  updateDoc(taskRef, { completed: true });
}

// Redo task
function redoTask(task) {
  task.querySelector("button:nth-child(3)").textContent = "Complete";
  task.querySelector("button:nth-child(3)").onclick = () => completeTask(task);
  ongoingTasks.appendChild(task);

  // Update the task completion status in Firestore
  const taskId = task.dataset.taskId;
  const taskRef = doc(db, "tasks", taskId);
  updateDoc(taskRef, { completed: false });
}

// Delete task
function deleteTask(task) {
  task.remove();

  // Delete the task from Firestore
  const taskId = task.dataset.taskId;
  const taskRef = doc(db, "tasks", taskId);
  deleteDoc(taskRef);
}

if (taskInput) {
  taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addTask();
    }
  });
}

// Other functions and code (addTask, createTaskElement, renameTask, etc.)
if (addButton) {
  addButton.addEventListener("click", addTask);
}

// Load tasks from Firestore
auth.onAuthStateChanged((user) => {
  if (user) {
    const tasksQuery = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "asc")
    );

    onSnapshot(tasksQuery, (querySnapshot) => {
      ongoingTasks.innerHTML = "";
      completedTasks.innerHTML = "";

      querySnapshot.forEach((doc) => {
        const taskData = doc.data();
        const taskId = doc.id;
        const taskName = taskData.name;
        const isCompleted = taskData.completed;

        const taskElement = createTaskElement(taskId, taskName, isCompleted);
        if (isCompleted) {
          completedTasks.appendChild(taskElement);
          const completeButton = taskElement.querySelector(
            "button:nth-child(3)"
          );
          if (completeButton) {
            completeButton.textContent = "Redo";
            completeButton.onclick = () => redoTask(taskElement);
          }
        } else {
          ongoingTasks.appendChild(taskElement);
        }
      });
    });
  }
});
