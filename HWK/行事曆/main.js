document.addEventListener("DOMContentLoaded", () => {
    const gridContainer = document.getElementById("calendar-days");
    const monthElement = document.getElementById("month");
    const yearElement = document.getElementById("year");
    const todayButton = document.querySelector(".today_btn");
    const modalDateInput = document.getElementById("modal-date-input");
    const modalColorInput = document.getElementById("exampleColorInput");
    const modalTextInput = document.getElementById("exampleInputPassword1");
    const modalSubmitButton = document.getElementById("modal-submitBtn");
    const modalDeleteButton = document.getElementById("modal-deleteBtn");
    const modal = new bootstrap.Modal(document.getElementById("exampleModal"));
    const dropdownButton = document.getElementById("dropdownMenuButton1");
    const dropdownItems = document.querySelectorAll(".dropdown-item");
    let selectedIconHTML = "";
    let editingTask = null;
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    const months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

    function generateUniqueId() {
        return Date.now().toString();
    }

    function fillCalendar(year, month) {
        gridContainer.innerHTML = "";
        let firstDay = new Date(year, month, 1).getDay();
        let daysInMonth = new Date(year, month + 1, 0).getDate();
        let today = new Date();

        for (let i = 0; i < 42; i++) {
            const gridItem = document.createElement("div");
            gridItem.className = "day";

            if (i >= firstDay && i < firstDay + daysInMonth) {
                let day = i - firstDay + 1;
                gridItem.innerHTML = `<div class="day-number">${day}</div>`;
                gridItem.dataset.date = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

                if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                    gridItem.classList.add("today");
                }

                // 新增事項到格子
                const savedTodos = getTodosFromLocalStorage();
                const dayTodos = savedTodos.filter(todo => todo.date === gridItem.dataset.date);
                dayTodos.forEach(todo => {
                    const todoElement = createTodoItem(todo.key, todo.iconHTML, todo.text, todo.backgroundColor);
                    gridItem.appendChild(todoElement);
                });

                gridItem.addEventListener("click", () => {
                    selectedDate = gridItem.dataset.date;
                    modalDateInput.value = selectedDate;
                    modal.show();
                    editingTask = null;
                    setModalButtonsForNewTodo(); // 設置表單為新增模式
                });
            }
            gridContainer.appendChild(gridItem);
        }

        monthElement.textContent = months[month];
        yearElement.textContent = year;
    }

    function createTodoItem(key, iconHTML, text, backgroundColor) {
        const todoElement = document.createElement("div");
        todoElement.className = "task-item";
        todoElement.style.backgroundColor = backgroundColor;
        todoElement.dataset.key = key;
        todoElement.innerHTML = `
            ${iconHTML} <span class="task-text">${text}</span>
        `;
        todoElement.addEventListener("click", (event) => {
            event.stopPropagation();
            editingTask = todoElement;
            modalDateInput.value = todoElement.closest(".day").dataset.date;
            setModalButtonsForEditTodo(); // 設置表單為編輯模式
            modal.show();
        });
        return todoElement;
    }

    function setModalButtonsForNewTodo() {
        modalSubmitButton.textContent = "新增";
        setModalDeleteButtonVisibility(false);
        modalTextInput.value = "";
    }

    function setModalButtonsForEditTodo() {
        modalSubmitButton.textContent = "保存";
        setModalDeleteButtonVisibility(true);
        modalDateInput.value = editingTask.closest(".day").dataset.date;
        modalTextInput.value = editingTask.querySelector(".task-text").textContent.trim();
    }

    function setModalDeleteButtonVisibility(visible) {
        modalDeleteButton.style.display = visible ? "inline-block" : "none";
    }

    function saveTodoToLocalStorage(todo) {
        const savedTodos = getTodosFromLocalStorage();
        savedTodos.push(todo);
        localStorage.setItem("todos", JSON.stringify(savedTodos));
    }

    function getTodosFromLocalStorage() {
        const todos = localStorage.getItem("todos");
        return todos ? JSON.parse(todos) : [];
    }

    function removeTodoFromLocalStorage(key) {
        let savedTodos = getTodosFromLocalStorage();
        savedTodos = savedTodos.filter(todo => todo.key !== key);
        localStorage.setItem("todos", JSON.stringify(savedTodos));
    }

    function removeTodoFromDOM(key) {
        const dayElement = [...document.querySelectorAll(".day")].find(day => day.dataset.date === modalDateInput.value);
        if (dayElement) {
            const todoElement = dayElement.querySelector(`.task-item[data-key="${key}"]`);
            if (todoElement) {
                dayElement.removeChild(todoElement);
            }
        }
    }

    function refreshCalendar() {
        fillCalendar(currentYear, currentMonth);
    }

    fillCalendar(currentYear, currentMonth);

    document.getElementById("prev-month").addEventListener("click", () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        refreshCalendar();
    });

    document.getElementById("next-month").addEventListener("click", () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        refreshCalendar();
    });

    document.getElementById("prev-year").addEventListener("click", () => {
        currentYear--;
        refreshCalendar();
    });

    document.getElementById("next-year").addEventListener("click", () => {
        currentYear++;
        refreshCalendar();
    });

    todayButton.addEventListener("click", () => {
        currentYear = new Date().getFullYear();
        currentMonth = new Date().getMonth();
        refreshCalendar();
    });

    dropdownItems.forEach(item => {
        item.addEventListener("click", (event) => {
            event.preventDefault();
            const iconElement = item.querySelector("i, img");
            if (iconElement) {
                selectedIconHTML = iconElement.outerHTML;
                dropdownButton.innerHTML = `圖示: ${selectedIconHTML}`;
            }
        });
    });

    modalSubmitButton.addEventListener("click", (event) => {
        event.preventDefault();
        const selectedDate = modalDateInput.value;
        if (selectedDate) {
            const dayElement = [...document.querySelectorAll(".day")].find(day => day.dataset.date === selectedDate);
            if (dayElement) {
                if (editingTask) {
                    // 更新代辦事項
                    const oldKey = editingTask.dataset.key;
                    editingTask.style.backgroundColor = modalColorInput.value;
                    editingTask.innerHTML = `
                        ${selectedIconHTML} <span class="task-text">${modalTextInput.value}</span>
                    `;
                    const updatedTodo = {
                        key: oldKey,
                        date: selectedDate,
                        iconHTML: selectedIconHTML,
                        text: modalTextInput.value,
                        backgroundColor: modalColorInput.value
                    };
                    removeTodoFromLocalStorage(oldKey);
                    saveTodoToLocalStorage(updatedTodo);
                    editingTask = null;
                    setModalButtonsForNewTodo();
                } else {
                    // 新增代辦事項
                    const todoKey = generateUniqueId();
                    const todoElement = createTodoItem(todoKey, selectedIconHTML, modalTextInput.value, modalColorInput.value);
                    dayElement.appendChild(todoElement);
                    const newTodo = {
                        key: todoKey,
                        date: selectedDate,
                        iconHTML: selectedIconHTML,
                        text: modalTextInput.value,
                        backgroundColor: modalColorInput.value
                    };
                    saveTodoToLocalStorage(newTodo);
                }
            }
        }
        modal.hide();
    });

    modalDeleteButton.addEventListener("click", () => {
        if (modalDateInput.value && editingTask) {
            const todoKey = editingTask.dataset.key;
            removeTodoFromLocalStorage(todoKey);
            removeTodoFromDOM(todoKey);
            refreshCalendar();
            editingTask = null;
            modal.hide();
        }
    });
});
