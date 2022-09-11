"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyRequiredError = void 0;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}
class PropertyRequiredError extends ValidationError {
    constructor(property, object) {
        super("Property: " + property + " in: " + object + " does not exist");
        this.name = "PropertyRequiredError";
        this.property = property;
    }
}
exports.PropertyRequiredError = PropertyRequiredError;
//# sourceMappingURL=errors.js.map