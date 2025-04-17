
// Hide buttons
// ---------------------------------------
// Navbar Visibility basierend auf Cookie
// ---------------------------------------
function updateNavbarVisibility() {
    const loginBtn     = document.getElementById("login");
    const logoutBtn    = document.getElementById("logout");
    const registerLi   = document.getElementById("nav-register"); 
    const cookie       = getCookie("rememberedLogin");
    const pagePath     = window.location.pathname;

     // Regulärer Zustand
     if (!cookie) {
         // nicht eingeloggt → Logout verstecken, Login + Register zeigen
         if (loginBtn)   loginBtn.style.display    = "inline-block";
         if (registerLi) registerLi.style.display  = "inline-block";
         if (logoutBtn)  logoutBtn.style.display   = "none";
        
      } else {
       // eingeloggt → Login + Register verstecken, Logout zeigen
       if (loginBtn)   loginBtn.style.display    = "none";
       if (registerLi) registerLi.style.display  = "none";
       if (logoutBtn)  logoutBtn.style.display   = "inline-block";
      }
  
  
    // Auf  Registrierungsseite weder Register noch Logout anzeigen
    if ( pagePath.endsWith("userRegistration.html")) {
      if (loginBtn)   loginBtn.style.display    = "inline-block";
      if (logoutBtn)  logoutBtn.style.display   = "none";
      if (registerLi) registerLi.style.display  = "none";
      return;
    }
  
    // Auf der Login-Seite weder Login noch Logout anzeigen
    if (pagePath.endsWith("userLogin.html")) {
      if (loginBtn)   loginBtn.style.display    = "none";
      if (logoutBtn)  logoutBtn.style.display   = "none";
      if (registerLi) registerLi.style.display  = "inline-block";
      return;
    }


    //HIER BItte weiter Navi Manipulation einssetzten 
    //Für AdminPanel wird noch erstellt
  
   
  }
  
  // Sofort ausführen und als Fallback
  updateNavbarVisibility();
  document.addEventListener("DOMContentLoaded", updateNavbarVisibility);
  
  
  