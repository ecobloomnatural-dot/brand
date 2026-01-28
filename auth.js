// Simple auth system for client-side demo
// Note: In production, use proper backend authentication

const ADMIN_CREDENTIALS = {
    username: 'Kasun@ecobloom',
    password: 'Microsoft@acer654321'
};

// Simple hash function for basic obfuscation
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

function authenticateAdmin(username, password) {
    return username === ADMIN_CREDENTIALS.username && 
           password === ADMIN_CREDENTIALS.password;
}

function logout() {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminUser');
    sessionStorage.removeItem('loginTime');
    window.location.href = 'login.html';
}

// Check session validity (optional - expires after 2 hours)
function checkSession() {
    const loginTime = sessionStorage.getItem('loginTime');
    if (loginTime) {
        const hoursSinceLogin = (new Date() - new Date(loginTime)) / (1000 * 60 * 60);
        if (hoursSinceLogin > 2) {
            logout();
        }
    }
}

// Check session every 5 minutes
setInterval(checkSession, 300000);