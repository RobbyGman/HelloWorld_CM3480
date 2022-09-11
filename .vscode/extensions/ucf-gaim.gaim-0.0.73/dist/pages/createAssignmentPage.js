"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreateAssignmentPage = void 0;
function getCreateAssignmentPage() {
    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Create an assignment</title>
                <script>
                  function createAssignment() {
                    var language = document.getElementById("language").value;
                    var name = document.getElementById("assignmentName").value;
                    var points = document.getElementById("points").value;
                    var dueDate = document.getElementById("dueDate").value;
                    var lockDate = document.getElementById("lockDate").value;
                    var msg = {language: language, name: name, points: points, dueDate: dueDate, lockDate: lockDate}
                    
                    const vscode = acquireVsCodeApi();
                    vscode.postMessage(msg);
                  }
                </script>
            </head>
            <body>
                <form onSubmit="createAssignment()">
                  <label for="type">Programming Language:</label><br>
                  <select name="language" id="language">
                    <option value="Python">Python</option>
                    <option value="JavaScript">JavaScript</option>
                  </select><br>
                  <label for="assignmentName">Assignment Name:</label><br>
                  <input type="text" id="assignmentName"><br>
                  <label for="points">Points possible:</label><br>
                  <input type="text" id="points"><br>
                  <label for="dueDate">Due at:</label><br>
                  <input type="date" id="dueDate" name="dueDate"><br>
                  <label for="lockDate">Locks at:</label><br>
                  <input type="date" id="lockDate" name="lockDate"><br>
                  <input type="submit" value="Create Assignment">
                </form>
                <p id="demo"></p>
            </body>
            </html>`;
}
exports.getCreateAssignmentPage = getCreateAssignmentPage;
// export function getCreateAssignmentPage() {
//   return `<!DOCTYPE html>
//             <html lang="en">
//             <head>
//               <meta charset="UTF-8">
//               <meta name="viewport" content="width=device-width, initial-scale=1.0">
//               <title>Create assignment</title>
//                     <style>
//                     label{
//                       display: inline-block;
//                       float: left;
//                       clear: left;
//                       width: 130px;
//                       margin-right: 20px;
//                       text-align: right;
//                     }
//                     pre {
//                       font-family: "Avenir", Verdana, sans-serif;
//                       font-size: 12px;
//                     }
//                     input {
//                       font-family: "Avenir", Verdana, sans-serif;
//                       font-size: 12px;
//                     }
//                     textarea {
//                       font-family: "Avenir", Verdana, sans-serif;
//                       font-size: 12px;
//                     }
//                     button {
//                       display: inline;
//                     }
//                     th, td {
//                       border: 1px solid black;
//                       text-align: center;
//                       padding: 10px;
//                     }
//                     #title {
//                       column-span: all;
//                     }
//                     #titleText,#IOText {
//                       width: 80%;
//                     }
//                     #testCaseText {
//                       width: 80%;
//                       height: 50px;
//                       overflow-wrap: normal;
//                       word-wrap: break-word;
//                       white-space: pre-wrap;
//                     }
//                     #pointsText {
//                       width: 20%;
//                     }
//                     #commandText {
//                       width: 40%; 
//                     }
//                     #criterionCell {
//                       text-align: unset;
//                     }
//                   </style>
//             </head>
//             <body>
//               <input type="text" value="Assignment Name"><br><br>
//               <textarea rows="10" cols="65">Assignment Description</textarea><br><br><br><br><br>
//               <label for="points" style="margin-left:1000px;">Points</label>
//               <input type="text" id="points" name="points" value="100" width="50px"><br><br>
//               <label for="groups">Assignment Group</label>
//               <select id="groups" name="groups">
//                 <option value="Syllabus Quiz">Syllabus Quiz</option>
//               </select><br><br>
//               <label for="display">Display Grade as</label>
//               <select id="display" name="display">
//                 <option value="Points">Points</option>
//               </select><br><br>
//               <label for="submissionType">Submission Type</label>
//               <select id="submissionType" name="submissionType">
//                 <option>Online</option>
//               </select><br><br>
//               <label for="groupAssignment">Group Assignment</label>
//               <input type="checkbox" id="groupAssignment" name="groupAssignment" margin-left="400px"><br><br>
//               <label for="peerReview">Require Peer Reviews</label>
//               <input type="checkbox" id="peerReview" name="peerReview"><br><br>
//               <p>Due</p>
//               <input type="date" id="dueDate" name="dueDate">
//               <pre>Available from                 Until</pre>
//               <input type="date" id="fromDate" name="fromDate"> <input type="date" id="toDate" name="toDate">
//               <br<br><br><br><br><table>
//               <tr id="title">
//                   <th colspan="3" >Title: <input id = "titleText" type="text"></input> </th>
//               </tr>
//               <tr>
//                   <th>Criteria</th>
//                   <th>Input/Output</th>
//                   <th>Points</th>
//               </tr>
//               <tr rowspan="5">
//                   <td> 
//                       <!--<input id="testCaseText" type="text" placeholder="Test Case Description (Optional)" row="3"></input>-->
//                       <textarea id="testCaseText" name="testCaseDescription" cols="40" rows="5"  placeholder="Test Case Description (Optional)"></textarea>
//                   </td>
//                   <td>
//                       <div> Input </div> 
//                       <div> <input id="IOText" type="text" placeholder="/path/to/file"> </input> </div>
//                       <div> Output </div>
//                       <div> <input id="IOText" type="text" placeholder="/path/to/file"></input> </div>
//                   </td>
//                   <td style="width: 20%" ><input id="pointsText" type="text"placeholder="10"></input> pts</td>
//               </tr>
//               <tr>
//                   <td id="criterionCell" colspan="2" style="text-align:center;"><div><button id="addCriterion" style="float:none;position:relative;">+Criterion</button></td>
//                   <td>Total Points: 10</td>
//               </tr>
//               <tr>
//                   <td colspan="3" rowspan="2">
//                       <div>
//                           <input type="checkbox" value="yes"> I want to run a command before tests are executed <input id="commandText" type="text"><br>
//                       </div><br>
//                       <div>
//                           <button> Cancel </button>
//                           <button> Create Rubric </button>
//                       </div>
//                   </td>
//               </tr>
//               <tr>
//               </tr>
//               </table>
//               <br><input type="submit" value="Create Assignment"><br><br>
// 			      </body>`
// }
//# sourceMappingURL=createAssignmentPage.js.map