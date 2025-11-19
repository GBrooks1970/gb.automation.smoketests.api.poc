declare class CommonUtils {
    constructor();
    static toJSONString(jsonObject: any, Unformatted?: boolean | false): string;
    static toJSONStringEscaped(jsonObject: any): string;
    static toJSONString_Escaped(jsonObject: any): string;
    static parseJSON(jsonString: string): any;
    static checkForDuplicates(array: any): boolean;
    static getSetIntersection(setA: Set<any>, setB: Set<any>): Set<any>;
    static getSetDifferences(setA: Set<any>, setB: Set<any>): Set<any>;
    static getSetUnion(setA: Set<any>, setB: Set<any>): Set<any>;
}
export default CommonUtils;
