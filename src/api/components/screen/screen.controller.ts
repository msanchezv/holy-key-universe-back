import {bind} from "decko";
import {NextFunction, Request, Response} from "express";
import * as yaml from 'js-yaml';
import {Validator} from "jsonschema";

import {SCREEN_SCHEMA} from "./screen.validator";
import {ScreenService} from "./screen.service";
import {Screen} from "./screen.model";
import {UnitService} from "../unit/unit.service";


export class ScreenController {
    private readonly screenService: ScreenService = new ScreenService();
    private readonly unitService: UnitService = new UnitService();

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
                return res.status(404).json({status: 404, error: 'Screen not found'});
            }

            let screenResponse = await this.getScreenInfo(screen.body);

            return res.json({status: res.statusCode, data: screenResponse});
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
            return this.saveScreen(body, res);

        } catch (err) {
            return res.status(500).json({status: 500, error: `Internal server error`});
        }
    }

    /**
     * Create screen from yaml file
     *
     * @param req Express request
     * @param res Express response
     * @param next Express next
     * @returns Returns HTTP response
     */
    @bind
    public async createScreenYaml(req: any, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const fileContent = yaml.load(req.file.buffer, {encoding: 'utf-8'});
            fileContent['title'] = req.file.originalname.substring(0, req.file.originalname.length - 5);

            return this.saveScreen(fileContent, res);

        } catch (err) {
            return res.status(500).json({status: 500, error: `Internal server error`});
        }
    }

    /**
     * Delete screen
     *
     * @param req Express request
     * @param res Express response
     * @param next Express next
     * @returns Returns HTTP response
     */
    @bind
    public async deleteScreen(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const {screenId} = req.params;
            if (!screenId) {
                return res.status(400).json({status: 400, error: 'Invalid request'});
            }

            const screenFound = await this.screenService.searchScreenById(screenId.toString());
            if (!screenFound) {
                return res.status(404).json({status: 404, error: 'Screen not found'});
            }

            await this.screenService.delete(screenFound._id);

            return res.status(204).send();
        } catch (err) {
            return res.status(500).json({status: 500, error: `Internal server error`});
        }
    }

    private async saveScreen(body: any, res: Response): Promise<Response | void> {
        if (!this.isScreenValid(body)) {
            return res.status(400).json({status: 400, error: 'Invalid request'});
        }

        const screenFound = await this.screenService.searchScreenByTitle(body.title);
        if (screenFound) {
            return res.status(400).json({status: 400, error: 'Screen name already exists'});
        }

        const result = await this.screenService.save(this.buildScreen(body));

        return res.json({status: res.statusCode, data: result.ops[0]});
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

    private async getScreenInfo(body: any) {
        let bodyResponse = {};
        for (const key of Object.keys(body)) {
            if (key == "row" || key == "column") {
                bodyResponse[key] = await this.getGridViewComponents(body[key]);
            } else {
                bodyResponse[key] = await this.getViewComponentsValue(body[key])
            }
        }
        return bodyResponse;
    }

    private async getGridViewComponents(gridComponent: Array<any>) {
        let result = [];
        for (const component of gridComponent) {
            result.push(await this.getScreenInfo(component));
        }
        return result;
    }

    private async getViewComponentsValue(value: string) {
        let unitReferences = value.match(/(?<!(\/))\${[^}]+}/gi);
        let unitEscapeReferences = value.match(/\/\${[^}]+}/gi);
        let result = value;
        unitEscapeReferences?.forEach(escapeReference => {
            result = result.replace(escapeReference, escapeReference.substring(1, escapeReference.length))
        })
        if (unitReferences) {
            for (const reference of unitReferences) {
                result = result.replace(reference, await this.getReferenceValue(reference.substring(2, reference.length - 1)))
            }
        }
        return result;
    }

    private async getReferenceValue(reference: string) {
        let keys = reference.split('.');
        if (keys.length < 2) {
            return 'ERROR: Wrong reference'
        }
        let unitName = keys[0];
        let key = keys[1].substring(0, keys[1].length - 3);
        let index = parseInt(keys[1].substring(keys[1].length - 2, keys[1].length - 1), 10);
        if (isNaN(index)) {
            return 'ERROR: Wrong reference'
        }
        if (this.referenceIsCard(key)) {
            let result = await this.unitService.searchUnitCard(unitName, key);
            return result.cards && result.cards[0].details[index] ? result.cards[0].details[index].text : 'ERROR: No reference was found';
        } else {
            let result = await this.unitService.searchUnitProperty(unitName, key);
            return result.images && result.images[index] ? result.images[index].url : 'ERROR: No reference was found';
        }
    }

    private referenceIsCard(key: string) {
        const reserveWords = ['images'];
        return !reserveWords.includes(key);
    }
}
