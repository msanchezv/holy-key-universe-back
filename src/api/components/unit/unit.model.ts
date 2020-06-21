import {Card} from "./card/card";

export interface Unit {
    _id?: string;
    title: string;
    gender?: string;
    images?: {
        url: string;
    }[];
    cards?: Card[];
}
