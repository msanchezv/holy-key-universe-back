import {Router} from 'express';
import {ExerciseController} from './exercise.controller';

export class ExerciseRoutes {
    readonly controller: ExerciseController = new ExerciseController();
    readonly router: Router = Router();

    path = '/exercise';

    public constructor() {
        this.initRoutes();
    }

    initRoutes(): void {
        this.router.post(this.path, this.controller.saveResponse);
    }
}
