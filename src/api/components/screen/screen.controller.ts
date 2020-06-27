import {bind} from "decko";
import {NextFunction, Request, Response} from "express";
import {Validator} from "jsonschema";

import {SCREEN_SCHEMA} from "./screen.validator";
import {ScreenService} from "./screen.service";
import {Screen} from "./screen.model";


export class ScreenController {
    private readonly screenService: ScreenService = new ScreenService();

    /**
     * Read screen
     *
     * @param req Express request
     * @param res Express response
     * @param next Express next
     * @returns Returns HTTP response
     */
    @bind
    public async readScreen(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const {screenId} = req.params;

            if (!screenId) {
                return res.status(400).json({status: 400, error: 'Invalid request'});
            }

            const screen: Screen = await this.screenService.searchScreenById(screenId);

            if (!screen) {
                return res.status(404).json({status: 404, error: 'Unit not found'});
            }

            return res.json({status: res.statusCode, data: this.getScreenInfo(screen)});
        } catch (err) {
            return res.status(500).json({status: 500, error: `Internal server error`});
        }
    }

    /**
     * Create screen
     *
     * @param req Express request
     * @param res Express response
     * @param next Express next
     * @returns Returns HTTP response
     */
    @bind
    public async createScreen(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const body = req.body;

            if (!this.isScreenValid(body)) {
                return res.status(400).json({status: 400, error: 'Invalid request'});
            }

            const screenFound = await this.screenService.searchScreenByTitle(body.title);
            if (screenFound) {
                return res.status(400).json({status: 400, error: 'Screen name already exists'});
            }

            const result = await this.screenService.save(this.buildScreen(body));

            return res.json({status: res.statusCode, data: result.ops[0]});
        } catch (err) {
            return res.status(500).json({status: 500, error: `Internal server error`});
        }
    }

    private isScreenValid(screen: Screen): boolean {
        let validator = new Validator();
        let errors = validator.validate(screen, SCREEN_SCHEMA).errors;
        return errors.length === 0;
    }

    private buildScreen(body): Screen {
        let bodyDB = {};
        Object.keys(body).forEach(key => {
            if (key !== 'title') {
                bodyDB[key] = body[key];
            }
        });
        return {
            title: body.title,
            body: bodyDB
        };
    }

    private getScreenInfo(body: any) {
        let bodyResponse = {};
        Object.keys(body).forEach((key) => {
            if (key == "row" || "column") {
                bodyResponse[key] = this.getScreenInfo(body[key])
            } else {
                bodyResponse[key] = this.getUnitInfo(body[key])
            }
        });
        return bodyResponse;
    }

    private getUnitInfo(value: string) {
        let unitReferences = value.match(/(?<!(\/))\${.+}/gi);
        console.log('Array con referencias', unitReferences);
        unitReferences.forEach(reference => {
            value.replace(reference, this.getItemValue(reference.substring(2, reference.length - 2)))
        });
        return value;
    }

    private getItemValue(reference: string) {
        console.log('Referencia', reference)
        let keys = reference.split('.');
        let key = keys[1].substring(0, keys[1].length - 4);
        if (this.referenceIsCard(key)) {
            return 'card value ' + key
        }
        return 'no es una card';
    }

    private referenceIsCard(key: string) {
        console.log('card', key)
        const reserveWords = ['images'];
        return !reserveWords.includes(key);
    }
}
