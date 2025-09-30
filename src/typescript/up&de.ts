// Fetch and render tasks on page load
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token') || '';
    try {
        const tasks = await fetchTasks(token);
        renderTasks(tasks, token);
    } catch (err) {
        const msg = document.getElementById('tasksMsg');
        if (msg) msg.textContent = (err instanceof Error ? err.message : 'Failed to load tasks.');
    }
});
const API_BASE = 'http://localhost:3000/api/v1';

interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    assignedUserIds?: number[];
    // Add other fields as needed
}

export async function fetchTasks(token: string): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/task/get`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    const result = await res.json();
    return result.data;
}

async function updateTask(taskId: number, updates: Partial<Task>, token: string) {
    const res = await fetch(`${API_BASE}/task/update/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
}

async function deleteTask(taskId: number, token: string) {
    const res = await fetch(`${API_BASE}/task/delete/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return res.json();
}

export function renderTasks(tasks: Task[], token: string) {
    const tbody = document.querySelector<HTMLTableSectionElement>('#tasksTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    tasks.forEach(task => {
        const tr = document.createElement('tr');
        // Render as plain text by default, switch to input/select on edit
        let editing = false;
        const renderRow = () => {
            tr.innerHTML = `
                <td class="title-cell">${editing ? `<input type="text" value="${task.title}" data-field="title" style="width:120px">` : `<span>${task.title}</span>`}</td>
                <td class="desc-cell">${editing ? `<input type="text" value="${task.description || ''}" data-field="description" style="width:180px">` : `<span>${task.description || ''}</span>`}</td>
                <td>
                    ${editing ? `
                        <select data-field="status">
                            <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    ` : `<span>${task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>`}
                </td>
                <td>${task.assignedUserIds && task.assignedUserIds.length > 0 ? task.assignedUserIds.join(', ') : '---'}</td>
                <td>
                    <button class="edit-btn" style="margin-right:4px;">${editing ? 'Save' : 'Edit'}</button>
                    <button class="delete-btn">Delete</button>
                </td>
            `;

            const editBtn = tr.querySelector('.edit-btn') as HTMLButtonElement;
            editBtn.addEventListener('click', async () => {
                if (!editing) {
                    editing = true;
                    renderRow();
                } else {
                    // Save changes
                    const titleInput = tr.querySelector('[data-field="title"]') as HTMLInputElement;
                    const descInput = tr.querySelector('[data-field="description"]') as HTMLInputElement;
                    const statusSelect = tr.querySelector('[data-field="status"]') as HTMLSelectElement;
                    const title = titleInput.value.trim();
                    const description = descInput.value.trim();
                    const status = statusSelect.value;
                    try {
                        await updateTask(task.id, { title, description, status }, token);
                        task.title = title;
                        task.description = description;
                        task.status = status;
                        tr.style.background = '#cfc';
                        setTimeout(() => tr.style.background = '', 1000);
                        editing = false;
                        renderRow();
                    } catch (err) {
                        tr.style.background = '#fcc';
                        setTimeout(() => tr.style.background = '', 1000);
                    }
                }
            });
            // Delete
            tr.querySelector('.delete-btn')?.addEventListener('click', async () => {
                if (!confirm('Delete this task?')) return;
                try {
                    await deleteTask(task.id, token);
                    tr.remove();
                } catch (err) {
                    alert('Failed to delete task');
                }
            });
        };
        renderRow();
        tbody.appendChild(tr);
    });
}