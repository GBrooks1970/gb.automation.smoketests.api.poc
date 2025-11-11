import { LAST_PARSED_DATE, SECONDARY_PARSED_DATE, LAST_PARSED_RANGE, LAST_PARSE_ERROR, LAST_GENERATED_STRING } from "./memory-keys";
import { DateRange } from "../../src/tokenparser/TokenDateParser";
import { utilActor } from "../core/util-world";

export class UtilActorMemory {
    static rememberPrimaryDate = (value: Date) => utilActor().remember(LAST_PARSED_DATE, value);
    static rememberSecondaryDate = (value: Date) => utilActor().remember(SECONDARY_PARSED_DATE, value);
    static rememberRange = (value: DateRange) => utilActor().remember(LAST_PARSED_RANGE, value);
    static rememberError = (error: unknown) => utilActor().remember(LAST_PARSE_ERROR, error as Error);
    static clearError = () => utilActor().forget(LAST_PARSE_ERROR);
    static getPrimaryDate = (): Date => {
        const value = utilActor().recall<Date>(LAST_PARSED_DATE);
        expect(value, "No primary parsed date stored").to.exist;
        return value!;
    };

    static getSecondaryDate = (): Date => {
        const value = utilActor().recall<Date>(SECONDARY_PARSED_DATE);
        expect(value, "No secondary parsed date stored").to.exist;
        return value!;
    };

    static getRange = (): DateRange => {
        const range = utilActor().recall<DateRange>(LAST_PARSED_RANGE);
        expect(range, "No parsed date range stored").to.exist;
        return range!;
    };

    static getParseError = (): Error | undefined => utilActor().recall<Error>(LAST_PARSE_ERROR);

    static rememberGenerated = (value: string) => utilActor().remember(LAST_GENERATED_STRING, value);

    static getGenerated = (): string => utilActor().recall<string>(LAST_GENERATED_STRING) ?? "";
}
