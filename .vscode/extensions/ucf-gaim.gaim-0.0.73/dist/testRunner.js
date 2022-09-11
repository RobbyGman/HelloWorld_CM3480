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
const child_process = __importStar(require("child_process"));
const fs = __importStar(require("fs"));
const path = require("path");
const extension_1 = require("./extension");
class TestRunner {
    constructor(rubric, config) {
        this.rubric = rubric;
        this.config = config;
        this.getTestCases();
    }
    compareOutput(testCase, stdout) {
        const stdin = fs.readFileSync(this.testCases[testCase], "utf8");
        console.log(stdin);
        console.log(stdout);
        if (stdin.length !== stdin.length) {
            console.log("Lenghts don't match");
            return false;
        }
        return stdin.localeCompare(stdout) === 0;
    }
    runTestCases() {
        return __awaiter(this, void 0, void 0, function* () {
            let totalPoints = 0;
            const criteria = this.rubric.data;
            const criteriaResults = {};
            for (var criterion of criteria) {
                const testCase = criterion.description;
                const fullPoints = criterion.points;
                const testCasePath = path.join(this.config.testCases, testCase);
                const result = yield this.runTestCase(testCasePath);
                if (result) {
                    criteriaResults[criterion.id] = {
                        points: fullPoints,
                    };
                    totalPoints += fullPoints;
                }
                else {
                    //failed
                    criteriaResults[criterion.id] = {
                        points: 0,
                    };
                }
            }
            let returnVal = {
                comment: {
                    text_comment: `Assesed at ${new Date().toString()}`,
                },
                submission: {
                    posted_grade: totalPoints,
                },
                rubric_assessment: criteriaResults,
            };
            return returnVal;
        });
    }
    callPython(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((success, reject) => {
                const execFile = path.join(this.config.workingDir, this.config.execFile);
                const pyArgs = [execFile, "<", input];
                const pyprog = child_process.spawn(this.config.program, pyArgs);
                let result = "";
                let resultError = "";
                pyprog.stdout.on("data", function (data) {
                    result += data.toString();
                });
                pyprog.stderr.on("data", (data) => {
                    resultError += data.toString();
                });
                pyprog.stdout.on("end", function () {
                    if (resultError == "") {
                        success(result);
                    }
                    else {
                        console.error(`Python error, you can reproduce the error with:`);
                        const error = new Error(resultError);
                        console.error(error);
                        reject(resultError);
                    }
                });
            });
        });
    }
    runCode(input) {
        let workingDir = this.config.workingDir;
        const program = this.config.program;
        const execFile = path.join(this.config.workingDir, this.config.execFile);
        const options = { cwd: workingDir };
        // *** Return the promise
        return new Promise(function (resolve, reject) {
            const args = [execFile];
            const process = child_process.spawn(program, args, options);
            let stderr = "";
            let stdout = "";
            process.stdin.write(input);
            process.stdin.end();
            process.stdout.on("data", function (data) {
                console.log(data.toString());
                extension_1.outputChannel.appendLine(data.toString());
                stdout += data.toString();
            });
            process.stderr.on("data", function (data) {
                console.log(data.toString());
                extension_1.outputChannel.appendLine(data.toString());
                stderr += data.toString();
            });
            process.on("close", function (code) {
                // Should probably be 'exit', not 'close'
                // *** Process completed
                resolve(stdout);
            });
            process.on("exit", function (code) {
                // Should probably be 'exit', not 'close'
                // *** Process completed
                resolve(stdout);
            });
            process.on("error", function (err) {
                // *** Process creation failed
                reject(stderr);
            });
        });
    }
    runTestCase(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const execFile = path.join(this.config.workingDir, this.config.execFile);
            const args = [execFile];
            const stdin = fs.readFileSync(input, "utf8");
            // const result = child_process.spawnSync(this.config.program, args, {
            //   input: stdin,
            //   encoding: "utf-8",
            // });
            const result = yield this.runCode(stdin);
            // console.log(`Result for test case ${stdin} is: ${result.stderr}`);
            // let comapreRes = this.compareOutput(input, result);
            return this.compareOutput(input, result);
        });
    }
    getTestCases() {
        const testCases = {};
        const testCasesPath = this.config.testCases;
        fs.readdirSync(testCasesPath).forEach((file) => {
            let fileName = path.parse(file).name;
            let fullPath = path.join(testCasesPath, file);
            let fullOutPath = path.join(testCasesPath, fileName + ".out"); // todo: error checking here
            testCases[fullPath] = fullOutPath;
        });
        this.testCases = testCases;
    }
}
exports.default = TestRunner;
// const test = new TestRunner({}, {program: "python3", workingDir: working_dir, testCases: working_dir + "/tests", execFile: "main.py"})
// let result = test.runTestCase('/var/codefeel/pyTests/tests/1.in')
// console.log(result)
//# sourceMappingURL=testRunner.js.map