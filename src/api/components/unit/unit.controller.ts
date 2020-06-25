import {bind} from 'decko';
import {NextFunction, Request, Response} from 'express';
import * as yaml from 'js-yaml';
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
     * Read unit
     *
     * @param req Express request
     * @param res Express response
     * @param next Express next
     * @returns Returns HTTP response
     */
    @bind
    public async readUnit(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const {unitId} = req.params;

            if (!unitId) {
                return res.status(400).json({status: 400, error: 'Invalid request'});
            }

            const unit: Unit = await this.unitService.searchUnitById(unitId);

            if (!unit) {
                return res.status(404).json({status: 404, error: 'Unit not found'});
            }

            let unitResponse = this.formatUnitResponse(unit);
            let relations = await this.relationService.searchRelationsUnitByUnitFrom(unit._id);
            if (relations.length > 0) {
                unitResponse["relations"] = await this.formatRelationsUnitResponse(relations);
            }

            return res.json({status: res.statusCode, data: unitResponse});
        } catch (err) {
            return res.status(500).json({status: 500, error: `Internal server error`});
        }
    }

    /**
     * Create unit from yaml file
     *
     * @param req Express request
     * @param res Express response
     * @param next Express next
     * @returns Returns HTTP response
     */
    @bind
    public async createUnitYaml(req: any, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const fileContent = yaml.load(req.file.buffer, {encoding: 'utf-8'});
            fileContent['title'] = req.file.originalname.substring(0, req.file.originalname.length - 5);

            return this.saveUnit(fileContent, res);

        } catch (err) {
            return res.status(500).json({status: 500, error: `Internal server error`});
        }
    }

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
            return this.saveUnit(body, res);

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
            relations = await this.relationService.searchRelationsUnit(unitFound._id);
            if (relations) {
                await this.deleteRelations(relations);
            }

            await this.unitService.delete(unitFound._id);

            return res.status(204).send();
        } catch (err) {
            return res.status(500).json({status: 500, error: `Internal server error`});
        }
    }

    private async saveUnit(body: any, res: Response): Promise<Response | void>{
        const {relations} = body;
        let unit: Unit;

        if (!this.isUnitValid(body)) {
            return res.status(400).json({status: 400, error: 'Invalid request'});
        }

        const unitFound = await this.unitService.searchUnitByTitle(body.title);
        if (unitFound) {
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
    }

    private async getUnitIdRelations(relations: any, relationsId): Promise<string> {
        for (const relationType of Object.keys(relations)) {
            relationsId[relationType] = [];
            for (const unitName of relations[relationType]) {
                let unit = await this.unitService.searchUnitByTitle(unitName);
                if (unit) {
                    relationsId[relationType].push(unit._id)
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
        cardBody.forEach(detail => {
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

    private async deleteRelations(relations): Promise<any> {
        let relationsIds = [];
        relations.forEach((relation) => {
            relationsIds.push(relation._id);
        });
        return await this.relationService.deleteRelations(relationsIds);
    }

    private formatUnitResponse(unit: Unit): any {
        let unitResponse = {};
        Object.keys(unit).forEach(key => {
            if (key !== "cards" && unit[key]) {
                unitResponse[key] = unit[key];
            } else {
                unit.cards.forEach((card) => {
                    unitResponse[card.name] = card.details;
                });
            }
        });

        return unitResponse;
    }

    private async formatRelationsUnitResponse(relations: Relation[]): Promise<any> {
        let relationsResponse = {};
        for (const relation of relations) {
            let relationKey = RelationUtil.getRelationKeyByType(relation.type);
            let relationValue = await this.unitService.searchNameById(relation.unitTo);
            if (relationsResponse[relationKey])
                relationsResponse[relationKey].push(relationValue.title);
            else
                relationsResponse[relationKey] = [relationValue.title];
        }

        return relationsResponse;
    }

}
