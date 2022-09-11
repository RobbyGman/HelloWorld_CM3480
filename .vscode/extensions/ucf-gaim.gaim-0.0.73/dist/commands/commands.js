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
const fs_1 = require("fs");
const fs_2 = require("fs");
const path = require("path");
const vscode = __importStar(require("vscode"));
const cfClient_1 = __importDefault(require("../cfClient"));
const config_1 = __importStar(require("../config"));
const fs_3 = require("fs");
const extension_1 = require("../extension");
const host_1 = require("../host");
var ConditionType;
(function (ConditionType) {
    ConditionType[ConditionType["file"] = 0] = "file";
    ConditionType[ConditionType["regEx"] = 1] = "regEx";
})(ConditionType || (ConditionType = {}));
const scriptsPath = [".ucf", "files", "Scripts"];
const scriptsDest = ["Assets", "Scripts"];
const commonPath = [".ucf", "files", "Runtime"];
const commonDest = ["Assets", "Tests", "Runtime"];
const scenes = ["Assets", "Scenes"];
const scripts = ["Assets", "Scripts"];
const prefabs = ["Assets", "Prefabs"];
const testFiles = {
    dig3480: [
        {
            conditions: [
                {
                    t: ConditionType.file,
                    f: [...scenes, "MiniGame.unity"],
                    e: "Error: Need MiniGame scene in Scenes subfolder of Assets.",
                },
                {
                    t: ConditionType.file,
                    f: [...scripts, "PlayerController.cs"],
                    e: "Error: Need PlayerController.cs in Scripts subfolder of Assets.",
                },
                {
                    t: ConditionType.file,
                    f: [...scripts, "CameraController.cs"],
                    e: "Error: Need CameraController.cs in Scripts subfolder of Assets.",
                },
                {
                    t: ConditionType.regEx,
                    f: ["ProjectSettings", "EditorBuildSettings.asset"],
                    re: /path: Assets\/Scenes\/MiniGame.unity/i,
                    e: "Error: Need MiniGame scene added to Unity Build Settings.",
                },
            ],
            files: [
                {
                    src: [...commonPath, "PlayTests.asmdef"],
                    dest: [...commonDest, "PlayTests.asmdef"],
                },
                {
                    src: [...scriptsPath, "GameAssembly.asmdef"],
                    dest: [...scriptsDest, "GameAssembly.asmdef"],
                },
                {
                    src: [...commonPath, "TestSetup"],
                    dest: [...commonDest, "TestSetup.cs"],
                },
                {
                    delete: true,
                    dest: ["Assets", "Template", "Scripts", "GameAssembly.asmdef"],
                },
            ],
        },
        {
            conditions: [
                {
                    t: ConditionType.file,
                    f: [...prefabs, "PickUp.prefab"],
                    e: "Error: Need 'PickUp' prefab in Prefabs subfolder of Assets. (PickUp.prefab)",
                },
                {
                    t: ConditionType.file,
                    f: [...scripts, "Rotator.cs"],
                    e: "Error: Need Rotator.cs in Scripts subfolder of Assets.",
                },
            ],
            files: [
                {
                    src: [...scriptsPath, "GameAssembly.asmdef"],
                    dest: [...scriptsDest, "GameAssembly.asmdef"],
                },
                {
                    src: [...commonPath, "TestPickups"],
                    dest: [...commonDest, "TestPickups.cs"],
                },
            ],
        },
        {
            conditions: [
                {
                    t: ConditionType.file,
                    f: ["Assets", "Scripts", "PlayerController.cs"],
                    e: "Error: Need PlayerController.cs in Scripts subfolder of Assets.",
                },
                {
                    t: ConditionType.regEx,
                    f: [...scripts, "PlayerController.cs"],
                    re: /public TextMeshProUGUI countText;/,
                    e: 'Error: Make sure you have a public variable named "countText" of type "TextMeshProUGUI" in PlayerController.cs.',
                },
                {
                    t: ConditionType.regEx,
                    f: [...scenes, "MiniGame.unity"],
                    re: /m_Name: Win ?Text/i,
                    e: 'Error: Make sure you have a game object named "WinText"',
                },
                {
                    t: ConditionType.regEx,
                    f: [...scenes, "MiniGame.unity"],
                    re: /m_Name: Count ?Text/i,
                    e: 'Error: Make sure you have a game object named "CountText"',
                },
                {
                    t: ConditionType.regEx,
                    f: [...prefabs, "PickUp.prefab"],
                    re: /m_TagString: PickUp/,
                    e: 'Error: Make sure your pick up\'s tag is exactly "PickUp"',
                },
            ],
            files: [
                {
                    src: [...scriptsPath, "GameAssembly.asmdef"],
                    dest: [...scriptsDest, "GameAssembly.asmdef"],
                },
                {
                    src: [...commonPath, "TestScoring"],
                    dest: [...commonDest, "TestScoring.cs"],
                },
            ],
        },
    ],
};
class Commands {
    constructor() {
        this.installTests = () => __awaiter(this, void 0, void 0, function* () {
            // First, delete all files in the Tests directory
            if (vscode.workspace.workspaceFolders === undefined) {
                return;
            }
            let folder = vscode.workspace.workspaceFolders[0].uri.fsPath;
            try {
                yield fs_2.promises.rm(path.join(folder, "Assets", "Tests"), { recursive: true, });
                yield fs_1.mkdir(path.join(folder, "Assets", "Tests"), () => extension_1.outputChannel.appendLine("Recreating test folder..."));
            }
            catch (err) {
                console.log(err);
            }
            for (var i = 0; i < testFiles[config_1.default.settings.config.course].length; i++) {
                let pass = true, success = false;
                for (let condition of testFiles[config_1.default.settings.config.course][i].conditions) {
                    switch (condition.t) {
                        case ConditionType.file:
                            let fileExists = fs_3.existsSync(path.join(folder, ...condition.f));
                            pass = pass && fileExists;
                            break;
                        case ConditionType.regEx:
                            let contents = fs_1.readFileSync(path.join(folder, ...condition.f)).toString();
                            pass = pass && condition.re.test(contents);
                    }
                    if (!pass) {
                        vscode.window.showWarningMessage(condition.e);
                        return;
                    }
                }
                if (pass) {
                    for (let file of testFiles[config_1.default.settings.config.course][i].files) {
                        let dirPath = [];
                        if (file.delete !== undefined) {
                            try {
                                fs_1.rmSync(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, ...file.dest));
                            }
                            catch (_a) {
                                extension_1.outputChannel.appendLine(`File ${path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, ...file.dest).toString()} already deleted`);
                            }
                        }
                        else {
                            for (let i = 0; i < file.dest.length - 1; i++) {
                                dirPath.push(file.dest[i]);
                                if (!fs_3.existsSync(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, ...dirPath))) {
                                    fs_1.mkdirSync(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, ...dirPath));
                                }
                            }
                            try {
                                fs_1.copyFileSync(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, ...file.src), path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, ...file.dest));
                            }
                            catch (err) {
                                extension_1.outputChannel.appendLine("ERROR: " + err);
                            }
                        }
                        success = true;
                    }
                    if (success) {
                        vscode.window.setStatusBarMessage(`Test Stage ${i + 1} installed successfully!`, 3000);
                    }
                }
            }
        });
        this.runTests = () => __awaiter(this, void 0, void 0, function* () {
            // console.log(`Running tests in ${path.join(Config.config.workspaceDirectory, "tests")} for  ${Config.config.workspaceDirectory}`)
            // let trConfig = {
            //   program: "python",
            //   workingDir: path.join(Config.config.workspaceDirectory),
            //   testCases: path.join(Config.config.workspaceDirectory, "tests"),
            //   execFile: "main.py",
            // }
            // const test = new TestRunner(graderRubric, trConfig);
            // let result = await test.runTestCases();
            // let criteria = graderRubric.data;
            // outputChannel.appendLine("Test Case Points")
            //     for (var criterion of criteria) {
            //       const testCase = criterion.description;
            //       const id = criterion.id
            //       const fullPoints = criterion.points;
            //       outputChannel.appendLine(`${testCase}  ${result.rubric_assessment[id].points} `)
            //     }
            console.log("finished running tests");
        });
        this.register = () => __awaiter(this, void 0, void 0, function* () {
            extension_1.outputChannel.appendLine("Registering student...");
            const client = new cfClient_1.default(config_1.default.settings.config.host);
            console.log(config_1.default.settings);
            return client
                .registerRepo(config_1.default.settings.config.course, config_1.default.settings.user.repo, config_1.default.settings.config.term, config_1.default.settings.user.githubID)
                .then((result) => __awaiter(this, void 0, void 0, function* () {
                if (result !== undefined) {
                    let secret = result.registerStudent;
                    extension_1.outputChannel.appendLine("Updating secret to " + secret);
                    yield config_1.updateConfigVars({ user: { secret } });
                }
                else {
                    extension_1.outputChannel.appendLine("Error, invalid result " + result);
                }
            }))
                .catch((error) => {
                console.error(error);
            });
        });
        this.submit = () => __awaiter(this, void 0, void 0, function* () {
            let msg = vscode.window.setStatusBarMessage("Submitting for evaluation...", new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                console.log(host_1.notLocal);
                if (host_1.notLocal) {
                    const client = new cfClient_1.default(config_1.default.settings.config.host);
                    client.submitForGrading(config_1.default.settings.user.repo).then((result) => {
                        resolve();
                        let info = vscode.window.showInformationMessage("Submitted for evaluation");
                    });
                }
                else {
                    // await squashAndMergeToMain()
                    resolve();
                    vscode.window.showInformationMessage("Submitted for evaluation");
                }
            })));
        });
    }
    activate(subscriptions) {
        this.registerCommand = vscode.commands.registerCommand(Commands.registerCommandId, this.register, this);
        this.installTestsCommand = vscode.commands.registerCommand(Commands.installTestsCommandId, this.installTests, this);
        this.runTestsCommand = vscode.commands.registerCommand(Commands.runTestsCommandId, this.runTests, this);
        this.submitCommand = vscode.commands.registerCommand(Commands.submitCommandId, this.submit, this);
        subscriptions.push(this);
    }
    dispose() {
        this.installTestsCommand.dispose();
        this.runTestsCommand.dispose();
        this.registerCommand.dispose();
        this.submitCommand.dispose();
    }
}
exports.default = Commands;
Commands.installTestsCommandId = "gaim.installTests";
Commands.runTestsCommandId = "gaim.runTests";
Commands.registerCommandId = "gaim.registerRepo";
Commands.submitCommandId = "gaim.submitRepo";
//# sourceMappingURL=commands.js.map