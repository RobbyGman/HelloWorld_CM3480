"use strict";
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
exports.watchForChanges = exports.ensureStatusBarItem = exports.commit = void 0;
const debounce_1 = require("debounce");
const vscode = require("vscode");
const config_1 = require("./config");
const git_1 = require("./git");
const luxon_1 = require("luxon");
const store_1 = require("./store");
const mobx_1 = require("mobx");
const minimatch = require("minimatch");
const REMOTE_NAME = "origin";
function pushRepository(repository, forcePush = false) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        store_1.store.isPushing = true;
        try {
            if (config_1.default.autoPull === "onPush") {
                yield pullRepository(repository);
            }
            const pushArgs = [REMOTE_NAME, (_a = repository.state.HEAD) === null || _a === void 0 ? void 0 : _a.name, false];
            if (forcePush) {
                pushArgs.push(git_1.ForcePushMode.Force);
            }
            else if (config_1.default.pushMode !== "push") {
                const pushMode = config_1.default.pushMode === "forcePush"
                    ? git_1.ForcePushMode.Force
                    : git_1.ForcePushMode.ForceWithLease;
                pushArgs.push(pushMode);
            }
            yield repository.push(...pushArgs);
            store_1.store.isPushing = false;
        }
        catch (_b) {
            store_1.store.isPushing = false;
            if (yield vscode.window.showWarningMessage("Remote repository contains conflicting changes.", "Force Push")) {
                yield pushRepository(repository, true);
            }
        }
    });
}
function pullRepository(repository) {
    return __awaiter(this, void 0, void 0, function* () {
        store_1.store.isPulling = true;
        yield repository.pull();
        store_1.store.isPulling = false;
    });
}
function matches(uri) {
    return minimatch(uri.path, config_1.default.filePattern, { dot: true });
}
function commit(repository, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const changes = [
            ...repository.state.workingTreeChanges,
            ...repository.state.mergeChanges,
            ...repository.state.indexChanges,
        ];
        if (changes.length > 0) {
            const changedUris = changes
                .filter((change) => matches(change.uri))
                .map((change) => change.uri);
            if (changedUris.length > 0) {
                if (config_1.default.commitValidationLevel !== "none") {
                    const diagnostics = vscode.languages
                        .getDiagnostics()
                        .filter(([uri, diagnostics]) => {
                        const isChanged = changedUris.find((changedUri) => changedUri.toString().localeCompare(uri.toString()) === 0);
                        return isChanged
                            ? diagnostics.some((diagnostic) => diagnostic.severity === vscode.DiagnosticSeverity.Error ||
                                (config_1.default.commitValidationLevel === "warning" &&
                                    diagnostic.severity === vscode.DiagnosticSeverity.Warning))
                            : false;
                    });
                    if (diagnostics.length > 0) {
                        return;
                    }
                }
                // @ts-ignore
                yield repository.repository.add(changedUris);
                let currentTime = luxon_1.DateTime.now();
                // Ensure that the commit dates are formatted
                // as UTC, so that other clients can properly
                // re-offset them based on the user's locale.
                const commitDate = currentTime.toUTC().toString();
                process.env.GIT_AUTHOR_DATE = commitDate;
                process.env.GIT_COMMITTER_DATE = commitDate;
                if (config_1.default.timeZone) {
                    currentTime = currentTime.setZone(config_1.default.timeZone);
                }
                const commitMessage = message || currentTime.toFormat(config_1.default.commitMessageFormat);
                yield repository.commit(commitMessage);
                delete process.env.GIT_AUTHOR_DATE;
                delete process.env.GIT_COMMITTER_DATE;
                if (config_1.default.autoPush === "onCommit") {
                    yield pushRepository(repository);
                }
                if (config_1.default.autoPull === "onCommit") {
                    yield pullRepository(repository);
                }
            }
        }
    });
}
exports.commit = commit;
const commitMap = new Map();
function debouncedCommit(repository) {
    if (!commitMap.has(repository)) {
        commitMap.set(repository, (0, debounce_1.debounce)(() => __awaiter(this, void 0, void 0, function* () {
            commit(repository);
        }), config_1.default.autoCommitDelay));
    }
    return commitMap.get(repository);
}
let statusBarItem = null;
function ensureStatusBarItem() {
    if (!statusBarItem) {
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "$(mirror)";
        statusBarItem.tooltip = "GitDoc: Auto-commiting files on save";
        statusBarItem.command = "gitdoc.disable";
        statusBarItem.show();
    }
    return statusBarItem;
}
exports.ensureStatusBarItem = ensureStatusBarItem;
let disposables = [];
function watchForChanges(git) {
    const commitAfterDelay = debouncedCommit(git.repositories[0]);
    disposables.push(git.repositories[0].state.onDidChange(commitAfterDelay));
    ensureStatusBarItem();
    disposables.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && matches(editor.document.uri)) {
            statusBarItem === null || statusBarItem === void 0 ? void 0 : statusBarItem.show();
        }
        else {
            statusBarItem === null || statusBarItem === void 0 ? void 0 : statusBarItem.hide();
        }
    }));
    if (vscode.window.activeTextEditor &&
        matches(vscode.window.activeTextEditor.document.uri)) {
        statusBarItem === null || statusBarItem === void 0 ? void 0 : statusBarItem.show();
    }
    else {
        statusBarItem === null || statusBarItem === void 0 ? void 0 : statusBarItem.hide();
    }
    disposables.push({
        dispose: () => {
            statusBarItem === null || statusBarItem === void 0 ? void 0 : statusBarItem.dispose();
            statusBarItem = null;
        },
    });
    if (config_1.default.autoPush === "afterDelay") {
        const interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            pushRepository(git.repositories[0]);
        }), config_1.default.autoPushDelay);
        disposables.push({
            dispose: () => {
                clearInterval(interval);
            },
        });
    }
    if (config_1.default.autoPull === "afterDelay") {
        const interval = setInterval(() => __awaiter(this, void 0, void 0, function* () { return pullRepository(git.repositories[0]); }), config_1.default.autoPullDelay);
        disposables.push({
            dispose: () => clearInterval(interval),
        });
    }
    const reactionDisposable = (0, mobx_1.reaction)(() => [store_1.store.isPushing, store_1.store.isPulling], () => {
        const suffix = store_1.store.isPushing
            ? " (Pushing...)"
            : store_1.store.isPulling
                ? " (Pulling...)"
                : "";
        statusBarItem.text = `$(mirror)${suffix}`;
    });
    disposables.push({
        dispose: reactionDisposable,
    });
    if (config_1.default.pullOnOpen) {
        pullRepository(git.repositories[0]);
    }
    return {
        dispose: () => {
            disposables.forEach((disposable) => disposable.dispose());
            disposables = [];
        },
    };
}
exports.watchForChanges = watchForChanges;
//# sourceMappingURL=watcher.js.map