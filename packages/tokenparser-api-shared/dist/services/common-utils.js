"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommonUtils {
    constructor() { }
    static toJSONString(jsonObject, Unformatted) {
        if (Unformatted)
            return JSON.stringify(jsonObject);
        return JSON.stringify(jsonObject, null, 2);
    }
    static toJSONStringEscaped(jsonObject) {
        return this.toJSONString(this.toJSONString(jsonObject, true), true);
    }
    static toJSONString_Escaped(jsonObject) {
        const jsonString = JSON.stringify(jsonObject);
        return jsonString.replace(/[\\]/g, "\\\\").replace(/[\/]/g, "\\/");
    }
    static parseJSON(jsonString) {
        try {
            return JSON.parse(jsonString);
        }
        catch (error) {
            throw new Error("Invalid JSON string: " + error);
        }
    }
    static checkForDuplicates(array) {
        return new Set(array).size !== array.length;
    }
    static getSetIntersection(setA, setB) {
        let intersection = new Set([...setA].filter((x) => setB.has(x)));
        return intersection;
    }
    static getSetDifferences(setA, setB) {
        let difference = new Set([...setA].filter((x) => !setB.has(x)));
        return difference;
    }
    static getSetUnion(setA, setB) {
        let union = new Set([...setA, ...setB]);
        return union;
    }
}
exports.default = CommonUtils;
