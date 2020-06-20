import {bind} from 'decko';
import {NextFunction, Request, Response} from 'express';
import {Validator} from "jsonschema"
import {UNIT_SCHEMA} from "./unit.validator";

import {UnitService} from './unit.service';
import {Unit} from './unit.model';

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
            const unit = req.body;
            const {relations} = req.body;

            //TODO: validar enumerados
            if (!this.isUnitValid(unit)) {
                return res.status(400).json({status: 400, error: 'Invalid request'});
            }

            const unitFound = await this.unitService.searchUnitByTitle(unit.title);
            if (unitFound.length > 0) {
                return res.status(400).json({status: 400, error: 'Name already exists'});
            }

            //TODO: Guardar relations por separado
            if (relations) {
                delete unit.relations;
            }

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
}
