import {Router} from 'express';
import {ScreenController} from './screen.controller';

export class ScreenRoutes {
    readonly controller: ScreenController = new ScreenController();
    readonly router: Router = Router();
    path = '/screen';

    public constructor() {
        this.initRoutes();
    }

    initRoutes(): void {
        this.router.post(this.path, this.controller.createScreen);
        this.router.get(this.path, this.controller.readScreen);
    }
}
