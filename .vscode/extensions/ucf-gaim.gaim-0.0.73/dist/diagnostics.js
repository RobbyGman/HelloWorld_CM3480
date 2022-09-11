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
const extension_1 = require("./extension");
class DiagnosticsProvider {
    constructor(client) {
        this.client = client;
    }
    activate(subscriptions) {
        this.command = vscode.commands.registerCommand(DiagnosticsProvider.commandId, this.provideCodeActions, this);
        subscriptions.push(this);
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection("code-feel");
        vscode.workspace.onDidOpenTextDocument(this.getDiagnostics, this, subscriptions);
        vscode.workspace.onDidCloseTextDocument((textDocument) => {
            this.diagnosticCollection.delete(textDocument.uri);
        }, null, subscriptions);
        vscode.workspace.onDidSaveTextDocument(this.getDiagnostics, this);
        subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                setTimeout(this.getDiagnostics, 500);
            }
        }));
        subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                setTimeout(this.getDiagnostics, 500);
            }
        }));
    }
    dispose() {
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
        this.command.dispose();
    }
    getDiagnostics(doc) {
        if (doc !== undefined) {
            const diagnostics = vscode.languages.getDiagnostics(doc.uri);
            // this.diagnosticCollection.set(doc.uri, diagnostics);
            if (diagnostics.length > 0) {
                console.log(`Sending diagnostics ${diagnostics.length}`);
                this.client.sendEvent({
                    type: "diagnostics",
                    diagnostics: diagnostics,
                    file: doc.uri.toString()
                });
            }
        }
    }
    // todo
    provideCodeActions(document, range, context, token) {
        console.log("Not implemented");
        extension_1.outputChannel.appendLine("Not implemented");
        let diagnostic = context.diagnostics[0];
        return [
            {
                title: "Accept CodeFeel Python suggestion",
                command: DiagnosticsProvider.commandId,
                arguments: [document, diagnostic.range, diagnostic.message],
            },
        ];
    }
}
exports.default = DiagnosticsProvider;
DiagnosticsProvider.commandId = "codefeel.runDiagnostics";
//# sourceMappingURL=diagnostics.js.map