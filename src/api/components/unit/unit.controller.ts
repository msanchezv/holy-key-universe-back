import {bind} from 'decko';
import {NextFunction, Request, Response} from 'express';
import {Validator} from "jsonschema"
import {UNIT_SCHEMA} from "./unit.validator";

import {UnitService} from './unit.service';
import {Unit} from './unit.model';
import {Card, Detail} from "./card/card";
import {DetailsBuilder} from "./card/details.builder";
import {RelationService} from "../relation/relation.service";
import {RelationUtil} from "../relation/util/relation.util";
import {Relation} from "../relation/relation.model";

export class UnitController {
    private readonly unitService: UnitService = new UnitService();
    private readonly relationService: RelationService = new RelationService();

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

            let relationsId = {};
            if (relations) {
                const errorMessage = await this.getUnitIdRelations(relations, relationsId);
                if (errorMessage) {
                    return res.status(400).json({status: 400, error: errorMessage});
                }
            }

            unit = this.buildUnit(body);
            const result = await this.unitService.save(unit);

            if (relations) {
                await Promise.all(this.saveRelations(relationsId, result.insertedId));
            }

            return res.json({status: res.statusCode, data: result.ops[0]});
        } catch (err) {
            return res.status(500).json({status: 500, error: `Internal server error`});
        }
    }

    /**
     * Delete unit
     *
     * @param req Express request
     * @param res Express response
     * @param next Express next
     * @returns Returns HTTP response
     */
    @bind
    public async deleteUnit(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const {unitId} = req.params;
            if (!unitId) {
                return res.status(400).json({status: 400, error: 'Invalid request'});
            }

            const unitFound = await this.unitService.searchUnitById(unitId.toString());
            if (!unitFound) {
                return res.status(404).json({status: 404, error: 'Unit not found'});
            }

            let relations: Relation[];
            let relationsIds: string[] = [];
            relations = await this.relationService.searchRelationsUnit(unitFound._id);
            if (relations) {
                relations.forEach((relation) => {
                    relationsIds.push(relation._id);
                });
                //await this.relationService.deleteRelations(relationsIds);
            }

            //await this.unitService.delete(unitDB);

            return res.status(204).send();
        } catch (err) {
            return res.status(500).json({status: 500, error: `Internal server error`});
        }
    }

    private async getUnitIdRelations(relations: any, relationsId): Promise<string> {
        for (const relationType of Object.keys(relations)) {
            relationsId[relationType] = [];
            for (const unitName of relations[relationType]) {
                let unit = await this.unitService.searchUnitByTitle(unitName);
                if (unit.length == 1) {
                    relationsId[relationType].push(unit[0]._id)
                } else {
                    return `Unit ${unitName} not found`;
                }
            }
        }
        return null;
    }

    private isUnitValid(unit: Unit): boolean {
        let validator = new Validator();
        let errors = validator.validate(unit, UNIT_SCHEMA).errors;
        return errors.length === 0;
    }

    private getCards(unit: any): Card[] {
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

    private getDetails(cardBody: any): Detail[] {
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

    private buildUnit(body): Unit {
        let cards: Card[] = this.getCards(body);
        return {
            title: body.title,
            gender: body.gender,
            images: body.images,
            cards: cards
        }
    }

    private saveRelations(relationsId: any, resultId: string): Promise<any>[] {
        let promises: Promise<any>[] = [];
        for (const relationType of Object.keys(relationsId)) {
            for (const unitId of relationsId[relationType]) {
                promises.push(this.relationService.save(
                    {
                        unitFrom: resultId,
                        unitTo: unitId,
                        type: RelationUtil.getRelationType(relationType)
                    }))
            }
        }
        return promises;
    }

}
