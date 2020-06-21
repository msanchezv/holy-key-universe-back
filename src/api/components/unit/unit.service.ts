import {bind} from 'decko';

import * as mongo from "../../../../db/db"
import {Unit} from "./unit.model"

export class UnitService {
    readonly db = mongo.getDb();

    /**
     * Save new unit to db
     *
     * @param unit Unit to save
     * @returns Returns insert document result
     */
    @bind
    public async save(unit: Unit): Promise<any> {
        try {
            return this.db.collection('units').insertOne(unit);
        } catch (err) {
            throw new Error(err);
        }
    }

    public async searchUnitByTitle(title: string): Promise<Unit[]> {
        try {
            return this.db.collection('units').find({title: {$eq: title}}).toArray();
        } catch (err) {
            throw new Error(err);
        }
    }
}
