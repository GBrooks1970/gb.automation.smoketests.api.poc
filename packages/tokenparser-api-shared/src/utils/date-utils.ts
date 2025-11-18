export class DateUtils {
  /**
   * Formats a date using the canonical UTC string for Token Parser responses.
   * Example: 2025-11-12 13:45:12Z
   */
  static formatDateUtc(date: Date): string {
    const iso = date.toISOString();
    return `${iso.slice(0, 19).replace("T", " ")}Z`;
  }
}
