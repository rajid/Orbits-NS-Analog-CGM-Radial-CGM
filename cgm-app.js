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

//let dashes=[5,50,5, 300, 5,100,5, 300, 5,100,5];
let dashes=[5, 300, 5, 300, 5];

/*
 * Remove all console messages for production code

 var console = {};
 console.log = function(){};
*/

//let alertColor = "green"; // normal

memory.monitor.onmemorypressurechange = function(evt) {
    //console.log(`Pressure = ${memory.monitor.pressure} ${memory.js.used} / ${memory.js.total}`);
    state.x = screenWidth - 15;
    state.y = 15;
    switch(memory.monitor.pressure){
    case "normal":
        state.r = 10;
        break;
    case "high":
        state.r = 10;
        break;
    case "critical":
        //console.log("critical");
        state.r = 20;
        state.cx = screenWidth - 25;
        state.cy = 25;
        break;
    }
}


function bgValue() {
    if (bgUnits === 'mmol/L') {
        return(util.oneDecimal(util.mmol(bgVal)));
    } else {
        return(bgVal);
    }
}

function bgCorrectValue(bg) {
    if (bgUnits === 'mmol/L') {
        return(util.mmol(bg));
    } else {
        return(bg);
    }
}

function bgStandardUnits(bg) {
    if (bgUnits === 'mmol/L') {
        return(util.mgdl(bg));
    } else {
        return(bg);
    }
}

let noteBG = document.getElementById("noteBG");
let noteMess = document.getElementById("noteMess");
let noteTime = document.getElementById("noteTime");
//var messTimeout;
let dismissButton = document.getElementById("dismiss");
let snoozeButton = document.getElementById("snooze");

var alarms = [];
var messages = [];
var regTimeouts = [];
var snoozes = [];
var snoozeTimeouts = [];
let currAlarm = -1; // current Alarm being displayed
//let currSnooze = 0; // actual time when snooze will expire
//let currTimeout = 0; // snooze/re-buzz assoc. w/ current alarm
let buzzTimeout = 0; // snooze/re-buzz assoc. w/ current alarm
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
let sgvbutton = document.getElementById("sgvbutton");
//let update = document.getElementById("update");
let state = document.getElementById("state");
let forceUpdate = document.getElementById("forceUpdate");

let cornerTime = 0; // init
let cornerTimeInit = 5; // time to display numbers in corners

/*
 * Display a graph - Detailed display of BG data
 */
var myGraph;
var docGraph;
var graphWindow;
var graphIOB;
var graphCOB;

var graphDismiss;
var graphReturn;

/*
// Only used in Radial CGM
var arcIn;
var arcAbove;
var arcBelow;
var timeAbove;
var timeIn;
var timeBelow;
*/

//console.log(`appname is ${myClock.appName()}`);
let rad = (myClock.appName() == "radialcgm") ? 1 : 0;
try {
    graphWindow = document.getElementById("graphWindow");
    graphIOB = graphWindow.getElementById("graphIOB");
    graphCOB = graphWindow.getElementById("graphCOB");
    
    graphDismiss = graphWindow.getElementById("GraphDismiss");
    graphReturn = 0; // what todo after display of the graph
    
    graphDismiss.onclick = dismissGraph;
    
    if (rad) {
        docGraph = document.getElementById("docGraph");
    } else {
        docGraph = graphWindow.getElementById("docGraph");
    }
    myGraph = new Graph(docGraph);
}catch(e){}


forceUpdate.onclick = function() {
    if (nsConfigured) {
        wakeupFetch();
    }
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

    if (display.on && nsConfigured && (bgNext < now.getTime())) {
        wakeupFetch();
    }
}
display.addEventListener("change", displayChange);



let nsConfigured = false;
var BG = [];
let bgUnits = "bg/dl"; // default
let bgVal = 0;
let bgDate = 0;
let bgPeriod = 0;
let bgNext = 0;
let bgDelta = 0;
let bgLast = 0;
let IOB = 0;
let COB = 0;
let bgFont1 = 40; // init.
let calibration = false; // signals the latest values were due to calibration
let BGUrgentLow = 0;
let BGLow = 0;
let BGHigh = 0;
let BGUrgentHigh = 0;
let onlyUrgent = false; // get ALL warnings
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
        (BGDiff > 0 && Math.abs(bgCorrectValue(bgDelta)) >= BGDiff)) {
        arrow.style.fill = "red";
    } else if (longTimeAlert) {
        arrow.style.fill = "yellow";
    } else {
        arrow.style.fill = "lightgreen";
    }
}

function bgHigher(v) {
    if (v > 0 && bgValue() > v) return true;
    else return false;
}
    
function bgLower(v) {
    if (v > 0 && bgValue() < v) return true;
    else return false;
}


const rangeHighest = screenHeight * 1.0;
const rangeLowest = screenHeight * 0.55;

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
        sgv.text = `${bgValue()}`;
        sgv.style.fontSize = bgFont1;
        sgv.style.fill = myGraph.setColor(bgValue());

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
            bgValue() > 0 && opacity == 0) {
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
//    console.log(`JS memory: ${(memory.js.used / memory.js.total)*100}`);
}


/*
 * Determine if "now" is within the range of times (start, end)
 * even if "start" is after "end" and thus loops to the next day.
 */
function inRange(start, end, now) {

    if (!start.def || !end.def) {
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
    
    if (now == 0 || (!inRange(warnSuppressStart, warnSuppressEnd, now) &&
                     (commSnoozeEnd == 0 || commSnoozeEnd < now.getTime()))) {
        //console.log(`**** Not in Range`);
        //vibration.start("nudge-max"); // get some attention
        vibPattern(dashes);
        display.poke();
    }
}

// Try to fix a comm/peerSocket communication error by exiting
// and having the OS restart us automatically
function fixComm(now) {
    var exited;
    //console.log("Looking for forceExit file");
    try {
        let s = statSync("forceExit");
        exited = true;
    } catch (err) {
        exited = false;
    }
    //console.log(`Found exited to be set as ${exited}`);
    if (!exited) {
        // give up, exit, and get restarted
        writeFileSync("forceExit", { // log that we force exited
            time: now  // This file is removed once comm works
        }, "json");
        let s = statSync("forceExit");
        //console.log(`forceexit file info ${s}`);
        watch.exit(); // Bye!
    } else {
        vibNudge(now);
    }
}

let lastFetch = 0; // time when last fetch was tried
let failedFetches = -1; // number of failed fetches - neg num's are indeterminate
// Period during which we shouldn't worry about connection issues
// Ultimately, I'd like to have this simply be "during sleep".
let warnSuppressStart = {def: false};
let warnSuppressEnd = {def: false};
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
    //console.log("click");
    
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
    //console.log(`New comet time of ${cometTime}`);
    
    cometHour = cometTime.getHours();
    cometMinute = cometTime.getMinutes();
}

