import React, { useEffect, useState } from "react";
import { getLogger } from "../../common/Logger";
import { DropDown, DropDownOption } from "../../components/DropDown/DropDown";
import { PropertyInspectorContainer } from "../../components/PropertyInspectorContainer/PropertyInspectorContainer";
import { Spinner } from "../../components/Spinner/Spinner";
import { TextBox } from "../../components/TextBox/TextBox";
import { Device } from "../../data/Device";
import { Switch1Settings } from "../../data/settings/Switch1Settings";
import { DeviceType } from "../../homematic/DeviceType";
import { loadDevices } from "../../homematic/loadDevices";
import { useStreamDeck } from "../../streamdeck/React/useStreamDeck";
import { useStreamdeckConnected } from "../../streamdeck/React/useStreamdeckConnected";

export function Switch1Component() {
    const [isDevicesLoading, setIsDevicesLoading] = useState(false);
    const [devices, setDevices] = useState<Device[]>([]);
    const [settings, setSettings] = useState<Switch1Settings | undefined>(undefined);
    const [isSettingsLoading, setIsSettingsLoading] = useState(false);

    const logger = getLogger("Switch1Component");
    const streamdeck = useStreamDeck();
    const streamdeckConnected = useStreamdeckConnected();

    useEffect(() => {
        let didCancel = false;
        async function fetchDevices() {
            setIsDevicesLoading(true);
            const fetchedDevices = settings?.address == null ? [] : await loadDevices(settings.address);
            if (!didCancel) {
                logger.log("Retrieved devices", fetchedDevices);
                setDevices(fetchedDevices);
                setIsDevicesLoading(false);
            }
        }
        fetchDevices();
        return () => { didCancel = true; };
    }, [settings?.address, logger]);

    useEffect(() => {
        let didCancel = false;
        async function loadSettings() {
            if (!streamdeck.isConnected) {
                return;
            }
            setIsSettingsLoading(true);
            const loadedSettings = await streamdeck.getSettings<Switch1Settings>();
            if (!didCancel) {
                logger.log("Retrieved settings", loadedSettings);
                setSettings(loadedSettings);
                setIsSettingsLoading(false);
            }
        }

        if (settings == null) {
            logger.info("Settings empty. Loading settings.");
            if (!streamdeck.isConnected) {
                logger.warn("StreamDeck not yet connected");
            } else {
                loadSettings();
            }
        }

        return () => {
            didCancel = true;
        };
    }, [streamdeckConnected, logger, settings, streamdeck]);

    const onIpChange = async (newAddress?: string) => {
        logger.log(`Handling new address ${newAddress}`);
        const newSettings = settings == null ? {} as Switch1Settings : { ...settings };
        newSettings.address = newAddress ?? "";
        streamdeck.setSettings(newSettings);
        setSettings(newSettings);

    };

    const onDeviceChange = async (newDevice?: Device) => {
        logger.log(`Handling new device ${newDevice?.name}`);
        const newSettings = settings == null ? {} as Switch1Settings : { ...settings };
        newSettings.selectedDeviceId = newDevice?.id;
        newSettings.selectedDeviceName = newDevice?.name;
        streamdeck.setSettings(newSettings);
        setSettings(newSettings);
    };

    if (settings == null || isSettingsLoading) {
        return <Spinner />;
    }

    const switch1s = devices.filter(device => device.deviceType === DeviceType.Switch1);
    const deviceOptions = switch1s.map(switch1 => ({ name: switch1.name, value: switch1.id, payload: switch1 } as DropDownOption<Device>));

    if (settings.selectedDeviceId == null && switch1s.length > 0) {
        onDeviceChange(switch1s[0]);
    }

    let editPanel: JSX.Element | null = (
        <>
            {!isDevicesLoading && devices != null &&
                <DropDown items={deviceOptions} disabled={isDevicesLoading} defaultValue={settings.selectedDeviceId} onChange={newSelectedDevice => onDeviceChange(newSelectedDevice.payload)} />}
        </>
    );
    if (settings.address == null || settings.address.length == 0) {
        editPanel = null;
    }

    return (
        <PropertyInspectorContainer>
            <TextBox label="Address" placeholder="Address of Homematic CCU" defaultValue={settings.address} onChange={(newAddress) => onIpChange(newAddress)} />
            {isDevicesLoading &&
                <Spinner />}
            {editPanel}
        </PropertyInspectorContainer>
    );
}