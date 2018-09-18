import clock from "clock";
import document from "document";
import {
    me as watch
} from "appbit";
import {
    me as device
} from "device";
import * as messaging from "messaging";
import * as util from "../common/utils";
// Setup a message for later
import {
    readFileSync
} from "fs";
import {
    writeFileSync
} from "fs";
import {
    unlinkSync
} from "fs";
import {
    statSync
} from "fs";
import {
    vibration
} from "haptics";
import Graph from "./graph.js"
import {
    inbox
} from "file-transfer";
import { display } from "display";
import { memory } from "system";
import {
    charger
} from "power";

/*
 * Remove all console messages for production code

 var console = {};
 console.log = function(){};
*/

memory.onmemorypressurechange = function(evt) {
    menuButton.opacity = "1";
    switch(memory.pressure){
    case "normal":
        menuButton.fill = "green";
        break;
    case "high":
        menuButton.fill = "yellow";
        break;
    case "critical":
        menuButton.fill = "red";
        break;
    }
}

let noteBG = document.getElementById("noteBG");
let noteMess = document.getElementById("noteMess");
let noteTime = document.getElementById("noteTime");
var messTimeout;
let dismissButton = document.getElementById("dismiss");
let snoozeButton = document.getElementById("snooze");

var alarms = [];
var messages = [];
var timeouts = [];
let currAlarm = -1; // current Alarm being displayed
let currSnooze = 0; // actual time when snooze will expire
let currTimeout = 0; // snooze/re-buzz assoc. w/ current alarm
let lastAlarm = -1; // last Alarm which was just dismissed

if (!device.screen) device.screen = {
    width: 348,
    height: 250
};
const screenWidth = device.screen.width;
const screenHeight = device.screen.height;

// Update the clock every second
clock.granularity = "seconds";

import { clockFace } from "./clock.js";
let myClock = new clockFace();

let month = document.getElementById("month");
let date = document.getElementById("date");
let hour = document.getElementById("hour");
let minute = document.getElementById("minute");

let arrow = document.getElementById("arrow");
let circle = document.getElementById("circle"); // for calibrated values
let sgv = document.getElementById("sgv");
//let update = document.getElementById("update");
let state = document.getElementById("state");
let forceUpdate = document.getElementById("forceUpdate");

let cornerTime = 0; // init
let cornerTimeInit = 5; // time to display numbers in corners


forceUpdate.onclick = function() {
    if (nsConfigured) {
        wakeupFetch();
    }
    //    fetchCompanionData("data", false); // Force this fetch
}

/*
 * We sometimes lose timeouts on both companion and watch face
 * especially if the phone's screen is off and the watch display is
 * off as well.
 * So...  Let's make sure that when the display turns on we trigger
 * getting a fresh value, if we don't have one.
 */
function displayChange(evt) {
    let now = new Date();

    if (display.on) {
        if (nsConfigured) {
            if (bgNext < now.getTime()) {
                wakeupFetch();
            }
        }
    }
}
display.addEventListener("change", displayChange);



let nsConfigured = false;
var BG = [];
let bgUnits = "bg/dl"; // default
let bgValue = 0;
let bgDate = 0;
let bgPeriod = 0;
let bgNext = 0;
let bgNextStart = 0;
let bgDelta = 0;
let bgLast = 0;
let IOB = 0;
let COB = 0;
let bgFont1 = 40; // init.
let bgFont2 = 40; // init.
let calibration = false; // signals the latest values were due to calibration
let BGUrgentLow = 0;
let BGLow = 0;
let BGHigh = 0;
let BGUrgentHigh = 0;
let urgentLowColor = "";
let lowColor = "";
let inRangeColor = "white";
let highColor = "";
let urgentHighColor = "";
let BGDiff = 0;
let fetchHandle = 0; // handle for regularly scheduled wakeups

// This is the time when the comet should show up
let cometTime = 0;
let cometHour = 0;
let cometMinute = 0;
let cometDays = 3;
let cometHours = 12;

var fullhours;
var mins;
var mondate;
var mon;

function setArrowColor(arrow) {

    if (Math.abs(bgDelta) > 20 ||
        (BGDiff > 0 && Math.abs(bgDelta) >= BGDiff)) {
        arrow.style.fill = "red";
    } else if (longTimeAlert) {
        arrow.style.fill = "yellow";
    } else {
        arrow.style.fill = "lightgreen";
    }
}

// Set the appropriate color for this bg range
function bgRangeColor() {

    if (BGUrgentHigh > 0 && bgValue > BGUrgentHigh) {
        if (urgentHighColor != "") return urgentHighColor;
    } else if (BGHigh > 0 && bgValue > BGHigh) {
        if (highColor != "") return highColor;
    } else if (BGUrgentLow > 0 && bgValue < BGUrgentLow) {
        if (urgentLowColor != "") return urgentLowColor;
    } else if (BGLow > 0 && bgValue < BGLow) {
        if (lowColor != "") return lowColor;
    } else {
        if (inRangeColor != "") return inRangeColor;
    }

    return "white";
}

let rangeHighest = screenHeight * 1.0;
let rangeLowest = screenHeight * 0.55;

// Rotate the hands every tick
function updateClock() {
    let today = new Date();
    fullhours = today.getHours();
    //    let hours = fullhours % 12;
    mins = today.getMinutes();
    //    let secs = today.getSeconds();
    //    let weekday = today.getDay();
    mondate = today.getDate();
    mon = today.getMonth() + 1;

    if (charger.connected) {
        display.poke();
    }

    myClock.updateClock(rangeHighest, rangeLowest, cometTime);

    /*
     * Update corner numbers, if we're showing them
     */
    if (cornerTime > 0) {
        month.text = `${mon}`;
        date.text = `${mondate}`;
        hour.text = `${fullhours}`;
        minute.text = `${util.zeroPad(mins)}`;
        cornerTime--;
    } else {
        month.style.display = "none";
        date.style.display = "none";
        hour.style.display = "none";
        minute.style.display = "none";

        if (nsConfigured) {
            arrow.style.display = "inline";
            sgv.style.display = "inline";
            state.style.display = "inline";
        }
        menu.style.display = "inline";
    }

    /*
     * Update Nightscout related info, if configured
     */
    if (nsConfigured && cornerTime <= 0) {
        // Display the correct sgv value
        if (bgUnits === 'mmol/L') {
            sgv.text = util.mmol(bgValue).toString();
        } else {
            sgv.text = bgValue.toString();
        }
        sgv.style.fontSize = bgFont1;
        try {
            sgv.style.fill = bgRangeColor();
        } catch(err) {
            sgv.style.fill = "white";
        }
        // Set opacity for how long it's been here
        let now = new Date();
        let age = now.getTime() - bgDate;
        let opacity = 1.0;
        age /= (1000 * 60);

        if (age < 5) {
            opacity = 1.0;
        } else {
            if (age > 5) {
                age -= 5;
            }
            opacity = (20 - age) / (20);
            if (opacity < 0) {
                opacity = 0;
            }
            if (opacity > 1) {
                opacity = 1;
            }
        }
        sgv.style.fillOpacity = opacity;
        sgv.style.display = "inline";

        if ((BGLow || BGHigh || BGUrgentLow || BGUrgentHigh) &&
            bgValue > 0 && opacity == 0) {
            // Let's bring this to their attention
            sgv.style.fillOpacity = 1;
            sgv.text = `${Math.floor(age)} mins old`;
        }

        // Update the arrow
        let angle = (bgDelta * 90) / 20;
        angle = 90 - angle;
        if (angle < 0) {
            angle = 0
        }
        if (angle > 180) {
            angle = 180
        }
        if (calibration) {
            circle.style.display = "inline";
            arrow.style.display = "none";
            setArrowColor(circle);
        } else {
            circle.style.display = "none";
            arrow.style.display = "inline";
            arrow.groupTransform.rotate.angle = angle;
            setArrowColor(arrow);
            arrow.style.opacity = opacity;
        }

        // Update our status dot (failedFetches is reset to 0 once a msg works)
        if (failedFetches > 0) {
            state.style.fill = "red";
        } else if (failedFetches == 0) {
            state.style.fill = "green";
        } else {
            state.style.fill = "white"; // indeterminate
        }
    }
}


