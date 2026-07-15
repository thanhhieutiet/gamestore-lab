/**
 * Global Authentication & Component Utilities
 */

/**
 * Dynamically includes HTML components using fetch and innerHTML.
 * Specifically uses innerHTML to comply with vulnerability specifications.
 * @param {string} selector - CSS selector of the placeholder
 * @param {string} path - URL/path to the HTML template
 */
async function includeComponent(selector, path) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    const response = await fetch(path);
    if (!response.ok) {
      console.warn(`Failed to fetch component: ${path}`);
      return;
    }
    const html = await response.text();
    el.innerHTML = html;

    // Execute scripts inside the loaded component
    const scripts = el.querySelectorAll('script');
    for (const script of scripts) {
      const newScript = document.createElement('script');
      if (script.src) {
        newScript.src = script.src;
      } else {
        newScript.textContent = script.textContent;
      }
      script.parentNode.replaceChild(newScript, script);
    }

    // Call individual component init functions if they exist
    if (path.includes('navbar.html')) {
      if (typeof window.initNavbar === 'function') {
        window.initNavbar();
      }
      const toggleBtn = document.getElementById('theme-toggle-btn');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', window.toggleTheme);
      }
      if (typeof window.updateThemeToggleIcons === 'function') {
        window.updateThemeToggleIcons();
      }
    }
  } catch (err) {
    console.error(`Error loading component ${path}:`, err);
  }
}

/**
 * Checks if the user is authenticated by verifying if a token exists in localStorage.
 * @returns {boolean}
 */
function isAuthenticated() {
  return !!localStorage.getItem('token');
}

/**
 * Handles user logout by clearing credentials from localStorage and sessionStorage,
 * then redirecting or reloading.
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role_id');
  localStorage.removeItem('avatar_path');
  sessionStorage.removeItem('cart');

  if (typeof showToast === 'function') {
    showToast("Đăng xuất thành công", "Hẹn gặp lại bạn!", "success");
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 1000);
  } else {
    window.location.href = '/login.html';
  }
}

/**
 * Updates UI elements that depend on the auth state.
 */
function updateAuthUI() {
  if (typeof window.initNavbar === 'function') {
    window.initNavbar();
  }
}

// Make helpers globally accessible
window.includeComponent = includeComponent;
window.isAuthenticated = isAuthenticated;
window.logout = logout;
window.updateAuthUI = updateAuthUI;

/**
 * Theme Toggle & Mode Configuration
 */
function initTheme() {
  const isLight = localStorage.getItem('theme') === 'light';
  if (isLight) {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
}

function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  updateThemeToggleIcons();
}

function updateThemeToggleIcons() {
  const sunIcon = document.getElementById('theme-toggle-sun');
  const moonIcon = document.getElementById('theme-toggle-moon');
  if (!sunIcon || !moonIcon) return;
  
  const isLight = document.documentElement.classList.contains('light');
  if (isLight) {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  } else {
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  }
}

window.toggleTheme = toggleTheme;
window.updateThemeToggleIcons = updateThemeToggleIcons;
window.initTheme = initTheme;

// Run immediate init of theme style
initTheme();
