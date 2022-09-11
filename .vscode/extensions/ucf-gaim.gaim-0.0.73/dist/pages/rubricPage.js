"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRubricPage = void 0;
function getRubricPage() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rubric</title>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <script>
            function addRating() {
                var x = document.getElementById("rubric").rows[2].insertCell(2);
                x.setAttribute("class", "rating_left");
                x.innerHTML = \`<div class="container">
                                <input type="text" class="field block" placeholder="Rating score">
                                <input type="text" class="field block" placeholder="Rating description">
                                <textarea class="field" placeholder="Long description" cols="23"></textarea>
                               </div>\`;
            
                var title = document.getElementById("title");
                var headers = document.getElementById("headers").cells;
                title.colSpan = (parseInt(title.getAttribute("colSpan")) + 1).toString();
                headers[0].colSpan = "1";
                headers[1].colSpan = (parseInt(headers[1].getAttribute("colSpan")) + 1).toString();
                headers[2].colSpan = "1";  
            }
            
            function addCriterion() {
                var x = document.getElementById("rubric").insertRow(3);
                var cell1 = x.insertCell(0);
                var cell2 = x.insertCell(1);
                var cell3 = x.insertCell(2);
                var cell4 = x.insertCell(3);
                cell1.innerHTML = \`<div class="container">
                                        <input type="text" class="field block" placeholder="Description of criterion">
                                        <textarea class="field" placeholder="Long description" cols="24"></textarea>
                                        <button class="btn block" id="add_criterion" onclick="addCriterion()"><i class="material-icons">add</i><span id="criterion_text">Criterion</span></button>
                                    </div>\`;
                cell2.innerHTML = \`<div class="container">
                                        <input type="text" class="field block" placeholder="Rating score">
                                        <input type="text" class="field block" placeholder="Rating description">
                                        <textarea class="field" placeholder="Long description" cols="23"></textarea>
                                        <button class="btn" id="add_rating" onclick="addRating()"><i class="material-icons">add</i></button>
                                    </div>\`;
                cell3.innerHTML = \`<div class="container">
                                        <input type="text" class="field block" placeholder="Rating score">
                                        <input type="text" class="field block" placeholder="Rating description">
                                        <textarea class="field" placeholder="Long description" cols="23"></textarea>
                                    </div>\`;
                cell4.innerHTML = \`<input type="text" class="field block" placeholder="Points">\`;
            }
            
            function createRubric() {
                const vscode = acquireVsCodeApi();
                vscode.postMessage({msg: "hello"});
            }
        </script>
        <style>
            table {
                border-collapse: collapse;
                border: 1px solid black;
            }
            
            td, th {
                padding: 8px;
                border-style: none solid solid none;
                border-width: 1px;
                border-color: black;
            }
            
            textarea {
                font-family: Arial, Helvetica, sans-serif;
            }
            
            td.rating_left {
                border-right-style: dotted;
                padding-right: 15px;
            }
            
            .rubric_header {
                background-color: #313030;
            }
            
            .block {
                display: block;
            }
            
            .field {
                margin: 1%;
            }
            
            .container {
                position: relative;
            }
            
            .btn {
                background-color: rgba(0,0,0,0);
                color: rgb(14, 170, 218);
                border: none;
                outline: none;
                position: absolute;
                cursor: pointer;
            }
            
            #add_criterion {
                left: -10px;
                bottom: -20px;
            }
            
            #criterion_text {
                position: absolute;
                bottom: 7px;
            }
            
            #add_rating {
                right: -33.5px;
                top: 30px;
            }
        </style>
    </head>
    <body>
        <table id="rubric">
            <tr class="rubric_header">
                <td colSpan="4" class="main_cell" id="title">
                    <div class="field">
                        <label for="rubric_title">
                            Title: <input type="text" id="rubric_title">
                        </label>
                    </div>
                </td>
            </tr>
            <tr class="rubric_header" id="headers">
                <th colSpan="1">Criteria</th>
                <th colSpan="2" id="ratings">Ratings</th>
                <th colSpan="1">Pts</th>
            </tr>
            <tr>
                <td>
                    <div class="container">
                        <input type="text" class="field block" placeholder="Description of criterion">
                        <textarea class="field" placeholder="Long description" cols="24"></textarea>
                        <button class="btn block" id="add_criterion" onclick="addCriterion()"><i class="material-icons">add</i><span id="criterion_text">Criterion</span></button>
                    </div>
                </td>
                <td class="rating_left">
                    <div class="container">
                        <input type="text" class="field block" placeholder="Rating score">
                        <input type="text" class="field block" placeholder="Rating description">
                        <textarea class="field" placeholder="Long description" cols="23"></textarea>
                        <button class="btn" id="add_rating" onclick="addRating()"><i class="material-icons">add</i></button>
                    </div>
                </td>
                <td>
                    <div class="container">
                        <input type="text" class="field block" placeholder="Rating score">
                        <input type="text" class="field block" placeholder="Rating description">
                        <textarea class="field" placeholder="Long description" cols="23"></textarea>
                    </div>
                </td>
                <td>
                    <input type="text" class="field block" placeholder="Points">
                </td>
            </tr>
        </table>
        <button onclick="createRubric()" class="field">Submit Rubric</button>
    </body>
    </html>`;
}
exports.getRubricPage = getRubricPage;
//# sourceMappingURL=rubricPage.js.map