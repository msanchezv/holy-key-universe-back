import {Detail, DETAIL_TYPE, STATUS_TYPE} from "./card";

export class DetailsBuilder {
    private detail: Detail;

    constructor() {
        this.reset();
    }

    setText(text: string): DetailsBuilder {
        this.detail.text = text;
        return this;
    }

    setKeys(keys: string[]): DetailsBuilder {
        if (keys) {
            this.detail.keys = keys;
        }
        return this;
    }

    setType(type: DETAIL_TYPE): DetailsBuilder {
        this.detail.type = type ? type : DETAIL_TYPE.TEXT;
        return this;
    }

    setStatus(status: STATUS_TYPE): DetailsBuilder {
        this.detail.status = status ? status : STATUS_TYPE.CORRECT;
        return this;
    }

    reset() {
        this.detail = new Detail();
    }

    build() {
        const detail = this.detail;
        this.reset();
        return detail;
    }
}
