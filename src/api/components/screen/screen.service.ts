import {bind} from 'decko';

import * as mongo from "../../../../db/db";
import {Screen} from "./screen.model";
import {ObjectId} from "mongodb";

export class ScreenService {
    readonly db = mongo.getDb();
    private collection = "screens";

    /**
     * Read a screen from db by title
     *
     * @param title Screen title
     * @returns Returns a single screen
     */
    @bind
    public async searchScreenByTitle(title: string): Promise<Screen> {
        try {
            return this.db.collection(this.collection).findOne({title: {$eq: title}});
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Read a screen from db by id
     *
     * @param id Screen
     * @returns Returns a single screen
     */
    @bind
    public async searchScreenById(id: string): Promise<Screen> {
        try {
            let o_id = ObjectId.isValid(id) ? new ObjectId(id) : id;
            return this.db.collection(this.collection).findOne({_id: o_id});
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Save new screen to db
     *
     * @param screen Screen to save
     * @returns Returns insert document result
     */
    @bind
    public async save(screen: Screen): Promise<any> {
        try {
            return this.db.collection(this.collection).insertOne(screen);
        } catch (err) {
            throw new Error(err);
        }
    }


}
