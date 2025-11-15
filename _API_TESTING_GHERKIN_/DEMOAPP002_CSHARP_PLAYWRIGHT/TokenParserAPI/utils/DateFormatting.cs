using System.Globalization;

namespace TokenParserAPI.utils;

public static class DateFormatting
{
    public const string CanonicalFormat = "yyyy-MM-dd HH:mm:ssZ";

    public static string FormatUtc(DateTime date) =>
        date.ToUniversalTime().ToString(CanonicalFormat, CultureInfo.InvariantCulture);

    public static DateTime ParseUtc(string value) =>
        DateTime.ParseExact(
            value,
            CanonicalFormat,
            CultureInfo.InvariantCulture,
            DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal);
}
