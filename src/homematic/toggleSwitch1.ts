import { getLogger } from "../common/Logger";
import { Switch1Settings } from "../data/settings/Switch1Settings";
import { StreamDeck } from "../streamdeck/StreamDeck";
import { filterDataPoints } from "./filterDataPoints";
import { loadState } from "./loadState";
import { setState } from "./setState";

export async function toggleSwitch1(streamdeck: StreamDeck, settings?: Switch1Settings): Promise<boolean> {
    const logger = getLogger("toggleSwitch1");

    if (settings == null) {
        logger.error("No settings provided. Cannot toggle switch1.");
        return false;
    }
    if (settings.address == null || settings.address.trim().length === 0) {
        logger.error("The address of the XMLAPI endpoint is not set. Cannot toggle switch1.");
        return false;
    }
    if (settings.selectedDeviceId == null || settings.selectedDeviceId.trim().length === 0) {
        logger.error("The device ID of the switch1 is empty. Cannot toggle switch1.");
        return false;
    }

    logger.log(`Getting current state of device "${settings.selectedDeviceName}" (${settings.selectedDeviceId})`);
    const currentState = await loadState(settings.address, settings.selectedDeviceId);

    if (currentState == null) {
        logger.warn(`Could not get current state of device "${settings.selectedDeviceName}" (${settings.selectedDeviceId})`);
        return false;
    }

    const stateDataPoints = filterDataPoints(currentState, ["STATE"]);
    if (stateDataPoints.length === 0) {
        logger.warn("No datapoint found for state \"STATE\"");
        return false;
    }
    logger.log(`Found ${stateDataPoints} data point${(stateDataPoints.length === 1 ? "" : "s")}`);

    for (const dataPoint of stateDataPoints) {
        logger.log(`Handling datapoint "${dataPoint.name}" (${dataPoint.id})`);

        // Toggle based on current value
        const newValue = dataPoint.value == "1" || dataPoint.value == "true" ? "false" : "true";
        await setState(settings.address, dataPoint.id, newValue);
        return dataPoint.value == "true" ? false : true;
    }

    return false;
}