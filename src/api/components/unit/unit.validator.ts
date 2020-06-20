import {Schema} from "jsonschema";

export const UNIT_SCHEMA: Schema = {
    type: "object",
    properties: {
        title: {type: "string"},
        gender: {type: "string"},
        images: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    url: {type: "string"}
                },
                additionalProperties: false
            }
        },
        relations: {
            type: "object",
            properties: {
                bases: {
                    type: "array",
                    items: {type: "string"}
                },
                associates: {
                    type: "array",
                    items: {type: "string"}
                },
                aggregates: {
                    type: "array",
                    items: {type: "string"}
                },
                parts: {
                    type: "array",
                    items: {type: "string"}
                },
                used: {
                    type: "array",
                    items: {type: "string"}
                },
            },
            additionalProperties: false
        }
    },
    patternProperties: {
        "^(?!(title|relations|images|gender)$).*": {
            type: "array",
            items: {
                type: "object",
                properties: {
                    details: {
                        type: "object",
                        properties: {
                            text: {type: "string"},
                            keys: {
                                type: "array",
                                items: {type: "string"}
                            },
                            type: {type: "string"},
                            status: {type: "string"},
                        },
                        required: ["text"],
                        additionalProperties: false
                    },
                },
                required: ["details"],
                additionalProperties: false
            },
        }
    },
    additionalProperties: false,
    required: ["title"]
}
