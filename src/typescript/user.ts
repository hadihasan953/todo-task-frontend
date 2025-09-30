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
        // Use userCompleted logic
        const isCompleteForUser = task.status === "completed" || (task as any).userCompleted === true;
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
                await updateTaskStatus(taskId, status, token);
                // Re-fetch and re-render tasks
                const tasks = await fetchUserTasks(token);
                renderKanban(tasks, token);
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

