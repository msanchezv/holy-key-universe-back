import {bind} from 'decko';
import {NextFunction, Request, Response} from 'express';
import {Validator} from "jsonschema"

import {UnitService} from "../unit/unit.service";
import {EXERCISE_SCHEMA} from "./exercise.validator";
import {EXERCISE_MODE} from "./exercise.model";
import {Detail, DETAIL_TYPE, STATUS_TYPE} from "../unit/card/card";

export class ExerciseController {
    private readonly unitService: UnitService = new UnitService();

    /**
     * Save exercise response
     *
     * @param req Express request
     * @param res Express response
     * @param next Express next
     * @returns Returns HTTP response
     */
    @bind
    public async saveResponse(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const body = req.body;
            if (!this.isRequestValid(body) || (body.mode !== EXERCISE_MODE.FILL && body.mode !== EXERCISE_MODE.OPEN_ANSWER)) {
                return res.status(400).json({error: 'Invalid request'});
            }

            if(body.mode === EXERCISE_MODE.OPEN_ANSWER){
                return await this.saveOpenAnswerResponse(body, res);
            }else if(body.mode === EXERCISE_MODE.FILL){
                return await this.saveFillResponse(body, res);
            }

        } catch (err) {
            return res.status(500).json({error: `Internal server error`});
        }
    }

    private async saveOpenAnswerResponse(exerciseResponse: any, res: Response): Promise<Response> {
        const cardFound = await this.unitService.searchUnitCard(exerciseResponse.exerciseCard.unit, exerciseResponse.exerciseCard.card);

        if (Object.keys(cardFound).length === 0) {
            return res.status(404).json({error: 'Card not found'});
        }
        const detail: Detail = {
            text: exerciseResponse.response,
            keys: null,
            type: DETAIL_TYPE.TEXT,
            status: STATUS_TYPE.TO_CHECK
        }

        await this.unitService.updateCards(exerciseResponse.exerciseCard.unit, exerciseResponse.exerciseCard.card, detail);

        return res.json({result: "ok"});
    }

    private async saveFillResponse(exerciseResponse: any, res: Response): Promise<Response> {
        const cardFound = await this.unitService.searchUnitCard(exerciseResponse.exerciseCard.unit, exerciseResponse.exerciseCard.card);

        if (Object.keys(cardFound).length === 0 || (cardFound.cards[0].details.length < exerciseResponse.exerciseCard.index)) {
            return res.status(404).json({error: 'Card not found'});
        }

        let details = cardFound.cards[0].details;
        const isCorrect =  details[exerciseResponse.exerciseCard.index].keys.length === exerciseResponse.response.length &&
            details[exerciseResponse.exerciseCard.index].keys.every((element, index) =>{
            return element ===  exerciseResponse.response[index];
        });

        if(details[exerciseResponse.exerciseCard.index].registerFillAnswer){
            isCorrect ? details[exerciseResponse.exerciseCard.index].registerFillAnswer.correctAnswers++
                : details[exerciseResponse.exerciseCard.index].registerFillAnswer.wrongAnswers++;
        }else{
            details[exerciseResponse.exerciseCard.index].registerFillAnswer = {
                correctAnswers: isCorrect ? 1 : 0,
                wrongAnswers: isCorrect ? 0 : 1
            }
        }

        await this.unitService.updateCardDetails(exerciseResponse.exerciseCard.unit, exerciseResponse.exerciseCard.card, details)

        return res.json({result: "ok"});
    }

    private isRequestValid(exerciseResponse: any): boolean {
        let validator = new Validator();
        let errors = validator.validate(exerciseResponse, EXERCISE_SCHEMA).errors;
        return errors.length === 0;
    }
}
