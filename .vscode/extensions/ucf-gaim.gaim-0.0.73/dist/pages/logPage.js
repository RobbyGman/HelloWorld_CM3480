"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogPage = void 0;
function getLogPage() {
    return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Student Logs</title>
                    <script>
                      window.addEventListener('message', event => {
                      const message = event.data;
  
                      var logs = message.log;
                      var logLen = logs.length;
                      var text = "<ul>";
                      for (var i = 0; i < logLen; i++)
                        text += "<li>" + logs[i].msg.toString() + "</li>";
                      text += "</ul>";

                      document.getElementById("log").innerHTML = text;
                      })
                    </script>
                </head>
                <body>
                    <p id="log"></p>
                </body>
                </html>`;
}
exports.getLogPage = getLogPage;
//# sourceMappingURL=logPage.js.map