// Haven't seen an "ack" to our last request - do it again
let ackHandle = 0;
function wakeupAck() {
    clearTimeout(ackHandle);
    //console.log("fetching again due to no ack");
    
    wakeupFetch();
}

/*
 * Primary routine called from a setTimeout, performing the fetch and doing retries
 */
function wakeupFetch() {

    if (!nsConfigured) return;
    
    //console.log("Wakeup and fetch data");
    

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
    let now = new Date();

    if ((bgHigher(BGHigh) && now.getTime() >= BGHighSnooze)||
        (bgLower(BGLow) && now.getTime() >= BGLowSnooze) ||
        (bgHigher(BGUrgentHigh) && now.getTime() >= BGUrgentHighSnooze) ||
        (bgLower(BGUrgentLow) && now.getTime() >= BGUrgentLowSnooze)) {
        return (warnBG());
    } else {
//        dismissBG();
        if (BGgraphButton.style.display == "inline") {
            dismissBG();
        }
        if (snoozeBGTimes.style.display == "inline") {
            snoozeBGTimes.style.display = "none";
        }
//        if (graphWindow.style.display == "inline" && graphReturn == warnBG) {
//            dismissGraph();
//        }
        return 0;
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
    for (i = 0 ; i < BG.length && (now.getTime() - BG[i].d) < longTime ; i++) {
        if (BG.cal) return; // abort if we cross a calibrarion
    }
    if (--i <= 0) return;

    try {
        let t = new Date(BG[i].d);
        if (Math.abs(bgValue() - bgCorrectValue(BG[i].s)) > longDiff) {
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
            //console.log("ns switching from false to true");
            nsConfigured = true;
            wakeupFetch();
        }
        forceUpdate.style.display = "inline";
        state.style.display = "inline";
    } else {
        nsConfigured = false;
        arrow.style.display = "none";
        sgv.style.display = "none";
        state.style.display = "none";
        forceUpdate.style.display = "none";
        circle.style.display = "none";
    }
    //console.log(`nsConfigured = ${nsConfigured}`);
    
}

/*
 * Reset any snoozes if we're no longer in that range
 */
function resetSnoozes() {

    if (bgHigher(BGUrgentLow+5)) BGUrgentLowSnooze = 0;
    if (bgHigher(BGLow+5)) BGLowSnooze = 0;
    if (bgLower(BGUrgentHigh-5)) BGUrgentHighSnooze = 0;
    if (bgLower(BGHigh-5)) BGHighSnooze = 0;
}

/*
 * Receive messages
 */
//let savedLastBG = 1;
var lastWasCalibrarion;
messaging.peerSocket.onmessage = evt => {
    let now = new Date();

    //console.log("message for you, sir! " + evt.data.key);

    switch (evt.data.key) {
    case "bg":
        failedFetches = 0; // Ok!  We have communication!            
        //console.log(`bgVal=${evt.data.bg}`);
        //console.log(`bgDate=${evt.data.date}`);
        //console.log(`bgPeriod=${evt.data.period}`);
        //console.log(`bgDelta=${evt.data.delta}`);
        //console.log(`nextUpdate=${(evt.data.update - now.getTime())/60000} mins`);
        //console.log(`calibration=${evt.data.cal}`);

        let x = now.getTime() - evt.data.date;
        //console.log(`bgAge = ${x} = ${x/(60*1000)} mins`);

        if (evt.data.bg > 0) {
            bgVal = evt.data.bg;
            bgDate = evt.data.date;
            bgPeriod = evt.data.period;
            bgDelta = evt.data.delta;
            calibration = evt.data.cal;

            let bginterval=(5*60*1000);
            var savebg;
            if (rad) bginterval=(10*60*1000);
            try{
                if (bgDate - BG[0].d >= bginterval)
                    savebg=1;
                else
                    savebg=0;
            }catch(e){savebg=1;}

            // buzz if we're only seeing old data
            if ((now.getTime() - bgDate) >= util.Min2ms(20) && 
                (BGLow || BGHigh || BGUrgentLow || BGUrgentHigh)) {
                vibNudge(now);
            } else {
                resetSnoozes();
                if (!testLimits() && bgVal <= 40) {
//                    warnBG();
                    vibNudge(0); // always!
                }
                if (savebg == 1) {
                    if (rad) {
                        BG.unshift({s: bgVal, d:bgDate});
                        //console.log(`Adding BG at beginning`);
                        myGraph.updateRgraph(BG, screenHeight, screenWidth);
                    } else {
                        BG.unshift({
                            s: bgVal,
                            d: bgDate,
                            c: calibration
                        });
                    }
                }
                //console.log(`BG length = ${BG.length}`);
                while (BG.length > 0 &&
                       (BG.length > myGraph.maxBGs() ||
                        BG[BG.length-1].d < (now.getTime() - (11*60*60*1000)))) {
                    let b = BG.pop();
                    let d = new Date(b.d);
                    //console.log(`Removed bg at ${d.toTimeString()}`);
                }
            }
        }
        if (evt.data.update > 0) {
            bgNext = evt.data.update;
            //                if (BGLow || BGHigh) {
            // If we have low or high limits, then make sure we gather data
            // at regular intervals
            //console.log(`Setting wakeup for ${bgNext-now.getTime()} ms`);
            
            let d = new Date(bgNext);
            //console.log(`at: ${d}`);
            
            if (fetchHandle) {
                clearTimeout(fetchHandle);
            }
            fetchHandle = setTimeout(wakeupFetch, bgNext - now.getTime());
            bgLast = now.getTime();
        }
        if (isNaN(bgDelta)) {
            bgDelta = 0;
        }

        if (calibration) {
            //console.log("calibration");
            //                vibration.start("nudge-max");
            if (!lastWasCalibrarion) {
                vibNudge(now);
            }
            lastWasCalibrarion = true;
        } else {
            lastWasCalibrarion = false;
            if (BGDiff > 0 && Math.abs(bgCorrectValue(bgDelta)) >= BGDiff) {
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
        //console.log("Received ACK");
        
        failedFetches = 0; // Ok!  We have communication!            
        if (ackHandle) {
            clearTimeout(ackHandle); // Got our "ack"!
            ackHandle = 0;
        }
        break;

    case "podchange":
        //console.log(`evt.data.value=${evt.data.value}`);
        
        let p = parseInt(evt.data.value);
        cometDays = parseInt(evt.data.period);
        cometHours = parseInt(evt.data.before);
        //console.log(`p=${evt.data.value}`);
        
        setPodchange(p);
        writeFileSync("podchange", {
            podchange: p,
            period: cometDays,
            before: cometHours
        }, "json");
        break;

    case "alarm":
        //console.log(`received alarm ${evt.data.number} as ${evt.data.value}`);
        
        setAlarm(evt.data.number, evt.data.value);
        break;

    case "mess":
        //console.log(`received mess ${evt.data.number} as ${evt.data.value}`);
        
        setMessage(evt.data.number, evt.data.value);
        break;

    case "alarmsnooze": // configured alarm snooze times
        //console.log(`alarmsnoozetimes ${evt.data.number} = ${evt.data.value}`);
        
        alarmSnoozeTimes[evt.data.number] = parseInt(evt.data.value);
        writeFileSync("alarmSnooze", alarmSnoozeTimes, "json");
        break;

    case "timer":
        //console.log(`Received timer request for ${evt.data.number} minutes`);
        
        startTimer(evt.data.number);
        break;

    case "limits":
        myGraph.setUL(bgStandardUnits(evt.data.UL));
        myGraph.setL(bgStandardUnits(evt.data.L));
        myGraph.setH(bgStandardUnits(evt.data.H));
        myGraph.setUH(bgStandardUnits(evt.data.UH));
        BGUrgentLow = evt.data.UL;
        BGLow = evt.data.L;
        BGHigh = evt.data.H;
        BGUrgentHigh = evt.data.UH;
        BGDiff = evt.data.diff;
        myGraph.setULColor(evt.data.ULC);
        myGraph.setLColor(evt.data.LC);
        myGraph.setUHColor(evt.data.UHC);
        myGraph.setHColor(evt.data.HC);
        myGraph.setIRColor(evt.data.IRC);
        myGraph.updateRgraph(BG, screenHeight, screenWidth);
        writeLimitsInfo();

        testLimits();
        break;

    case "long":
        longPeriod = evt.data.period;
        longDiff = evt.data.diff;
        break;

    case "warn-start":
        if (evt.data.value == "") {
            warnSuppressStart = {
                def: false
            }
        } else {
            let tokens = evt.data.value.split(":");
            warnSuppressStart = {
                hours: parseInt(tokens[0]),
                minutes: parseInt(tokens[1]),
                def: true
            };
        }
        writeFileSync("warn-start", warnSuppressStart, "json");
        //console.log(`Warn-start: ${warnSuppressStart.hours}:${warnSuppressStart.minutes}`);
        
        break;

    case "warn-end":
        if (evt.data.value == "") {
            warnSuppressEnd = {
                def: false
            }
        } else {
            let tokens = evt.data.value.split(":");
            warnSuppressEnd = {
                hours: parseInt(tokens[0]),
                minutes: parseInt(tokens[1]),
                def: true
            };
        }
        writeFileSync("warn-end", warnSuppressEnd, "json");
        //console.log(`Warn-end: ${warnSuppressEnd.hours}:${warnSuppressEnd.minutes}`);
        
        break;

    case "units":
        bgUnits = evt.data.value;
        //console.log(`Got new Units of ${bgUnits}`);
        testLimits();
        break;

    case "bgFont1":
        bgFont1 = evt.data.number;
        break;

    case "bgsnooze": // configured bg notice "ignore" times
        //console.log(`bgsnooze ${evt.data.number} = ${evt.data.value}`);
        
        bgSnoozeTimes[evt.data.number] = parseInt(evt.data.value);
        writeFileSync("BGSnooze", bgSnoozeTimes, "json");
        break;

    case "ns": // is Nightscout configured?
        writeFileSync("ns", {nsconfigured: evt.data.number}, "json");
        nightScout(evt.data.number);
        break;
        
    case "graphdata":
        BG = [];
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

    case "urgent":
        onlyUrgent = evt.data.number;
        testLimits();
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

// Callback for our special timer screen (at comet reset time, if configured)



let timerWindow = document.getElementById("timerWindow");
function startTimer(value) {
    let timer = timerWindow.getElementById("timer");
    let timerHandle = 0;
    let timerCountdown = 0;

    function timerCallback() {
        //console.log(`TimerCallback here countdown is ${timerCountdown}`);
        
        let min = Math.floor(timerCountdown / 60);
        let sec = timerCountdown - (min * 60);
        timer.text = `${util.zeroPad(min)}:${util.zeroPad(sec)}`;
        if (--timerCountdown < 0) {
            timerCountdown = 0;
            clearInterval(timerHandle);
            timerWindow.style.display = "none";
            vibPattern(dashes);
            return;
        } else if (timerCountdown < 5) {
            //console.log("timer last values");
            vibration.start("bump");
        }
        
        timerWindow.style.display = "inline";
        display.poke();
    }

    //console.log(`starting timer with value ${value}`);
    
    timerCountdown = value * 60; // minutes
    timerHandle = setInterval(timerCallback, 1000);
}

/*
 * Comm channel is up - let's get started!
 */
messaging.peerSocket.onopen = evt => {
    //console.log("Watch is ready");
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
//let BGTimeout = 0;
let BGLowSnooze = 0;
let BGHighSnooze = 0;
let BGUrgentLowSnooze = 0;
let BGUrgentHighSnooze = 0;
let BGgraphButton = document.getElementById("BGgraph");
let suppressButton = document.getElementById("suppress");

function writeLimitsInfo() {
    writeFileSync("BGLimits", {
        BGUL: BGUrgentLow,
        BGLow: BGLow,
        BGHigh: BGHigh,
        BGUH: BGUrgentHigh,
        LS: BGLowSnooze,
        HS: BGHighSnooze,
        ULS: BGUrgentLowSnooze,
        UHS: BGUrgentHighSnooze,
        BGDiff: BGDiff
    }, "json");
}


function BGSnooze(period) {
    //console.log(`BG Snooze for ${period} minutes`);
    

    // Return to normal screen
    snoozeBGTimes.style.display = "none";

    let now = new Date();

    if (bgLower(BGUrgentLow)) {
        BGUrgentLowSnooze = now.getTime() + period * (60 * 1000);
        BGLowSnooze = BGUrgentLowSnooze;
    } else if (bgHigher(BGUrgentHigh)) {
        BGUrgentHighSnooze = now.getTime() + period * (60 * 1000);
        BGHighSnooze = BGUrgentHighSnooze;
    } else if (bgHigher(BGHigh)) {
        BGHighSnooze = now.getTime() + period * (60 * 1000); // snooze in ms
    } else if (bgLower(BGLow)) {
        BGLowSnooze = now.getTime() + period * (60 * 1000);
    }
    writeLimitsInfo();
}


function dismissBG() {

    noteMess.style.display = "none";
//    noteMess.style.fill = "black";
    noteBG.style.display = "none";
    noteTime.style.display = "none";
    suppressButton.style.display = "none";
    BGgraphButton.style.display = "none";

    vibration.stop();
//    clearTimeout(BGTimeout);
    clearTimeout(buzzTimeout);

    // Do we have a current alarm message?
    runAlarmNow(2); // in case an alarm happened in the meantime
}


// Invoked when the "Snooze" button is pressed for BG Limit screen
function snoozeBG() {
    //console.log("Snooze BG");
    
    dismissBG();

    // Set the snooze time selections
    for (let i = 0; i < 8; i++) {
        bgs[i].getElementById("text").text = bgSnoozeTimes[i];
        let j = bgSnoozeTimes[i];
        bgs[i].onclick = function() {
            BGSnooze(j)
        };
    }

    // Show the snooze time selection window
    snoozeBGTimes.style.display = "inline";
}



function doBuzz() {
    
    clearTimeout(buzzTimeout);
    buzzTimeout = setTimeout(alarmBuzz, 10 * 1000); // That was nice!  Do it again!
}

function warnBG() {

    if (bgValue() == 0) return 0;
    if (bgValue() > 40) {
        if (bgValue() == 0 || ((BGHigh == 0 || bgValue() < BGHigh) && 
                               (BGUrgentHigh == 0 || bgValue() < BGUrgentHigh) &&
                               (BGLow == 0 || bgValue() > BGLow) &&
                               (BGUrgentLow == 0 || bgValue() > BGUrgentLow))) return 0;
        if (snoozeBGTimes.style.display == "inline") return 0;
    }

    let now = new Date();
/*
    if ((bgHigher(BGHigh) && now.getTime() < BGHighSnooze) &&
        (bgHigher(BGUrgentHigh) && now.getTime() < BGUrgentHighSnooze) &&
        (bgLower(BGLow) && now.getTime() < BGLowSnooze) &&
        (bgLower(BGUrgentLow) && now.getTime() < BGUrgentLowSnooze)) {
        return 0; // still snoozing...
    }
*/
    if (noticeDismiss.style.display != "none") menuExit();

    noteBG.style.fill = myGraph.setColor(bgValue());
    noteBG.style.display = "inline";
    dismissButton.style.display = "none"; // in case it's showing
    snoozeButton.style.display = "none";
    noteTime.text = `${now.getHours()}:${util.zeroPad(now.getMinutes())}`;
    noteTime.style.display = "inline";

    var urgent = false;
    if (bgHigher(BGUrgentHigh)) {
        noteMess.text = `BG of ${bgValue()} is higher than urgent high limit of ${BGUrgentHigh}`;
        urgent = true;
    } else
        if (bgHigher(BGHigh)) {
            noteMess.text = `BG of ${bgValue()} is higher than high limit of ${BGHigh}`;
            if (BGUrgentHigh == 0) urgent = true;
        } else
            if (bgLower(BGUrgentLow)) {
                noteMess.text = `BG of ${bgValue()} is lower than urgent limit of ${BGUrgentLow}`;
                urgent = true;
            } else 
                if (bgLower(BGLow)) {
                    noteMess.text = `BG of ${bgValue()} is lower than limit of ${BGLow}`;
                    if (BGUrgentLow == 0) urgent = true; // make sure we see it in this case
                }
    noteMess.style.display = "inline";
//    noteMess.style.fill = "black";
    noteMess.style.fontSize = 40;
    //console.log("warnBG");
//    vibration.start("nudge-max");
    if (urgent || !(onlyUrgent && inRange(warnSuppressStart, warnSuppressEnd, now))) {
        vibPattern(dashes);
        display.poke();
//        BGTimeout = setTimeout(warnBG, 10 * 1000); // That was nice!  Do it again!
        doBuzz();
    }

    BGgraphButton.onactivate = BGshowGraph;
//    BGgraphButton.style.fill = "black";
    BGgraphButton.style.display = "inline";
//    suppressButton.style.fill = "black";
    suppressButton.style.display = "inline";
    suppressButton.onactivate = snoozeBG;

    return 1;
}


/*
 * Implementation of a custom vib pattern
 */
//let vibs=["", "", "", "",
//          "", "confirmation-max"];
var vibList;
var vibIdx;
function vibPattern(list) {
    vibList = list;
    vibIdx = 0;
    vibNext();
}
function vibNext() {
    if (vibIdx < vibList.length) {
        vibration.start("confirmation-max");
        setTimeout(vibNext, vibList[vibIdx++]);
    }
}


/*
 * Show graph screens and code
 */
let showingGraph = false;
function displayGraph() {
    let now = new Date();
    
    //console.log("displayGraph");
    showingGraph = true;
    myGraph.reset();
    if (BG.length >= myGraph.maxBGs()) {
        //console.log(`BG.length is ${BG.length}`);
        updateGraph(BG);
    } else {
        // Gather some data for the graph
        //console.log(`Getting graph data because we don't have enough - length=${BG.length}`);
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

    if (currAlarm != -1 && currAlarm != num) {
        //console.log(`Got alarm ${num}, but already showing ${currAlarm}`);
        return; // later, dude
    }

    if (noticeDismiss.style.display != "none") {
        menuExit();
    }

    currAlarm = num;
    noteBG.style.display = "inline";
    noteBG.style.fill = "white";
    noteTime.text = `${alarms[num].value.hour}:${alarms[num].value.minute}`;
    noteTime.style.display = "inline";
//    dismissButton.style.fill = "black";
    dismissButton.style.display = "inline";
//    snoozeButton.style.fill = "black";
    snoozeButton.style.display = "inline";

    dismissButton.onactivate = dismissText;
    snoozeButton.onactivate = snoozeActivate;

    if (typeof messages[num] == 'undefined' ||
        messages[num].value == "") {
        noteMess.text = "<no text>";
    } else {
        noteMess.text = messages[num].value;
    }
//    noteMess.style.fill = "black";
    noteMess.style.display = "inline";
    noteMess.style.fontSize = 40;

    vibPattern(dashes);
    display.poke();
    doBuzz();
//    setTimeout(alarmBuzz, 10 * 1000); // lather, rinse, repeat!

    writeNote(currAlarm);
/*    
    writeFileSync("snooze", {
        number: currAlarm,
        timeout: now.getTime(),
        last: currAlarm
    }, "json");
*/
}

// Simply buzz for an alarm again - if it's still on the screen
function alarmBuzz() {
    //console.log("AlarmBuzz");
    if (noteMess.style.display == "inline"
        //        && currAlarm != -1) {
       ) {
        vibration.start("nudge-max");
        display.poke();
//        if (currAlarm != -1)
//            currTimeout = setTimeout(alarmBuzz, 10 * 1000);
//        else
//            BGTimeout = setTimeout(alarmBuzz, 10 * 1000);
        doBuzz();
//        buzzTimeout = setTimeout(alarmBuzz, 10 * 1000);
    }
}

// Snooze an alarm
function resetAlarm(i) {
    let now = new Date();
    let then = new Date();

    then.setHours(alarms[i].value.hour, alarms[i].value.minute, 0);
    let diff = then.getTime() - now.getTime();
    diff += (util.Hour2ms(24)); // move to tomorrow
    //console.log(`Resetting timeout in ${diff} ms`);
    
    regTimeouts[i] = setTimeout(onWakeup, diff, i);
    snoozes[i] = now.getTime() + diff;
}


// Our function handling wakeups for snoozing alarms
function onWakeup(handle) {
    //console.log(`wakeup ********* ${handle}`);
    //console.log(`currAlarm=${currAlarm}, timeout handle is ${regTimeouts[currAlarm]}`);

    if (regTimeouts[handle] >= 0) {
        // Continue with current alarm
        showAlarm(handle);
        return;
    }

/*
    if (currAlarm >= 0 && regTimeouts[currAlarm] >= 0) {
        // Continue with current alarm
        showAlarm(currAlarm);
        return;
    }

    let now = new Date();
    var i;
    for (i = 0; i < alarms.length; i++) {
        if (alarms[i] && alarms[i].value.hour == now.getHours() &&
            alarms[i].value.minute == now.getMinutes()) {
            currAlarm = i;
            showAlarm(i);
            resetAlarm(i);
            console.log(`cause of alarm is ${i}`);
            return;
        }
    }
*/
}

function overlapAlarm() {
    let now = new Date();
    
    for (let i = 0 ; i < 10 ; i++) {
        if (snoozes[i] > 0 && snoozes[i] - now.getTime() < 0) {
            currAlarm = i;
            //console.log(`>>> Rescheduling alarm ${currAlarm}`);
            runAlarmNow(2);
        }
    }
}


// Invoked when the Dismiss button is pressed
function dismissText() {

    let now = new Date();

    //console.log("Dismiss");
    
    noteMess.style.display = "none";
    noteBG.style.display = "none";
    noteTime.style.display = "none";
    dismissButton.style.display = "none";
    snoozeButton.style.display = "none";

    vibration.stop();
//    clearTimeout(currTimeout);
    clearAlarm(currAlarm);
//    clearTimeout(buzzTimeout);
//    clearTimeout(snoozeTimeouts[currAlarm]);
//    snoozeTimeouts[currAlarm] = 0;
    
//    currSnooze = 0;
    lastAlarm = currAlarm; // so we can get it back again, if needed

    writeNote(currAlarm);

    /* If any alarm has a "snoozes" time in the past, run it now */
    overlapAlarm();
    currAlarm = -1;

/*
    writeFileSync("snooze", {
        number: currAlarm,
        timeout: 0,
        last: lastAlarm
    }, "json");
*/
    // remove any saved snooze file
    //    try {
    //        unlinkSync("snooze");
    //    } catch (err) {}
}

function selectSnooze(index) {
    //console.log(`selected ${index}`);
    
    let snoozeTime = index;

    //console.log(`resetting alarm for snooze of ${snoozeTime} mins`);
    
    let now = new Date();
    clearAlarm(currAlarm);
//    clearTimeout(snoozeTimeouts[currAlarm]);
    snoozes[currAlarm] = now.getTime() + util.Min2ms(snoozeTime);
    snoozeTimeouts[currAlarm] = setTimeout(onWakeup, util.Min2ms(snoozeTime), currAlarm);
    //console.log(`curr Timeout Handle = ${regTimeouts[currAlarm]}`);
    
    //console.log(`currAlarm=${currAlarm}`);
    lastAlarm = currAlarm;
    
    writeNote(currAlarm);
    overlapAlarm();
    currAlarm = -1;
/*
    writeFileSync("snooze", {
        number: currAlarm,
        timeout: currSnooze,
        last: lastAlarm
    }, "json");
*/
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
    //console.log("Snooze");

    menuWindow1.style.display = "none";
    menuWindow2.style.display = "none";
    noteMess.style.display = "none";
    noteBG.style.display = "none";
    noteTime.style.display = "none";
    dismissButton.style.display = "none";
    snoozeButton.style.display = "none";

    clearTimeout(buzzTimeout);
    vibration.stop();

    switch (type) {
    case "BG":
//        clearTimeout(currTimeout); // clear current re-buzz/snooze
//        currSnooze = -1;
        break;

    case "comm":
        break;
    }
    
    // Set the snooze time selections
    for (let i = 0; i < 8; i++) {
        sts[i].getElementById("text").text = alarmSnoozeTimes[i];
        //        //console.log(`alarmsnoozetimes[$i}] = ${alarmSnoozeTimes[i]}`);
        
        let j = alarmSnoozeTimes[i];
        switch (type) {
        case "BG":
            sts[i].onclick = function() {
                selectSnooze(j)
            };
            break;
        case "comm":
            sts[i].onclick = function() {
                commSnooze(j)
                //console.log("comm snooze");
            };
            break;
        }
    }

    // Show the snooze times selection screen
    snoozeTimes.style.display = "inline";
}


let commSnoozeEnd = 0;
function commSnooze(time) {
    let now = new Date();
    
    //console.log(`commSnooze time is ${time}`);
    commSnoozeEnd = now.getTime() + (util.Min2ms(time));
    let d = new Date(commSnoozeEnd);
    //console.log(`ending comm snooze at ${d}`);

    writeFileSync("commsnooze", {
        time: commSnoozeEnd
    }, "json");

    snoozeTimes.style.display = "none";
    //console.log(`lastalarm=${lastAlarm}`);
}


function clearAlarm(num) {
    clearTimeout(buzzTimeout);
    clearTimeout(snoozeTimeouts[num]);
    snoozeTimeouts[num] = 0;
    snoozes[num] = 0;
}

// Deal with updates to configuration
function setAlarm(num, time) {
    //console.log(`setting alarm ${num} to ${time}`);

    // Clear anything there already
    if (regTimeouts[num]) {
        clearTimeout(regTimeouts[num]);
        if (currAlarm == num) {
//            clearTimeout(currTimeout);
//            clearTimeout(buzzTimeout);

            clearAlarm(num);
//            currSnooze = 0;
            currAlarm = -1; // no current alarm any more
        }
    }

    // Either set an alarm or possibly clear it
    if (typeof time != 'undefined' && time != "" && !isNaN(parseInt(time))) {

        let tokens = time.split(":");
        alarms[num] = {
            name: "alarm" + num.toString(),
            value: {
                hour: tokens[0],
                minute: tokens[1]
            }
        };
        //console.log(`alarm value is ${alarms[num].value.hour}:${alarms[num].value.minute}`);

        let now = new Date();
        let then = new Date();
        then.setHours(tokens[0], tokens[1], 0);
        let diff = then.getTime() - now.getTime();
        if (diff < 0) { // Make it for tomorrow instead
            diff += util.Hour2ms(24);
            //console.log("Setting alarm for tomorrow");
        }

        //console.log(`setting alarm to ${diff} ms`);
        regTimeouts[num] = setTimeout(onWakeup, diff, num);
        snoozes[num] = now.getTime() + diff;
    } else {
        //console.log(`clearing alarm num ${num}`);
        alarms[num] = undefined;
        try {
            unlinkSync("note" + num);
        } catch(err) {};
        return;
    }

    if (typeof messages[num] == 'undefined' ||
        messages[num].value == "") {
        setMessage(num, ""); // Make sure it's *something*
    } else {
        writeNote(num);
    }
}

function writeNote(num) {
    
    writeFileSync("note" + num, {
        time: alarms[num],
        message: messages[num],
        snooze: snoozes[num]
    }, "json");
}

function setMessage(num, mess) {
    //console.log(`setting message ${num} to ${mess}`);
    
    messages[num] = {
        name: "message" + num.toString(),
        value: mess
    };

    writeNote(num);
}


// Read in the last podchange time - if it's there
//let m = new ArrayBuffer(50);
//console.log(`trying to read podchange info`);

try {
    let m = readFileSync("podchange", "json");
    //console.log(`podchange = ${m.podchange}`);
    
    setPodchange(m.podchange);
    cometDays = m.period;
    cometHours = m.before;
} catch (err) {
    //console.log(`no podchange info - asking companion`)
    
    // See if we can get it from the companion
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        // Send a command to the companion
        messaging.peerSocket.send({
            command: "podchange"
        });
    }  
}

// Read BG high and low snooze times
try {
    let m = readFileSync("BGLimits", "json");
    BGUrgentLow = m.BGUL;
    BGLow = m.BGLow,
    BGHigh = m.BGHigh,
    BGUrgentHigh = m.BGUH;
    BGLowSnooze = m.LS;
    BGHighSnooze = m.HS;
    BGUrgentLowSnooze = m.ULS;
    BGUrgentHighSnooze = m.UHS;
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
//    let m = new ArrayBuffer(200);
    let now = new Date();

    try {
        let m = readFileSync("note" + i, "json");
        //console.log(`read note ${i}, m=${m}`);
        
        let mess = "";
        if (typeof m.message == 'undefined' || typeof m.message.value == 'undefined') {
            //console.log("setting message to null");
            mess = "";
        } else {
            //console.log("setting message to something");
            mess = m.message.value;
        }
        
        if (m && !isNaN(m.time.value.hour) && !isNaN(m.time.value.minute)) {
            //console.log(`i=${i}: m=${m.time.value.hour}:${m.time.value.minute} , ${mess}`);

            alarms[i] = m.time;
            messages[i] = {value: mess};

            let then = new Date();
            then.setHours(m.time.value.hour, m.time.value.minute, 0);
            let diff = then.getTime() - now.getTime();
            if (diff < 0) { // Make it for tomorrow instead
                diff += util.Hour2ms(24);
            }
            //console.log(`Setting timeout in ${diff} ms`);
            
            regTimeouts[i] = setTimeout(onWakeup, diff, i);
            if (m.snooze > 0) {
                if(m.snooze > now.getTime()) {
                    snoozeTimeouts[i] = setTimeout(onWakeup, m.snooze - now.getTime(), i);
                    snoozes[i] = m.snooze;
                } else {
                    currAlarm = i;
                    runAlarmNow(10);
                }
            }
//            currSnooze = now.getTime() + diff;
        }
    } catch (err) {}
}




function dismissGraph() {

    showingGraph = false;
    graphWindow.style.display = "none";
    if (graphReturn) graphReturn();
}

sgvbutton.onclick = function(e) {
    //console.log("click on sgv");
    
    graphWindow.style.display = "inline";
    graphReturn = 0;

    displayGraph();
}

// Event occurs when new file(s) are received
inbox.onnewfile = () => {
    let fileName;
    do {
        // If there is a file, move it from staging into the application folder
        fileName = inbox.nextFile();
        if (fileName) {
            //console.log(`Got info: ${fileName}`);
            
            readSGVFile(fileName);
        }
    } while (fileName);
};


function readSGVFile(fileName) {

    BG = [];
    BG = readFileSync(fileName, 'cbor');
    //console.log("reading graph file");
    myGraph.updateRgraph(BG, screenHeight, screenWidth);

    if (showingGraph) {
        updateGraph(BG);
    }
}

function updateGraph(data) {

    let min = 500;
    let max = 0;
    var minAt;
    var maxAt;
    
    let graphMin = graphWindow.getElementById("graphMin");
    let graphMax = graphWindow.getElementById("graphMax");
    let graphMinAt = graphWindow.getElementById("graphMinAt");
    let graphMaxAt = graphWindow.getElementById("graphMaxAt");
    let graphStartAt = graphWindow.getElementById("graphStartAt");
    let graphEndAt = graphWindow.getElementById("graphEndAt");
    var graphStart, graphEnd;
    var arcIn;
    let arcAbove;
    let arcBelow;
    let timeAbove;
    let timeIn;
    let timeBelow;
    try{
        // Start of code not in Radial CGM
        graphStart = graphWindow.getElementById("graphStart");
        graphEnd = graphWindow.getElementById("graphEnd");
    }catch(e){}
    if (rad) {
        arcIn = graphWindow.getElementById("arcIn");
        arcAbove = graphWindow.getElementById("arcAbove");
        arcBelow = graphWindow.getElementById("arcBelow");
        timeAbove = graphWindow.getElementById("timeAbove");
        timeIn = graphWindow.getElementById("timeIn");
        timeBelow = graphWindow.getElementById("timeBelow");
    }

    //console.log(`graphmin=${graphWindow.getElementById("graphMin")}`);

    for (let i = 0; i < data.length; i++) {
        if (data[i].s < min) {
            min = data[i].s;
            minAt = data[i].d;
        }
        if (data[i].s > max) {
            max = data[i].s;
            maxAt = data[i].d;
        }
    }
    min--;
    max++;
    //console.log(`min=${min} max=${max}`);
    

    // Set start time
    if (rad) {
        let a=0;let b=0;let i=0;
        for (let j=0;j<BG.length;j++) {
            if (BGHigh > 0 && BG[j].s > BGHigh) a++;
            else if (BGLow > 0 && BG[j].s < BGLow) b++;
            else i++
        }
        a = (a*100)/ BG.length;
        b = (b*100) / BG.length;
        i = (i*100) / BG.length;

        timeAbove.text = `High: ${util.oneDecimal(a)}%`;
        timeIn.text = `In: ${util.oneDecimal(i)}%`;
        timeBelow.text = `Low: ${util.oneDecimal(b)}%`;
        graphMin.text = `Min:${bgCorrectValue(min)}`;
        graphMax.text = `Max:${bgCorrectValue(max)}`;
        //console.log(`arc in=${(i*360)/100}`);
        arcIn.startAngle = 0;
        arcIn.sweepAngle = (i*360)/100;
        arcIn.style.fill = myGraph.IRC();
        arcAbove.startAngle = (i*360)/100;
        arcAbove.sweepAngle = (a*360)/100;
        arcAbove.style.fill = myGraph.HC();
        arcBelow.startAngle = arcAbove.startAngle+arcAbove.sweepAngle;
        arcBelow.sweepAngle = (b*360)/100;
        arcBelow.style.fill = myGraph.LC();
    } else {
        graphStart.text = hourMin(data[data.length - 1].d);
        graphEnd.text = hourMin(data[0].d);
        graphMin.text = `${bgCorrectValue(min)}`;
        graphMax.text = `${bgCorrectValue(max)}`;
    }
    graphMinAt.text = `${hourMin(minAt)}`;
    graphMaxAt.text = `${hourMin(maxAt)}`;
    graphStartAt.text = `Start: ${bgCorrectValue(data[data.length-1].s)}`;
    graphEndAt.text = `End: ${bgCorrectValue(data[0].s)}`;
    graphIOB.text = `--`;
    graphCOB.text = `--`;

    fetchCompanionData("iobcob"); // get new info

    // Set the graph scale
    myGraph.setYRange(min, max);
    myGraph.setBGColor("black");

    // Update the graph
    myGraph.update(data);
    graphWindow.style.display = "inline";
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
        if ((snoozes[currAlarm] - now.getTime()) <= secs*1000) {
            snoozes[currAlarm] = now.getTime() + (secs*1000);
        }
        regTimeouts[currAlarm] = setTimeout(onWakeup,
                                            snoozes[currAlarm] - now.getTime(), currAlarm);
    }
}


/*
 * Menu code
 */
let menu = document.getElementById("menu");
let menuButton = menu.getElementById("menuButton");
menuButton.onclick = function () {
    //console.log("MENU!");
    
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

    //console.log(`string is ${string} lastalarm=${lastAlarm}`);
    switch (string) {
    case "Redo last alarm":
        if (lastAlarm >= 0) {
            currAlarm = lastAlarm;
            //console.log(`Redo alarm ${lastAlarm}`);
            regTimeouts[currAlarm] = 0;
            snoozes[lastAlarm] = 0;
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
        //console.log("more1");
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
menuItemClass = menuWindow2.getElementsByClassName("menuItem");
for (let i = 0; i < menuItemClass.length ; i++) {
    menu2[i] = menuWindow2.getElementById(i.toString());
    menu2[i].onclick = function () {
        menu2click(menu2[i].text);
    };
}
menuItemClass = [];

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
        //console.log("more2");
    }
}
menu2exit.onclick = menuExit;

function menuExit() {
    //console.log("exit menu");
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
    //console.log("Suppressions Text");
    let now = new Date();

    noteMess.text = "";
    noteMess.style.fontSize = 30;
    noteBG.style.fill = "white";

    let highBGSuppress = BGHighSnooze - now.getTime();
    if (BGHighSnooze && highBGSuppress > 0) {
        noteMess.text = `High BG: ${Math.floor(highBGSuppress / (60*1000))} mins`;
    }

    let lowBGSuppress = BGLowSnooze - now.getTime();
    if (BGLowSnooze && lowBGSuppress > 0) {
        if (noteMess.text.length > 0) {
            noteMess.text += "\n";
        }
        noteMess.text += `Low BG: ${Math.floor(lowBGSuppress / (60*1000))} mins`;
    }

    let urgentLowBGSuppress = BGUrgentLowSnooze - now.getTime();
    if (BGUrgentLowSnooze && urgentLowBGSuppress > 0) {
        if (noteMess.text.length > 0) {
            noteMess.text += "\n";
        }
        noteMess.text += `Urg. Low BG: ${Math.floor(urgentLowBGSuppress / (60*1000))} mins`;
    }

    let urgentHighBGSuppress = BGUrgentHighSnooze - now.getTime();
    if (BGUrgentHighSnooze && urgentHighBGSuppress > 0) {
        if (noteMess.text.length > 0) {
            noteMess.text += "\n";
        }
        noteMess.text += `Urg. High BG: ${Math.floor(urgentHighBGSuppress / (60*1000))} mins`;
    }

    if (commSnoozeEnd > now.getTime()) {
        if (noteMess.text.length > 0) {
            noteMess.text += "\n";
        }
        noteMess.text += `Comm: ${Math.floor((commSnoozeEnd-now.getTime())/(60*1000))} mins`;
    }

    // Check for Alarm snoozes
    for (let i = 0 ; i < 10 ; i++) {
        if (snoozes[i] > 0) {
            if (noteMess.text.length > 0) {
                noteMess.text += "\n";
            }
            noteMess.text += `Alarm ${i+1}: ${Math.floor((snoozes[i]-now.getTime())/(60*1000))} mins`;
        }
    }
/*
    if (currAlarm >= 0 && currTimeout) {
        if (didSome) {
            noteMess.text += "\n";
        }
        //console.log(`currSnooze=${currSnooze}, currAlarm=${currAlarm}`);
        noteMess.text += `Alarm ${currAlarm+1}: ${Math.floor((currSnooze-now.getTime())/(60*1000))} mins`;
        didSome = true;
    }
*/    
    if (noteMess.text.length == 0) {
        //console.log("nothing to show");
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

    writeLimitsInfo();
    
    menuExit();
}

let list = document.getElementById("menu-list");

/*
 * Initialization code
 */

// Read in any snooze time which was previously running and restart it


try {
    let now = new Date();
    let m = readFileSync("snooze", "json");
    
    let timeout = m.timeout;
    if (m.number != -1) {
        if (timeout < now.getTime()) {
            timeout = now.getTime() + (10 * 1000);
        }
        if (timeout > now.getTime()) {
            // Make sure we reinvoke this alarm in the short future
            if ((timeout - now.getTime()) <= 5000) {
                timeout = now.getTime() + 5000;
            }
            snoozeTimeouts[currAlarm] = setTimeout(onWakeup, timeout - now.getTime(), m.number);
            snoozes[m.number] = timeout;
        }
    }
    unlinkSync("snooze");
} catch (err) {}


let alarmSnoozeTimes = [10, 20, 30, 40, 50, 60, 90, 120];
try {
    let m = readFileSync("alarmSnooze", "json");
    for (let i = 0; i < 8; i++) {
        if (m[i]) {
            alarmSnoozeTimes[i] = m[i];
            //            //console.log(`alarmSnoozeTimes[${i}] = ${m[i]}`);
        }
    }
} catch (err) {}

let bgSnoozeTimes = [20, 40, 60, 90, 120, 180, 240, 480];
try {
    let m = readFileSync("BGSnooze", "json");
    for (let i = 0; i < 8; i++) {
        if (m[i]) {
            bgSnoozeTimes[i] = m[i];
            //            //console.log(`bgSnoozeTimes[${i}] = ${m[i]}`);
        }
    }
} catch (err) {};

/*
try {
    let now = new Date();
    let warnStart = readFileSync("warn-start", "json");
    warnSuppressStart.hours = parseInt(warnStart.hours);
    warnSuppressStart.minutes = parseInt(warnStart.minutes);
    warnSuppressStart.def = true;
    //console.log(`Warn-start: ${warnSuppressStart.hours}:${warnSuppressStart.minutes}`);
} catch (err) {
    warnSuppressStart = {def: false};
}

try {
    let now = new Date();
    let warnEnd = readFileSync("warn-end", "json");
    warnSuppressEnd.hours = parseInt(warnEnd.hours);
    warnSuppressEnd.minutes = parseInt(warnEnd.minutes);
    warnSuppressEnd.def = true;
    //console.log(`Warn-end: ${warnSuppressEnd.hours}:${warnSuppressEnd.minutes}`);
} catch (err) {
    warnSuppressEnd = {def: false};
}
*/

try {
    let t = readFileSync("commsnooze", "json");
    if (t) {
        commSnoozeEnd = parseInt(t.time);
        //console.log(`commSnoozeEnd=${commSnoozeEnd}`);
    }
} catch (err) {};


// See if Nightscout is configured or not
try {
    let m = readFileSync("ns", "json");
    nsConfigured = m.nsconfigured;
} catch(err) {
    nsConfigured = false;
};

if (nsConfigured) {
    // Make sure we at least *try* getting data, even if all else fails
    setTimeout(wakeupFetch, util.Min2ms(1));
}

//console.log(`max. message size is ${messaging.peerSocket.MAX_MESSAGE_SIZE}`);
//console.log("JS memory: " + memory.js.used + "/" + memory.js.total);
//console.log(`Memory pressure is at ${memory.monitor.pressure} ${memory.js.used} / ${memory.js.total}`);

