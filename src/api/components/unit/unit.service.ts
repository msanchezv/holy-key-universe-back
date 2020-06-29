import {bind} from 'decko';
import {ObjectId} from 'mongodb';

import * as mongo from "../../../../db/db";
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

    /**
     * Read a unit from db by title
     *
     * @param title Unit title
     * @returns Returns a single unit
     */
    @bind
    public async searchUnitByTitle(title: string): Promise<Unit> {
        try {
            return this.db.collection('units').findOne({title: {$eq: title}});
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Read a unit from db by id
     *
     * @param id Unit id
     * @returns Returns a single unit
     */
    @bind
    public async searchUnitById(id: string): Promise<Unit> {
        try {
            let o_id = ObjectId.isValid(id) ? new ObjectId(id) : id;
            return this.db.collection('units').findOne({_id: o_id});
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Read unit name from db by id
     *
     * @param id Unit id
     * @returns Returns unit name
     */
    @bind
    public async searchNameById(id: string): Promise<Unit> {
        try {
            return this.db.collection('units').findOne({_id: new ObjectId(id)},{projection: {title: true}});
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Read unit card from db by name
     *
     * @param unit Unit name
     * @param cardName Unit card name
     * @returns Returns unit card
     */
    @bind
    public async searchUnitCard(unit: string, cardName: string): Promise<any> {
        try {
            return this.db.collection('units').findOne({title: unit}, {
                projection: {
                    cards: {$elemMatch: {name: cardName}},
                    _id: 0
                }
            });
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Read unit property from db
     *
     * @param unit Unit name
     * @param property Unit property name
     * @returns Returns unit card
     */
    @bind
    public async searchUnitProperty(unit: string, property: string): Promise<any> {
        try {
            let projections = {
                projection: {
                    _id: 0
                }
            }
            projections[property] = 1;

            return this.db.collection('units').findOne({title: unit}, projections);
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Delete a unit from db
     *
     * @param id Unit id
     * @returns Returns a single unit
     */
    @bind
    public async delete(id: string): Promise<any> {
        try {
            return this.db.collection('units').deleteOne({_id: new ObjectId(id)});
        } catch (err) {
            throw new Error(err);
        }
    }
}
