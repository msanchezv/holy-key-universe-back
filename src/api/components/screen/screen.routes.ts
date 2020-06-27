import {Router} from 'express';
import {ScreenController} from './screen.controller';
import * as multer from 'multer';

export class ScreenRoutes {
    readonly controller: ScreenController = new ScreenController();
    readonly router: Router = Router();
    storage = multer.memoryStorage();
    readonly upload;

    path = '/screen';

    public constructor() {
        let storage = multer.memoryStorage();
        this.upload = multer({storage: storage});
        this.initRoutes();
    }

    initRoutes(): void {
        this.router.post(this.path + '/yaml', this.upload.single('screen'), this.controller.createScreenYaml);
        this.router.post(this.path, this.controller.createScreen);
        this.router.delete(this.path + '/:screenId', this.controller.deleteScreen);
    }
}
