import {Schema} from "jsonschema";

export const EXERCISE_SCHEMA: Schema = {
    type: "object",
    properties: {
        mode: {
            type: "string",
            pattern: "^(openanswer|fill)$"
        },
        response: {
            oneOf: [
                {
                    type: "string"
                },
                {
                    type: "array",
                    items: {
                        type: "string"
                    }
                }
            ]
        },
        exerciseCard: {
            type: "object",
            properties: {
                card: {
                    type: "string"
                },
                unit: {
                    type: "string",
                },
                index: {
                    type: "number"
                }
            },
            required: ["unit", "card"],
            additionalProperties: false
        }
    },
    additionalProperties: false,
    required: ["mode", "response", "exerciseCard"]
};
