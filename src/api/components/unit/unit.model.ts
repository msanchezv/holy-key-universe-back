import {Card} from "./card/card";

export interface Unit {
    title: string;
    gender?: string;
    images?: {
        url: string;
    }[];
    cards?: Card[];
}
