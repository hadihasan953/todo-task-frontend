interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    assignedUserIds?: number[];
    createdBy?: number;
}

const API_BASE = 'http://localhost:3000/api/v1';

export async function fetchTasks(): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/task/create`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
}

async function createTask(task: Omit<Task, 'id' | 'status'>, token?: string): Promise<Task> {
    const res = await fetch(`${API_BASE}/task/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(task)
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
}


// Wire up task form
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('taskForm') as HTMLFormElement | null;
    const msg = document.getElementById('taskMsg');
    const userPickerList = document.getElementById('userPickerList');
    const openUserPickerBtn = document.getElementById('openUserPicker');
    const userPicker = document.getElementById('userPicker');
    const selectAllBtn = document.getElementById('selectAllUsers');
    const clearAllBtn = document.getElementById('clearAllUsers');
    const doneBtn = document.getElementById('doneUserPicker');

    // Show/hide user picker
    if (openUserPickerBtn && userPicker) {
        openUserPickerBtn.addEventListener('click', () => {
            userPicker.style.display = userPicker.style.display === 'block' ? 'none' : 'block';
        });
    }
    if (doneBtn && userPicker) {
        doneBtn.addEventListener('click', () => {
            userPicker.style.display = 'none';
        });
    }

    // Fetch and render users for assignment
    (async () => {
        if (!userPickerList) return;
        const token = localStorage.getItem('token') || '';
        try {
            const users = await fetchUsers(token);
            // Filter out admin users
            const nonAdminUsers = users.filter(user => user.role !== 'admin');
            userPickerList.innerHTML = nonAdminUsers.map(user =>
                `<label><input type="checkbox" value="${user.id}"> ${user.name || user.email || 'User ' + user.id}</label><br>`
            ).join('');
        } catch (err: any) {
            userPickerList.innerHTML = `<span style="color:red;">Failed to load users</span>`;
        }
    })();

    // Select all/clear all logic
    if (selectAllBtn && userPickerList) {
        selectAllBtn.addEventListener('click', () => {
            userPickerList.querySelectorAll('input[type=checkbox]').forEach(cb => (cb as HTMLInputElement).checked = true);
        });
    }
    if (clearAllBtn && userPickerList) {
        clearAllBtn.addEventListener('click', () => {
            userPickerList.querySelectorAll('input[type=checkbox]').forEach(cb => (cb as HTMLInputElement).checked = false);
        });
    }

    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (msg) msg.textContent = '';
        const title = (document.getElementById('taskTitle') as HTMLInputElement).value.trim();
        const description = (document.getElementById('taskDesc') as HTMLInputElement).value.trim();
        let assignedUserIds: number[] = [];
        if (userPickerList) {
            assignedUserIds = Array.from(userPickerList.querySelectorAll('input[type=checkbox]:checked')).map(cb => Number((cb as HTMLInputElement).value));
        }
        const token = localStorage.getItem('token') || undefined;
        try {
            await createTask({ title, description, assignedUserIds, createdBy: Number(localStorage.getItem('userId')) }, token);
            if (msg) msg.textContent = 'Task created successfully!';
            form.reset();
            // Optionally, uncheck all users after task creation
            if (userPickerList) userPickerList.querySelectorAll('input[type=checkbox]').forEach(cb => (cb as HTMLInputElement).checked = false);
        } catch (err: any) {
            if (msg) msg.textContent = err.message || 'Failed to create task.';
        }
    });
});

interface User {
    id: number;
    name?: string;
    email?: string;
    role?: string;
    // Add other user fields as needed
}

async function fetchUsers(token: string): Promise<User[]> {
    const res = await fetch(`${API_BASE}/user/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    const result = await res.json();
    return result.data;
}
