import { getLogger, Logger } from "../../../common/Logger";
import { Switch2Settings } from "../../../data/settings/Switch2Settings";
import { filterDataPoints } from "../../../homematic/filterDataPoints";
import { loadState } from "../../../homematic/loadState";
import { toggleSwitch2 } from "../../../homematic/toggleSwitch2";
import { KeyDownMessage } from "../../../message/KeyDownMessage";
import { StreamDeck } from "../../StreamDeck";
import { BaseStreamDeckInstanceHandler } from "../BaseStreamDeckInstanceHandler";

export class Switch2InstanceHandler extends BaseStreamDeckInstanceHandler<Switch2Settings> {
    protected logger: Logger;
    private state: "STATE" | "STATE" = "STATE";

    private refreshInterval = 30000;
    private timerHandle?: number;

    constructor(streamdeck: StreamDeck, device: string | undefined, context: string | undefined, initialSettings: Switch2Settings | undefined) {
        super(streamdeck, device, context, initialSettings);

        this.logger = getLogger(`Switch2InstanceHandler-${device}-${context}`);
        this.getState();
    }

    protected startTimer() {
        if (this.timerHandle != null) {
            this.stopTimer();
        }
        this.timerHandle = window.setInterval(() => {
            this.getState();
        }, this.refreshInterval);
        this.logger.info(`Started new timer with handle ${this.timerHandle} and interval ${this.refreshInterval}`);
    }

    protected stopTimer() {
        if (this.timerHandle != null) {
            this.logger.info(`Stopping timer ${this.timerHandle}`);
            window.clearInterval(this.timerHandle);
        }
    }

    protected async getState() {
        try {
            if (this.settings == null) {
                this.logger.error("Settings are empty. Cannot refresh data from HomeMatic.");
                return;
            }
            if (this.settings.selectedDeviceId == null) {
                this.logger.error("No switch2 control device configured. Cannot refresh data from HomeMatic.");
                return;
            }

            const device = await loadState(this.settings.address, this.settings.selectedDeviceId);
            if (device == null) {
                this.logger.warn(`Could not load state data for device ${this.settings.selectedDeviceId}`);
                return;
            }
            const data = filterDataPoints(device, ["STATE"]);
            const stateData = data.filter(dataPoint => dataPoint.type === this.state);
            if (stateData.length === 0) {
                this.logger.error(`No data points found for mode ${this.state}`);
                return;
            }
            this.setStateIcon((stateData[0].value) == "true" ? true : false, this.settings.selectedDeviceName || "");
        } catch (e) {
            this.logger.error("While handling the getState, an error occurred", e);
        } finally {
            this.startTimer();
        }
    }

    public setStateIcon(state: boolean, deviceName: string) {
        if (this.streamdeck == null) {
            this.logger.error("StreamDeck instance is empty. Cannot render button");
            return;
        }
        if (this.context == null) {
            this.logger.error("The context of the current button is unknown. Cannot render it.");
            return;
        }

        this.logger.log(`setStateIcon for device ${deviceName}`);
        let actualStateIcon = state == true ? "assets/state_on" : "assets/state_off";
        if (deviceName.length > 0 && (deviceName.includes("heizung") || deviceName.includes("Heizung"))) {
            actualStateIcon = state == true ? "assets/heater_on" : "assets/heater_off";
        }
        this.streamdeck.setImage(this.context, actualStateIcon);
    }

    public async onKeyDown(instance: StreamDeck, message: KeyDownMessage<Switch2Settings>) {
        const settings = message.payload.settings;
        this.logger.info(`KeyDown for switch2 "${settings.selectedDeviceName}".`);

        const newState = await toggleSwitch2(instance, this.settings);
        this.setStateIcon(newState, settings.selectedDeviceName || "");
    }
}