import {bind} from 'decko';
import {ObjectId} from 'mongodb';

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

    /**
     * Read all unit relations
     *
     * @param unitId unitFrom or unitTo id relation
     * @returns Returns Return an array of relations
     */
    @bind
    public async searchRelationsUnit(unitId: string): Promise<Relation[]> {
        try {
            return this.db.collection('relations').find(
                {$or: [{unitFrom: new ObjectId(unitId)}, {unitTo: new ObjectId(unitId)}]}).toArray();
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Read afferent relations from db by unitFrom
     *
     * @param unitFrom Unit id
     * @returns Returns an array of relations
     */
    @bind
    public async searchRelationsUnitByUnitFrom(unitFrom: string): Promise<Relation[]> {
        try {
            return this.db.collection('relations').find({unitFrom: new ObjectId(unitFrom)}).toArray();
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Delete a relation from db
     *
     * @param relationId Relation id to delete
     * @returns Returns insert document result
     */
    @bind
    public async deleteRelations(relationId: string): Promise<any> {
        try {
            return this.db.collection('relations').deleteOne({_id: new ObjectId(relationId)});
        } catch (err) {
            throw new Error(err);
        }
    }

}
