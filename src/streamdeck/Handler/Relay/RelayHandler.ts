import { getLogger, Logger } from "../../../common/Logger";
import { RelaySettings } from "../../../data/settings/RelaySettings";
import { StreamDeck } from "../../StreamDeck";
import { StreamDeckPluginAction } from "../../StreamDeckPluginAction";
import { BaseStreamDeckHandler } from "../BaseStreamDeckHandler";
import { RelayInstanceHandler } from "./RelayInstanceHandler";

export class RelayHandler extends BaseStreamDeckHandler<RelaySettings, RelayInstanceHandler> {
    public action: StreamDeckPluginAction;
    protected logger: Logger;

    constructor() {
        super();
        this.action = StreamDeckPluginAction.RelayToggle;
        this.logger = getLogger("RelayHandler");
    }

    public createInstanceHandler(streamdeck: StreamDeck, device: string | undefined, context: string | undefined, initialSettings: RelaySettings | undefined) {
        return new RelayInstanceHandler(streamdeck, device, context, initialSettings);
    }
}