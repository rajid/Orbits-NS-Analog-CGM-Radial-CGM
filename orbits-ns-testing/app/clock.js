import document from "document";
import {
    battery
} from "power";

let clockWindow = document.getElementById("clock");
let myclock = clockWindow.getElementById("clockFace");
let orbit = myclock.getElementById("orbit");
let moonorbit = orbit.getElementById("moonorbit");
let earth = orbit.getElementById("earth");
let moon = moonorbit.getElementById("moon");
let belt = myclock.getElementById("belt");
let asteroid = belt.getElementById("asteroid");
let grad = myclock.getElementById("rays");
let cometorbit = myclock.getElementById("cometorbit");
let comet = cometorbit.getElementById("comet");

// Returns an angle (0-360) for the current hour in the day, including minutes
function hoursToAngle(hours, minutes) {
    let hourAngle = (360 / 12) * hours;
    let minAngle = (360 / 12 / 60) * minutes;
    return hourAngle + minAngle;
}

// Returns an angle (0-360) for minutes
function minutesToAngle(minutes,hourangle) {
    let minangle = ((360 / 60) * minutes);
    let val = minangle - hourangle;
    return val;
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
        
        this._hourColor = "white";
        this._minColor = "white";
        this._secColor = "red";
        this._gradColor = "green";
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

    updateClock(screenHeight, screenWidth, cometTime) {
        let today = new Date();
        let hours = today.getHours() % 12;
        let mins = today.getMinutes();
        let secs = today.getSeconds();
        let weekday = today.getDay();
        
        /*
         * Set Sun rays according to power level
         */
        let rangeHighest = screenHeight * 0.95;
        let rangeLowest = screenHeight * 0.70;
        let level = battery.chargeLevel;
        level = ((level * (rangeHighest - rangeLowest)) / 100) +
            rangeLowest;
        grad.gradient.x2 = level;
        grad.gradient.y2 = level;

        /*
         * Update the actual time display
         */
        let hour_angle = hoursToAngle(hours, mins);
        orbit.groupTransform.rotate.angle = hour_angle;
        let minAngle = minutesToAngle(mins, hour_angle);
        while (minAngle < 0) minAngle += 360;
        earth.style.display = "inline";
        earth.groupTransform.rotate.angle = 0-hour_angle;
        let moonangle = (mins * 360) / 60;
        moonorbit.groupTransform.rotate.angle = moonangle;
        moon.groupTransform.rotate.angle = 0 - moonangle;
        let week_angle = weekdayToAngle(weekday);
        belt.groupTransform.rotate.angle = week_angle;
        asteroid.groupTransform.rotate.angle = 0 - week_angle;

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
