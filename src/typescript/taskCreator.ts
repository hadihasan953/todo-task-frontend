
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
    const res = await fetch(`${API_BASE}/task`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
}

async function createTask(task: Omit<Task, 'id' | 'status'>, token?: string): Promise<Task> {
    const res = await fetch(`${API_BASE}/task`, {
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
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (msg) msg.textContent = '';
        const title = (document.getElementById('taskTitle') as HTMLInputElement).value.trim();
        const description = (document.getElementById('taskDesc') as HTMLInputElement).value.trim();
        // Collect assigned user IDs from checkboxes if present
        const userPickerList = document.getElementById('userPickerList');
        let assignedUserIds: number[] = [];
        if (userPickerList) {
            assignedUserIds = Array.from(userPickerList.querySelectorAll('input[type=checkbox]:checked')).map(cb => Number((cb as HTMLInputElement).value));
        }
        const token = localStorage.getItem('token') || undefined;
        try {
            await createTask({ title, description, assignedUserIds, createdBy: Number(localStorage.getItem('userId')) }, token);
            if (msg) msg.textContent = 'Task created successfully!';
            form.reset();
        } catch (err: any) {
            if (msg) msg.textContent = err.message || 'Failed to create task.';
        }
    });
});
