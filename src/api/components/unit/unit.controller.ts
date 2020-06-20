import {bind} from 'decko';
import {NextFunction, Request, Response} from 'express';
import {Validator} from "jsonschema"
import {UNIT_SCHEMA} from "./unit.validator";

import {UnitService} from './unit.service';
import {Unit} from './unit.model';
import {Card, Detail} from "./card/card";
import {DetailsBuilder} from "./card/details.builder";

export class UnitController {
    private readonly unitService: UnitService = new UnitService();

    /**
     * Create unit
     *
     * @param req Express request
     * @param res Express response
     * @param next Express next
     * @returns Returns HTTP response
     */
    @bind
    public async createUnit(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const body = req.body;
            const {relations} = req.body;
            let unit: Unit;

            if (!this.isUnitValid(body)) {
                return res.status(400).json({status: 400, error: 'Invalid request'});
            }

            const unitFound = await this.unitService.searchUnitByTitle(body.title);
            if (unitFound.length > 0) {
                return res.status(400).json({status: 400, error: 'Name already exists'});
            }

            //TODO: Guardar relations por separado

            unit = this.buildUnit(body);
            const result = await this.unitService.save(unit);

            return res.json({status: res.statusCode, data: result.ops[0]});
        } catch (err) {
            return next(err);
        }
    }

    isUnitValid(unit: Unit): boolean {
        let validator = new Validator();
        let errors = validator.validate(unit, UNIT_SCHEMA).errors;
        return errors.length === 0;
    }

    getCards(unit: any): Card[] {
        const reservedKeys = ['title', 'gender', 'images', 'relations'];
        let cards: Card[] = [];
        Object.keys(unit).forEach(key => {
            if (!reservedKeys.includes(key)) {
                let details: Detail[] = this.getDetails(unit[key]);
                cards.push({
                    name: key,
                    details: details
                });
            }
        });
        return cards;
    }

    getDetails(cardBody: any): Detail[] {
        let details: Detail[] = [];
        let detailBuilder: DetailsBuilder = new DetailsBuilder();
        cardBody.details.forEach(detail => {
            details.push(
                detailBuilder.setText(detail.text)
                    .setKeys(detail.keys)
                    .setType(detail.type)
                    .setStatus(detail.status).build());
        });
        return details;
    }

    buildUnit(body): Unit {
        let cards: Card[] = this.getCards(body);
        return {
            title: body.title,
            gender: body.gender,
            images: body.images,
            cards: cards
        }
    }
}
