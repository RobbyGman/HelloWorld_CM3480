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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const cfClient_1 = __importDefault(require("../cfClient"));
const config_1 = __importDefault(require("../config"));
const adminKey = "9EBGn9nSc3z8OterZS9nyYlvizBP6byjquA_8nCPbQJIQdjG";
const instructorKey = "esf3RSNxmLBpn5asp8VAv0RJEJOD8FSyZ0aWw08U4L7uGqa9srQMnTUVbz3mP7YR";
const host = "https://cfd.mrl.ai";
describe("Sample task tests", function () {
    before(function () { });
    after(() => { });
    // it("should succeed with simple inputs", async function () {
    //   const client = new CodefeelClient(host);
    //   client.setSecret(adminKey);
    //   const res = await client.versionCheck("1", "gaim-vsc");
    //   expect(res).to.equal(true);
    //   return res;
    // });
    // it("should send a webhook", async function () {
    //   const client = new CodefeelClient(host);
    //   client.setSecret(adminKey);
    //   const res = await client.sendEvent({ test: "test123" });
    //   expect(res).to.equal(true);
    //   return res;
    // });
    it("should register a repo ", function () {
        return __awaiter(this, void 0, void 0, function* () {
            this.timeout(50000);
            const client = new cfClient_1.default(config_1.default.settings.config.host);
            client.setAuth(adminKey, "canvas");
            const res = yield client.registerRepo("dig3480", "https://github.com/some/repo", "112", "josh");
            chai_1.expect(res.data.registerStudent).to.be.a("string");
            return res;
        });
    });
    it("get the logs ", function () {
        return __awaiter(this, void 0, void 0, function* () {
            this.timeout(50000);
            const client = new cfClient_1.default(config_1.default.settings.config.host);
            client.setAuth(instructorKey, "canvas");
            const res = yield client.getLogs();
            chai_1.expect(res[0].msg).to.be.a("string");
            return res;
        });
    });
    //   it("should download a file ", async function () {
    //     this.timeout(50000);
    //     const client = new CodefeelClient(host);
    //     client.setSecret(adminKey);
    //     const res = await client.download(`${host}/git/gaim.unity`, "gaim.unity");
    //     return res;
    //   });
});
//# sourceMappingURL=_suite.js.map