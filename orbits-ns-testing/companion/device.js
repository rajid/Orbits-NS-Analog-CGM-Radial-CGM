import {
    settingsStorage
} from "settings";


export default function registerDevice() {
    try {
        let loghere = JSON.parse(settingsStorage.getItem("log")).name;
    } catch (err) {
        fetch("https://peacock.place/cgi-bin/cgm.cgi?orbitns");
        settingsStorage.setItem("log", JSON.stringify({"name": "here"}));
    }
}