/*
 * Determine if "now" is within the range of times (start, end)
 * even if "start" is after "end" and thus loops to the next day.
 */
function inRange(start, end, now) {

    if (!start.defined || !end.defined) {
        return false;
    }

    let s = (start.hours * 60) + start.minutes;
    let e = (end.hours * 60) + end.minutes;
    let n = (now.getHours() * 60) + now.getMinutes();
    
    if (s == e) {
        return false;
    }

    if (s < e) { // if it's between, we're done
        if (s < n && n < e) {
            return true;
        }
    } else {
        if (n > s) {
            return true; // between s and midnight
        }
        if (n < e) {
            return true; // earlier than e
        }
    }
    return false;
}

function vibNudge(now) {
    
    if (!inRange(warnSuppressStart, warnSuppressEnd, now) &&
        (commSnoozeEnd == 0 || commSnoozeEnd < now.getTime())) {
        console.log(`**** Not in Range`);
        vibration.start("nudge-max"); // get some attention
        display.poke();
    }
}

// Try to fix a comm/peerSocket communication error by exiting
// and having the OS restart us automatically
function fixComm(now) {
    var exited;
    console.log("Looking for forceExit file");
    try {
        let s = statSync("forceExit");
        exited = true;
    } catch (err) {
        exited = false;
    }
    console.log(`Found exited to be set as ${exited}`);
    if (!exited) {
        // give up, exit, and get restarted
        writeFileSync("forceExit", { // log that we force exited
            time: now  // This file is removed once comm works
        }, "json");
        let s = statSync("forceExit");
        console.log(`forceexit file info ${s}`);
        watch.exit(); // Bye!
    } else {
        vibNudge(now);
    }
}

let lastFetch = 0; // time when last fetch was tried
let failedFetches = -1; // number of failed fetches - neg num's are indeterminate
// Period during which we shouldn't worry about connection issues
// Ultimately, I'd like to have this simply be "during sleep".
let warnSuppressStart = {defined: false};
let warnSuppressEnd = {defined: false};
function fetchCompanionData(cmd) {
    var worked;
    let now = new Date();

    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        // Send a command to the companion
        messaging.peerSocket.send({
            command: cmd
        });
        lastFetch = now.getTime();
        if (failedFetches < 0) failedFetches--; // we hope for the best, but...
        else failedFetches = -1;
        worked = true;
    } else {
        if (failedFetches > 0) failedFetches++;
        else failedFetches = 1;
        worked = false;
    }

    // If we have seen too many failures, we're tracking BG values,
    // and we're not in the quiet time range, and we haven't
    // snoozed comm channel warnings, then tell us about this.
    if (Math.abs(failedFetches) > 10 &&
        (BGLow > 0 || BGHigh > 0 || BGUrgentLow > 0 || BGUrgentHigh > 0)) {
        fixComm(now);
        //      vibNudge(now);
    }
    return worked;
}


// Dealing with displaying numbers in the corners on touch
var wholeScreen = document.getElementById("clicker");
wholeScreen.onclick = function(e) {
    console.log("click");
    
    if (cornerTime == 0) {
        month.text = `${mon}`;
        date.text = `${mondate}`;
        hour.text = `${fullhours}`;
        minute.text = `${mins}`;

        month.style.display = "inline";
        date.style.display = "inline";
        hour.style.display = "inline";
        minute.style.display = "inline";

        arrow.style.display = "none";
        sgv.style.display = "none";
        state.style.display = "none";
        circle.style.display = "none";
        menu.style.display = "none";

        cornerTime = cornerTimeInit; // display corners for this many seconds
    } else {
        cornerTime = 0;
    }
}

// Update the clock every tick event
clock.ontick = () => updateClock();

function setPodchange(value) {
    let d = new Date(value);

    if (value == null || isNaN(value)) {
        cometTime = 0;
        cometHour = 0;
        cometMinute = 0;
        return;
    }

    cometTime = new Date((d.getTime() + cometDays * 24 * 60 * 60 * 1000) - (cometHours * 60 * 60 * 1000));
    console.log(`New comet time of ${cometTime}`);
    
    cometHour = cometTime.getHours();
    cometMinute = cometTime.getMinutes();
}

// Haven't seen an "ack" to our last request - do it again
let ackHandle = 0;
function wakeupAck() {
    clearTimeout(ackHandle);
    console.log("fetching again due to no ack");
    
    wakeupFetch();
}

/*
 * Primary routine called from a setTimeout, performing the fetch and doing retries
 */
function wakeupFetch() {

    if (!nsConfigured) return;
    
    console.log("Wakeup and fetch data");
    

    if (!fetchCompanionData("data")) {
        // Failed - reschedule another try
        if (fetchHandle) clearTimeout(fetchHandle);
        fetchHandle = setTimeout(wakeupFetch, 10 * 1000);
    } else {
        // Even then, we still need to see an "ack"
        if (ackHandle) clearTimeout(ackHandle);
        ackHandle = setTimeout(wakeupAck, 5 * 1000);
    }
}

/*
 * See if a BG warning is needed
 */
function testLimits() {
    var bg;

    if (bgUnits === 'mmol/L') {
        bg = util.mmol(bgValue).toString();
    } else {
        bg = bgValue.toString();
    }
    if ((BGHigh > 0 && bg > BGHigh) ||
        (BGLow > 0 && bg < BGLow) ||
        (BGUrgentHigh > 0 && bg > BGUrgentHigh) ||
        (BGUrgentLow > 0 && bg < BGUrgentLow)) {
        warnBG();
    }
}

/*
 * Check for difference over a longer time frame
 */
