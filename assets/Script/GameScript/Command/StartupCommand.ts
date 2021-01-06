import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Command from "../../Framework/patterns/command/Command";
import { HallPanelMediator } from "../Mediator/HallPanelMediator";

export class StartupCommand extends Command {
    public execute(notification: INotification): void {
        

        Facade.Instance.registerMediator(new HallPanelMediator());
    }
}