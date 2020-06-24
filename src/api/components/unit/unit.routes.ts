import {Router} from 'express';
import {UnitController} from './unit.controller';
import * as multer from 'multer'

export class UnitRoutes {
    readonly controller: UnitController = new UnitController();
    readonly router: Router = Router();
    storage = multer.memoryStorage()
    readonly upload;

    path = '/unit';

    public constructor() {
        let storage = multer.memoryStorage()
        this.upload = multer({storage: storage})
        this.initRoutes();
    }

    initRoutes(): void {
        this.router.post(this.path + '/yaml', this.upload.single('unit'), this.controller.createUnitYaml)
        this.router.post(this.path, this.controller.createUnit);
        this.router.get(this.path + '/:unitId', this.controller.readUnit);
        this.router.delete(this.path + '/:unitId', this.controller.deleteUnit);
    }
}