let longPeriod = 0;
let longDiff = 0;
let longTimeAlert = false;
function longTimeCheck(now) {

    longTimeAlert = false;

    if (longPeriod == 0 || longDiff == 0) return;
    
    var i;
    let longTime = util.Min2ms(longPeriod);
    for (i = 0 ; i < BG.length && (now.getTime() - BG[i].date) < longTime ; i++) {
        if (BG.cal) return; // abort if we cross a calibrarion
    }
    if (--i <= 0) return;

    try {
        let t = new Date(BG[i].date);
        if (Math.abs(bgValue - BG[i].sgv) > longDiff) {
            longTimeAlert = true;
            vibNudge(now);
        }
    } catch (err) {}
}

/*
 * Enable and disable Nightscout info
 */
function nightScout(val) {

    if (val == 1) {
        if (nsConfigured == false) {
            console.log("ns switching from false to true");
            nsConfigured = true;
            wakeupFetch();
        }
        forceUpdate.style.display = "inline";
        state.style.display = "inline";
        if (BG.length < 24) {
            console.log("Fetching initial graph data");
            fetchCompanionData("graph");
        }
    } else {
        nsConfigured = false;
        arrow.style.display = "none";
        sgv.style.display = "none";
        state.style.display = "none";
        forceUpdate.style.display = "none";
        circle.style.display = "none";
    }
    console.log(`nsConfigured = ${nsConfigured}`);
    
}

/*
 * Receive messages
 */
messaging.peerSocket.onmessage = evt => {
    let now = new Date();

    console.log("message for you, sir! " + evt.data.key);
    

    switch (evt.data.key) {
    case "bg":
        failedFetches = 0; // Ok!  We have communication!            
        console.log(`bgValue=${evt.data.bg}`);
        console.log(`bgDate=${evt.data.date}`);
        console.log(`bgPeriod=${evt.data.period}`);
        console.log(`bgDelta=${evt.data.delta}`);
        console.log(`nextUpdate=${(evt.data.update - now.getTime())/60000} mins`);
        console.log(`calibration=${evt.data.calibration}`);

        let x = now.getTime() - evt.data.date;
        console.log(`bgAge = ${x} = ${x/(60*1000)} mins`);

        if (evt.data.bg > 0) {
            bgValue = evt.data.bg;
            bgDate = evt.data.date;
            // buzz if we're only seeing old data
            if ((now.getTime() - bgDate) >= util.Min2ms(20) && 
                (BGLow || BGHigh || BGUrgentLow || BGUrgentHigh)) {
                vibNudge(now);
            }
            
            bgPeriod = evt.data.period;
            bgDelta = evt.data.delta;
            calibration = evt.data.calibration;
            testLimits();
            BG.unshift({
                sgv: bgValue,
                date: bgDate,
                cal: calibration
            });
            console.log(`BG length = ${BG.length}`);
            
            while (BG.length > 24)
                BG.pop();
        }
        if (evt.data.update > 0) {
            bgNext = evt.data.update;
            //                if (BGLow || BGHigh) {
            // If we have low or high limits, then make sure we gather data
            // at regular intervals
            console.log(`Setting wakeup for ${bgNext-now.getTime()} ms`);
            
            let d = new Date(bgNext);
            console.log(`at: ${d}`);
            
            if (fetchHandle) {
                clearTimeout(fetchHandle);
            }
            fetchHandle = setTimeout(wakeupFetch, bgNext - now.getTime() /* + (30*1000) */);
            //                }
            bgNextStart = bgNext - now.getTime();
            bgLast = now.getTime();
        }
        if (isNaN(bgDelta)) {
            delta = 0;
        }

        var lastWasCalibrarion;
        if (calibration) {
            console.log("calibration");
            //                vibration.start("nudge-max");
            if (!lastWasCalibrarion) {
                vibNudge(now);
            }
            lastWasCalibrarion = true;
        } else {
            lastWasCalibrarion = false;
            if (BGDiff > 0 && Math.abs(bgDelta) >= BGDiff) {
                // Buzz if this is a "large" difference
                vibNudge(now);
            } else longTimeCheck(now);
        }
        if (showingGraph) {
            updateGraph(BG);
        }
        nightScout(1); // obvously!
        break;

    case "ack":
        console.log("Received ACK");
        
        failedFetches = 0; // Ok!  We have communication!            
        if (ackHandle) {
            clearTimeout(ackHandle); // Got our "ack"!
            ackHandle = 0;
        }
        break;

    case "podchange":
        console.log(`evt.data.value=${evt.data.value}`);
        
        let p = parseInt(evt.data.value);
        cometDays = parseInt(evt.data.period);
        cometHours = parseInt(evt.data.before);
        console.log(`p=${evt.data.value}`);
        
        setPodchange(p);
        writeFileSync("podchange", {
            podchange: p,
            period: cometDays,
            before: cometHours
        }, "json");
        break;

    case "alarm":
        console.log(`received alarm ${evt.data.number} as ${evt.data.value}`);
        
        setAlarm(evt.data.number, evt.data.value);
        break;

    case "mess":
        console.log(`received mess ${evt.data.number} as ${evt.data.value}`);
        
        setMessage(evt.data.number, evt.data.value);
        break;

    case "alarmsnooze": // configured alarm snooze times
        console.log(`alarmsnoozetimes ${evt.data.number} = ${evt.data.value}`);
        
        alarmSnoozeTimes[evt.data.number] = parseInt(evt.data.value);
        writeFileSync("alarmSnooze", alarmSnoozeTimes, "json");
        break;

    case "timer":
        console.log(`Received timer request for ${evt.data.number} minutes`);
        
        startTimer(evt.data.number);
        break;

    case "limits":
        BGUrgentLow = evt.data.urgentLow;
        BGLow = evt.data.low;
        BGHigh = evt.data.high;
        BGUrgentHigh = evt.data.urgentHigh;
        BGDiff = evt.data.diff;
        urgentLowColor = evt.data.urgentLowColor;
        lowColor = evt.data.lowColor;
        inRangeColor = evt.data.inRangeColor;
        highColor = evt.data.highColor;
        urgentHighColor = evt.data.urgentHighColor;
        writeLimitsInfo();

        if (BGLow || BGHigh || BGUrgentLow || BGUrgentHigh) {
            if ((BGHigh > 0 && bgValue > BGHigh) ||
                (BGLow > 0 && bgValue < BGLow) ||
                (BGUrgentLow > 0 && bgValue < BGUrgentLow) ||
                (BGUrgentHigh > 0 && bgValue > BGUrgentHigh)) {
                warnBG();
            } else {
                if (BGgraphButton.style.display == "inline") {
                    dismissBG();
                }
                if (snoozeBGTimes.style.display == "inline") {
                    snoozeBGTimes.style.display = "none";
                }
                if (graphWindow.style.display == "inline" && graphReturn == warnBG) {
                    dismissGraph();
                }
            }
        }
        break;

    case "long":
        longPeriod = evt.data.period;
        longDiff = evt.data.diff;
        break;

    case "warn-start":
        if (evt.data.value == "") {
            warnSuppressStart = {
                defined: false
            }
        } else {
            let tokens = evt.data.value.split(":");
            warnSuppressStart = {
                hours: parseInt(tokens[0]),
                minutes: parseInt(tokens[1]),
                defined: true
            };
        }
        writeFileSync("warn-start", warnSuppressStart, "json");
        console.log(`Warn-start: ${warnSuppressStart.hours}:${warnSuppressStart.minutes}`);
        
        break;

    case "warn-end":
        if (evt.data.value == "") {
            warnSuppressEnd = {
                defined: false
            }
        } else {
            let tokens = evt.data.value.split(":");
            warnSuppressEnd = {
                hours: parseInt(tokens[0]),
                minutes: parseInt(tokens[1]),
                defined: true
            };
        }
        writeFileSync("warn-end", warnSuppressEnd, "json");
        console.log(`Warn-end: ${warnSuppressEnd.hours}:${warnSuppressEnd.minutes}`);
        
        break;

    case "units":
        bgUnits = evt.data.value;
        console.log(`Got new Units of ${bgUnits}`);
        
        break;

    case "bgFont1":
        bgFont1 = evt.data.number;
        break;

    case "bgsnooze": // configured bg notice "ignore" times
        console.log(`bgsnooze ${evt.data.number} = ${evt.data.value}`);
        
        bgSnoozeTimes[evt.data.number] = parseInt(evt.data.value);
        writeFileSync("BGSnooze", bgSnoozeTimes, "json");
        break;

    case "ns": // is Nightscout configured?
        writeFileSync("ns", {nsconfigured: evt.data.number}, "json");
        nightScout(evt.data.number);
        break;
        
    case "graphdata":
        BG = evt.data.data;
        if (showingGraph) {
            updateGraph(BG);
        }
        break;
    case "gradient":
        myClock.setGradColor(evt.data.value);
        break;
    case "hour":
        myClock.setHourColor(evt.data.value);
        break;
    case "minute":
        myClock.setMinColor(evt.data.value);
        break;
    case "second":
        myClock.setSecColor(evt.data.value);
        break;
    case "iobcob":
        IOB = evt.data.iob;
        COB = evt.data.cob;
        graphIOB.text = `${IOB}`;
        graphCOB.text = `${COB}`;
        break;
    }

    // Received some type of message from companion - so comm is working
    try {
        unlinkSync("forceExit"); // note that comm is now working
    } catch (err) {}
}

