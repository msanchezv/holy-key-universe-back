import {Router} from 'express';
import {ItineraryController} from "./itinerary.controller";
import * as multer from 'multer'

export class ItineraryRoutes {
    readonly controller: ItineraryController = new ItineraryController();
    readonly router: Router = Router();
    readonly upload;

    path = '/itinerary';

    public constructor() {
        let storage = multer.memoryStorage()
        this.upload = multer({storage: storage})
        this.initRoutes();
    }

    initRoutes(): void {
        this.router.post(this.path + '/yaml', this.upload.single('itinerary'), this.controller.createItineraryYaml)
        this.router.post(this.path, this.controller.createItinerary);
    }
}
