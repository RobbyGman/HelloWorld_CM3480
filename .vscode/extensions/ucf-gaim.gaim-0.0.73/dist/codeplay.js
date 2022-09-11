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
const vscode = __importStar(require("vscode"));
const fs = require("fs");
class CodePlay {
    constructor(bufferLocation) {
        this.bufferLocation = bufferLocation;
        this.bufferUnparsed = [];
        this.bufferRaw = [];
        this.buffer = [];
        this.recording = false;
        this.start = new Date();
        this.startTime = 0;
        this.editNumber = 0;
        CodePlay.instance = this;
        this.register();
    }
    registerCommands(context) {
        return __awaiter(this, void 0, void 0, function* () {
            let disposable = vscode.commands.registerCommand("codefeel.startRecording", this.startRecording);
            context.subscriptions.push(disposable);
            disposable = vscode.commands.registerCommand("codefeel.loadRecording", this.loadRecording);
            disposable = vscode.commands.registerCommand("codefeel.stopRecording", this.stopRecording);
            context.subscriptions.push(disposable);
            disposable = vscode.commands.registerCommand("codefeel.playAllRecording", this.playAllRecording);
            context.subscriptions.push(disposable);
            disposable = vscode.commands.registerCommand("codefeel.playRecording", this.playRecording);
            context.subscriptions.push(disposable);
        });
    }
    startRecording() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            CodePlay.instance.document = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri;
            CodePlay.instance.recording = true;
            CodePlay.instance.start = new Date();
            vscode.window.showInformationMessage("Starting session");
            CodePlay.instance.startTime = new Date().valueOf();
        });
    }
    playAllRecording() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.edit((editBuilder) => __awaiter(this, void 0, void 0, function* () {
                while (CodePlay.instance.editNumber < CodePlay.instance.buffer.length) {
                    //console.log("Playing" + JSON.stringify(buffer[CodePlay.instance.editNumber]))
                    // if (buffer[CodePlay.instance.editNumber].length == 0) {
                    // editBuilder.insert(buffer[CodePlay.instance.editNumber].range.start, buffer[CodePlay.instance.editNumber].text)
                    // } else {
                    editBuilder.delete(CodePlay.instance.buffer[CodePlay.instance.editNumber].range);
                    editBuilder.insert(CodePlay.instance.buffer[CodePlay.instance.editNumber].range.start, CodePlay.instance.buffer[CodePlay.instance.editNumber].text);
                    CodePlay.instance.editNumber++;
                }
                // await sleep(100)
            }));
            // }
            // recording = false;
            // fs.writeFileSync(path.join(context.extensionUri.fsPath,'buffer.json'),JSON.stringify(buffer),{encoding:"utf-8"})
            // if (editNumber < buffer.length) {
            // setTimeout(() => {
            // vscode.commands.executeCommand('codefeel.playRecording')
            // }, buffer[editNumber].ts-buffer[editNumber-1].ts)
            // } else {
            vscode.window.showInformationMessage("Finished playing session");
        });
    }
    playRecording() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // while (editNumber < buffer.length) {
            (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.edit((editBuilder) => __awaiter(this, void 0, void 0, function* () {
                // console.log("Playing" + JSON.stringify(buffer[editNumber]))
                // if (buffer[editNumber].length == 0) {
                // editBuilder.insert(buffer[editNumber].range.start, buffer[editNumber].text)
                // } else {
                editBuilder.delete(CodePlay.instance.buffer[CodePlay.instance.editNumber].range);
                editBuilder.insert(CodePlay.instance.buffer[CodePlay.instance.editNumber].range.start, CodePlay.instance.buffer[CodePlay.instance.editNumber].text);
                // }
                CodePlay.instance.editNumber++;
                // await sleep(100)
            }));
            // }
            // recording = false;
            // fs.writeFileSync(path.join(context.extensionUri.fsPath,'CodePlay.instance.buffer.json'),JSON.stringify(CodePlay.instance.buffer),{encoding:"utf-8"})
            if (CodePlay.instance.editNumber < CodePlay.instance.buffer.length) {
                setTimeout(() => {
                    vscode.commands.executeCommand("codefeel.playRecording");
                }, CodePlay.instance.buffer[CodePlay.instance.editNumber].ts - CodePlay.instance.buffer[CodePlay.instance.editNumber - 1].ts);
            }
            else {
                vscode.window.showInformationMessage("Finished playing session");
                CodePlay.instance.editNumber = 0;
            }
        });
    }
    loadRecording() {
        return __awaiter(this, void 0, void 0, function* () {
            let recording = fs.readFileSync(CodePlay.instance.bufferLocation).toString();
            CodePlay.instance.bufferUnparsed = JSON.parse(recording);
            for (let l of CodePlay.instance.bufferUnparsed) {
                let lp = {
                    ts: l.ts,
                    range: new vscode.Range(new vscode.Position(l.range[0].line, l.range[0].character), new vscode.Position(l.range[1].line, l.range[1].character)),
                    length: l.length,
                    text: l.text,
                };
                CodePlay.instance.buffer.push(lp);
            }
            console.log(CodePlay.instance.buffer);
            vscode.window.showInformationMessage("Restored session.");
        });
    }
    stopRecording() {
        return __awaiter(this, void 0, void 0, function* () {
            CodePlay.instance.recording = false;
            fs.writeFileSync(CodePlay.instance.bufferLocation, JSON.stringify(CodePlay.instance.bufferUnparsed), {
                encoding: "utf-8",
            });
            vscode.window.showInformationMessage(`Saved session in ${CodePlay.instance.bufferLocation}`);
        });
    }
    register() {
        vscode.workspace.onDidChangeTextDocument((changeEvent) => {
            if (CodePlay.instance.recording &&
                changeEvent.document.uri === CodePlay.instance.document) {
                console.log(`Did change: ${changeEvent.document.uri}`);
                for (const change of changeEvent.contentChanges) {
                    change;
                    let ts = new Date().valueOf() - CodePlay.instance.start.valueOf();
                    let newChanges = {
                        ts,
                        range: [
                            {
                                line: change.range.start.line,
                                character: change.range.start.character,
                            },
                            {
                                line: change.range.end.line,
                                character: change.range.end.character,
                            },
                        ],
                        length: change.rangeLength,
                        text: change.text,
                    };
                    console.log(newChanges);
                    CodePlay.instance.bufferUnparsed.push(newChanges);
                    // CodePlay.instance.bufferRaw.push([
                    //   ts,
                    //   change.range.start.line,
                    //   change.range.start.character,
                    //   change.range.end.line,
                    //   change.range.end.character,
                    //   change.rangeLength,
                    //   change.text,
                    // ])
                }
            }
        });
    }
}
exports.default = CodePlay;
//# sourceMappingURL=codeplay.js.map