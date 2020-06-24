import {Schema} from "jsonschema";

export const SCREEN_SCHEMA: Schema = {
    type: "object",
    properties: {
        title: {type: "string"},
    },
    patternProperties: {
        "^(text|image|diagram)$": {type: "string"},
        "^(row|column)$": {"$ref": "#/definitions/composite"}
    },
    maxProperties: 2,
    additionalProperties: false,
    required: ["title"],
    definitions: {
        composite: {
            type: "array",
            items: {
                type: "object",
                patternProperties: {
                    "^(text|image|diagram)$": {type: "string"},
                    "^(row|column)$": {"$ref": "#/definitions/composite"},
                },
                additionalProperties: false,
            },
            minItems: 1
        }
    }
};

