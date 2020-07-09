import {Schema} from "jsonschema";

export const SCREEN_SCHEMA: Schema = {
    type: "object",
    properties: {
        title: {type: "string"},
        exercise: {
            type: "object",
            properties: {
                mode: {
                    type: "string",
                    pattern: "^(openanswer|fill)$"
                },
                statement: {type: "string"},
                card: {type: "string"}
            },
            additionalProperties: false,
            required: ["mode, card"]
        }
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
                properties: {
                    exercise: {
                        type: "object",
                        properties: {
                            mode: {
                                type: "string",
                                pattern: "^(openanswer|fill)$"
                            },
                            statement: {type: "string"},
                            card: {type: "string"}
                        },
                        additionalProperties: false,
                        required: ["mode", "card"]
                    }
                },
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

