import {Schema} from "jsonschema";

export const ITINERARY_SCHEMA: Schema = {
    type: "object",
    properties: {
        title: {
            type: "string"
        },
        screens: {
            type: "array",
            items: {
                type: "string"
            }
        }
    }
}
