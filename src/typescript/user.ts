interface User {
    id?: number;
    name: string;
    email: string;
    password: string;
    role?: string;
}

const API_BASE = 'http://localhost:3000/api/v1';

export async function createUser(user: Omit<User, 'id'>, token?: string): Promise<User> {
    const res = await fetch(`${API_BASE}/user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(user)
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
}



// Kanban board: fetch and render tasks assigned to or created by the user
interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    createdBy?: number;
}

async function fetchUserTasks(token: string): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/task/get`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    const result = await res.json();
    return result.data;
}

async function updateTaskStatus(taskId: number, status: string, token: string) {
    const res = await fetch(`${API_BASE}/task/update/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update task status');
    return res.json();
}

// Track individual user completion (stores in localStorage for now)
function markTaskCompleteForUser(taskId: number, completed: boolean) {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const userCompletions = JSON.parse(localStorage.getItem(`userCompletions_${userId}`) || '{}');
    userCompletions[taskId] = completed;
    localStorage.setItem(`userCompletions_${userId}`, JSON.stringify(userCompletions));
}

// Check if current user has completed a task
function isTaskCompleteForUser(taskId: number): boolean {
    const userId = localStorage.getItem('userId');
    if (!userId) return false;

    const userCompletions = JSON.parse(localStorage.getItem(`userCompletions_${userId}`) || '{}');
    return userCompletions[taskId] === true;
}

function renderKanban(tasks: Task[], token: string) {
    const pendingCol = document.getElementById('col-pending');
    const inProgressCol = document.getElementById('col-in-progress');
    const completedCol = document.getElementById('col-completed');
    if (!pendingCol || !inProgressCol || !completedCol) return;
    pendingCol.innerHTML = '';
    inProgressCol.innerHTML = '';
    completedCol.innerHTML = '';
    tasks.forEach(task => {
        const el = document.createElement('div');
        el.className = 'kanban-task';
        el.draggable = true;
        el.dataset.taskId = String(task.id);
        el.innerHTML = `<strong>${task.title}</strong><br><span>${task.description || ''}</span>`;
        el.addEventListener('dragstart', (e) => {
            (e.dataTransfer as DataTransfer).setData('text/plain', String(task.id));
        });
        // Check if this user has individually completed the task
        const isCompleteForUser = isTaskCompleteForUser(task.id);
        if (isCompleteForUser) {
            completedCol.appendChild(el);
        } else if (task.status === 'in-progress') {
            inProgressCol.appendChild(el);
        } else {
            pendingCol.appendChild(el);
        }
    });
    // Set up drop zones
    [
        { col: pendingCol, status: 'pending' },
        { col: inProgressCol, status: 'in-progress' },
        { col: completedCol, status: 'completed' }
    ].forEach(({ col, status }) => {
        col.ondragover = (e) => { e.preventDefault(); };
        col.ondrop = async (e) => {
            e.preventDefault();
            const taskId = Number((e.dataTransfer as DataTransfer).getData('text/plain'));
            try {
                if (status === 'completed') {
                    // Mark as completed for this user only (doesn't change main task status)
                    markTaskCompleteForUser(taskId, true);
                    // Just re-render, no need to fetch from server
                    renderKanban(tasks, token);
                } else if (status === 'pending') {
                    // Remove user's completion and update main task status
                    markTaskCompleteForUser(taskId, false);
                    await updateTaskStatus(taskId, status, token);
                    // Re-fetch and re-render tasks
                    const newTasks = await fetchUserTasks(token);
                    renderKanban(newTasks, token);
                } else {
                    // For in-progress, update main task status and remove user completion
                    markTaskCompleteForUser(taskId, false);
                    await updateTaskStatus(taskId, status, token);
                    // Re-fetch and re-render tasks
                    const newTasks = await fetchUserTasks(token);
                    renderKanban(newTasks, token);
                }
            } catch (err) {
                alert('Failed to update task status');
            }
        };
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token') || '';
    try {
        const tasks = await fetchUserTasks(token);
        renderKanban(tasks, token);
    } catch (err) {
        // Optionally show error in UI
        const pendingCol = document.getElementById('col-pending');
        if (pendingCol) pendingCol.innerHTML = '<span style="color:red;">Failed to load tasks</span>';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('userLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('userId');
            localStorage.removeItem('name');
            window.location.href = 'login.html';
        });
    }
});

