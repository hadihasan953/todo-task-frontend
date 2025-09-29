
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


// If you have a user form, you can wire it up like this:
// document.addEventListener('DOMContentLoaded', () => {
//     const form = document.getElementById('userForm') as HTMLFormElement | null;
//     const msg = document.getElementById('userMsg');
//     if (!form) return;
//     form.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         if (msg) msg.textContent = '';
//         const name = (document.getElementById('userName') as HTMLInputElement).value.trim();
//         const email = (document.getElementById('userEmail') as HTMLInputElement).value.trim();
//         const password = (document.getElementById('userPassword') as HTMLInputElement).value.trim();
//         const role = (document.getElementById('userRole') as HTMLSelectElement).value;
//         const token = localStorage.getItem('token') || '';
//         try {
//             await createUser({ name, email, password, role }, token);
//             if (msg) msg.textContent = 'User created successfully!';
//             form.reset();
//         } catch (err: any) {
//             if (msg) msg.textContent = err.message || 'Failed to create user.';
//         }
//     });
// });
