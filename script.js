const STORAGE_KEY = 'taskflow-todos-v1';
const USERS_KEY = 'taskflow-users-v1';
const CURRENT_USER_KEY = 'taskflow-current-user-v1';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const count = document.getElementById('todo-count');
const clearButton = document.getElementById('clear-completed');
const markAllButton = document.getElementById('mark-all');
const filterBar = document.querySelector('.filter-bar');
const summaryTotal = document.getElementById('summary-total');
const summaryActive = document.getElementById('summary-active');
const summaryCompleted = document.getElementById('summary-completed');

const authCard = document.getElementById('auth-card');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authMessage = document.getElementById('auth-message');
const showRegisterButton = document.getElementById('show-register');
const showLoginButton = document.getElementById('show-login');
const logoutButton = document.getElementById('logout-button');
const userGreeting = document.getElementById('user-greeting');
const authTitle = document.getElementById('auth-title');
const authSwitchText = document.getElementById('auth-switch-text');

let todos = [];
let activeFilter = 'all';
let dragSourceId = null;
let currentUser = null;

function getTodosStorageKey() {
  return currentUser ? `${STORAGE_KEY}-${currentUser}` : STORAGE_KEY;
}

function persist() {
  if (!currentUser) return;
  localStorage.setItem(getTodosStorageKey(), JSON.stringify(todos));
}

function hydrate() {
  if (!currentUser) {
    todos = [];
    return;
  }

  const saved = localStorage.getItem(getTodosStorageKey());
  if (!saved) {
    todos = [];
    return;
  }

  try {
    todos = JSON.parse(saved).map((item) => ({
      id: item.id ?? crypto.randomUUID(),
      text: item.text ?? '',
      completed: item.completed ?? false,
      editing: false,
      createdAt: item.createdAt ?? Date.now(),
    }));
  } catch (error) {
    console.warn('Failed to parse saved todos', error);
    todos = [];
  }
}

function loadUsers() {
  const saved = localStorage.getItem(USERS_KEY);
  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadCurrentUser() {
  return localStorage.getItem(CURRENT_USER_KEY);
}

function saveCurrentUser(username) {
  currentUser = username;
  localStorage.setItem(CURRENT_USER_KEY, username);
}

function clearCurrentUser() {
  currentUser = null;
  localStorage.removeItem(CURRENT_USER_KEY);
}

function displayAuthMessage(message, isError = true) {
  authMessage.textContent = message;
  authMessage.style.color = isError ? '#f8b4b4' : 'var(--accent-strong)';
}

function showAuthView(view = 'login') {
  authCard.classList.remove('hidden');
  document.getElementById('todo-card').classList.add('hidden');
  loginForm.classList.toggle('hidden', view !== 'login');
  registerForm.classList.toggle('hidden', view !== 'register');
  showRegisterButton.classList.toggle('hidden', view === 'register');
  showLoginButton.classList.toggle('hidden', view !== 'register');
  authTitle.textContent = view === 'login' ? 'Sign in to TaskFlow' : 'Create account';
  authSwitchText.textContent = view === 'login' ? 'New here?' : 'Already have an account?';
  displayAuthMessage('');
}

function showTodoView() {
  authCard.classList.add('hidden');
  document.getElementById('todo-card').classList.remove('hidden');
  userGreeting.textContent = currentUser ? `@${currentUser}` : 'Guest';
}

function findUser(username) {
  const normalized = username.trim().toLowerCase();
  return loadUsers().find((user) => user.username.toLowerCase() === normalized);
}

function isValidUsername(username) {
  return username.trim().length >= 3;
}

function isValidPassword(password) {
  return password.length >= 6;
}

function loginUser(username, password) {
  const normalized = username.trim();
  const user = findUser(normalized);
  if (!user) return 'No account found with that username.';
  if (user.password !== password) return 'Password does not match.';

  saveCurrentUser(normalized);
  hydrate();
  render();
  showTodoView();
  return null;
}

function registerUser(username, password, confirmPassword) {
  const normalized = username.trim();
  if (!isValidUsername(normalized)) return 'Username must be at least 3 characters.';
  if (!isValidPassword(password)) return 'Password must be at least 6 characters.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  if (findUser(normalized)) return 'This username is already taken.';

  const users = loadUsers();
  users.push({ username: normalized, password });
  saveUsers(users);
  saveCurrentUser(normalized);
  hydrate();
  render();
  showTodoView();
  return null;
}

function logout() {
  clearCurrentUser();
  todos = [];
  showAuthView('login');
}

function getFilteredTodos() {
  return todos.filter((todo) => {
    if (activeFilter === 'active') return !todo.completed;
    if (activeFilter === 'completed') return todo.completed;
    return true;
  });
}

function formatRelative(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function updateSummary() {
  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;
  const active = total - completed;

  summaryTotal.textContent = total;
  summaryActive.textContent = active;
  summaryCompleted.textContent = completed;
  count.textContent = `${total} total · ${active} active · ${completed} completed`;
}

function render() {
  const filtered = getFilteredTodos();

  if (filtered.length === 0) {
    list.innerHTML = `
      <li class="empty-state">
        <strong>Everything is clear.</strong>
        <p>Add a task or switch tabs to view your work queue.</p>
      </li>`;
  } else {
    list.innerHTML = filtered
      .map((todo) => {
        const isEditing = todo.editing ? 'editing' : '';
        const checked = todo.completed ? 'checked' : '';
        return `
        <li class="todo-item ${isEditing}" draggable="true" data-id="${todo.id}" aria-label="${escapeHtml(todo.text)}">
          <label class="todo-checkbox">
            <input type="checkbox" data-action="toggle" ${checked} />
          </label>

          <div class="todo-body">
            ${todo.editing ? `
              <div class="edit-row">
                <input class="edit-input" type="text" value="${escapeHtml(todo.text)}" aria-label="Edit task" />
                <div class="edit-actions">
                  <button type="button" class="text-button" data-action="save">Save</button>
                  <button type="button" class="text-button" data-action="cancel">Cancel</button>
                </div>
              </div>
            ` : `
              <span class="todo-text ${todo.completed ? 'completed' : ''}">${escapeHtml(todo.text)}</span>
              <span class="todo-created">Added ${formatRelative(todo.createdAt)}</span>
            `}
          </div>

          <div class="todo-actions">
            <button type="button" class="text-button" data-action="edit" aria-label="Edit task">Edit</button>
            <button type="button" class="text-button" data-action="delete" aria-label="Delete task">Delete</button>
            <button type="button" class="text-button drag-handle" data-action="drag" aria-label="Drag to reorder">⇅</button>
          </div>
        </li>`;
      })
      .join('');
  }

  updateSummary();
  persist();
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function addTodo(text) {
  todos.push({
    id: crypto.randomUUID(),
    text: text.trim(),
    completed: false,
    editing: false,
    createdAt: Date.now(),
  });
  render();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  render();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  render();
}

function startEditing(id) {
  todos = todos.map((todo) => ({
    ...todo,
    editing: todo.id === id,
  }));
  render();
}

function saveEdit(id, value) {
  const trimmed = value.trim();
  if (!trimmed) return;

  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, text: trimmed, editing: false } : todo
  );
  render();
}

function cancelEdit(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, editing: false } : todo
  );
  render();
}

