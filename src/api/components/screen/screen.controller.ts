import {bind} from "decko";
import {NextFunction, Request, Response} from "express";
import * as yaml from 'js-yaml';
import {Validator} from "jsonschema";

import {SCREEN_SCHEMA} from "./screen.validator";
import {ScreenService} from "./screen.service";
import {Screen} from "./screen.model";


export class ScreenController {
    private readonly screenService: ScreenService = new ScreenService();

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


}
