export interface Unit {
    title: string;
    gender?: string;
    images?: {
        url: string;
    }[];
    card?: {
        details: {
            text: string;
            keys?: string[];
            type?: DETAIL_TYPE;
            status?: STATUS_TYPE;
        }
    }[];
    relations?: {
        bases?: string[];
        associates?: string[];
        aggregates?: string[];
        parts?: string[];
        used?: string[];
    }
}

enum DETAIL_TYPE {
    TEXT = "text",
    IMG = "img"
}

enum STATUS_TYPE {
    CORRECT = "correct",
    INCORRECT = "incorrect",
    TO_CHECK = "tocheck"
}
