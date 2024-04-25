// TASK: import helper functions from utils
// TASK: import initialData
import {getTasks, createNewTask, patchTask, putTask, deleteTask} from './utils/taskFunctions.js';
import {initialData} from './initialData.js';

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
const image = document.getElementById('logo')
function initializeData() {
  
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
    localStorage.setItem('light-theme','enabled');
    localStorage.setItem('logo','./assets/logo-light.svg');
    localStorage.setItem('switch', 'true')
    image.src = localStorage.getItem('logo')

  } else {
    console.log("Data already exists in localStorage");
  }
}
initializeData()

// TASK: Get elements from the DOM
const elements = {
  modalWindow: document.getElementById("new-task-modal-window"),
  filterDiv: document.getElementById('filterDiv'),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),
  showSideBar: document.getElementById('side-bar-div'),
  columnDivs: document.querySelectorAll('.column-div'),//had to pick all since they carry the same class so that they can appear
  headerBoardName: document.getElementById('header-board-name'),
  filterDiv: document.getElementById('filterDiv'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  
};

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();//GETTING DATA FROM LOCAL STORAGE
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0]; // bug ';' instead of ':'
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ""; // Clears the container
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", function () {//BUG : 'click()' instead of eventListener
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter((task) => (task.board === boardName)); //BUG : "=" instead of === for comparing

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach((column) => {
    
    const status = column.getAttribute("data-status");//is todo,doing , Done
    // console.log(status)
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks
      .filter((task) => (task.status === status))//compare if they are the same
      .forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute("data-task-id", task.id);

        // Listen for a click event on each task and open a modal
        taskElement.addEventListener("click", function () {// BUG: wrong use of eventListener()
          openEditTaskModal(task);
        });

        tasksContainer.appendChild(taskElement);
      });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").forEach((btn) => {
    if (btn.textContent === boardName) {
      btn.classList.add("active"); //BUG: missed classList
    } else {
      btn.classList.remove("active");// BUG : Missed classList
    }
  });
}

//NEEDS TO ADD THE NEW TASK TO USER INT
function addTaskToUI(task) {
  const column = document.querySelector(
    `.column-div[data-status="${task.status}"]`//Bug : Had to use template literal instead of a string
  );
  console.log(task.status)
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`
    );
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title;
  console.log(task.id) // Modify as needed
  taskElement.setAttribute("data-task-id", task.id);
 

  tasksContainer.appendChild(taskElement);
}

//FUNCTION FOR ALL BUTTONS CLICKS 
function setupEventListeners() {
  // Cancel editing task event listener
  
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.addEventListener("click", function () {
    toggleModal(false, elements.editTaskModal);
  });

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", function () {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", function () {
    toggleSidebar(false);
  });
  elements.showSideBarBtn.addEventListener("click", function () {
    toggleSidebar(true);
  });

  // Theme switch event listener
  elements.themeSwitch.addEventListener("change", toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener("submit", (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
// Task: Fix bugs
//FOR MODAL TO SHOW
function toggleModal(show, modal = elements.modalWindow) {//Which modal must open
  
  modal.style.display = show ? "block" : "none";//BUG : used '=>' instead of :
  
}


/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();

  //Assign user input to the task object
  // THE SAME WAY WE DID ON ELEMENTS
  const task = {
    title: document.getElementById('title-input').value,
    discription: document.getElementById('desc-input').value,
    status: document.getElementById('select-status').value,
    board: activeBoard

  };
  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}

//SIDE BAR FUNCTION
function toggleSidebar(show) {
  const sidebarBottomClass = document.querySelector(".side-bar-bottom");

  sidebarBottomClass.style.marginTop = '300px';
  
  
  if(show ){
    
    elements.showSideBar.style.display ="block"
    elements.showSideBarBtn.style.display = "none"
  }else {
    elements.showSideBar.style.display = "none"
    elements.showSideBarBtn.style.display = "block"
  }
  if(localStorage.getItem("showSideBar") == "true") {
    localStorage.setItem("showSideBar", true)
  }
  if (localStorage.setItem("showSideBarBtn", false)){
    
  }
    
}

function toggleTheme() {
  // document.body.classList.toggle('light-theme')
  // localStorage.setItem('light-theme', "enabled");
  // if( localStorage.('light-theme', "enabled"))
  if(localStorage.getItem('light-theme') == 'enabled'){
    document.body.classList.toggle('light-theme',false);
    localStorage.setItem('light-theme','disabled')
    image.src = localStorage.getItem('logo')
  }
  else{
    document.body.classList.toggle('light-theme',true);
    localStorage.setItem('light-theme','enabled')
    image.src = localStorage.getItem('logo')

  }
 
}

//OPENS THE EDTI TASK /Only for edit Modal
function openEditTaskModal(task) {
  // Set task details in modal inputs
  document.getElementById('edit-task-title-input').value = task.title
  document.getElementById('edit-task-desc-input').value = task.description
  document.getElementById('edit-select-status').value = task.status


  // Get button elements from the task modal
  const saveTaskChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');

  // Call saveTaskChanges upon click of Save Changes button
  saveTaskChangesBtn.addEventListener('click', function() {
    saveTaskChanges(task.id)
    toggleModal(false, elements.editTaskModal)//close it
  })

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener('click', function() {
    deleteTask(task.id)//deletes the task
    toggleModal(false, elements.editTaskModal)//close the modal
    refreshTasksUI()
  })
  cancelEditBtn.addEventListener('click', function() {
    toggleModal(false, elements.editTaskModal)
  })
  
  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

//

function saveTaskChanges(taskId) {
  // Get new user inputs
  const editTaskTitle = document.getElementById('edit-task-title-input').value;
  const editTaskDescription = document.getElementById('edit-task-desc-input').value;
  const editTaskStatus = document.getElementById('edit-select-status').value

  // Create an object with the updated task details
  const updateTask = {
    title: editTaskTitle,
    description: editTaskDescription,
    status: editTaskStatus
  }

  // Update task using a hlper functoin
  patchTask(taskId, updateTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal)

  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener("DOMContentLoaded", function () {
  init(); // init is called after the DOM is fully loaded
  
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem("light-theme") === "enabled";
  document.body.classList.toggle("light-theme", isLightTheme);

  if(localStorage.getItem('logo') == './asset/logo-dark.svg'){
    image.src = './asset/logo-light.svg'
  } 

  if (localStorage.getItem('switch') =='false') {
    elements.themeSwitch.setAttribute('checked', 'false')
  }
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
