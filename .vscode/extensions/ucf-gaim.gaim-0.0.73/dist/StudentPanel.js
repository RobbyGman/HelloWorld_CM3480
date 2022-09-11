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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCaseNode = exports.TestNodeProvider = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = __importDefault(require("./config"));
const extension_1 = require("./extension");
const testRunner_1 = __importDefault(require("./testRunner"));
const cfClient_1 = __importDefault(require("./cfClient"));
const host_1 = __importDefault(require("./host"));
class TestNodeProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            const testCaseJsonPath = path.join(this.workspaceRoot, "/.ucf/tests.json");
            const testCaseJson = JSON.parse(fs.readFileSync(testCaseJsonPath, "utf-8"));
            console.log(`Running tests in ${path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, "tests")} for  ${vscode.workspace.workspaceFolders[0].uri.fsPath}`);
            let trConfig = {
                program: "python",
                workingDir: path.join(vscode.workspace.workspaceFolders[0].uri.fsPath),
                testCases: path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, "tests"),
                execFile: "main.py",
            };
            let client = new cfClient_1.default(host_1.default);
            client.setAuth(config_1.default.settings.user.secret, config_1.default.settings.session.canvasToken);
            const gqlResponse = yield client.getAssignmentRubric(config_1.default.settings.config.course, config_1.default.settings.config.assignment);
            const graderRubric = gqlResponse.data.rubric;
            const test = new testRunner_1.default(graderRubric, trConfig);
            let result = yield test.runTestCases();
            let criteria = graderRubric.data;
            extension_1.outputChannel.appendLine("Test Case Points");
            for (var criterion of criteria) {
                const testCase = criterion.description;
                const id = criterion.id;
                const fullPoints = criterion.points;
                if (fullPoints === result.rubric_assessment[id].points) {
                    testCaseJson.testCases[criterion.description].state = "pass";
                }
                else {
                    testCaseJson.testCases[criterion.description].state = "fail";
                }
                //  outputChannel.appendLine(`${testCase}  ${} `)
            }
            fs.writeFileSync(testCaseJsonPath, JSON.stringify(testCaseJson));
            this._onDidChangeTreeData.fire();
        });
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage("No test cases found in empty workspace");
            return Promise.resolve([]);
        }
        if (element) {
            return Promise.resolve(this.getTestCaseNodes(path.join(this.workspaceRoot, "node_modules", element.input, "package.json")));
        }
        else {
            const packageJsonPath = path.join(this.workspaceRoot, "/.ucf/tests.json");
            if (this.pathExists(packageJsonPath)) {
                return Promise.resolve(this.getTestCaseNodes(packageJsonPath));
            }
            else {
                vscode.window.showInformationMessage("Workspace has no package.json");
                return Promise.resolve([]);
            }
        }
    }
    getTestCaseNodes(testCaseJsonPath) {
        if (this.pathExists(testCaseJsonPath)) {
            const testCaseJson = JSON.parse(fs.readFileSync(testCaseJsonPath, "utf-8"));
            const toNode = (input, output, state) => {
                return new TestCaseNode(input, output, state, vscode.TreeItemCollapsibleState.None, {
                    command: "extension.openPackageOnNpm",
                    title: "",
                    arguments: [input],
                });
            };
            const testCases = testCaseJson.testCases
                ? Object.keys(testCaseJson.testCases).map((tc) => toNode(tc, testCaseJson.testCases[tc].output, testCaseJson.testCases[tc].state))
                : [];
            return testCases;
        }
        else {
            return [];
        }
    }
    pathExists(p) {
        try {
            fs.accessSync(p);
        }
        catch (err) {
            return false;
        }
        return true;
    }
}
exports.TestNodeProvider = TestNodeProvider;
class TestCaseNode extends vscode.TreeItem {
    constructor(input, output, state, collapsibleState, command) {
        super(input, collapsibleState);
        this.input = input;
        this.output = output;
        this.state = state;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.contextValue = "dependency";
        this.tooltip = `${this.input}-${this.output}`;
        this.description = this.output + " ";
        if (this.state === "fail") {
            this.iconPath = {
                light: path.join(__filename, "..", "..", "resources", "light", "redX.svg"),
                dark: path.join(__filename, "..", "..", "resources", "dark", "redX.svg"),
            };
        }
        else if (this.state === "unknown") {
            this.iconPath = {
                light: path.join(__filename, "..", "..", "resources", "light", "q.svg"),
                dark: path.join(__filename, "..", "..", "resources", "dark", "q.svg"),
            };
        }
        else {
            this.iconPath = {
                light: path.join(__filename, "..", "..", "resources", "light", "green_check.svg"),
                dark: path.join(__filename, "..", "..", "resources", "dark", "green_check.svg"),
            };
        }
    }
}
exports.TestCaseNode = TestCaseNode;
//# sourceMappingURL=StudentPanel.js.map