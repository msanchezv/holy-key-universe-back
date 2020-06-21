import {RELATION_TYPE} from "../relation.model";

export class RelationUtil {
    static getRelationType(relation: string) {
        switch (relation) {
            case "bases":
                return RELATION_TYPE.INHERITANCE;
            case "associates":
                return RELATION_TYPE.ASSOCIATION;
            case "aggregates":
                return RELATION_TYPE.AGGREGATION;
            case "parts":
                return RELATION_TYPE.COMPOSITION;
            case "used":
                return RELATION_TYPE.USE;
        }
    }
}
