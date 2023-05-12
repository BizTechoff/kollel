import { BackendMethod, Controller } from "remult"

@Controller('sys')
export class HelperController {

    @BackendMethod({ allowed: true })
    async getVersion() {
        return '2.1.0'
        // var pjson = require('../../../../kollel/src/app/');
        // return pjson.version
        // return process.env['npm_package_version'] as string
    }

}