function clearCompleted() {
  todos = todos.filter((todo) => !todo.completed);
  render();
}

function markAllDone() {
  todos = todos.map((todo) => ({ ...todo, completed: true }));
  render();
}

function reorderTodos(fromId, toId) {
  const fromIndex = todos.findIndex((item) => item.id === fromId);
  const toIndex = todos.findIndex((item) => item.id === toId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;

  const [moved] = todos.splice(fromIndex, 1);
  todos.splice(toIndex, 0, moved);
  render();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) return;
  addTodo(value);
  input.value = '';
  input.focus();
});

list.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  const item = event.target.closest('.todo-item');
  if (!action || !item) return;

  const id = item.dataset.id;
  if (!id) return;

  switch (action) {
    case 'toggle':
      toggleTodo(id);
      break;
    case 'edit':
      startEditing(id);
      break;
    case 'delete':
      deleteTodo(id);
      break;
    case 'save': {
      const inputField = item.querySelector('.edit-input');
      if (inputField instanceof HTMLInputElement) {
        saveEdit(id, inputField.value);
      }
      break;
    }
    case 'cancel':
      cancelEdit(id);
      break;
    case 'drag':
      break;
    default:
      break;
  }
});

filterBar.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!(button instanceof HTMLElement)) return;

  activeFilter = button.dataset.filter || 'all';
  filterBar.querySelectorAll('.filter-button').forEach((node) => {
    node.classList.toggle('active', node === button);
  });
  render();
});

clearButton.addEventListener('click', clearCompleted);
markAllButton.addEventListener('click', markAllDone);

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const error = loginUser(username, password);
  if (error) {
    displayAuthMessage(error);
  } else {
    loginForm.reset();
  }
});

registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm').value;
  const error = registerUser(username, password, confirmPassword);
  if (error) {
    displayAuthMessage(error);
  } else {
    registerForm.reset();
  }
});

showRegisterButton.addEventListener('click', () => showAuthView('register'));
showLoginButton.addEventListener('click', () => showAuthView('login'));
logoutButton.addEventListener('click', logout);

list.addEventListener('dragstart', (event) => {
  const item = event.target.closest('.todo-item');
  if (!item) return;
  dragSourceId = item.dataset.id;
  item.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
});

list.addEventListener('dragend', (event) => {
  const item = event.target.closest('.todo-item');
  if (!item) return;
  item.classList.remove('dragging');
  dragSourceId = null;
});

list.addEventListener('dragover', (event) => {
  event.preventDefault();
  const item = event.target.closest('.todo-item');
  if (!item) return;
  event.dataTransfer.dropEffect = 'move';
});

list.addEventListener('drop', (event) => {
  event.preventDefault();
  const item = event.target.closest('.todo-item');
  if (!item || !dragSourceId) return;

  const targetId = item.dataset.id;
  if (dragSourceId !== targetId) {
    reorderTodos(dragSourceId, targetId);
  }
});

const savedUser = loadCurrentUser();
if (savedUser && findUser(savedUser)) {
  saveCurrentUser(savedUser);
  hydrate();
  showTodoView();
} else {
  clearCurrentUser();
  showAuthView('login');
}

render();
