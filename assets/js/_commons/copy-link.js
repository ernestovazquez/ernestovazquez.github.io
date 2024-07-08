/*
 * Copy current page url to clipboard.
 * v2.1
 * https://github.com/cotes2020/jekyll-theme-chirpy
 * © 2020 Cotes Chung
 * MIT License
 */

function copyLink() {
  const url = window.location.href;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(function() {
      alert("Link copied successfully!");
    }).catch(function(error) {
      console.error("Failed to copy the link: ", error);
    });
  } else {
    const $temp = $("<input>");
    $("body").append($temp);
    $temp.val(url).select();
    document.execCommand("copy");
    $temp.remove();
    alert("Link copied successfully!");
  }
}
