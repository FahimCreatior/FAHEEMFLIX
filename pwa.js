// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// Handle install prompt
let deferredPrompt;
const addBtn = document.querySelector('.install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show the install button if it exists
  if (addBtn) {
    addBtn.style.display = 'block';
  }
  
  // Show the install button in the UI
  const installButton = document.createElement('button');
  installButton.className = 'install-app-btn';
  installButton.innerHTML = '📱 Install App';
  installButton.addEventListener('click', installApp);
  
  const header = document.querySelector('header');
  if (header) {
    header.appendChild(installButton);
  }
});

// Function to handle the installation
function installApp() {
  // Show the install prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    // Reset the deferred prompt variable
    deferredPrompt = null;
  });
}

// Check if the app is already installed
window.addEventListener('appinstalled', (evt) => {
  console.log('App was installed');
  // Hide the install button if the app is already installed
  const installButton = document.querySelector('.install-app-btn');
  if (installButton) {
    installButton.style.display = 'none';
  }
});
