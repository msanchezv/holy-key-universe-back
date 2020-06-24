import {bind} from 'decko';

import * as mongo from "../../../../db/db";
import {Screen} from "./screen.model";

export class ScreenService {
    readonly db = mongo.getDb();
    private path = "screens";

    /**
     * Read a screen from db by title
     *
     * @param title Screen title
     * @returns Returns a single screen
     */
    @bind
    public async searchScreenByTitle(title: string): Promise<Screen> {
        try {
            return this.db.collection(this.path).findOne({title: {$eq: title}});
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
            return this.db.collection(this.path).insertOne(screen);
        } catch (err) {
            throw new Error(err);
        }
    }


}
