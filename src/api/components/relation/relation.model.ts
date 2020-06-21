export interface Relation {
    _id?: string;
    unitFrom: string;
    unitTo: string;
    type: RELATION_TYPE;
}

export enum RELATION_TYPE {
    INHERITANCE = "inheritance",
    COMPOSITION = "composition",
    AGGREGATION = "aggregation",
    ASSOCIATION = "association",
    USE = "use"
}
