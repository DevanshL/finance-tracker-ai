// 🔍 DIAGNOSTIC SCRIPT
// Paste this in browser console (F12) after login attempt

console.log('=== 🔍 DIAGNOSTIC CHECK ===\n');

// Check 1: LocalStorage
console.log('1️⃣ LocalStorage Check:');
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');
console.log('   Token exists:', !!token);
console.log('   Token value:', token ? token.substring(0, 20) + '...' : 'null');
console.log('   User exists:', !!user);
console.log('   User value:', user);
console.log('');

// Check 2: Zustand Store State
console.log('2️⃣ Zustand Store State:');
try {
  const store = useAuthStore.getState();
  console.log('   isAuthenticated:', store.isAuthenticated);
  console.log('   isLoading:', store.isLoading);
  console.log('   token:', store.token ? store.token.substring(0, 20) + '...' : 'null');
  console.log('   user:', store.user);
  console.log('   error:', store.error);
} catch (err) {
  console.error('   ❌ Error accessing store:', err);
}
console.log('');

// Check 3: Current Route
console.log('3️⃣ Current Route:');
console.log('   window.location.pathname:', window.location.pathname);
console.log('');

// Check 4: Check if initializeAuth exists
console.log('4️⃣ Store Functions Check:');
try {
  const store = useAuthStore.getState();
  console.log('   initializeAuth exists:', typeof store.initializeAuth === 'function');
  console.log('   login exists:', typeof store.login === 'function');
  console.log('   logout exists:', typeof store.logout === 'function');
} catch (err) {
  console.error('   ❌ Error:', err);
}
console.log('');

// Check 5: Attempt to call initializeAuth
console.log('5️⃣ Try Manual Initialize:');
try {
  const store = useAuthStore.getState();
  if (store.initializeAuth) {
    console.log('   Calling initializeAuth()...');
    store.initializeAuth();
    setTimeout(() => {
      const newState = useAuthStore.getState();
      console.log('   After init - isAuthenticated:', newState.isAuthenticated);
    }, 1000);
  } else {
    console.error('   ❌ initializeAuth does not exist!');
  }
} catch (err) {
  console.error('   ❌ Error:', err);
}

console.log('\n=== END DIAGNOSTIC ===');