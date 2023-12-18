import { getLogger, Logger } from "../../../common/Logger";
import { Switch2Settings } from "../../../data/settings/Switch2Settings";
import { StreamDeck } from "../../StreamDeck";
import { StreamDeckPluginAction } from "../../StreamDeckPluginAction";
import { BaseStreamDeckHandler } from "../BaseStreamDeckHandler";
import { Switch2InstanceHandler } from "./Switch2InstanceHandler";

export class Switch2Handler extends BaseStreamDeckHandler<Switch2Settings, Switch2InstanceHandler> {
    public action: StreamDeckPluginAction;
    protected logger: Logger;

    constructor() {
        super();
        this.action = StreamDeckPluginAction.Switch2Toggle;
        this.logger = getLogger("Switch2Handler");
    }

    public createInstanceHandler(streamdeck: StreamDeck, device: string | undefined, context: string | undefined, initialSettings: Switch2Settings | undefined) {
        return new Switch2InstanceHandler(streamdeck, device, context, initialSettings);
    }
}