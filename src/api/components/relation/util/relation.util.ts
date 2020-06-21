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

    static getRelationKeyByType(type: RELATION_TYPE) {
        switch (type) {
            case RELATION_TYPE.INHERITANCE:
                return "bases";
            case RELATION_TYPE.ASSOCIATION:
                return "associates";
            case RELATION_TYPE.AGGREGATION:
                return "aggregates";
            case RELATION_TYPE.COMPOSITION:
                return "parts";
            case RELATION_TYPE.USE:
                return "used";
        }
    }
}
