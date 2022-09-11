"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogInfo = exports.createView = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = __importStar(require("vscode"));
const logPage_1 = require("./pages/logPage");
const createAssignmentPage_1 = require("./pages/createAssignmentPage");
const rubricPage_1 = require("./pages/rubricPage");
const axios = require("axios");
var formData = require("form-data");
var fs = require("fs");
let panel = undefined;
function createView(subscriptions) {
    return __awaiter(this, void 0, void 0, function* () {
        subscriptions.push(vscode.commands.registerCommand("getLogs.start", () => {
            panel = vscode.window.createWebviewPanel("getLogs", "Get Logs", vscode.ViewColumn.One, {
                enableScripts: true,
            });
            getLogInfo().then((logs) => {
                if (panel) {
                    panel.webview.html = logPage_1.getLogPage();
                    panel.webview.postMessage({ log: logs });
                }
            });
        }));
        subscriptions.push(vscode.commands.registerCommand("createAssignment.start", () => {
            panel = vscode.window.createWebviewPanel("createAssignment", "Create Assignment", vscode.ViewColumn.One, {
                enableScripts: true,
            });
            panel.webview.html = createAssignmentPage_1.getCreateAssignmentPage();
            panel.webview.onDidReceiveMessage((message) => {
                vscode.window.showInformationMessage("Received message");
                var data = JSON.stringify({
                    type: message["language"],
                    assignment: {
                        name: message["name"],
                        points_possible: message["points"],
                        due_at: "2021-01-21T18:48:00Z",
                        lock_at: "2021-10-21T18:48:00Z",
                    },
                });
                var config = {
                    method: "post",
                    url: "https://cfd.mrl.ai/assignment/5",
                    headers: {
                        secret: "9EBGn9nSc3z8OterZS9nyYlvizBP6byjquA_8nCPbQJIQdjG",
                        "Content-Type": "application/json",
                    },
                    data: data,
                };
                axios(config)
                    .then(function (response) {
                    console.log(JSON.stringify(response.data));
                })
                    .catch(function (error) {
                    console.log(error);
                });
            }, undefined, subscriptions);
        }));
        subscriptions.push(vscode.commands.registerCommand("createRubric.start", () => {
            panel = vscode.window.createWebviewPanel("createRubric", "Create Rubric", vscode.ViewColumn.One, {
                enableScripts: true,
            });
            panel.webview.html = rubricPage_1.getRubricPage();
            panel.webview.onDidReceiveMessage((message) => {
                vscode.window.showInformationMessage("Received message: " + message.msg);
                var data = JSON.stringify({
                    canvas_token: "ZnvRpBlTPnG7Y8DvljWN3S2RMpD5I1oIGHcLjez36NFBeVGQ7O8s2guvwTEJ1AAd",
                    rubric: {
                        title: "Awesome rubric 315 ",
                        criteria: {
                            "0": {
                                points: 2,
                                mastery_points: 2,
                                ignore_for_scoring: true,
                                title: "Cool Rubric",
                                criterion_use_range: null,
                                ratings: {
                                    "0": {
                                        description: "zero points",
                                        long_description: "Completed NONE OF requirements.",
                                        points: 2,
                                    },
                                    "2": {
                                        description: "No Marks",
                                        long_description: "Completed ALL of the requirements.",
                                        points: 0,
                                    },
                                },
                            },
                        },
                    },
                });
                var config = {
                    method: "post",
                    url: "https://cfd.mrl.ai/rubric/5/315",
                    headers: {
                        secret: "9EBGn9nSc3z8OterZS9nyYlvizBP6byjquA_8nCPbQJIQdjG",
                        "Content-Type": "application/json",
                    },
                    data: data,
                };
                axios(config)
                    .then(function (response) {
                    console.log(JSON.stringify(response.data));
                })
                    .catch(function (error) {
                    console.log(error);
                });
            }, undefined, subscriptions);
        }));
    });
}
exports.createView = createView;
function getLogInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield axios.post({
            method: "post",
            url: "https://codefeel.mrl.ai/api/graphql/",
            headers: {
                secret: "esf3RSNxmLBpn5asp8VAv0RJEJOD8FSyZ0aWw08U4L7uGqa9srQMnTUVbz3mP7YR",
            },
            data: {
                query: `{
        logs {
          msg
        }
      }`,
            },
        });
        return response.data.data.logs;
    });
}
exports.getLogInfo = getLogInfo;
//# sourceMappingURL=views.js.map