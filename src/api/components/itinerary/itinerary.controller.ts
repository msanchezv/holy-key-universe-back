import {bind} from 'decko';
import {NextFunction, Request, Response} from 'express';
import * as yaml from 'js-yaml';
import {Validator} from "jsonschema";
import {ITINERARY_SCHEMA} from "./itinerary.validator";
import {ScreenService} from "../screen/screen.service";
import {ItineraryService} from "./itinerary.service";
import {Itinerary} from "./itinerary.model";


export class ItineraryController {
    private readonly screenService: ScreenService = new ScreenService();
    private readonly itineraryService: ItineraryService = new ItineraryService();

    /**
     * Create itinerary from yaml file
     *
     * @param req Express request
     * @param res Express response
     * @param next Express next
     * @returns Returns HTTP response
     */
    @bind
    public async createItineraryYaml(req: any, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const fileContent: Itinerary = {
                screens: yaml.load(req.file.buffer, {encoding: 'utf-8'}),
                title: req.file.originalname.substring(0, req.file.originalname.length - 5)
            };

            return this.saveItinerary(fileContent, res);

        } catch (err) {
            return res.status(500).json({status: 500, error: `Internal server error`});
        }
    }

    /**
     * Create itinerary
     *
     * @param req Express request
     * @param res Express response
     * @param next Express next
     * @returns Returns HTTP response
     */
    @bind
    public async createItinerary(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const body = req.body;
            return this.saveItinerary(body, res);

        } catch (err) {
            return res.status(500).json({status: 500, error: `Internal server error`});
        }
    }

    /**
     * Delete itinerary
     *
     * @param req Express request
     * @param res Express response
     * @param next Express next
     * @returns Returns HTTP response
     */
    @bind
    public async deleteItinerary(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const {itineraryId} = req.params;
            if (!itineraryId) {
                return res.status(400).json({status: 400, error: 'Invalid request'});
            }

            const itineraryFound = await this.itineraryService.searchItineraryById(itineraryId.toString());
            if (!itineraryFound) {
                return res.status(404).json({status: 404, error: 'Itinerary not found'});
            }

            await this.itineraryService.delete(itineraryId.toString());

            return res.status(204).send();
        } catch (err) {
            return res.status(500).json({status: 500, error: `Internal server error`});
        }
    }

    private async saveItinerary(body: any, res: Response): Promise<Response | void> {
        const itinerary: Itinerary = body;

        if (!this.isItineraryValid(itinerary)) {
            return res.status(400).json({status: 400, error: 'Invalid request'});
        }

        const itineraryFound = await this.itineraryService.searchItineraryByTitle(itinerary.title);
        if (itineraryFound) {
            return res.status(400).json({status: 400, error: 'Name already exists'});
        }

        let itineraryDB: Itinerary = {
            title: itinerary.title,
            screens: []
        };

        for (const screen of itinerary.screens) {
            let screenDB = await this.screenService.searchScreenByTitle(screen);
            if (!screenDB) {
                return res.status(404).json({status: 404, error: 'Screen ' + screen + ' not found'});
            }
            itineraryDB.screens.push(screenDB._id);
        }

        const result = await this.itineraryService.save(itineraryDB);

        return res.json({status: res.statusCode, data: result.ops[0]});
    }

    private isItineraryValid(itinerary: Itinerary): boolean {
        let validator = new Validator();
        let errors = validator.validate(itinerary, ITINERARY_SCHEMA).errors;
        return errors.length === 0;
    }
}
