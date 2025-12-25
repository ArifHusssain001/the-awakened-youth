// Authentication and User Management System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.initializeAuth();
    }

    initializeAuth() {
        // Check if user is logged in
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUIForLoggedInUser();
        }
    }

    // Register new user
    register(userData) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if email already exists
        if (users.find(user => user.email === userData.email)) {
            throw new Error('Email already registered. Please use a different email or login.');
        }

        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            password: userData.password, // In production, this should be hashed
            role: 'contributor', // Default role for new users
            status: 'active',
            registeredAt: new Date().toISOString(),
            lastLogin: null
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Send notification email to admin (simulated)
        this.notifyAdminNewUser(newUser);

        return newUser;
    }

    // Login user
    login(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check for admin login
        if (email === 'admin' && password === 'awakened2024') {
            const adminUser = {
                id: 'admin',
                name: 'Admin',
                email: 'syedamaha087@gmail.com',
                role: 'admin',
                status: 'active'
            };
            
            this.currentUser = adminUser;
            localStorage.setItem('currentUser', JSON.stringify(adminUser));
            this.updateUIForLoggedInUser();
            return adminUser;
        }

        // Check for regular user login
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('Invalid email or password.');
        }

        if (user.status !== 'active') {
            throw new Error('Your account is not active. Please contact admin.');
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        const userIndex = users.findIndex(u => u.id === user.id);
        users[userIndex] = user;
        localStorage.setItem('users', JSON.stringify(users));

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.updateUIForLoggedInUser();
        
        return user;
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('loginTime');
        this.updateUIForLoggedInUser();
        
        // Redirect to home page
        if (window.location.pathname.includes('writer-dashboard') || 
            window.location.pathname.includes('admin')) {
            window.location.href = 'index.html';
        }
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Check if user is contributor
    isContributor() {
        return this.currentUser && this.currentUser.role === 'contributor';
    }

    // Update UI based on login status
    updateUIForLoggedInUser() {
        const authLinks = document.getElementById('authLinks');
        const userInfo = document.getElementById('userInfo');
        
        if (!authLinks) return;

        if (this.isLoggedIn()) {
            authLinks.innerHTML = `
                <span style="color: #330066; margin-right: 15px;">Welcome, ${this.currentUser.name}!</span>
                ${this.isContributor() ? '<a href="writer-dashboard.html" style="color: #663399; margin-right: 15px;">My Dashboard</a>' : ''}
                ${this.isAdmin() ? '<a href="admin.html" style="color: #663399; margin-right: 15px;">Admin Panel</a>' : ''}
                <button onclick="authSystem.logout()" style="background: #663399; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Logout</button>
            `;
        } else {
            authLinks.innerHTML = `
                <a href="login.html" style="color: #663399; margin-right: 15px;">Login</a>
                <a href="register.html" style="background: #663399; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none;">Register</a>
            `;
        }
    }

    // Password reset functionality
    requestPasswordReset(email) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email);
        
        if (!user && email !== 'syedamaha087@gmail.com') {
            throw new Error('Email not found in our records.');
        }

        // Generate reset token (in production, this should be more secure)
        const resetToken = Math.random().toString(36).substring(2, 15);
        const resetData = {
            email: email,
            token: resetToken,
            expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
        };

        // Store reset token
        const resetTokens = JSON.parse(localStorage.getItem('resetTokens') || '[]');
        resetTokens.push(resetData);
        localStorage.setItem('resetTokens', JSON.stringify(resetTokens));

        // Simulate sending email
        this.sendPasswordResetEmail(email, resetToken);
        
        return resetToken;
    }

    // Reset password with token
    resetPassword(token, newPassword) {
        const resetTokens = JSON.parse(localStorage.getItem('resetTokens') || '[]');
        const resetData = resetTokens.find(r => r.token === token);
        
        if (!resetData) {
            throw new Error('Invalid reset token.');
        }

        if (new Date() > new Date(resetData.expiresAt)) {
            throw new Error('Reset token has expired. Please request a new one.');
        }

        // Update password
        if (resetData.email === 'syedamaha087@gmail.com') {
            // Admin password reset would need special handling
            alert('Admin password reset completed. Please use new credentials.');
        } else {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.email === resetData.email);
            
            if (userIndex !== -1) {
                users[userIndex].password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
            }
        }

        // Remove used token
        const updatedTokens = resetTokens.filter(r => r.token !== token);
        localStorage.setItem('resetTokens', JSON.stringify(updatedTokens));
    }

    // Simulate email notifications
    notifyAdminNewUser(user) {
        console.log(`Email sent to admin: New user registered - ${user.name} (${user.email})`);
        
        // In production, this would send actual email
        const emailBody = `
            New User Registration - The Awakened Youth
            
            Name: ${user.name}
            Email: ${user.email}
            Registration Date: ${new Date(user.registeredAt).toLocaleString()}
            Role: Contributor
            
            Please review and approve this new user account.
        `;
        
        // Store notification for admin
        const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        notifications.push({
            id: Date.now().toString(),
            type: 'new_user',
            title: 'New User Registration',
            message: `${user.name} has registered as a contributor`,
            data: user,
            createdAt: new Date().toISOString(),
            read: false
        });
        localStorage.setItem('adminNotifications', JSON.stringify(notifications));
    }

    sendPasswordResetEmail(email, token) {
        console.log(`Password reset email sent to: ${email}`);
        console.log(`Reset link: reset-password.html?token=${token}`);
        
        // In production, this would send actual email
        alert(`Password reset link has been sent to ${email}. Check the console for the reset link (in production, this would be sent via email).`);
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Get all users (admin only)
    getAllUsers() {
        if (!this.isAdmin()) {
            throw new Error('Access denied. Admin privileges required.');
        }
        
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    // Update user status (admin only)
    updateUserStatus(userId, status) {
        if (!this.isAdmin()) {
            throw new Error('Access denied. Admin privileges required.');
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].status = status;
            localStorage.setItem('users', JSON.stringify(users));
            return users[userIndex];
        }
        
        throw new Error('User not found.');
    }
}

// Global auth system instance
window.authSystem = new AuthSystem();

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    if (window.authSystem) {
        window.authSystem.updateUIForLoggedInUser();
    }
});