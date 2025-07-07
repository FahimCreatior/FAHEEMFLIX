// PWA Installation and Service Worker Registration
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw-new.js', { scope: '/' });
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
      return null;
    }
  }
  return null;
};

// Handle PWA installation
let deferredPrompt = null;
let installButton = null;
let installPromptShown = false;

// Function to show install promotion
const showInstallPromotion = () => {
  // Only show the install prompt once per session
  if (installPromptShown) return;
  
  // Create install button if it doesn't exist
  if (!installButton) {
    installButton = document.createElement('button');
    installButton.id = 'installAppBtn';
    installButton.innerHTML = '📱 Install FaheemFlix App';
    installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #e50914;
      color: white;
      border: none;
      border-radius: 30px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    `;
    
    // Add hover effect
    installButton.addEventListener('mouseover', () => {
      installButton.style.transform = 'translateY(-2px)';
      installButton.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
    });
    
    installButton.addEventListener('mouseout', () => {
      installButton.style.transform = 'translateY(0)';
      installButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    });
    
    installButton.addEventListener('click', installPWA);
    document.body.appendChild(installButton);
  }
  
  // Show the button with animation
  installButton.style.display = 'flex';
  installButton.style.animation = 'fadeInUp 0.5s ease-out';
  
  // Auto-hide after 10 seconds if not clicked
  setTimeout(() => {
    if (installButton && installButton.style.display !== 'none') {
      installButton.style.animation = 'fadeOutDown 0.5s ease-out';
      setTimeout(() => {
        if (installButton) installButton.style.display = 'none';
      }, 500);
    }
  }, 10000);
  
  installPromptShown = true;
};

// Function to handle PWA installation
const installPWA = async (e) => {
  if (e) e.preventDefault();
  
  if (deferredPrompt) {
    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      
      // Reset the deferred prompt variable
      deferredPrompt = null;
      
      // Hide the install button
      if (installButton) {
        installButton.style.display = 'none';
      }
    } catch (error) {
      console.error('Error during installation:', error);
    }
  } else {
    // If deferredPrompt isn't available, show a message
    console.log('Installation not available');
    // Fallback for browsers that don't support the install prompt
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;
    
    if (isIos && !isStandalone) {
      // Show iOS installation instructions
      alert('To install this app, tap the share icon and select "Add to Home Screen".');
    }
  }
};

// Track the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt event fired');
  
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Show the install button
  showInstallPromotion();
  
  // For debugging
  console.log('Installation is available');
});

// Track successful installation
window.addEventListener('appinstalled', (evt) => {
  console.log('App was installed successfully');
  
  // Hide the install button
  if (installButton) {
    installButton.style.display = 'none';
  }
  
  // Reset the deferredPrompt variable
  deferredPrompt = null;
});

// Check if the app is running as a PWA
const checkDisplayMode = () => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                      window.navigator.standalone === true;
  
  if (isStandalone) {
    console.log('App is running in standalone mode');
    // Hide install button when running as PWA
    if (installButton) {
      installButton.style.display = 'none';
    }
  }
  return isStandalone;
};

// Add CSS animations
const addInstallButtonStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeOutDown {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(20px);
      }
    }
  `;
  document.head.appendChild(style);
};

// Initialize PWA
const initPWA = async () => {
  // Add animation styles
  addInstallButtonStyles();
  
  // Register service worker
  await registerServiceWorker();
  
  // Check display mode
  checkDisplayMode();
  
  // Listen for changes in display mode
  window.matchMedia('(display-mode: standalone)').addEventListener('change', checkDisplayMode);
  
  // Check if the app is eligible for installation
  if (window.matchMedia('(display-mode: browser)').matches) {
    // Show install promotion after a delay
    setTimeout(showInstallPromotion, 3000);
  }
};

// Start PWA when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPWA);
} else {
  initPWA();
}

// Make installPWA available globally for manual triggering
window.installPWA = installPWA;
