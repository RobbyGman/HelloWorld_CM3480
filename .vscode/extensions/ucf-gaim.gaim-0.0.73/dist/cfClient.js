"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
// import Config from "./config";
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
const config_1 = __importDefault(require("./config"));
const extension_1 = require("./extension");
const axios_1 = __importDefault(require("axios"));
const http_1 = require("http");
const host_1 = __importDefault(require("./host"));
const fs = require("fs");
const path = require("path");
class CodefeelClient {
    constructor(host) {
        this.host = host;
        this.secret = "";
        this.canvasToken = "";
    }
    get gqlHost() {
        return `${config_1.default.settings.config.host}/api/graphql`;
    }
    setAuth(secret, canvasToken) {
        if (secret !== undefined) {
            this.secret = secret;
        }
        if (canvasToken !== undefined) {
            this.canvasToken = canvasToken;
        }
    }
    startSession() {
        return __awaiter(this, void 0, void 0, function* () {
            this.sendEvent({
                msg: "Session Started",
            });
        });
    }
    endSession() {
        return __awaiter(this, void 0, void 0, function* () {
            this.sendEvent({
                msg: "Session Ended",
            });
        });
    }
    sendEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (config_1.default.settings.user.secret === undefined || config_1.default.settings.user.secret === "" || !config_1.default.settings.session.online) {
                return;
            }
            const url = `${config_1.default.settings.config.host}/codefeel`;
            const data = {
                source: "visual-studio-code-extension",
                sessionID: config_1.default.settings.session.sessionID,
                assignment: config_1.default.settings.config.assignment,
                course: config_1.default.settings.config.course,
                payload: event,
            };
            const result = yield this.post({
                method: "post",
                url: url,
                data: JSON.stringify(data),
                headers: {
                    "x-cf-secret": config_1.default.settings.user.secret,
                    "x-cf-signature-256": "55555",
                    "x-cf-event": "log",
                    "Content-Type": "application/json",
                },
            });
            if (result.status === "ok") {
                return true;
            }
            return false;
        });
    }
    getAssignmentRubric(course, assignment) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = JSON.stringify({
                query: `{
  rubric(course_id: ${course}, assignment_id: ${assignment}) {
      id
      data {
          id
          description
          long_description
          points
          ratings {
              criterion_id
              points
              description

          }
      }
  }
}`,
                variables: {},
            });
            const url = this.gqlHost;
            const result = yield this.post({
                method: "post",
                url: url,
                data: data,
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return result;
        });
    }
    submitForGrading(repo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (config_1.default.settings.config.assignment === undefined) {
                return;
            }
            console.log("submitting for grading ");
            const data = JSON.stringify({
                repo: config_1.default.settings.user.repo,
                assignment: config_1.default.settings.config.assignment,
                source: "visual-studio-code-extension",
            });
            const url = `${host_1.default}/codefeel`;
            const result = yield this.post({
                method: "post",
                url: url,
                data: data,
                headers: {
                    "x-cf-secret": config_1.default.settings.user.secret,
                    "x-cf-signature-256": "55555",
                    "x-cf-event": "submit",
                    "Content-Type": "application/json",
                },
            });
            if (result.status === "ok") {
                return true;
            }
            return false;
        });
    }
    getLogs() {
        return __awaiter(this, void 0, void 0, function* () {
            var data = JSON.stringify({
                query: `{
  logs {
    msg
  }
}`,
                variables: {},
            });
            const url = this.gqlHost;
            const result = yield this.post({
                method: "post",
                url: this.gqlHost,
                headers: {
                    secret: this.secret,
                    "Content-Type": "application/json",
                },
                data: data,
            });
            return result.data.logs;
        });
    }
    confirmIdentity(repo, assignment, courseName, username, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            // var data = 
            //       query: `query {
            //   confirmIdentity(repo: "${repo}", assignment: "${assignment}", course: "${courseName}", username: "${username}", secret: "${secret}")    
            // }`,
            //       variables: {},
            //     })
            return yield this.post({
                url: `${host_1.default}/git/me`, data: JSON.stringify({ secret }), headers: {
                    "Accept-Encoding": "gzip, deflate, br",
                    "Content-Type": "application/json",
                    "x-cf-secret": secret,
                    Accept: "application/json",
                    Connection: "keep-alive",
                },
            }).then(res => {
                console.log(res);
                if (res === "No response") {
                    return false;
                }
                else if (res === "OK" || res === http_1.STATUS_CODES.OK) {
                    return true;
                }
                else {
                    return res.statusCode !== http_1.STATUS_CODES.OK;
                }
            });
            // const url = this.gqlHost
            // const result = await this.post({
            //   method: "post",
            //   url: url,
            //   data: data,
            //   headers: {
            //     "Accept-Encoding": "gzip, deflate, br",
            //     "Content-Type": "application/json",
            //     Accept: "application/json",
            //     Connection: "keep-alive",
            //   },
            // })
            // if (result !== "No response") {
            //   return result.data.confirmIdentity
            // } else {
            //   return true
            // }
        });
    }
    registerRepo(course, repo, term, username) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = JSON.stringify({
                githubId: username,
                repo,
                course,
                term
            });
            console.log(data);
            return yield this.post({
                url: `${config_1.default.settings.config.host}/api/register`,
                data,
                headers: {
                    "Accept-Encoding": "gzip, deflate, br",
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Connection: "keep-alive",
                },
            });
        });
    }
    download(url, path) {
        return __awaiter(this, void 0, void 0, function* () {
            extension_1.outputChannel.appendLine("Downloading..." + url + "  " + path);
            const writer = fs.createWriteStream(path);
            const response = yield axios_1.default({
                url,
                method: "GET",
                responseType: "stream",
            });
            response.data.pipe(writer);
            return new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });
        });
    }
    get(config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield axios_1.default.get(config.url, { timeout: config_1.default.timeout, headers: config.headers });
                return JSON.stringify(response.data);
            }
            catch (err) {
                console.log(err);
                return "Failure";
            }
        });
    }
    post(config) {
        return __awaiter(this, void 0, void 0, function* () {
            // const source = CancelToken.source();
            console.log(config);
            // const timeout = setTimeout(() => {
            //   source.cancel()
            //   // Timeout Logic
            // }, 10000)
            const CancelToken = axios_1.default.CancelToken;
            const source = CancelToken.source();
            const timeout = setTimeout(() => {
                source.cancel();
                return "No response";
                // Timeout Logic
            }, 10000);
            return yield axios_1.default.post(config.url, config.data, { timeout: config_1.default.timeout, headers: config.headers, cancelToken: source.token })
                .then(data => {
                console.log(data);
                clearTimeout(timeout);
                return data.data;
            })
                .catch((thrown) => {
                if (axios_1.default.isCancel(thrown)) {
                    console.log('Request canceled', thrown.message);
                    return "No response";
                }
                else if (thrown.response !== undefined && thrown.response.status !== 426) {
                    extension_1.outputChannel.appendLine(`Error:  + ${thrown.message} + ${config.url}`);
                    return "No response";
                    // handle error
                }
                else {
                    return;
                }
            });
        });
    }
}
exports.default = CodefeelClient;
//# sourceMappingURL=cfClient.js.map