class CommonUtils {
  constructor() {}

  static toJSONString(jsonObject: any, Unformatted?: boolean | false): string {
    if (Unformatted) return JSON.stringify(jsonObject);

    return JSON.stringify(jsonObject, null, 2);
  }

  static toJSONStringEscaped(jsonObject: any): string {
    return this.toJSONString(this.toJSONString(jsonObject, true), true);
  }

  static toJSONString_Escaped(jsonObject: any): string {
    const jsonString = JSON.stringify(jsonObject);
    return jsonString.replace(/[\\]/g, "\\\\").replace(/[\/]/g, "\\/");
  }

  static parseJSON(jsonString: string): any {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error("Invalid JSON string: " + error);
    }
  }

  static checkForDuplicates(array: any) {
    return new Set(array).size !== array.length;
  }

  static getSetIntersection(setA: Set<any>, setB: Set<any>): Set<any> {
    let intersection = new Set([...setA].filter((x) => setB.has(x)));
    return intersection;
  }

  static getSetDifferences(setA: Set<any>, setB: Set<any>): Set<any> {
    let difference = new Set([...setA].filter((x) => !setB.has(x)));
    return difference;
  }

  static getSetUnion(setA: Set<any>, setB: Set<any>): Set<any> {
    let union = new Set([...setA, ...setB]);
    return union;
  }
}

export default CommonUtils;
