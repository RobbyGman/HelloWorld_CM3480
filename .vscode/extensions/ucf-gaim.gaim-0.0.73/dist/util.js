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
exports.updateSettingsFile = exports.generateSessionId = exports.getExtensionVersion = exports.getGitUsername = exports.checkEnabled = exports.sleep = exports.getConfigVars = void 0;
const vscode = __importStar(require("vscode"));
const fs_1 = require("fs");
const path = require("path");
const config_1 = __importStar(require("./config"));
const git_1 = require("./git");
const minimatch = require("minimatch");
const child_process_1 = require("child_process");
const util_1 = require("util");
const extension_1 = require("./extension");
const versionBar_1 = __importDefault(require("./statusbar/versionBar"));
const axios_1 = __importDefault(require("axios"));
let exec = util_1.promisify(child_process_1.exec);
const emailRe = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
function getConfigVars() {
    var _a;
    return JSON.parse(fs_1.readFileSync(((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath.toString()) +
        "/.ucf/vsc.json", "utf8"));
}
exports.getConfigVars = getConfigVars;
/**
 * Promise that sleeps for ms.
 * @param {number} ms - The number of ms to wait to resolve.
 */
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
exports.sleep = sleep;
function checkEnabled(git) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        let commitAndPush = false;
        let curBranch = git.repositories[0].state.HEAD.name;
        yield config_1.updateConfigVars({ user: { curBranch } });
        let error = false;
        if (curBranch === "main" || curBranch === "master") {
            extension_1.outputChannel.appendLine("On main branch " + git.repositories[0].state.workingTreeChanges);
            //   // await switchToBranch("working")
            // } else {
            // Verify that upstream is correctly set.
            try {
                const gApi = yield git_1.getGitApi();
                const repo = gApi === null || gApi === void 0 ? void 0 : gApi.repositories[0];
                extension_1.outputChannel.appendLine("Checking upstream..." + ((_b = (_a = repo === null || repo === void 0 ? void 0 : repo.state.HEAD) === null || _a === void 0 ? void 0 : _a.upstream) === null || _b === void 0 ? void 0 : _b.remote) +
                    ":" + ((_d = (_c = repo === null || repo === void 0 ? void 0 : repo.state.HEAD) === null || _c === void 0 ? void 0 : _c.upstream) === null || _d === void 0 ? void 0 : _d.name));
                if (((_e = repo === null || repo === void 0 ? void 0 : repo.state.HEAD) === null || _e === void 0 ? void 0 : _e.upstream) === undefined) {
                    // First, try to set upstream and then force push?
                    extension_1.outputChannel.appendLine("Pushing to origin/" + curBranch);
                    repo === null || repo === void 0 ? void 0 : repo.push("origin", curBranch, true, 0 /* Force */);
                    yield git.repositories[0].setBranchUpstream(curBranch, `origin/${curBranch}`);
                }
            }
            catch (err) {
                error = true;
                extension_1.outputChannel.appendLine("Problem pulling: conflict\n" + err);
            }
        }
        extension_1.activateButtons();
        return;
    });
}
exports.checkEnabled = checkEnabled;
function matches(uri) {
    return minimatch(uri.path, "**/*", { dot: true });
}
function getGitUsername() {
    return __awaiter(this, void 0, void 0, function* () {
        const repoExp = new RegExp(`https://.*github.com/.*?/((?:dig\d{4}.?)-.{3,4}-(?:0w61|\\w\\d)?)-(.+?)(?:.git)?$`, "i");
        let git = yield git_1.getGitApi();
        let changed = false;
        if (git === undefined) {
            return "";
        }
        let username, userEmail;
        try {
            username = yield git.repositories[0].getConfig("user.name");
        }
        catch (err) {
            console.log(err);
        }
        try {
            if (username === "" || username === undefined) {
                username = yield git.repositories[0].getGlobalConfig("user.name");
            }
        }
        catch (err) {
            username = "";
        }
        extension_1.outputChannel.appendLine("Configured user name: " + username);
        let repoName = vscode.workspace.workspaceFolders[0].name;
        console.log(repoName);
        let username2 = "";
        let results = repoName.match(new RegExp(`${config_1.default.settings.config.slug}-(.+?)$`, "i"));
        if (results !== null) {
            username2 = results[1];
        }
        else {
            extension_1.outputChannel.appendLine("Result didn't match");
        }
        if (username.toLowerCase().localeCompare(username2.toLowerCase()) !== 0) {
            username = username2;
            git.repositories[0].setConfig("user.name", username);
            changed = true;
        }
        config_1.updateConfigVars({ user: { githubID: username } });
        console.log("Retrieving github id...");
        let json = yield axios_1.default.get('https://api.github.com/users/' + username2);
        console.log(json);
        let { id, email } = json.data;
        if (email === null) {
            userEmail = `${id}+${username}@users.noreply.github.com`;
        }
        else {
            userEmail = email;
        }
        if ((userEmail !== undefined && !emailRe.test(userEmail)) ||
            userEmail === "knight@ucf.edu" ||
            userEmail === "") {
            try {
                userEmail = yield git.repositories[0].getConfig("user.email");
                extension_1.outputChannel.appendLine("Configured repo email: " + userEmail);
            }
            catch (err) {
                console.log("No email configured ");
                try {
                    userEmail = yield git.repositories[0].getGlobalConfig("user.email");
                    extension_1.outputChannel.appendLine("Configured global email: " + userEmail);
                }
                catch (err) {
                    extension_1.outputChannel.appendLine("Error, no global email configured" + err);
                    while (userEmail === "" || userEmail === "knight@ucf.edu" || !emailRe.test(email)) {
                        userEmail = (yield vscode.window.showInputBox({
                            prompt: "Enter an Email associated with your GitHub account.\n You can enter the private one or a public one located here: https://github.com/settings/emails",
                        }));
                    }
                }
            }
        }
        git.repositories[0].setConfig("user.email", userEmail);
        return username;
    });
}
exports.getGitUsername = getGitUsername;
function getExtensionVersion(system) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let version = "0.0.0";
        switch (system) {
            case 'gaim.vsix':
                version = (_a = vscode.extensions.getExtension("ucf-gaim.gaim")) === null || _a === void 0 ? void 0 : _a.packageJSON.version;
                extension_1.outputChannel.appendLine(`${system}: v${version}`);
                try {
                    yield config_1.updateConfigVars({ user: { versions: { "gaim.vsix": version } } });
                }
                catch (e) {
                    console.log("Error: " + e);
                    extension_1.outputChannel.appendLine("Error: " + e);
                }
                break;
            case 'gaim.unity':
                try {
                    let packageFile = fs_1.readFileSync(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, "Packages", "GaIM", "package.json")).toString();
                    let pkg = JSON.parse(packageFile);
                    version = pkg.version;
                    yield config_1.updateConfigVars({ user: { versions: { "gaim.unity": version } } });
                    extension_1.outputChannel.appendLine(`${system}: v${version}`);
                }
                catch (e) {
                    console.log("Error: " + e);
                    extension_1.outputChannel.appendLine("Error: " + e);
                }
                break;
        }
        versionBar_1.default.updateStatusBarItem();
        return version;
    });
}
exports.getExtensionVersion = getExtensionVersion;
function generateSessionId(length) {
    var date = Date.now();
    let result = date.toString() + "-";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.generateSessionId = generateSessionId;
function updateSettingsFile() {
    var _a, _b;
    let settingsFile = path.join((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath, ".vscode", "settings.json");
    if (!fs_1.existsSync(settingsFile)) {
        fs_1.mkdirSync(path.join((_b = vscode.workspace.workspaceFolders) === null || _b === void 0 ? void 0 : _b[0].uri.fsPath, ".vscode"), { recursive: true });
        fs_1.writeFileSync(settingsFile, "");
    }
    let json = fs_1.readFileSync(settingsFile).toString();
    json = json
        .split("\n")
        .filter((line) => !/\s*\/\//.test(line))
        .join("\n");
    let regex = /\,(?!\s*?[\{\[\"\'\w])/g;
    json = json.replace(regex, ""); // remove all trailing commas
    let jsonObject;
    console.log(json);
    try {
        jsonObject = JSON.parse(json);
    }
    catch (error) {
        console.log(error);
        jsonObject = {};
    }
    jsonObject["gitdoc.autoCommitDelay"] = 15000;
    jsonObject["gitdoc.autoPush"] = "onCommit";
    jsonObject["gitdoc.autoPushDelay"] = 10000;
    jsonObject["gitdoc.commitValidationLevel"] = "none";
    jsonObject["gitdoc.enabled"] = true;
    jsonObject["git.enabled"] = true;
    jsonObject["editor.formatOnPaste"] = true;
    jsonObject["editor.formatOnSave"] = true;
    jsonObject["eslint.format.enable"] = true;
    jsonObject["files.autoSave"] = "afterDelay";
    jsonObject["git.autoStash"] = true;
    fs_1.writeFileSync(settingsFile, JSON.stringify(jsonObject, undefined, "  "));
}
exports.updateSettingsFile = updateSettingsFile;
//# sourceMappingURL=util.js.map