/*
 * Timer screen - done at comet reset, if configured
 */
let timerWindow = document.getElementById("timerWindow");
let timer = timerWindow.getElementById("timer");
let timerHandle = 0;
let timerCountdown = 0;

// Callback for our special timer screen (at comet reset time, if configured)
function timerCallback() {
    console.log(`TimerCallback here countdown is ${timerCountdown}`);
    

    let min = Math.floor(timerCountdown / 60);
    let sec = timerCountdown - (min * 60);
    timer.text = `${util.zeroPad(min)}:${util.zeroPad(sec)}`;

    if (--timerCountdown < 0) {
        timerCountdown = 0;
        clearInterval(timerHandle);
        timerWindow.style.display = "none";
        //        timer.style.display = "none";
        //        noteBG.style.display = "none";
        console.log("timer end");
        vibration.start("nudge-max");
    } else if (timerCountdown < 5) {
        console.log("timer last values");
        vibration.start("bump");
    }
    display.poke(); // this is correct for the watch - not for the simulator
}



function startTimer(value) {
    console.log(`starting timer with value ${value}`);
    
    timerWindow.style.display = "inline";
    //    noteBG.style.display = "inline";
    //    timer.style.display = "inline";

    timerCountdown = value * 60; // minutes
    timerHandle = setInterval(timerCallback, 1000);
}

/*
 * Comm channel is up - let's get started!
 */
messaging.peerSocket.onopen = evt => {
    console.log("Watch is ready");
    if (nsConfigured) {
        wakeupFetch();
    }    
}


/*
 * BG High and Low warning messages, and associated screens
 */

let snoozeBGTimes = document.getElementById("snoozeBGTimes");
var bgs = [];
for (let i = 0; i < 8; i++) {
    bgs[i] = snoozeBGTimes.getElementById(i.toString());
}
let BGTimeout = 0;
let BGLowSnooze = 0;
let BGHighSnooze = 0;
let BGUrgentLowSnooze = 0;
let BGUrgentHighSnooze = 0;
let BGgraphButton = document.getElementById("BGgraph");
let suppressButton = document.getElementById("suppress");

function writeLimitsInfo() {
    writeFileSync("BGLimits", {
        BGUrgentLow: BGUrgentLow,
        BGLow: BGLow,
        BGHigh: BGHigh,
        BGUrgentHigh: BGUrgentHigh,
        lowSnooze: BGLowSnooze,
        highSnooze: BGHighSnooze,
        urgentLowSnooze: BGUrgentLowSnooze,
        urgentHighSnooze: BGUrgentHighSnooze,
        BGDiff: BGDiff
    }, "json");
}


function BGSnooze(period) {
    console.log(`BG Snooze for ${period} minutes`);
    

    // Return to normal screen
    snoozeBGTimes.style.display = "none";

    let now = new Date();

    if (BGUrgentLow > 0 && bgValue < BGUrgentLow) {
        BGUrgentLowSnooze = now.getTime() + period * (60 * 1000);
    } else if (BGUrgentHigh > 0 && bgValue > BGUrgentHigh) {
        BGUrgentHighSnooze = now.getTime() + period * (60 * 1000);
    } else if (BGHigh > 0 && bgValue > BGHigh) {
        BGHighSnooze = now.getTime() + period * (60 * 1000); // snooze in ms
    } else if (BGLow > 0 && bgValue < BGLow) {
        BGLowSnooze = now.getTime() + period * (60 * 1000);
    }
    writeLimitsInfo();
}


function dismissBG() {

    noteMess.style.display = "none";
    noteMess.style.fill = "black";
    noteBG.style.display = "none";
    noteTime.style.display = "none";
    suppressButton.style.display = "none";
    BGgraphButton.style.display = "none";

    vibration.stop();
    clearTimeout(BGTimeout);

    // Do we have a current alarm message?
    runAlarmNow(2); // in case an alarm happened in the meantime
}


// Invoked when the "Snooze" button is pressed for BG Limit screen
function snoozeBG() {
    console.log("Snooze BG");
    
    dismissBG();

    // Set the snooze time selections
    for (let i = 0; i < 8; i++) {
        bgs[i].getElementById("text").text = bgSnoozeTimes[i];
        bgs[i].onclick = function() {
            BGSnooze(bgSnoozeTimes[i])
        };
    }

    // Show the snooze time selection window
    snoozeBGTimes.style.display = "inline";
}



