import { getLogger, Logger } from "../../../common/Logger";
import { Switch1Settings } from "../../../data/settings/Switch1Settings";
import { StreamDeck } from "../../StreamDeck";
import { StreamDeckPluginAction } from "../../StreamDeckPluginAction";
import { BaseStreamDeckHandler } from "../BaseStreamDeckHandler";
import { Switch1InstanceHandler } from "./Switch1InstanceHandler";

export class Switch1Handler extends BaseStreamDeckHandler<Switch1Settings, Switch1InstanceHandler> {
    public action: StreamDeckPluginAction;
    protected logger: Logger;

    constructor() {
        super();
        this.action = StreamDeckPluginAction.Switch1Toggle;
        this.logger = getLogger("Switch1Handler");
    }

    public createInstanceHandler(streamdeck: StreamDeck, device: string | undefined, context: string | undefined, initialSettings: Switch1Settings | undefined) {
        return new Switch1InstanceHandler(streamdeck, device, context, initialSettings);
    }
}