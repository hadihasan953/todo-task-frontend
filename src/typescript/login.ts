interface LoginResponse {
    status: string;
    message: string;
    data: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
            createdBy: number | null;
            createdAt: string;
            updatedAt: string;
        };
        token: string;
    };
}

const API_BASE = 'http://localhost:3000/api/v1';

async function login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    console.log('Login response:', res);
    if (!res.ok) {
        let msg = 'Login failed';
        try {
            const data = await res.json();
            msg = data.message || msg;
        } catch { }
        throw new Error(msg);
    }
    return res.json();
}

// Wire up login form
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm') as HTMLFormElement | null;
    const errorMsg = document.getElementById('errorMsg');
    if (!form) {
        console.error('Login form not found');
        return;
    }
    form.addEventListener('submit', async (e) => {
        console.log('Login form submitted');
        e.preventDefault();
        if (errorMsg) errorMsg.textContent = '';
        const emailInput = document.getElementById('email') as HTMLInputElement | null;
        const passwordInput = document.getElementById('password') as HTMLInputElement | null;
        if (!emailInput || !passwordInput) {
            if (errorMsg) errorMsg.textContent = 'Email or password input not found';
            console.error('Email or password input not found');
            return;
        }
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        console.log('Submitting login for:', email);
        try {
            const data = await login(email, password);
            localStorage.setItem('name', data.data.user.name);
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('role', data.data.user.role);
            localStorage.setItem('userId', String(data.data.user.id));
            // Redirect based on role
            if (data.data.user.role === 'admin') {
                console.log('Redirecting to admin.html');
                window.location.href = './admin.html';
            } else {
                console.log('Redirecting to user.html');
                window.location.href = './user.html';
            }
        } catch (err: any) {
            if (errorMsg) errorMsg.textContent = err.message || 'Login failed';
            console.error('Login error:', err);
        }
    });
});
