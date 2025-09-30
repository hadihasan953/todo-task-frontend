// interface User {
//     id: number;
//     name: string;
//     email: string;
//     role: string;
//     createdBy: number | null;
//     createdAt: string;
//     updatedAt: string;
// }

// interface Task {
//     id: number;
//     title: string;
//     description: string;
//     status: string;
//     assignedUserIds?: number[];
//     createdBy?: number;
// }

// const API_BASE = 'http://localhost:3000/api/v1';

//IN USER CREATOR
// async function fetchUsers(token: string): Promise<User[]> {
//     const res = await fetch(`${API_BASE}/user/users`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//     });
//     if (!res.ok) throw new Error('Failed to fetch users');
//     return res.json();
// }

//IN TASK EDIT AND DELETE
// async function fetchTasks(token: string): Promise<Task[]> {
//     const res = await fetch(`${API_BASE}/task/get`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//     });
//     if (!res.ok) throw new Error('Failed to fetch tasks');
//     return res.json();
// }

document.addEventListener('DOMContentLoaded', () => {
    const name = localStorage.getItem('name') ?? '';
    const span = document.querySelector<HTMLSpanElement>('#adminName');
    if (span) span.textContent = name;
});

document.addEventListener('DOMContentLoaded', () => {
    const id = localStorage.getItem('userId') ?? '';
    const span = document.querySelector<HTMLSpanElement>('#adminId');
    if (span) span.textContent = id;
});

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('userId');
            localStorage.removeItem('name');
            window.location.replace('login.html'); // Use replace to prevent back navigation
        });
    }
});

// On page load, fetch users and tasks and log them
// document.addEventListener('DOMContentLoaded', () => {
//     const token = localStorage.getItem('token') || '';
//     fetchUsers(token)
//         .then(users => console.log('Users:', users))
//         .catch(err => console.error('Error fetching users:', err));
//     fetchTasks(token)
//         .then(tasks => console.log('Tasks:', tasks))
//         .catch(err => console.error('Error fetching tasks:', err));
// });