function warnBG() {

    if (bgValue == 0 || ((BGHigh == 0 || bgValue < BGHigh) && 
                         (BGUrgentHigh == 0 || bgValue < BGUrgentHigh) &&
                         (BGLow == 0 || bgValue > BGLow) &&
                         (BGUrgentLow == 0 || bgValue > BGUrgentLow))) return;
    if (snoozeBGTimes.style.display == "inline") return;

    let now = new Date();
    if (
        ((BGHigh > 0 && bgValue > BGHigh) && now.getTime() < BGHighSnooze) ||
            ((BGUrgentHigh > 0 && bgValue > BGUrgentHigh) && now.getTime() < BGUrgentHighSnooze) || 
            ((BGLow > 0 && bgValue < BGLow) && now.getTime() < BGLowSnooze) ||
            ((BGUrgentLow > 0 && bgValue < BGUrgentLow) && now.getTime() < BGUrgentLowSnooze)
    ) {
        return; // still snoozing...
    }

    try{
        noteBG.style.fill = bgRangeColor();
    } catch(err) {
        noteBG.style.fill = "white";
    }
    noteBG.style.display = "inline";
    dismissButton.style.display = "none"; // in case it's showing
    snoozeButton.style.display = "none";
    noteTime.text = `${now.getHours()}:${util.zeroPad(now.getMinutes())}`;
    noteTime.style.display = "inline";

    if (BGUrgentHigh > 0 && bgValue > BGUrgentHigh) {
        noteMess.text = `BG of ${bgValue} is higher than urgent high limit of ${BGUrgentHigh}`;
    } else
        if (BGHigh > 0 && bgValue > BGHigh) {
            noteMess.text = `BG of ${bgValue} is higher than high limit of ${BGHigh}`;
        } else
            if (BGUrgentLow > 0 && bgValue < BGUrgentLow) {
                noteMess.text = `BG of ${bgValue} is lower than urgent limit of ${BGUrgentLow}`;
            } else 
                if (BGLow > 0 && bgValue < BGLow) {
                    noteMess.text = `BG of ${bgValue} is lower than limit of ${BGLow}`;
                }
    noteMess.style.display = "inline";
    noteMess.style.fill = "black"; // Set the text to the appropriate color
    console.log("warnBG");
    vibration.start("nudge-max");
    display.poke();
    BGTimeout = setTimeout(warnBG, 10 * 1000); // That was nice!  Do it again!

    BGgraphButton.onactivate = BGshowGraph;
    BGgraphButton.style.fill = "black";
    BGgraphButton.style.display = "inline";
    suppressButton.style.fill = "black";
    suppressButton.style.display = "inline";
    suppressButton.onactivate = snoozeBG;
}


/*
 * Show graph screens and code
 */
let showingGraph = false;
function displayGraph() {
    
    showingGraph = true;
    if (BG.length >= 24) {
        myGraph.reset();
        updateGraph(BG);
    } else {
        myGraph.reset();
        // Gather some data for the graph
        console.log(`Getting graph data because we don't have enough - length=${BG.length}`);
        fetchCompanionData("graph");
    }
}

function BGshowGraph() {

    graphReturn = warnBG;
    graphWindow.style.display = "inline";

    displayGraph();
}

/*
 * Show an alarm message, and associated screens
 */
function showAlarm(num) {
    let now = new Date();

    currAlarm = num;
    noteBG.style.display = "inline";
    noteBG.style.fill = "white";
    noteTime.text = `${alarms[num].value.hour}:${alarms[num].value.minute}`;
    noteTime.style.display = "inline";
    dismissButton.style.fill = "black";
    dismissButton.style.display = "inline";
    snoozeButton.style.fill = "black";
    snoozeButton.style.display = "inline";

    dismissButton.onactivate = dismissText;
    snoozeButton.onactivate = snoozeActivate;

    if (typeof messages[num] == 'undefined' ||
        messages[num].value == "") {
        noteMess.text = "<no text>";
    } else {
        noteMess.text = messages[num].value;
    }
    noteMess.style.fill = "black";
    noteMess.style.display = "inline";

    // And a little nudge
    vibration.start("nudge-max");
    display.poke();
    currTimeout = setTimeout(alarmBuzz, 10 * 1000); // That was nice!  Do it again!

    writeFileSync("snooze", {
        number: currAlarm,
        timeout: now.getTime(),
        last: currAlarm
    }, "json");
}

// Simply buzz for an alarm again - if it's still on the screen
function alarmBuzz() {
    if (noteMess.style.display == "inline" &&
        currAlarm != -1) {
        vibration.start("nudge-max");
        display.poke();
        currTimeout = setTimeout(alarmBuzz, 10 * 1000); // That was nice!  Do it again!
    }
}

// Snooze an alarm
function resetAlarm(i) {
    let now = new Date();
    let then = new Date();

    then.setHours(alarms[i].value.hour, alarms[i].value.minute, 0);
    let diff = then.getTime() - now.getTime();
    diff += (util.Hour2ms(24)); // move to tomorrow
    console.log(`Resetting timeout in ${diff} ms`);
    
    timeouts[i] = setTimeout(onWakeup, diff);
    currSnooze = now.getTime() + diff;
}


// Our function handling wakeups for snoozing alarms
function onWakeup(handle) {
    console.log(`wakeup ********* `);
    console.log(`currAlarm=${currAlarm}, timeout handle is ${timeouts[currAlarm]}`);

    if (currAlarm >= 0 && timeouts[currAlarm] >= 0) {
        // Continue with current alarm
        showAlarm(currAlarm);
        return;
    }

    let now = new Date();
    for (let i = 0; i < alarms.length; i++) {
        if (alarms[i] && alarms[i].value.hour == now.getHours() &&
            alarms[i].value.minute == now.getMinutes()) {
            currAlarm = i;
            showAlarm(i);
            resetAlarm(i);
            return;
        }
    }
}

// Invoked when the Dismiss button is pressed
function dismissText() {
    console.log("Dismiss");
    
    noteMess.style.display = "none";
    noteBG.style.display = "none";
    noteTime.style.display = "none";
    dismissButton.style.display = "none";
    snoozeButton.style.display = "none";

    vibration.stop();
    clearTimeout(currTimeout);
    currSnooze = 0;
    lastAlarm = currAlarm; // so we can get it back again, if needed
    currAlarm = -1;

    writeFileSync("snooze", {
        number: currAlarm,
        timeout: 0,
        last: lastAlarm
    }, "json");

    // remove any saved snooze file
    //    try {
    //        unlinkSync("snooze");
    //    } catch (err) {}
}

function selectSnooze(index) {
    console.log(`selected ${index}`);
    
    let snoozeTime = index;

    console.log(`resetting alarm for snooze of ${snoozeTime} mins`);
    
    let now = new Date();
    currSnooze = now.getTime() + util.Min2ms(snoozeTime);
    currTimeout = setTimeout(onWakeup, util.Min2ms(snoozeTime));
    console.log(`curr Timeout Handle = ${timeouts[currAlarm]}`);
    
    console.log(`currAlarm=${currAlarm}`);
    lastAlarm = currAlarm;
    
    writeFileSync("snooze", {
        number: currAlarm,
        timeout: currSnooze,
        last: lastAlarm
    }, "json");
    snoozeTimes.style.display = "none";
}

