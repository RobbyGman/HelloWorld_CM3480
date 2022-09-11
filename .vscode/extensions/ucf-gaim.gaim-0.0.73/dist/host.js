"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notLocal = exports.featuresEnabled = void 0;
const prod = "https://cf.gaim.dev";
const dev = "homer.home.lan:4000";
const host = prod;
exports.default = host;
exports.featuresEnabled = {
    studentPanel: false,
    versionCheck: true,
    protocol: "https"
};
exports.notLocal = host === prod;
//# sourceMappingURL=host.js.map