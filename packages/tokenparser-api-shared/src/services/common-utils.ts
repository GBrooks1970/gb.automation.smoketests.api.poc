class CommonUtils {
  static toJSONString(jsonObject: unknown, unformatted?: boolean | false): string {
    if (unformatted) return JSON.stringify(jsonObject);

    return JSON.stringify(jsonObject, null, 2);
  }

  static toJSONStringEscaped(jsonObject: unknown): string {
    return this.toJSONString(this.toJSONString(jsonObject, true), true);
  }

  static toJSONString_Escaped(jsonObject: unknown): string {
    const jsonString = JSON.stringify(jsonObject);
    return jsonString.replace(/[\\]/g, "\\\\").replace(/[\/]/g, "\\/");
  }

  static parseJSON<T = unknown>(jsonString: string): T {
    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      throw new Error(`Invalid JSON string: ${error}`);
    }
  }

  static checkForDuplicates<T>(array: T[]): boolean {
    return new Set(array).size !== array.length;
  }

  static getSetIntersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    return new Set([...setA].filter((x) => setB.has(x)));
  }

  static getSetDifferences<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    return new Set([...setA].filter((x) => !setB.has(x)));
  }

  static getSetUnion<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    return new Set([...setA, ...setB]);
  }
}

export default CommonUtils;
