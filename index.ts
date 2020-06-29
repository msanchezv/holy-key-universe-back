import * as express from "express";
import * as bodyParser from "body-parser";
import {UnitRoutes} from "./src/api/components/unit/unit.routes";
import {ScreenRoutes} from "./src/api/components/screen/screen.routes";
import {ItineraryRoutes} from "./src/api/components/itinerary/itinerary.routes";

export class App {

    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
    }

    private config(): void {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: false}));
        this.app.use('/api', [new UnitRoutes().router, new ScreenRoutes().router, new ItineraryRoutes().router])
    }

}