let snoozeTimes = document.getElementById("snoozeTimes");
var sts = [];
for (let i = 0; i < 8; i++) {
    sts[i] = snoozeTimes.getElementById(i.toString());
}

// Invoked when the "Snooze" button is pressed
function snoozeActivate() {
    snoozeText("BG");
}
function snoozeText(type) {
    console.log("Snooze");

    switch (type) {
    case "BG":
        clearTimeout(currTimeout); // clear current re-buzz/snooze
        currSnooze = -1;
        vibration.stop();

        noteMess.style.display = "none";
        noteBG.style.display = "none";
        noteTime.style.display = "none";
        dismissButton.style.display = "none";
        snoozeButton.style.display = "none";
        break;

    case "comm":
        menuWindow1.style.display = "none";
        break;
    }
    
    // Set the snooze time selections
    for (let i = 0; i < 8; i++) {
        sts[i].getElementById("text").text = alarmSnoozeTimes[i];
        //        console.log(`alarmsnoozetimes[$i}] = ${alarmSnoozeTimes[i]}`);
        
        switch (type) {
        case "BG":
            sts[i].onclick = function() {
                selectSnooze(alarmSnoozeTimes[i])
            };
            break;
        case "comm":
            sts[i].onclick = function() {
                commSnooze(alarmSnoozeTimes[i])
            };
            break;
        }
    }

    // Show the snooze times selection screen
    snoozeTimes.style.display = "inline";
}


let commSnoozeEnd = 0;
function commSnooze(time) {
    now = new Date();
    
    console.log(`commSnooze time is ${time}`);
    commSnoozeEnd = now.getTime() + (util.Min2ms(time));
    let d = new Date(commSnoozeEnd);
    console.log(`ending comm snooze at ${d}`);

    writeFileSync("commsnooze", {
        time: commSnoozeEnd
    }, "json");

    snoozeTimes.style.display = "none";
    console.log(`lastalarm=${lastAlarm}`);
}


// Deal with updates to configuration
function setAlarm(num, time) {
    console.log(`setting alarm ${num} to ${time}`);

    // Clear anything there already
    if (timeouts[num]) {
        clearTimeout(timeouts[num]);
        if (currAlarm == num) {
            clearTimeout(currTimeout);
            currSnooze = 0;
            currAlarm = -1; // no current alarm any more
        }
    }

    // If we have nothing new to add - we're done
    if (typeof time != 'undefined' && time != "" && !isNaN(parseInt(time))) {

        let tokens = time.split(":");
        alarms[num] = {
            name: "alarm" + num.toString(),
            value: {
                hour: tokens[0],
                minute: tokens[1]
            }
        };
        console.log(`alarm value is ${alarms[num].value.hour}:${alarms[num].value.minute}`);

        let now = new Date();
        let then = new Date();
        then.setHours(tokens[0], tokens[1], 0);
        let diff = then.getTime() - now.getTime();
        if (diff < 0) { // Make it for tomorrow instead
            diff += util.Hour2ms(24);
            console.log("Setting alarm for tomorrow");
        }

        console.log(`setting alarm to ${diff} ms`);
        timeouts[num] = setTimeout(onWakeup, diff);
        currSnooze = now.getTime() + diff;
    } else {
        console.log(`clearing alarm num ${num}`);
        try {
            unlinkSync("note" + num);
        } catch(err) {};
        return;
    }

    if (typeof messages[num] == 'undefined' ||
        messages[num].value == "") {
        setMessage(num, ""); // Make sure it's *something*
    } else {
        writeFileSync("note" + num, {
            time: alarms[num],
            message: messages[num]
        }, "json");
    }
}

function setMessage(num, mess) {
    console.log(`setting message ${num} to ${mess}`);
    
    messages[num] = {
        name: "message" + num.toString(),
        value: mess
    };

    writeFileSync("note" + num, {
        time: alarms[num],
        message: messages[num]
    }, "json");
}


// Read in the last podchange time - if it's there
let m = new ArrayBuffer(50);
console.log(`trying to read podchange info`);

try {
    m = readFileSync("podchange", "json");
    console.log(`podchange = ${m.podchange}`);
    
    setPodchange(m.podchange);
    cometDays = m.period;
    cometHours = m.before;
} catch (err) {
    console.log(`no podchange info - asking companion`)
    
    // See if we can get it from the companion
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        // Send a command to the companion
        messaging.peerSocket.send({
            command: "podchange"
        });
    }  
}

// Read BG high and low snooze times
let BGLowSnooze = 0;
let BGHighSnooze = 0;
let BGUrgentLowSnooze = 0;
let BGUrgentHighSnooze = 0;
try {
    m = readFileSync("BGLimits", "json");
    BGUrgentLow = m.BGUrgentLow;
    BGLow = m.BGLow,
    BGHigh = m.BGHigh,
    BGUrgentHigh = m.BGUrgentHigh;
    BGLowSnooze = m.lowSnooze;
    BGHighSnooze = m.highSnooze;
    BGUrgentLowSnooze = m.urgentLowSnooze;
    BGUrgentHighSnooze = m.urgentHighSnooze;
    BGDiff = m.BGDiff;
} catch (err) {
    BGLowSnooze = 0;
    BGHighSnooze = 0;
    BGUrgentLowSnooze = 0;
    BGUrgentHighSnooze = 0;
    BGUrgentLow = 0;
    BGLow = 0;
    BGHigh = 0;
    BGUrgentHigh = 0;
    BGDiff = 0;
}


// Read in initial note times and messages
for (let i = 0; i < 10; i++) {
    let m = new ArrayBuffer(200);
    let now = new Date();

    try {
        m = readFileSync("note" + i, "json");
        console.log(`read note ${i}, m=${m}`);
        
        let mess = "";
        if (typeof m.message == 'undefined' || typeof m.message.value == 'undefined') {
            console.log("setting message to null");
            mess = "";
        } else {
            console.log("setting message to something");
            mess = m.message.value;
        }
        
        if (m && !isNaN(m.time.value.hour) && !isNaN(m.time.value.minute)) {
            console.log(`i=${i}: m=${m.time.value.hour}:${m.time.value.minute} , ${mess}`);

            alarms[i] = m.time;
            messages[i] = {value: mess};

            let then = new Date();
            then.setHours(m.time.value.hour, m.time.value.minute, 0);
            let diff = then.getTime() - now.getTime();
            if (diff < 0) { // Make it for tomorrow instead
                diff += util.Hour2ms(24);
            }
            console.log(`Setting timeout in ${diff} ms`);
            
            timeouts[i] = setTimeout(onWakeup, diff);
            currSnooze = now.getTime() + diff;
        }
    } catch (err) {}
}



/*
 * Display a graph - Detailed display of BG data
 */
