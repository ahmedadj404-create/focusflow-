
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");
const summary = document.getElementById("task-summary");

const totalCount = document.getElementById("total-count");
const completedCount = document.getElementById("completed-count");
const remainingCount = document.getElementById("remaining-count");
const filterButtons = document.querySelectorAll(".filter");

let tasks = [];

try {
  const savedTasks = JSON.parse(
    localStorage.getItem("focusflow-tasks") || "[]"
  );

  if (
    Array.isArray(savedTasks) &&
    savedTasks.every(
      task =>
        task &&
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        typeof task.done === "boolean"
    )
  ) {
    tasks = savedTasks;
  }
} catch {
  tasks = [];
}

let currentFilter = "all";

function saveTasks() {
  try {
    localStorage.setItem("focusflow-tasks", JSON.stringify(tasks));
    return true;
  } catch {
    summary.textContent =
      "Unable to save tasks. Your browser storage may be unavailable.";
    return false;
  }
}

function updateCounts() {
  const completed = tasks.filter(task => task.done).length;

  totalCount.textContent = tasks.length;
  completedCount.textContent = completed;
  remainingCount.textContent = tasks.length - completed;
}

function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.done;
    if (currentFilter === "completed") return task.done;
    return true;
  });

  emptyMessage.hidden = visibleTasks.length > 0;

  if (tasks.length === 0) {
    emptyMessage.textContent =
      "No tasks yet. Add your first task above!";
  } else if (visibleTasks.length === 0) {
    emptyMessage.textContent = "No tasks in this filter.";
  }

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = "task-item";

    if (task.done) {
      item.classList.add("done");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute(
      "aria-label",
      `Mark ${task.title} as ${task.done ? "active" : "completed"}`
    );

    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      updateCounts();
      renderTasks();
    });

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      updateCounts();
      renderTasks();
    });

    item.append(checkbox, title, deleteButton);
    taskList.append(item);
  });

  summary.textContent =
    `${tasks.filter(task => task.done).length} of ${tasks.length} tasks completed.`;
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const title = input.value.trim();

  if (!title) return;

  tasks.push({
    id: crypto.randomUUID(),
    title,
    done: false
  });

  saveTasks();
  updateCounts();
  renderTasks();

  input.value = "";
  input.focus();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(filterButton => {
      const active = filterButton === button;
      filterButton.classList.toggle("active", active);
      filterButton.setAttribute("aria-pressed", String(active));
    });

    renderTasks();
  });
});

filterButtons.forEach(button => {
  button.setAttribute(
    "aria-pressed",
    String(button.dataset.filter === currentFilter)
  );
});

updateCounts();
renderTasks();
