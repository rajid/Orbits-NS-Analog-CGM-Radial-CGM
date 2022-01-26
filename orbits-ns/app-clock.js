import clock from "clock";
import  document from "document";
import {
    battery
} from "power";
import { display } from "display";

let clockWindow = document.getElementById("clock");
let myclock = clockWindow.getElementById("clockFace");
let sunImage = document.getElementById("star");
let orbit = myclock.getElementById("orbit");
let moonorbit = orbit.getElementById("moonorbit");
let earth = orbit.getElementById("earth");
let earthImage = document.getElementById("earthImage");
let moon = moonorbit.getElementById("moon");
let moonImage = document.getElementById("moonImage");
let belt = myclock.getElementById("belt");
let asteroid = belt.getElementById("asteroid");
let grad = myclock.getElementById("rays");
let cometorbit = myclock.getElementById("cometorbit");
let comet = cometorbit.getElementById("comet");
let testAOD = false;

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
//        console.log(`add listener returned: ${display.addEventListener("change", this.changeDisplay)}`);;
    }

    appName() {
        return "orbitsns";
    }

    aod(a) {
        testAOD = a;
        this.changeDisplay(testAOD);
    }

    changeDisplay(aod) {
        //console.log(`Change display here - aod is ${aod} aodActive is ${display.aodActive}`);
        /*
         * Set appropriate earth, sun, moon
         */
        if (`${testAOD}` == 'true' ||
            (display.aodActive && display.on)) {
            //console.log(`aod is ${aod} aodActive is ${display.aodActive} and display.on is ${display.on}`);
//            console.log("setting granularity to minutes");
            clock.granularity = "minutes";
            earthImage.href = "earthOutline.png";
            moonImage.href = "moonOutline.png";
            sunImage.href = "starOutline.png";
        } else {
//            console.log("setting granularity to seconds");
            clock.granularity = "seconds";
            earthImage.href = "earth_only.png";
            moonImage.href = "moon_only.png";
            sunImage.href = "star_only.png";
        }
    }
    
    setHourColor(c) {}

    setMinColor(c) {}

    setSecColor(c) {}

    setGradColor(c) {}

    updateClock(rangeHighest, rangeLowest, cometTime, cometClock, today, secs) {
        //console.log(`granularity is ${clock.granularity}`);

        /*
         * Set Sun rays according to power level
         */
        let level = battery.chargeLevel;
        level = ((level * (rangeHighest - rangeLowest)) / 100) +
            rangeLowest;
        grad.gradient.x2 = level;
        grad.gradient.y2 = level;

        /*
         * Update the actual time display
         */
        let hour_angle = hoursToAngle(today.getHours(), today.getMinutes());
        orbit.groupTransform.rotate.angle = hour_angle;
        let minAngle = minutesToAngle(today.getMinutes, hour_angle);
        while (minAngle < 0) minAngle += 360;
        earth.style.display = "inline";
        earth.groupTransform.rotate.angle = 0-hour_angle;
        let moonangle = (today.getMinutes() * 360) / 60;
        moonorbit.groupTransform.rotate.angle = moonangle;
        moon.groupTransform.rotate.angle = 0 - moonangle;
        let week_angle = weekdayToAngle(today.getDay());
        belt.groupTransform.rotate.angle = week_angle;
//        asteroid.groupTransform.rotate.angle = 0 - week_angle;
        asteroid.groupTransform.rotate.angle = minutesToAngle(today.getSeconds(), 0);

        /*
         * Update the comet, if needed
         */
        //console.log(`cometClock is ${cometClock}, cometTime is ${cometTime}, today is ${today}`);
        if (cometTime != 0 && today >= cometTime) {
            let cometHour = cometClock.getHours();
            let cometMinute = cometClock.getMinutes();
            let op;
            cometorbit.groupTransform.rotate.angle =
                hoursToAngle(cometHour, cometMinute);
            comet.style.display = "inline";

            let timeLeft = cometClock.getTime() - today.getTime();
            if (timeLeft < 0) {
                op = 1;
            } else {
                let op = 1 -
                    (timeLeft/(cometClock.getTime() -
                               cometTime.getTime()));
            }
            if (op > 1) op = 1;
            else if (op < 0) op = 0;
            comet.style.fillOpacity = op;
        } else {
            comet.style.display = "none";
        }
    }
}
