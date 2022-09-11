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
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
var fs = require("fs");
class StatsProvider {
    constructor(client) {
        this.client = client;
    }
    activate(subscriptions) {
        this.command = vscode.commands.registerCommand(StatsProvider.commandId, this.getFileStats, this);
        subscriptions.push(this);
        // vscode.workspace.onDidOpenTextDocument(
        //   this.getFileStats,
        //   this,
        //   subscriptions
        // );
        // vscode.workspace.onDidSaveTextDocument(this.getFileStats, this, subscriptions);
        // vscode.window.onDidChangeActiveTextEditor((editor) => {
        //   if (editor) {
        //     setTimeout(this.getFileStats, 500);
        //   }
        // }, this, subscriptions)
    }
    dispose() {
        this.command.dispose();
    }
    getFileStats(doc) {
        if (doc.uri.scheme !== "file") {
            return;
        }
        const lineCount = doc.lineCount;
        console.log(`Sending file stats ${doc.uri.fsPath}`);
        const stats = fs.statSync(doc.uri.fsPath);
        this.client.sendEvent({ stats: stats, lineCount: lineCount });
    }
}
exports.default = StatsProvider;
StatsProvider.commandId = "codefeel.runStats";
//# sourceMappingURL=statistics.js.map