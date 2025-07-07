// PWA Installation and Service Worker Registration
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw-new.js', { scope: '/' });
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New update available
            console.log('New content is available; please refresh.');
            // You can show a notification here to update the app
          }
        });
      });
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
    }
  }
};

// Handle PWA installation
let deferredPrompt;
const installButton = document.getElementById('installAppBtn');

const showInstallPromotion = () => {
  if (installButton) {
    installButton.style.display = 'block';
    installButton.addEventListener('click', installPWA);
  }
};

const installPWA = (e) => {
  if (e) e.preventDefault();
  
  if (deferredPrompt) {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  }
};

// Track the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Show the install button
  showInstallPromotion();
});

// Track successful installation
window.addEventListener('appinstalled', (evt) => {
  console.log('App was installed successfully');
  // Hide the install button
  if (installButton) {
    installButton.style.display = 'none';
  }
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

// Initialize PWA
const initPWA = () => {
  // Register service worker
  registerServiceWorker();
  
  // Check display mode
  checkDisplayMode();
  
  // Listen for changes in display mode
  window.matchMedia('(display-mode: standalone)').addEventListener('change', checkDisplayMode);
};

// Start PWA when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPWA);
} else {
  initPWA();
}

// Make installPWA available globally for manual triggering
window.installPWA = installPWA;