let graphWindow = document.getElementById("graphWindow");
let docGraph = graphWindow.getElementById("docGraph");
var myGraph = new Graph(docGraph);
let graphMin = graphWindow.getElementById("graphMin");
let graphMax = graphWindow.getElementById("graphMax");
let graphStart = graphWindow.getElementById("graphStart");
let graphEnd = graphWindow.getElementById("graphEnd");
let graphMinAt = graphWindow.getElementById("graphMinAt");
let graphMaxAt = graphWindow.getElementById("graphMaxAt");
let graphStartAt = graphWindow.getElementById("graphStartAt");
let graphEndAt = graphWindow.getElementById("graphEndAt");
let graphIOB = graphWindow.getElementById("graphIOB");
let graphCOB = graphWindow.getElementById("graphCOB");

let graphDismiss = graphWindow.getElementById("GraphDismiss");
let graphReturn = 0; // what todo after display of the graph

graphDismiss.onclick = dismissGraph;

function dismissGraph() {

    showingGraph = false;
    graphWindow.style.display = "none";
    if (graphReturn) graphReturn();
}

sgv.onclick = function(e) {
    console.log("click on sgv");
    
    graphWindow.style.display = "inline";
    graphReturn = 0;
    myGraph.setHigh = BGHigh;
    myGraph.setLow = BGLow;

    displayGraph();
}

// Event occurs when new file(s) are received
inbox.onnewfile = () => {
    let fileName;
    do {
        // If there is a file, move it from staging into the application folder
        fileName = inbox.nextFile();
        if (fileName) {
            console.log(`Got info: ${fileName}`);
            
            readSGVFile(fileName);
        }
    } while (fileName);
};


function readSGVFile(fileName) {

    BG = readFileSync(fileName, 'cbor');

    if (showingGraph) {
        updateGraph(BG);
    }
}

function updateGraph(data) {

    let min = 500;
    let max = 0;
    var minAt;
    var maxAt;

    for (let i = 0; i < data.length; i++) {
        //    values[i] = {sgv: Math.log(data[i].sgv)};
        //    if (values[i].sgv < min) min = values[i].sgv;
        //    if (values[i].sgv > max) max = values[i].sgv;
        if (data[i].sgv < min) {
            min = data[i].sgv;
            minAt = data[i].date;
        }
        if (data[i].sgv > max) {
            max = data[i].sgv;
            maxAt = data[i].date;
        }
    }
    min--;
    max++;
    console.log(`min=${min} max=${max}`);
    

    // Set start time
    graphStart.text = hourMin(data[data.length - 1].date);
    graphEnd.text = hourMin(data[0].date);
    //  min -= Math.floor(min/10);
    //  max += Math.floor(max/10);
    graphMin.text = `${min}`;
    graphMax.text = `${max}`;
    graphMinAt.text = `${hourMin(minAt)}`;
    graphMaxAt.text = `${hourMin(maxAt)}`;
    graphStartAt.text = `Start: ${data[data.length-1].sgv}`;
    graphEndAt.text = `End: ${data[0].sgv}`;
    graphIOB.text = `--`;
    graphCOB.text = `--`;

    fetchCompanionData("iobcob"); // get new info

    // Set the graph scale
    myGraph.setYRange(min, max);
    myGraph.setUrgentLowLimit(BGUrgentLow);
    myGraph.setLowLimit(BGLow);
    myGraph.setHighLimit(BGHigh);
    myGraph.setUrgentHighLimit(BGUrgentHigh);
    myGraph.setBGColor("black");
    myGraph.setUrgentLowColor(urgentLowColor);
    myGraph.setLowColor(lowColor);
    myGraph.setUrgentHighColor(urgentHighColor);
    myGraph.setHighColor(highColor);
    myGraph.setInRangeColor(inRangeColor);

    // Update the graph
    myGraph.update(data);
}


function hourMin(ms) {
    let d = new Date(ms);

    return (`${d.getHours()}:${util.zeroPad(d.getMinutes())}`);
}

// Run the currAlarm ASAP
function runAlarmNow(secs) {
    let now = new Date();

    if (currAlarm != -1) {
        // Make sure we reinvoke this alarm in the short future
        if ((currSnooze - now.getTime()) <= secs*1000) {
            currSnooze = now.getTime() + (secs*1000);
        }
        timeouts[currAlarm] = setTimeout(onWakeup, currSnooze - now.getTime());
    }
}


/*
 * Menu code
 */
let menu = document.getElementById("menu");
let menuButton = menu.getElementById("menuButton");
menuButton.onclick = function () {
    console.log("MENU!");
    
    menuWindow1.style.display = "inline";
}

let menuWindow1 = document.getElementById("menuWindow1");
let menu1more = menuWindow1.getElementById("more");
let menu1exit = menuWindow1.getElementById("exit");

var menu1 = [];
let menuItemClass = menuWindow1.getElementsByClassName("menuItem");
for (let i = 0; i < menuItemClass.length ; i++) {
    menu1[i] = menuWindow1.getElementById(i.toString());
    menu1[i].onclick = function () {
        menu1click(menu1[i].text);
    };
}

function menu1click(string) {

    console.log(`string is ${string} lastalarm=${lastAlarm}`);
    switch (string) {
    case "Redo last alarm":
        if (lastAlarm >= 0) {
            currAlarm = lastAlarm;
            console.log(`Redo alarm ${lastAlarm}`);
            timeouts[currAlarm] = 0;
            currSnooze = 0;
            runAlarmNow(1);
        }
        menuWindow1.style.display = "none";
        break;

    case "Snooze Comm Warnings":
        snoozeText("comm");
        break;

    case "Current Suppressions":
        suppressionsText();
        break;
        
    case "Cancel Suppressions":
        cancelSuppressions();
        break;
        
    default:
        menuWindow1.style.display = "none";
    }
}
if (menu1more != null) {
    menu1more.onclick = function () {
        console.log("more1");
        menuWindow2.style.display = "inline";
    }
}
menu1exit.onclick = menuExit;


/*
 * Second page of menu items
 */
let menuWindow2 = document.getElementById("menuWindow2");
let menu2more = menuWindow2.getElementById("more");
let menu2exit = menuWindow2.getElementById("exit");

var menu2 = [];
let menuItemClass = menuWindow2.getElementsByClassName("menuItem");
for (let i = 0; i < menuItemClass.length ; i++) {
    menu2[i] = menuWindow2.getElementById(i.toString());
    menu2[i].onclick = function () {
        menu2click(menu2[i].text);
    };
}

function menu2click(string) {
    switch (string) {
    case "Current Suppressions":
        suppressionsText();
        break;
        
    case "Cancel Suppressions":
        cancelSuppressions();
        break;
        
    default:
        menuWindow2.style.display = "none";
    }
}

if (menu2more != null) {
    menu2more.onclick = function () {
        console.log("more2");
    }
}
menu2exit.onclick = menuExit;

function menuExit() {
    console.log("exit menu");
    noteBG.style.display = "none";
    noteMess.style.display = "none";
    menuWindow2.style.display = "none";
    menuWindow1.style.display = "none";
    noticeDismiss.style.display = "none";
}

let noticeDismiss = document.getElementById("noticeDismiss");

/*
 * Menu item routines
 */
