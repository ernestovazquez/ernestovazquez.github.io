<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Copy Link Example</title>
  <style>
    #copyMessage {
      visibility: hidden;
      min-width: 120px;
      background-color: #333;
      color: #fff;
      text-align: center;
      border-radius: 5px;
      padding: 10px;
      position: fixed;
      z-index: 1;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 14px;
    }
    #copyMessage.show {
      visibility: visible;
    }
  </style>
</head>
<body>
  <button onclick="copyLink()">Copy Link</button>
  <div id="copyMessage">Link copied successfully!</div>

  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script>
    function copyLink() {
      const url = window.location.href;

      // Verifica si la API Clipboard está disponible
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function() {
          showCopyMessage();
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
        showCopyMessage();
      }
    }

    function showCopyMessage() {
      const copyMessage = document.getElementById('copyMessage');
      copyMessage.classList.add('show');
      setTimeout(function() {
        copyMessage.classList.remove('show');
      }, 2000);
    }
  </script>
</body>
</html>
