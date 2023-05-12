import { BackendMethod, Controller, ControllerBase } from "remult";

@Controller('app')
export class AppController extends ControllerBase {

    @BackendMethod({ allowed: true })
    async isDevMode() {
        let prod = (process.env['NODE_ENV'] ?? '') === 'production'
        return !prod
    }

}
