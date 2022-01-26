import clock from "clock";
import document from "document";
import {
    battery
} from "power";
import { display } from "display";

let hourG = document.getElementById("hours");
let minG = document.getElementById("mins");
let secG = document.getElementById("secs");
let hourHand = document.getElementById("hourHand");
let hourHandFill = document.getElementById("hourHandFill");
let minHand = document.getElementById("minHand");
let minHandFill = document.getElementById("minHandFill");
let secHand = document.getElementById("secHand");
let cometorbit = document.getElementById("cometorbit");
let comet = cometorbit.getElementById("comet");
let grad = document.getElementById("grad");
let testAOD = false;

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
        
        this._hourColor = "white";
        this._minColor = "white";
        this._secColor = "red";
        this._gradColor = "green";
//        console.log(`add listener returned: ${display.addEventListener("change", this.changeDisplay)}`);
    }

    appName() {
	return "analogcgm";
    }

    aod(a) {
        //console.log("test aod here");
        testAOD = a;
        this.changeDisplay(testAOD);
    }
    
    changeDisplay(aod, secs) {
        //console.log(`Change display here - aod is ${aod} aodActive is ${display.aodActive}`);
        /*
         * Set appropriate earth, sun, moon
         */
        if (`${testAOD}` == 'true' ||
            (display.aodActive && display.on)) {
       //     console.log(`aod is ${aod} aodActive is ${display.aodActive} and display.on is ${display.on}`);
       //     console.log("setting granularity to minutes");
            clock.granularity = "minutes";
            secHand.style.display = "none";
            hourHandFill.style.fill = "black";
            minHandFill.style.fill = "black";
            grad.style.display = "none";
        } else {
       //     console.log("setting granularity to seconds");
	    if (secs) {
            clock.granularity = "seconds";
            secHand.style.display = "inline";
	    } else {
            clock.granularity = "minutes";
            secHand.style.display = "none";
	    }
            hourHandFill.style.fill = this._hourColor;
            minHandFill.style.fill = this._minColor;
            grad.style.display = "inline";
        }
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

    updateClock(rangeHighest, rangeLowest, cometTime, cometClock, today, secs) {
        
   //     console.log(`updateClock now is ${today}`);
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
        hourG.groupTransform.rotate.angle = hoursToAngle(today.getHours(),
                                                         today.getMinutes());
        minG.groupTransform.rotate.angle = minutesToAngle(today.getMinutes());
        
        hourHand.style.fill = this._hourColor;
        hourHandFill.style.fill = this._hourColor;
        minHand.style.fill = this._minColor;
        minHandFill.style.fill = this._minColor;
        //console.log(`secs is ${secs}`);
        if (secs) {
            secG.groupTransform.rotate.angle = secondsToAngle(today.getSeconds());
            secHand.style.fill = this._secColor;
            secHand.style.display = "inline";
        } else {
            secHand.style.display = "none";
        }

        /*
         * Update the comet, if needed
         */
   //     console.log(`cometClock is ${cometClock}, cometTime is ${cometTime}, today is ${today}`);
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
