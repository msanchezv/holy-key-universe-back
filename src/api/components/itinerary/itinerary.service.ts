import {bind} from 'decko';

import * as mongo from "../../../../db/db";
import {Itinerary} from "./itinerary.model";
import {ObjectId} from "mongodb";

export class ItineraryService {
    readonly db = mongo.getDb();
    private collection = "itineraries";

    /**
     * Save new itinerary to db
     *
     * @param itinerary Itinerary to save
     * @returns Returns insert document result
     */
    @bind
    public async save(itinerary: Itinerary): Promise<any> {
        try {
            return this.db.collection(this.collection).insertOne(itinerary);
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Read a itinerary from db by title
     *
     * @param title Itinerary title
     * @returns Returns a single itinerary
     */
    @bind
    public async searchItineraryByTitle(title: string): Promise<Itinerary> {
        try {
            return this.db.collection(this.collection).findOne({title: {$eq: title}});
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Read a itinerary from db by id
     *
     * @param id Itinerary id
     * @returns Returns a single itinerary
     */
    @bind
    public async searchItineraryById(id: string): Promise<Itinerary> {
        try {
            let o_id = ObjectId.isValid(id) ? new ObjectId(id) : id;
            return this.db.collection(this.collection).findOne({_id: o_id});
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Read all the itineraries from db
     *
     * @returns Returns an array of itineraries
     */
    @bind
    public async searchAllItineraries(): Promise<Itinerary[]> {
        try {
            return this.db.collection(this.collection).find().toArray();
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Delete a itinerary from db
     *
     * @param id Itinerary id
     * @returns Returns a single itinerary
     */
    @bind
    public async delete(id: string): Promise<Itinerary> {
        try {
            return this.db.collection(this.collection).deleteOne({_id: new ObjectId(id)});
        } catch (err) {
            throw new Error(err);
        }
    }
}
