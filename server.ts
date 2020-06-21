import {App} from "./index";
import * as mongoUtil from "./db/db"


(async function main() {
    try {
        mongoUtil.connectToServer(function (err) {
            if (err) {
                console.log(err.message);
                process.exit(1);
            }

            // Init express server
            const app = new App().app;

            // Start express server
            const PORT = process.env.PORT || 8080
            app.listen(PORT, function () {
                console.log("App now running on port", PORT);
            });
        });

    } catch (err) {
        console.log(err.message);
    }
})();

