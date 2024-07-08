/*
 * Copy current page url to clipboard.
 * v2.1
 * https://github.com/cotes2020/jekyll-theme-chirpy
 * © 2020 Cotes Chung
 * MIT License
 */

function copyLink() {
  const url = window.location.href;
  
  // Verifica si la API Clipboard está disponible
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(function() {
      showNotification("Link copied successfully!");
    }).catch(function(error) {
      console.error("Failed to copy the link: ", error);
    });
  } else {
    // Método de respaldo para navegadores que no soportan la API Clipboard
    const $temp = $("<input>");
    $("body").append($temp);
    $temp.val(url).select();
    document.execCommand("copy");
    $temp.remove();
    showNotification("Link copied successfully!");
  }
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.innerText = message;
  notification.style.position = "fixed";
  notification.style.bottom = "20px";
  notification.style.right = "20px";
  notification.style.padding = "10px 20px";
  notification.style.backgroundColor = "#333";
  notification.style.color = "#fff";
  notification.style.borderRadius = "5px";
  notification.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
  notification.style.zIndex = "1000";
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transition = "opacity 0.5s";
    notification.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}
