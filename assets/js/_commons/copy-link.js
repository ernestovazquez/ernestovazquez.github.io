/*
 * Copy current page url to clipboard.
 * v2.1
 * https://github.com/cotes2020/jekyll-theme-chirpy
 * © 2020 Cotes Chung
 * MIT License
 */

function copyLink(url) {
  if (!url || url.length === 0) {
    url = window.location.href;
  }
  
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(url).select();
  document.execCommand("copy");
  $temp.remove();

  // Cambiar el texto del botón temporalmente
  var originalText = "Copy link";
  var newText = "Link copiado";
  var $copyBtn = $(".copy-button"); // Asume que tienes un botón con la clase .copy-button

  $copyBtn.text(newText);

  setTimeout(function() {
    $copyBtn.text(originalText);
  }, 2000); // Cambia el texto de vuelta después de 2 segundos (2000 milisegundos)
}
