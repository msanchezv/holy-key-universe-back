import {bind} from 'decko';

import * as mongo from "../../../../db/db"
import {Relation} from "./relation.model"

export class RelationService {
    readonly db = mongo.getDb();

    /**
     * Save new relation to db
     *
     * @param relation Relation to save
     * @returns Returns insert document result
     */
    @bind
    public async save(relation: Relation): Promise<any> {
        try {
            return this.db.collection('relations').insertOne(relation);
        } catch (err) {
            throw new Error(err);
        }
    }
}
