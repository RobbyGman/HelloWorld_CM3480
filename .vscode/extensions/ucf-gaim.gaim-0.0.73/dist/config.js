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
exports.updateConfigVars = exports.mergeDeep = exports.isObject = exports.client = void 0;
const util_1 = require("./util");
const tar = __importStar(require("tar"));
const host_1 = __importStar(require("./host"));
const vscode = __importStar(require("vscode"));
const fs_1 = require("fs");
const extension_1 = require("./extension");
const path = require("path");
const cfClient_1 = __importDefault(require("./cfClient"));
const axios_1 = __importDefault(require("axios"));
const https_1 = require("https");
const fs = __importStar(require("fs"));
/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}
exports.isObject = isObject;
/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
    if (!sources.length) {
        return target;
    }
    const source = sources.shift();
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, { [key]: {} });
                }
                mergeDeep(target[key], source[key]);
            }
            else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return mergeDeep(target, ...sources);
}
exports.mergeDeep = mergeDeep;
const OK = "OK";
var ConfigTypes;
(function (ConfigTypes) {
    ConfigTypes["config"] = "config";
    ConfigTypes["user"] = "user";
    ConfigTypes["session"] = "session";
})(ConfigTypes || (ConfigTypes = {}));
// }
class Config {
    static getConfig() {
        return this.settings;
    }
    static settingsCheck(settingsFile) {
        let pass = true;
        let checks = [...Config.globalChecks];
        for (let expression of checks) {
            pass = pass && expression.test(settingsFile);
        }
        return pass;
    }
    static versionCheck(context) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnValue = yield this.confirmCheck(yield util_1.getExtensionVersion('gaim.vsix'), "gaim.vsix");
            extension_1.outputChannel.appendLine(returnValue !== undefined ? returnValue.toString() : "Server did not respond");
            if (!returnValue) {
                extension_1.outputChannel.appendLine("Version not up to date");
                let extensions = [];
                let extensionNames = [
                    "vsls-contrib.gitdoc",
                    "vsls-contrib.codetour",
                ];
                if (Config.settings.config.type === "react") {
                    extensionNames.push("codespaces-contrib.codeswing");
                }
                for (let extName of extensionNames) {
                    if (vscode.extensions.getExtension(extName) === undefined) {
                        extensions.push(yield vscode.commands.executeCommand("workbench.extensions.installExtension", vscode.Uri.file(path.join(context.extensionUri.fsPath, extName))));
                    }
                }
                if (extensions.length > 0) {
                    extension_1.outputChannel.appendLine("Updating extension..." + extensionNames.join(" "));
                    yield this.updateSettings();
                    yield Promise.all(extensions).then((done) => {
                        return vscode.commands.executeCommand("workbench.action.reloadWindow");
                    });
                }
                extension_1.outputChannel.appendLine("Updating version...");
                yield this.downloadNewVersion('gaim.vsix')
                    .then((res) => __awaiter(this, void 0, void 0, function* () {
                    // await sleep(1000)
                    return vscode.commands
                        .executeCommand("workbench.extensions.installExtension", vscode.Uri.file(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, ".ucf", "gaim.vsix")))
                        .then((done) => __awaiter(this, void 0, void 0, function* () {
                        extension_1.outputChannel.appendLine("Installed extension.");
                        console.error("Installed extension");
                        yield vscode.commands.executeCommand("workbench.action.reloadWindow");
                    }));
                }));
            }
            if (Config.settings.config.type === 'unity') {
                returnValue = yield this.confirmCheck(yield util_1.getExtensionVersion('gaim.unity'), "gaim.unity");
                if (!returnValue) {
                    extension_1.outputChannel.appendLine("Version not up to date");
                    let extensions = [];
                    let extensionNames = [
                        "ms-dotnettools.csharp",
                        "unity.unity-debug",
                        "vsls-contrib.codetour",
                        "tobiah.unity-tools",
                    ];
                    for (let extName of extensionNames) {
                        if (vscode.extensions.getExtension(extName) === undefined) {
                            extensions.push(yield vscode.commands.executeCommand("workbench.extensions.installExtension", vscode.Uri.file(path.join(context.extensionUri.fsPath, extName))));
                        }
                    }
                    if (extensions.length > 0) {
                        extension_1.outputChannel.appendLine("Updating extension..." + extensionNames.join(" "));
                        yield this.updateSettings();
                        yield Promise.all(extensions).then(() => {
                            return vscode.commands.executeCommand("workbench.action.reloadWindow");
                        });
                    }
                    extension_1.outputChannel.appendLine(`Updating gaim.unity from ${Config.settings.user.versions['gaim.unity']}.`);
                    return yield this.downloadNewVersion('gaim.unity')
                        .then(() => {
                        tar.x({
                            file: path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, ".ucf", "gaim.unity"),
                            cwd: path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, "Packages"),
                            sync: true,
                        });
                    })
                        .then(() => __awaiter(this, void 0, void 0, function* () {
                        updateConfigVars({ versions: { 'gaim.unity': yield util_1.getExtensionVersion('gaim.unity') } });
                    }));
                }
            }
        });
    }
    static updateSettings() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let settingsFile = path.join((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath, ".vscode", "settings.json");
            let json = fs_1.readFileSync(settingsFile).toString();
            let jsonObject = JSON.parse(json);
            jsonObject["gitdoc.autoCommitDelay"] = 15000;
            jsonObject["gitdoc.autoPushDelay"] = 60000;
            jsonObject["gitdoc.commitValidationLevel"] = "none";
            jsonObject["gitdoc.enabled"] = true;
            jsonObject["gaim.enabled"] = true;
            fs_1.writeFileSync(settingsFile, JSON.stringify(jsonObject));
            extension_1.outputChannel.appendLine("Updating json file...");
        });
    }
    static downloadNewVersion(system) {
        return __awaiter(this, void 0, void 0, function* () {
            // Make sure pre-requisites are installed
            if (system === "gaim-vsc" || system === "gaim.vsix") {
                system = "gaim.vsix";
            }
            console.log(`Downloading from https://manyrealities.blob.core.windows.net/codefeel/${system}`);
            return yield exports.client
                .download(`https://manyrealities.blob.core.windows.net/codefeel/${system}`, path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, ".ucf", system))
                .catch((err) => {
                extension_1.outputChannel.appendLine("ERROR: " + err);
                console.log(err);
            });
        });
    }
    static confirmCheck(version, system) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${Config.settings.config.host}/git/${system}/${version}`;
            const config = {
                url: url,
                headers: {}
            };
            if (Config.settings.user.secret !== undefined) {
                config.headers = { "x-cf-secret": this.settings.user.secret };
            }
            const result = yield exports.client.post(config);
            if (result === OK) {
                return true;
            }
            else if (result === "No response") {
                vscode.window.showErrorMessage("Error: Server cannot be reached.");
                return true;
            }
            return false;
        });
    }
    static consistencyChecks() {
        return __awaiter(this, void 0, void 0, function* () {
            let fileChanged = false;
            function verifyFiles(assignment) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (assignment === "Roll a Ball") {
                        let localDir = [".ucf", "files"];
                        let files = [
                            ["Runtime", "PlayTests.asmdef"],
                            ["Runtime", "TestPickups"],
                            ["Runtime", "TestScoring"],
                            ["Runtime", "TestSetup"],
                            ["Scripts", "GameAssembly.asmdef"],
                        ];
                        for (let value of files) {
                            let localPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, ...localDir, ...value);
                            let size = 0;
                            try {
                                size = fs_1.statSync(localPath).size;
                            }
                            catch (_a) {
                                size = 0;
                            }
                            let remoteUrl = `${host_1.default}/git/files/2/${value.join("/")}`;
                            let remoteSize = parseInt((yield axios_1.default.head(remoteUrl)).headers["content-length"]);
                            if (size !== remoteSize) {
                                // Download the file
                                if (value.length > 0) {
                                    try {
                                        fs.mkdirSync(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, ...localDir, value[value.length - 2]), { recursive: true });
                                    }
                                    catch (_b) {
                                        extension_1.outputChannel.appendLine("Already present parent directories");
                                    }
                                }
                                yield exports.client.download(remoteUrl, localPath);
                                fileChanged = true;
                            }
                        }
                    }
                    else if (assignment === "Ruby's Adventure") {
                        console.log("TBD");
                    }
                });
            }
            function downloadAssetPackage() {
                return __awaiter(this, void 0, void 0, function* () {
                    // https://www.dropbox.com/s/oplgfgu1fexhd55/Assets.tar.gz?dl=0
                    var link = "https://dl.dropboxusercontent.com/s/oplgfgu1fexhd55/Assets.tar.gz?dl=1";
                    // var file = createWriteStream(path.join(Config.config.workingDir, ".ucf", "Assets.tar.gz"))
                    var request = (url) => {
                        https_1.get(url, (response) => {
                            if (response.statusCode === 302) { // it's a redirect!
                                request(response.headers.location);
                            }
                            else {
                                if (!fs_1.existsSync(path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, "Assets"))) {
                                    fs.mkdirSync(path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, "Assets"));
                                }
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                response.pipe(tar.x({ strip: 1, C: path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, "Assets") }));
                            }
                        }).on('error', (err) => {
                            // Do something if the request fails
                        });
                        // Here we start the request
                    };
                    request(link);
                });
            }
            if (Config.settings.config.course === "dig3480") {
                if (Config.settings.config.assignment === "Roll a Ball") {
                    extension_1.outputChannel.appendLine("Checking test files...");
                    yield verifyFiles(Config.settings.config.assignment);
                    // Get bytes for tests
                    let checks = [
                        {
                            file: ["Packages", "manifest.json"],
                            checks: [/com.unity.inputsystem.*:.*\d.\d.\d/],
                            add: { "com.unity.inputsystem": "1.0.2" },
                            type: "json",
                            propertyPath: ["dependencies"],
                        },
                        {
                            file: ["Packages", "GaIM", "Editor", "edu.ucf.gaim.Editor.asmdef"],
                            checks: [/includePlatforms.*:.*["Editor".*]/],
                            add: { includePlatforms: ["Editor"] },
                            type: "json",
                            propertyPath: [],
                        },
                        {
                            file: ["Packages", "GaIM", "Editor", "edu.ucf.gaim.Editor.asmdef"],
                            checks: [/excludePlatforms.*:.*\[\]/],
                            add: { excludePlatforms: [] },
                            type: "json",
                            propertyPath: [],
                        },
                    ];
                    extension_1.outputChannel.appendLine("Checking workspace configuration files...");
                    for (let fileCheck of checks.map(({ file, checks, add, type, propertyPath }) => {
                        return {
                            file: path.join(vscode.workspace.workspaceFolders[0].uri.fsPath.toString(), ...file),
                            checks,
                            add,
                            type,
                            propertyPath,
                        };
                    })) {
                        let content = "", file = "";
                        for (let check of fileCheck.checks) {
                            if (fileCheck.file !== file) {
                                file = fileCheck.file;
                                content = fs_1.readFileSync(file).toString();
                            }
                            if (!check.test(content)) {
                                switch (fileCheck.type) {
                                    case "json":
                                        let obj = JSON.parse(content);
                                        let targetObj = obj;
                                        if (fileCheck.propertyPath.length === 1) {
                                            targetObj = targetObj[fileCheck.propertyPath[0]];
                                        }
                                        else if (fileCheck.propertyPath.length > 1) {
                                            let tempObj = targetObj;
                                            for (var propertyPathSegment of fileCheck.propertyPath) {
                                                tempObj = tempObj[propertyPathSegment];
                                            }
                                            targetObj = tempObj;
                                        }
                                        for (let key in fileCheck.add) {
                                            targetObj[key] = fileCheck.add[key];
                                        }
                                        content = JSON.stringify(obj, undefined, "  ");
                                        fs_1.writeFileSync(file, content);
                                        fileChanged = true;
                                        extension_1.outputChannel.appendLine("Wrote new file " + file);
                                        break;
                                    case "yaml":
                                    // Replace the line
                                }
                            }
                        }
                    }
                }
                else if (Config.settings.config.assignment === "Ruby's New Adventure" || Config.settings.config.assignment === "Ruby's Adventure") {
                    if (!fs.existsSync(path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, "Art"))) {
                        downloadAssetPackage();
                    }
                    return fileChanged;
                }
            }
        });
    }
    static initialize(git, context) {
        return __awaiter(this, void 0, void 0, function* () {
            let wss = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, ".vscode", "settings.json");
            if (!fs_1.existsSync(wss) ||
                !Config.settingsCheck(fs_1.readFileSync(wss).toString())) {
                util_1.updateSettingsFile();
            }
            const configVars = util_1.getConfigVars();
            const checkFields = [
                "config",
                "user",
            ];
            checkFields.forEach((key) => {
                if ((configVars[key] === null ||
                    configVars[key] === "" ||
                    configVars[key] === undefined)) {
                    updateConfigFile();
                    // throw new PropertyRequiredError(key, "configVars")
                    // return;
                }
            });
            Config.settings = configVars;
            extension_1.outputChannel.appendLine("Host: " + Config.settings.config.host);
            exports.client = new cfClient_1.default(Config.settings.config.host); // new code feel API client
            const url = `${Config.settings.config.host}/git/status`;
            const config = {
                url: url,
                headers: {}
            };
            if (Config.settings.user !== undefined && Config.settings.user.secret !== undefined) {
                config.headers = { "x-cf-secret": this.settings.user.secret };
            }
            const result = yield exports.client.get(config);
            if (result === "Failure") {
                console.log("OFFLINE MODE");
                extension_1.outputChannel.append("OFFLINE MODE");
                updateConfigVars({ session: { online: false } });
                // Config.settings.session.online = false
                return;
            }
            else {
                updateConfigVars({ session: { online: true } });
                Config.settings.session.online = true;
            }
            if (host_1.featuresEnabled.versionCheck) {
                yield Config.versionCheck(context);
                setInterval(() => Config.versionCheck(context), 1000 * (60 * 30));
            }
            extension_1.outputChannel.appendLine("Confirming git username...");
            try {
                yield util_1.getGitUsername();
                Config.settings.user.repo = vscode.workspace.workspaceFolders[0].name;
            }
            catch (_a) {
                extension_1.outputChannel.appendLine("Error -- username or repo not found via config");
            }
            if (Config.settings.user.secret === undefined ||
                Config.settings.user.secret === "" ||
                Config.settings.user.secret === "Course or assignment not found") {
                extension_1.outputChannel.appendLine("No secret or other problem; registering!");
                yield vscode.commands.executeCommand("gaim.registerRepo");
            }
            else {
                if (Config.settings.user.repo === undefined && /.*:.*github.com\//.test(Config.settings.user.repo)) {
                    updateConfigVars({ user: { repo: `https://github.com/${Config.settings.config.org}/${Config.settings.config.slug}-${Config.settings.user.githubID}` } });
                }
                let result = yield exports.client.confirmIdentity(Config.settings.user.repo, Config.settings.config.assignment, Config.settings.config.course, Config.settings.user.githubID, Config.settings.user.secret);
                let registered;
                console.log("Identity is " + result);
                if (result) {
                    exports.client.setAuth(Config.settings.user.secret);
                    registered = true;
                }
                else {
                    console.log("Registering...");
                    registered = yield vscode.commands.executeCommand("gaim.registerRepo");
                    console.log("Registered: " + registered);
                }
            }
            let sessionID = util_1.generateSessionId(6);
            updateConfigVars({ session: { sessionID } });
            // Config.settings.session = { curBranch: "", sessionID }
            yield util_1.checkEnabled(git);
            extension_1.outputChannel.appendLine("Running consistency checks...");
            let fileChanged = yield this.consistencyChecks();
            if (fileChanged) {
                try {
                    yield git.repositories[0].commit("Updated files...", { all: true });
                    yield git.repositories[0].push();
                }
                catch (e) {
                    extension_1.outputChannel.appendLine("Error while committing file workspace updates..." + e);
                }
            }
            extension_1.outputChannel.appendLine("Consistency checks passed!");
            extension_1.outputChannel.appendLine("Welcome, " + Config.settings.user.githubID);
            extension_1.outputChannel.appendLine("Configuration complete! Load time: " + (new Date().valueOf() - Config.startTime.valueOf()));
        });
    }
}
exports.default = Config;
Config.settings = {
    config: {
        host: host_1.default,
        org: "UCF-GaiM",
        course: "",
        assignment: "",
        assignments: [],
        term: "",
        type: "",
        slug: "",
    },
    user: {
        githubID: "",
        secret: "",
        canvasID: "",
        repo: "",
        submission: "0",
        fixesApplied: {},
        debugLevel: 0,
        versions: {
            "gaim.vsix": "",
            "gaim.unity": "",
        },
    },
    session: {
        online: false,
        canvasToken: "",
        curBranch: "main",
        sessionID: "",
    },
};
Config.globalChecks = [
    /git.enabled.*:\s*true,?\n/,
    /files.autoSave.*:\s*"afterDelay"/,
    /gitdoc.enabled.*:\s*true/,
    /git.autoStash.*:\s*true/,
];
Config.timeout = 2000;
const SESSION = "session";
const CONFIG = "config";
const USER = "user";
const BASE = "base";
function sparseEquals(a, b) {
    if (!isObject(a)) {
        return a === b;
    }
    else {
        return Object.keys(a).every(key => {
            return (b !== undefined && key in b) ? sparseEquals(a[key], b[key]) : false;
        });
    }
}
function updateConfigVars(updateObject) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!sparseEquals(updateObject[Object.keys(updateObject)[0]], Config.settings[Object.keys(updateObject)[0]])) {
            mergeDeep(Config.settings, updateObject);
            console.log(`Updating ${Object.keys(updateObject)[0]} from ${JSON.stringify(updateObject)}`);
            switch (Object.keys(updateObject)[0]) {
                case SESSION:
                    break;
                case CONFIG:
                case BASE:
                case USER:
                    writeConfig();
                    break;
            }
        }
        function writeConfig() {
            const filepath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath.toString(), ".ucf", "vsc.json");
            let configWrite = { config: Config.settings.config, user: Config.settings.user };
            let jsonString = JSON.stringify(configWrite);
            fs_1.writeFileSync(filepath, jsonString);
            extension_1.outputChannel.appendLine("Wrote config file");
        }
    });
}
exports.updateConfigVars = updateConfigVars;
function updateConfigFile() {
}
//# sourceMappingURL=config.js.map