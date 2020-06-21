import {Router} from 'express';
import {UnitController} from './unit.controller';

export class UnitRoutes {
    readonly controller: UnitController = new UnitController();
    readonly router: Router = Router();
    path = '/unit'

    public constructor() {
        this.initRoutes();
    }

    initRoutes(): void {
        this.router.post(this.path, this.controller.createUnit);
        this.router.get(this.path + '/:unitId', this.controller.readUnit);
    }
}
