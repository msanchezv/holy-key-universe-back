export class Card {
    name: string;
    details: Detail[];
}

export class Detail {
    text: string;
    keys: string[];
    type: DETAIL_TYPE;
    status: STATUS_TYPE;
}

export enum DETAIL_TYPE {
    TEXT = "text",
    IMG = "img"
}

export enum STATUS_TYPE {
    CORRECT = "correct",
    INCORRECT = "incorrect",
    TO_CHECK = "tocheck"
}
