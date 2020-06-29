import {Router} from 'express';
import {ItineraryController} from "./itinerary.controller";

export class ItineraryRoutes {
    readonly controller: ItineraryController = new ItineraryController();
    readonly router: Router = Router();

    path = '/itinerary';

    public constructor() {
        this.initRoutes();
    }

    initRoutes(): void {
        this.router.post(this.path, this.controller.createItinerary);
    }
}
