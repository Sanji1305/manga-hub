document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        // Send data to backend
        try {
            const res = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.success) {
                alert('Login successful!');
                window.location.href = 'index.html';
            } else {
                alert(data.message || 'Login failed!');
            }
        } catch (err) {
            alert('Server error. Please try again later.');
        }
    });

    // Social login buttons
    document.querySelector('.social-btn.google').addEventListener('click', function() {
        alert('Google login functionality will be implemented here');
    });

    document.querySelector('.social-btn.facebook').addEventListener('click', function() {
        alert('Facebook login functionality will be implemented here');
    });
});

(function(){
    const body = document.body;
    const toggleBtn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    if (!toggleBtn) return;
    function setTheme(theme) {
        body.classList.remove('light-theme', 'dark-theme');
        body.classList.add(theme+'-theme');
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', theme);
    }
    toggleBtn.addEventListener('click', function() {
        const isDark = body.classList.contains('dark-theme');
        setTheme(isDark ? 'light' : 'dark');
    });
    // On load
    const saved = localStorage.getItem('theme');
    setTheme(saved === 'dark' ? 'dark' : 'light');
})(); 