function suppressionsText() {
    //  <rect id="noteBG" x="0" y="0" width="100%" height="100%" fill="white" display="none"/>
    //  <text id="noteTime" text-anchor="middle" x="50%" y="25"  display="none">88:88</text>
    //  <textarea id="noteMess" text-anchor="start" x="10" y="20%" width="100%-10" text-length="200"  font-size="40" display="none"/>
    //  <use id="dismiss" href="#square-button" y="72%" width="50%" fill="fb-red"  display="none">
    console.log("Suppressions Text");
    let didSome = false;
    let now = new Date();

    noteMess.text = "";
    let highBGSuppress = BGHighSnooze - now.getTime();
    if (BGHighSnooze && highBGSuppress > 0) {
        noteMess.text = `High BG: ${Math.floor(highBGSuppress / (60*1000))} mins`;
        didSome = true;
    }

    let lowBGSuppress = BGLowSnooze - now.getTime();
    if (BGLowSnooze && lowBGSuppress > 0) {
        if (noteMess.text != "") {
            noteMesa.text += "\n";
        }
        noteMess.text = `Low BG: ${Math.floor(lowBGSuppress / (60*1000))} mins`;
        didSome = true;
    }

    let urgentLowBGSuppress = BGUrgentLowSnooze - now.getTime();
    if (BGUrgentLowSnooze && lowUrgentBGSuppress > 0) {
        if (noteMess.text != "") {
            noteMesa.text += "\n";
        }
        noteMess.text = `Low BG: ${Math.floor(urgentLowBGSuppress / (60*1000))} mins`;
        didSome = true;
    }

    let urgentHighBGSuppress = BGUrgentHighSnooze - now.getTime();
    if (BGUrgentHighSnooze && urgentHighGSuppress > 0) {
        if (noteMess.text != "") {
            noteMesa.text += "\n";
        }
        noteMess.text = `Low BG: ${Math.floor(urgentHighBGSuppress / (60*1000))} mins`;
        didSome = true;
    }

    if (commSnoozeEnd > now.getTime()) {
        if (noteMess.text != "") {
            noteMess.text += "\n";
        }
        noteMess.text += `Comm: ${Math.floor((commSnoozeEnd-now.getTime())/(60*1000))} mins`;
        didSome = true;
    }

    // Check for Alarm snoozes
    if (currAlarm >= 0 && currTimeout) {
        if (noteMess.text != "") {
            noteMess.text += "\n";
        }
        console.log(`currSnooze=${currSnooze}, currAlarm=${currAlarm}`);
        noteMess.text += `Alarm ${currAlarm+1}: ${Math.floor((currSnooze-now.getTime())/(60*1000))} mins`;
        didSome = true;
    }
    
    if (!didSome) {
        noteMess.text = "No current suppressions";
    }

    menuWindow2.style.display = "none";
    menuWindow1.style.display = "none";

    noteBG.style.display = "inline";
    noteMess.style.display = "inline";
    noticeDismiss.style.display = "inline";
    noticeDismiss.onclick = menuExit;
}


function cancelSuppressions() {
    BGHighSnooze = 0;
    BGLowSnooze = 0;
    BGUrgentHighSnooze = 0;
    BGUrgentLowSnooze = 0;
    commSnoozeEnd = 0;

    menuExit();
}

let list = document.getElementById("menu-list");
//let items = list.getElementsByClassName("tile-list-item");

/*
  items.forEach((element, index) => {
  let touch = element.getElementById("touch-me");
  touch.onclick = (evt) => {
  console.log(`touched: ${index} > ${element.text}`);
  switch (element.text) {
  case "Save":
  console.log("Save");
  break;
  }
  menuWindow.style.display = "none";
  }
  });
*/


/*
 * Initialization code
 */

// Read in any snooze time which was previously running and restart it
try {
    let now = new Date();
    m = readFileSync("snooze", "json");
    console.log(`reading snooze data: ${m.timeout-now.getTime()} ms`);
    
    currAlarm = m.number;
    let timeout = m.timeout;
    if (currAlarm != -1) {
        if (timeout > now.getTime()) {
            // Make sure we reinvoke this alarm in the short future
            if ((timeout - now.getTime()) <= 5000) {
                timeout = now.getTime() + 5000;
            }
            timeouts[currAlarm] = setTimeout(onWakeup, timeout - now.getTime());
            currSnooze = timeout;
            console.log(`Reestablishing snooze for ${currAlarm} in ${timeout-now.getTime()} ms`)
        } else {
            // We were currently snoozing when we exited
            console.log(`Were snoozing when we exited - rescheduling for now`);
            currSnooze = timeout;
            runAlarmNow(2);
        }
    }
    lastAlarm = m.last;
} catch (err) {}


let m = new ArrayBuffer(50);

let alarmSnoozeTimes = [10, 20, 30, 40, 50, 60, 90, 120];
try {
    m = readFileSync("alarmSnooze", "json");
    for (let i = 0; i < 8; i++) {
        if (m[i]) {
            alarmSnoozeTimes[i] = m[i];
            //            console.log(`alarmSnoozeTimes[${i}] = ${m[i]}`);
        }
    }
} catch (err) {}

let bgSnoozeTimes = [20, 40, 60, 90, 120, 180, 240, 480];
try {
    m = readFileSync("BGSnooze", "json");
    for (let i = 0; i < 8; i++) {
        if (m[i]) {
            bgSnoozeTimes[i] = m[i];
            //            console.log(`bgSnoozeTimes[${i}] = ${m[i]}`);
        }
    }
} catch (err) {};

try {
    let now = new Date();
    let warnStart = readFileSync("warn-start", "json");
    warnSuppressStart.hours = parseInt(warnStart.hours);
    warnSuppressStart.minutes = parseInt(warnStart.minutes);
    warnSuppressStart.defined = true;
    console.log(`Warn-start: ${warnSuppressStart.hours}:${warnSuppressStart.minutes}`);
} catch (err) {
    warnSuppressStart = {defined: false};
}

try {
    let now = new Date();
    let warnEnd = readFileSync("warn-end", "json");
    warnSuppressEnd.hours = parseInt(warnEnd.hours);
    warnSuppressEnd.minutes = parseInt(warnEnd.minutes);
    warnSuppressEnd.defined = true;
    console.log(`Warn-end: ${warnSuppressEnd.hours}:${warnSuppressEnd.minutes}`);
} catch (err) {
    warnSuppressEnd = {defined: false};
}

try {
    let t = readFileSync("commsnooze", "json");
    if (t) {
        commSnoozeEnd = parseInt(t.time);
        console.log(`commSnoozeEnd=${commSnoozeEnd}`);
    }
} catch (err) {};


// See if Nightscout is configured or not
try {
    m = readFileSync("ns", "json");
    nsConfigured = m.nsconfigured;
} catch(err) {
    nsConfigured = false;
};

if (nsConfigured) {
    // Make sure we at least *try* getting data, even if all else fails
    setTimeout(wakeupFetch, util.Min2ms(1));
}

console.log(`max. message size is ${messaging.peerSocket.MAX_MESSAGE_SIZE}`);

