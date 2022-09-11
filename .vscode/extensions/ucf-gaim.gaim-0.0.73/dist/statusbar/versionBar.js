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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
const config_1 = __importDefault(require("../config"));
class VersionBar {
    static init(subscriptions) {
        this.myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.myStatusBarItem.text = `GaIM:v${config_1.default.settings.user.versions["gaim.vsix"]} `;
        subscriptions.push(this.myStatusBarItem);
    }
    static updateStatusBarItem(status = "") {
        if (this.myStatusBarItem) {
            this.myStatusBarItem.text = `GaIM:v${config_1.default.settings.user.versions['gaim.vsix']}|${status !== "" ? ":" + status : ""}${config_1.default.settings.session.online ? "online" : "offline"}`;
            this.myStatusBarItem.show();
        }
    }
}
exports.default = VersionBar;
//# sourceMappingURL=versionBar.js.map