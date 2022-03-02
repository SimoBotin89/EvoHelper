"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorage = void 0;
class LocalStorage {
    constructor(storage) {
        this.storage = storage;
    }
    getValue(key) {
        return this.storage.get(key, null);
    }
    setValue(key, value) {
        this.storage.update(key, value);
    }
}
exports.LocalStorage = LocalStorage;
//# sourceMappingURL=localStorage.js.map