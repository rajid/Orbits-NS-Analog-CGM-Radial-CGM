import { memory } from "system";

import document from "document";
import {
    battery
} from "power";

let hourG = document.getElementById("hours");
let minG = document.getElementById("mins");
let secG = document.getElementById("secs");
let hourHand = document.getElementById("hourHand");
let minHand = document.getElementById("minHand");
let secHand = document.getElementById("secHand");
let cometorbit = document.getElementById("cometorbit");
let comet = cometorbit.getElementById("comet");
let grad = document.getElementById("grad");

function hoursToAngle(hours, minutes) {
    let hourAngle = (360 / 12) * hours;
    let minAngle = (360 / 12 / 60) * minutes;
    return hourAngle + minAngle;
}

// Returns an angle (0-360) for minutes
function minutesToAngle(minutes) {
    return (360 / 60) * minutes;
}

// Returns an angle (0-360) for seconds
function secondsToAngle(seconds) {
    return (360 / 60) * seconds;
}

// Returns an angle (0-360) for weekday
function weekdayToAngle(weekday) {
    return (360 / 7) * weekday;
}

export class clockFace {

    constructor(id) {
        
        this._id = id;
        this._hourColor = "white";
        this._minColor = "white";
        this._secColor = "red";
        this._gradColor = "green";
//        this._rdots = this._id.getElementsByClassName("rdotx");
//        this._lowCircle = this._id.getElementById("lowCircle");
//        this._midCircle = this._id.getElementById("midCircle");
//        this._highCircle = this._id.getElementById("highCircle");
//        this._urgentHighColor = "white";
//        this._highColor = "white";
//        this._inRangeColor = "white";
//        this._lowColor = "white";
//        this._urgentLowColor = "white";
//        this._urgentHigh = 0;
//        this._high = 0;
//        this._low = 0;
//        this._urgentLow = 0;
//        this._bgValue = 0;
//        this._bgUnits = "bg/dL";
    }


    appName() {
        return "radialcgm";
    }

    setHourColor(c) {
        this._hourColor= c;
    }

    setMinColor(c) {
        this._minColor= c;
    }

    setSecColor(c) {
        this._secColor= c;
    }

    setGradColor(c) {
        this._gradColor= c;
    }

    updateClock(rangeHighest, rangeLowest, cometTime) {
        let today = new Date();
        let hours = today.getHours() % 12;
        let mins = today.getMinutes();
        let secs = today.getSeconds();
        
        /*
         * Update power level gradient
         */
        

        let level = battery.chargeLevel;
        level = ((level * (rangeHighest - rangeLowest)) / 100) +
            rangeLowest;
        grad.gradient.x2 = level;
        grad.gradient.y2 = level;
        grad.gradient.colors.c1 = this._gradColor;

        /*
         * Update the actual time display
         */
        hourG.groupTransform.rotate.angle = hoursToAngle(hours, mins);
        minG.groupTransform.rotate.angle = minutesToAngle(mins);
        secG.groupTransform.rotate.angle = secondsToAngle(secs);
        
        hourHand.style.fill = this._hourColor;
        hourHand.style.opacity = 0.6;
        minHand.style.fill = this._minColor;
        minHand.style.opacity = 0.6;
        secHand.style.fill = this._secColor;

        /*
         * Update the comet, if needed
         */
        if (cometTime != 0 && cometTime <= today) {
            let cometHour = cometTime.getHours();
            let cometMinute = cometTime.getMinutes();
            cometorbit.groupTransform.rotate.angle = hoursToAngle(cometHour, cometMinute);
            comet.style.display = "inline";
        } else {
            comet.style.display = "none";
        }
    }
}
