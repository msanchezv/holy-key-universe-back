import {bind} from 'decko';

import * as mongo from "../../../../db/db";
import {Itinerary} from "./itinerary.model";

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
}
