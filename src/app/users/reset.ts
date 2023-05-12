import { remult } from "remult";
import { RouteHelperService } from "../common-ui-elements";
import { HomeComponent } from "../home/home.component";
import { SignInController } from "./SignInController";

export const restart = async (router: RouteHelperService): Promise<boolean> => {

    SignInController.signOut();
    remult.user = undefined;
    router.navigateToComponent(HomeComponent);
    return true

}
