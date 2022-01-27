// Import the messaging module
import * as messaging from "messaging";
import {
    encode
} from 'cbor';
import {
    outbox
} from "file-transfer";
import {
    settingsStorage
} from "settings";
import {
    me
} from "companion";
import {
    geolocation
} from "geolocation";
import * as util from "../common/utils";
import appName from "./appname.js";

import * as appClusterStorage from "app-cluster-storage";
//import { me as appbit } from "companion";
const myCluster = appClusterStorage.get("cgm1");

// Max. times to try Inet and getting fetch errors before going to Local Mode
let MAXFETCHERRORS = 3;

// // default URL pointing at xDrip Plus endpoint
var baseURL = "";
var URLtoken = "";
//WeatheyAPI connection
var API_KEY = null;
var ENDPOINT = null


if (me.launchReasons.peerAppLaunched) {
    // The Device application caused the Companion to start
    console.log("Device application was launched!");
}

if (me.launchReasons.wokenUp) {
    // The companion started due to a periodic timer
    console.log("Started due to wake interval!")
    formatReturnData(); // just to make sure
}


var lastbg;
var lastdate;
var lastperiod;
var lastdelta;
var bgNext;
let BGUrgentLow = 0;
let BGLow=0;
let BGHigh=0;
let BGUrgentHigh = 0;
let urgentLowColor = "";
let lowColor = "";
let inRangeColor = "";
let highColor = "";
let urgentHighColor = "";
let BGDiff = 0;
let longPeriod = 0;
let longDiff = 0;
let units = "bg/dl"; // init.
var podChange;
let minUpdate=0;
let timerVal=0; // default to no timer
let cometDays=3;
let cometHours=12;
var cometURL;



function  sendData(bg, date, period, delta, next) {
    console.log("Replying from companion");
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        let now = new Date();
        console.log(`bg=${bg}`);
        messaging.peerSocket.send({
            key: "bg",
            bg: bg,
            date: date,
            period: period,
            delta: delta,
            update: next
        });

    } else {
        console.log("********* No peerSocket connection");
    }
}


let nextBatteryCheck = 0;
function batteryCheck() {
    console.log("Battery Check here");

    let url = getBatteryURL()
    if (url == "") return; // done!

    fetch(url)
        .then(function (response) {
            return response.json()
                .then(function(data) {
                    let devList = [];
                    fetchErrors = 0; // worked!!
                    console.log(`Got battery data: ${data}`);
                    
                    for (let i = 0 ; i < data.length ; i++) {
                        console.log(`Device is ${data[i].device}`);
                        if (typeof(devList[data[i].device]) == 'undefined') {
                            devList[data[i].device] = data[i].uploader.battery;
                            console.log("Saved");
                        }
                    }

                    let note = "";;
                    for (let i in devList) {
                        console.log(`Device ${i} has power ${devList[i]}`);
                        if (devList[i] < 20) {
                            note += `${i} power:${devList[i]}%\n`;
                        }
                    }

                    if (note != "") {
                        console.log(`Note is:\n${note}`);
                        sendSetting("message", 0, note);
                    }
                });
        })
        .catch(function (err) {
            console.log("Error fetching " + err);
            /*
              if (!useLocal && (++fetchErrors >= MAXFETCHERRORS)) {
              if (localMode <= 0) {
              // try local mode
              localMode = 10; // local mode 10 times - then try Inet again
              } else if (localMode < 10-MAXFETCHERRORS) {
              localMode = 0; // Local mode isn't working either
              }
              }
              // Try again in 1 minute
              sendData(0,0,0,0, now.getTime() + (1 * 60 * 1000));
              doingFetch = false;              
            */
        });
    nextBatteryCheck = setTimeout(batteryCheck, 15 * 60 * 1000);
}




let doingFetch = false; // Try to avoid overlapping fetches
let fetchErrors = 0; // know when to try Local mode
let bgs = [];
let dates = [];
function queryBGD() {
    console.log("queryBGD");
    if (baseURL == "" && useLocal !== 'true') return;
    let url = getSgvURL()
    let now = new Date();

    console.log(url);

    // Save a flag saying we're now looking for the information needed
    // Don't initiate another query when we already have one going
    if (doingFetch) {
        console.log("Disallowing multiple overlapping fetches");
        return; // Don't allow multiple overlapping fetches
    }
    doingFetch = true;

    // Check battery levels
    if (nextBatteryCheck == 0) {
        batteryCheck();
    }

    return fetch(url)
        .then(function (response) {
            return response.json()
                .then(function(data) {
                    fetchErrors = 0; // worked!!
                    console.log(`Got data: ${data}`);

                    let date1 = 0 , date2 = 0;
                    let sgv1 = 0 , sgv2 = 0;
                    bgs = []; dates = [];
                    var i;
                    for (i = 0 ; i < data.length ; i++) {
                        if (data[i].type == "cal") {
                            if (i > 0) 
                                sendSetting("cal", data[i-1].date, "");
                        } else {
                            if (date1 == 0) {
                                date1 = data[i].date;
                                sgv1 = data[i].sgv;
                                console.log(`saving date1 with index ${i}`);
                            } else if (date2 == 0) {
                                date2 = data[i].date;
                                sgv2 = data[i].sgv;
                                console.log(`saving date2 with index ${i}`);
                            }
                        }
//                        bgs[i] = data[i].sgv;
//                        dates[i] = data[i].date;
                    }

                    // Save away the last info
                    lastperiod = date1 - date2;
                    console.log("after for loop");
                    if (sgv1 != 0) {
                        console.log("sgv1");
                        lastbg = sgv1;
                        console.log("after sgv1");
                        lastdate = date1;
                        console.log(`after date1 sgv1 is ${sgv1} sgv2 is ${sgv2}`);
                        lastdelta = sgv1 - sgv2;
                        console.log("after minus");
                    } else {
                        console.log("no sgv1");
                        lastbg = sgv2;
                        lastdate = date2;
                        lastdelta = 0; // for now
                    }
                    console.log("after if");
                    if (isNaN(lastdelta))
                        lastdelta = 0;
                    console.log(`period=${lastperiod}, bg=${lastbg}, lastdate=${lastdate}, delta=${lastdelta}`);

                    bgNext = setUpdateInterval();

//                    if (lastbg == 0) {
//                        fetch(`https://peacock.place/cgi-bin/log.cgi?date1=${date1}&date2=${date2}&sgv1=${sgv1}&sgv2=${sgv2}`);
//                    }

//                    bgVal = lastbg;

                    // Normalize delta to a 5 minutes period
                    console.log(`>>>>>>>>> lastdelta is ${lastdelta}`);
                    let interval = lastperiod / (5 * 60 * 1000);
                    console.log(`>>>>>>>>> last normalized period is ${interval}`);
                    lastdelta = lastdelta / interval;
                    console.log(`>>>>>>>>>> lastdelta is now ${lastdelta}`);
                    
                    sendData(lastbg, lastdate, lastperiod, lastdelta, bgNext);
                    doingFetch = false;              
                });
        })
        .catch(function (err) {
            console.log("Error fetching " + err);
            if (!useLocal && (++fetchErrors >= MAXFETCHERRORS)) {
                if (localMode <= 0) {
                    // try local mode
                    localMode = 10; // local mode 10 times - then try Inet again
                } else if (localMode < 10-MAXFETCHERRORS) {
                    localMode = 0; // Local mode isn't working either
                }
            }
            // Try again in 1 minute
            sendData(0,0,0,0, now.getTime() + (1 * 60 * 1000));
            doingFetch = false;              
        });
}



function returnGraphData(data) {  
    let graphData = [];

    let cal = 0;
    for (let i = 0 ; i*2 < data.length ; i++) {
        let index = i*2;
        if (cal == 0) {
            if (data[index].type == "cal") {
                index = i*2 - 1;    // value is last entry
                cal = data[index].date;
                sendSetting("cal", cal, "");
                console.log(`>>>>>> got a calibration value next - val ${data[index].sgv}`);
            } else if (index+1 < data.length && data[index+1].type == "cal") {
                cal = data[index].date;
                sendSetting("cal", cal, "");
                console.log(`>>>>>> got a calibration value here - val ${data[index].sgv}`);
            }
        }
        
        graphData[i] = {s: data[index].sgv
                        ,d: data[index].date
                       };
    }

    const myFileInfo = encode(graphData);
    outbox.enqueue('graph.json', myFileInfo);

    gettingGraphData = false;
}


function sendGraphData(data) {
    
    let graphData = [];
    
    for (let ifrom = 0, ito = 0 ; ifrom < data.length ; ifrom++) {
        //console.log(`type of ${ifrom} with value ${data[ifrom].sgv} is ${data[ifrom].type}`);
        let cal = 0;
        if (ifrom > 0 && data[ifrom].type == "cal") {
            sendSetting("cal", data[ifrom-1].date , "");
        } else {
            graphData[ito++] = {s: data[ifrom].sgv,
                              d: data[ifrom].date
                             };
        }
    }

    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        console.log(`Sending graph data... `);
        messaging.peerSocket.send({
            key: "graphdata",
            data: graphData
        });
    } else {
        console.log("No peerSocket connection");
    }  

    gettingGraphData = false; // done
}


let gettingGraphData = false;
function getGraphData() {
    if (gettingGraphData) return; // Don't do this twice overlapping
    gettingGraphData = true;
    
    let url = getGraphURL()
    let now = new Date();

    console.log(url);

    return fetch(url)
        .then(function (response) {
            return response.json()
                .then(function(data) {
                    if (appName() == "radialcgm") {
                        returnGraphData(data);
                    } else {
                        sendGraphData(data);
                    }
                });
        })
        .catch(function (err) {
            console.log("Error fetching " + err);
            gettingGraphData = false; // error, so we're done
        });
}



// Send the weather data to the device
function returnData(data) {
    const myFileInfo = encode(data);
    outbox.enqueue('file.txt', myFileInfo)

}

function formatReturnData() {
    console.log("formatReturnData");
    queryBGD();
}

//function formatUpdateData() {
//    console.log("formatUpdateData");
//    sendData(lastbg, lastdate, lastperiod, lastdelta, bgNext, false);
//}

function sendIOBCOB(data) {
    
    console.log(`iob=${data.bgs[0].iob} cob=${data.bgs[0].cob}`);
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        console.log(`Sending IOB/COB data... `);
        messaging.peerSocket.send({
            key: "iobcob",
            iob: data.bgs[0].iob,
            cob: data.bgs[0].cob
        });
    } else {
        console.log("No peerSocket connection");
    }  
    gettingIOBCOB = false; // done
}

let gettingIOBCOB = false;
function getIOBCOB() {
    if (gettingIOBCOB) return; // Don't do this twice overlapping
    gettingIOBCOB = true;
    
    let url = getIOBCOBURL()
    let now = new Date();

    console.log(url);

    return fetch(url)
        .then(function (response) {
            return response.json()
                .then(function(data) {
                    //        returnGraphData(data);
                    sendIOBCOB(data);
                });
        })
        .catch(function (err) {
            console.log("Error fetching " + err);
            gettingIOBCOB = false; // error, so we're done
        });
}


// Listen for messages from the device
messaging.peerSocket.onmessage = function(evt) {
    console.log(`********** Companion received message: ${evt.data.command}`);
    sendSetting("ack", 0, ""); // ack the request
    switch (evt.data.command) {
    case "data":
        formatReturnData(); // Actually gather the data now
        break;

//    case "update":
//        formatUpdateData(); // Just send me the last data
//        break;

    case "podchange":
        getAndSendPodchange();
        break;

    case "podreset":
        updateSetting({key:"change"}, true);
        break;

    case "graph":
        getGraphData();
        break;

    case "iobcob":
        getIOBCOB();
        break;
    }
}

function getAndSendPodchange() {

//    podChange = settingsStorage.getItem("podchange");
    podChange = myCluster.getItem("podchange");
    console.log(`new podchange time is ${podChange}`);
    if (typeof podChange !== "undefined" && podChange) {
        
        let d = new Date(parseInt(podChange));
        settingsStorage.setItem("changeDate", JSON.stringify({"name": d.toLocaleString()}));
    } else {
        settingsStorage.setItem("changeDate", JSON.stringify({"name": ""}));
    }
    
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        console.log("Sending podchange data...");
        messaging.peerSocket.send({
            key: "podchange",
            value: podChange,
            period: cometDays,
            before: cometHours
        });
    } else {
        console.log("No peerSocket connection");
    }  
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
    // Handle any errors
    console.log("********** Connection error: " + err.code + " - " + err.message);
}


//----------------------------------------------------------
//
// This section deals with settings
//
//----------------------------------------------------------

/*
  function getHourMin(name, newTime) {
  console.log("Trying");
  let d = new Date();
  let ds = d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear();
  let newd = new Date(ds + " " + newTime);

  d = {
  hour: newd.getHours(),
  min: newd.getMinutes()
  };

  if (d.hour >= 0 && d.min >= 0) {
  return d;
  } else {
  settingsStorage.setItem(name, JSON.stringify({
  name: "HH:MM"
  }));
  console.log("error in time");
  return {
  hour: -1,
  min: -1
  };
  }
  }
*/

/*
 * Format a date according to my described format from the settings page
 */
function datestring(rem) {
    var mon = rem.getMonth() + 1;
    var day = rem.getDate();
    var year = rem.getFullYear();
    var hour = rem.getHours();
    var med = "AM";
    var hourint = parseInt(hour);
    if (hourint > 12) {
        hourint -= 12;
        med = 'PM';
    } else if (hourint === 12) {
        med = 'PM';
    } else if (hourint === 0) {
        hourint = 12;
    }
    hour = hourint.toString();

    var min = rem.getMinutes();

    var ts = mon + "/" + day + "/" + year + "%20" + hour + ":" + min + ":00%20" + med + "%20-0000";

    return (ts);
}


// Fetch a URL constructed from the one given in the configuration
// and substituting "<c>" with the comet reset date and time
// Uses format: MM/DD/YYYY HH:MM:SS "AM"|"PM" <TZ-offset>
// which should work if dropped directly back into javascript Date()
function addURL(now) {
    
    if (typeof(cometURL) == "undefined" ||
        cometURL == "") {
        return;
    }

    console.log(`addURL: ${cometURL}`);
    
    var tzoffset = now.getTimezoneOffset() * 1000 * 60;

    var nowgmt = new Date(now.getTime() + tzoffset);
    var ts = datestring(nowgmt);
    
    var comet = ts;
    
    var url = (' ' + cometURL).slice(1);  // force copy of the string
    
    var newURL = url.replace("<c>", comet);
    
    console.log('Opening Comet URL: ' + newURL);

    return fetch(newURL)
        .then(function(response) {
            return response.text()
                .then(function(data) {
                    console.log(data);
                })
        });
}


settingsStorage.onchange = updateSetting;

function updateSetting(evt, updateConfigStr) {
    var now, d;
    var minUpdateStr;

    console.log(`Got settings storage change ${evt.key} to ${evt.newValue}`);
    now = new Date();
    
    switch (evt.key) {
    case "import":
        let val = evt.newValue;
        console.log(`Got import button as ${val}`);
        if (val == "1") {
            if (me.permissions.granted("access_app_cluster_storage")) {
                if (myCluster !== null) {
                    let conf = myCluster.getItem("config");
                    console.log(`Got cluster of ${myCluster.getItem("config")}`);
                    settingsStorage.setItem("config", conf);
                    updateSetting({key: "config", newValue: conf});
                } else {
                    console.error("App Cluster Storage is unavailable.");
                }
            }
            updateConfigStr = false;
        } else if (val == "0") {
            initConfigString("export");
        }
        break;

//    case "export":
//        initConfigString("export");
//        break;
        
    case "change": // Update calendar of a pod change
        console.log("Updating comet");
//        settingsStorage.setItem("podchange", now.getTime());
        myCluster.setItem("podchange", now.getTime());
        if (!isNaN(timerVal) && timerVal != 0) {
            sendSetting("timer", timerVal, "");
        }
        // Invoke our special URL for this update
        addURL(now);
        getAndSendPodchange();
        break;

    case "changeDate":
        d = JSON.parse(evt.newValue);
        console.log(`d=${d.name}`);
        d = new Date(d.name);
        if (isNaN(d.getTime())) {
            settingsStorage.removeItem("changeDate");
        }
//        settingsStorage.setItem("podchange", d.getTime());
        myCluster.setItem("podchange", d.getTime());
        addURL(d);
        getAndSendPodchange();
        break;

    case "minUpdate":
        console.log(`evt=${JSON.parse(evt.newValue)}`);
        minUpdate = JSON.parse(evt.newValue);
        minUpdateStr = minUpdate.name;
        minUpdate = parseInt(minUpdateStr);
        if (isNaN(minUpdate)) {
            settingsStorage.removeItem("minUpdate");
        }
        break;
        
    case "timer":
        timerVal = parseInt(JSON.parse(evt.newValue).name);
        if (isNaN(timerVal)) {
            settingsStorage.removeItem("timerVal");
        }
        console.log(`Timer set to ${timerVal}`);
        break;

    case "urgentLowColor":
        urgentLowColor = JSON.parse(evt.newValue).name.toLowerCase();
        sendLowHigh();
        break;

    case "lowColor":
        lowColor = JSON.parse(evt.newValue).name.toLowerCase();
        sendLowHigh();
        break;

    case "inRangeColor":
        inRangeColor = JSON.parse(evt.newValue).name.toLowerCase();
        sendLowHigh();
        break;

    case "highColor":
        highColor = JSON.parse(evt.newValue).name.toLowerCase();
        sendLowHigh();
        break;

    case "urgentHighColor":
        urgentHighColor = JSON.parse(evt.newValue).name.toLowerCase();
        sendLowHigh();
        break;

    case "urgentLow":
        BGUrgentLow = parseFloat(JSON.parse(evt.newValue).name);
        if (isNaN(BGUrgentLow)) {
            settingsStorage.removeItem("BGUrgentLow");
            BGUrgentLow = 0;
        }
        console.log(`Urgent Low limit set to ${BGUrgentLow}`);
        sendLowHigh();
        break;

    case "low":
        BGLow = parseFloat(JSON.parse(evt.newValue).name);
        if (isNaN(BGLow)) {
            settingsStorage.removeItem("BGLow");
            BGLow = 0;
        }
        console.log(`Low limit set to ${BGLow}`);
        sendLowHigh();
        break;

    case "high":
        BGHigh = parseFloat(JSON.parse(evt.newValue).name);
        console.log(`High limit set to ${BGHigh}`);
        if (isNaN(BGHigh)) {
            settingsStorage.removeItem("BGHigh");
            BGHigh = 0;
        }
        sendLowHigh();
        break;

    case "urgentHigh":
        BGUrgentHigh = parseFloat(JSON.parse(evt.newValue).name);
        if (isNaN(BGUrgentHigh)) {
            settingsStorage.removeItem("BGUrgentHigh");
            BGUrgentHigh = 0;
        }
        console.log(`High limit set to ${BGUrgentHigh}`);
        sendLowHigh();
        break;

    case "diff":
        BGDiff = parseFloat(JSON.parse(evt.newValue).name);
        if (isNaN(BGDiff)) {
            settingsStorage.removeItem("BGDiff");
        }
        console.log(`BG Difference set to ${BGDiff}`);
        sendLowHigh();
        break;

    case "longDiff":
        longDiff = parseFloat(JSON.parse(evt.newValue).name);
        if (isNaN(longDiff)) {
            settingsStorage.removeItem("longDiff");
        }
        console.log(`Long period difference set to ${longDiff}`);
        sendLongInfo();
        break;

    case "longPeriod":
        longPeriod = parseInt(JSON.parse(evt.newValue).name);
        if (isNaN(longPeriod)) {
            settingsStorage.removeItem("longPeriod");
        }
        console.log(`Long period set to ${longPeriod} mins`);
        sendLongInfo();
        break;

    case "warn-start":
        try {
            let w = JSON.parse(evt.newValue).name;
            sendSetting("warn-start", 0, w);
            console.log(`********** sending warn-start as ${w}`);
        } catch (err) {
            settingsStorage.removeItem("warn-start");
        }
        break;
        
    case "warn-end":
        try {
            let w = JSON.parse(evt.newValue).name;
            sendSetting("warn-end", 0, w);
            console.log(`********** sending warn-end as ${w}`);
        } catch (err) {
            settingsStorage.removeItem("warn-end");
        }
        break;
        
    case "bgsnooze0":
    case "bgsnooze1":
    case "bgsnooze2":
    case "bgsnooze3":
    case "bgsnooze4":
    case "bgsnooze5":
    case "bgsnooze6":
    case "bgsnooze7":
        let bgSnooze=JSON.parse(evt.newValue);
        try {
            let index = evt.key.slice(-1);
            BGSnooze[index] = parseInt(JSON.parse(evt.newValue).name);
            sendSetting("bgsnooze", index, JSON.parse(evt.newValue).name);
        }
        catch (err) {
            settingsStorage.setItem("bgsnooze"+index.toString(), BGSnooze[index].toString());
        }
        break;
        
    case "defBgSz":
        defBgSz = parseInt(JSON.parse(evt.newValue).name);
        sendSetting("defBgSz", defBgSz, "");
        break;
        
    case "defAlmSz":
        defAlmSz = parseInt(JSON.parse(evt.newValue).name);
        sendSetting("defAlmSz", defAlmSz, "");
        break;
        
    case "url":
        baseURL = JSON.parse(evt.newValue).name;
        if (baseURL != "") {
            baseURL = baseURL.trim();
            baseURL = baseURL.replace(/\/$/, "");
            baseURL = baseURL.replace(/^Http/,"http");
            baseURL = baseURL.replace(/^http:/,"https:");
            
            settingsStorage.setItem("url", JSON.stringify({"name": baseURL}));
            sendSetting("ns", 1, "");
            setTimeout(getGraphData, 5 * 1000);
            //        queryBGD();
        } else if (!(useLocal == 'true')) {
            sendSetting("ns", 0, "");
        }
        break;
        
    case "token":
        URLtoken = JSON.parse(evt.newValue).name;
        if (URLtoken != "") {
            URLtoken = URLtoken.trim();
            settingsStorage.setItem("token", JSON.stringify({"name": URLtoken}));
            setTimeout(getGraphData, 5 * 1000);
            queryBGD();
        }
        break;
        
    case "units":
        let toggleValue = settingsStorage.getItem("units");
        units = (toggleValue === 'false') ? "bg/dl" : "mmol/L";
        sendSetting("units", 0, units);
        console.log(`New Units of ${units}`);
        break;

    case "local":
        useLocal = settingsStorage.getItem("local");
        console.log(`useLocal = ${useLocal}`);
        if (useLocal === 'true') {
            sendSetting("ns", 1, "");
            // Also send graph info
            setTimeout(getGraphData, 5 * 1000);
        } else if (baseURL == "") {
            sendSetting("ns", 0, "");
        }
        break;

    case "localapp":
        localApp = settingsStorage.getItem("localapp");
        console.log(`localApp = ${localApp}`);
        if (localApp === 'true') { // xdrip+
            setTimeout(getGraphData, 5 * 1000);
        }
        break;

    case "cometURL":
        cometURL = JSON.parse(evt.newValue).name;
        break;

    case "cometDays":
        cometDays = parseInt(JSON.parse(evt.newValue).name);
        if (isNaN(cometDays)) {
            settingsStorage.removeItem("cometDays");
        }
        break;

    case "comethours":
        cometHours = parseInt(JSON.parse(evt.newValue).name);
        if (isNaN(cometHours)) {
            settingsStorage.removeItem("cometHours");
        }
        break;

    case "bgFont1":
        let size = parseInt(JSON.parse(evt.newValue).name);
        if (!isNaN(size)) {
            settingsStorage.removeItem("bgFont1");
        }
        settingsStorage.setItem("bgFont1", evt.newValue);
        sendSetting("bgFont1", size, "");
        break;

    case "urgent": // Only Urgent High and Low warnings during quiet time
        let onlyUrgent = settingsStorage.getItem("urgent");
        sendSetting("urgent", (onlyUrgent === 'true')?1:0, "");
        console.log(`Urgent only is ${onlyUrgent}`);
        break;

    case "alarm0":
    case "alarm1":
    case "alarm2":
    case "alarm3":
    case "alarm4":
    case "alarm5":
    case "alarm6":
    case "alarm7":
    case "alarm8":
    case "alarm9":
        let alarmTime=JSON.parse(evt.newValue);
        sendSetting("alarm", parseInt(evt.key.slice(-1)), alarmTime.name);
        break;

    case "mess0":
    case "mess1":
    case "mess2":
    case "mess3":
    case "mess4":
    case "mess5":
    case "mess6":
    case "mess7":
    case "mess8":
    case "mess9":
        let mess=JSON.parse(evt.newValue);
        sendSetting("mess", parseInt(evt.key.slice(-1)), mess.name);
//        sendSetting("message", 0, "this is a test message");
        break;

    case "alarmsnooze0":
    case "alarmsnooze1":
    case "alarmsnooze2":
    case "alarmsnooze3":
    case "alarmsnooze4":
    case "alarmsnooze5":
    case "alarmsnooze6":
    case "alarmsnooze7":
        console.log("alarmsnoozetimes");
        try {
            let index = parseInt(evt.key.slice(-1));
            alarmSnooze[index] = parseInt(JSON.parse(evt.newValue).name);
            sendSetting("alarmsnooze", index, JSON.parse(evt.newValue).name);
        }
        catch (err) {
            console.log(`err = ${err}`);
            settingsStorage.setItem("alarmsnooze"+index.toString(),
                                    JSON.stringify({"name": alarmSnooze[index].toString()}));
        }
        break;

    case "gradient":
        gradientColor = JSON.parse(evt.newValue).name.toLowerCase();
        sendSetting("gradient", 0, gradientColor);
        break;

    case "hour":
        hourColor = JSON.parse(evt.newValue).name.toLowerCase();
        sendSetting("hour", 0, hourColor);
        break;

    case "minute":
        minuteColor = JSON.parse(evt.newValue).name.toLowerCase();
        sendSetting("minute", 0, minuteColor);
        break;

    case "second":
        secondColor = JSON.parse(evt.newValue).name.toLowerCase();
        sendSetting("second", 0, secondColor);
        break;

    case "seconds":
        displaySeconds = settingsStorage.getItem("seconds");
        console.log(`seconds = ${displaySeconds}`);
        if (displaySeconds === 'true') {
            sendSetting("seconds", 1, "");
        } else {
            sendSetting("seconds", 0, "");
        }
        break;

    case "config":
        let conf  = JSON.parse(evt.newValue).name;
        console.log(`Got new config: ${conf}`);
        conf = JSON.parse(conf);
        for (let i in conf) {
            let val=`${conf[i]}`;
            console.log(`${i} = ${val}`);
            if (val == "true" || val == "false") {
                console.log(`Setting toggle value`);
                settingsStorage.setItem(i, val);
                updateSetting({"key":i, newValue: val}, false);
            } else {
                settingsStorage.setItem(i, JSON.stringify({"name": val}));
                let nv = {name: val}
                updateSetting({"key":i, newValue: JSON.stringify(nv)}, false);
            }
        }
        settingsStorage.removeItem("import");
        break;
    }

    if (updateConfigStr == undefined || updateConfigStr == true) {
        console.log("******* Updating configstr *****");
        initConfigString("init");
    }

}

function sendSetting(item, num, value) {
    console.log(`sendsetting ${item},${num},${value}`);
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        console.log(`Sending settings data... key=${item}, num=${num}, value=${value}`);
        messaging.peerSocket.send({
            key: item,
            number: num,
            value: value
        });
    } else {
        console.log("No peerSocket connection");
    }  
}

// getters 
function getSettings(key) {
    if (settingsStorage.getItem(key)) {
        return JSON.parse(settingsStorage.getItem(key));
    } else {
        return undefined
    }
}

function getBaseURL() {

    console.log(`useLocal=${useLocal}`);
    if (useLocal === 'true' || localMode > 0) { // still doing Local mode?
        if (!useLocal) localMode--; // countdown until trying Inet again
        if (localApp === 'true') {
            return("http://127.0.0.1:17580");
        } else {
            return("http://127.0.0.1:1979");
        }
    } else {
        return(baseURL);
    }
}

let localMode = 0;
function getSgvURL() {
    let now = new Date();
    let timePeriod;
    if (isNaN(lastdate)) {
        timePeriod = 5; // default
    } else {
        timePeriod = (now.getTime() - lastdate) / (60 * 1000);
    }
    console.log(`minUpdate is ${minUpdate}`);
    let count = Math.floor(minUpdate / 5) + 3;
    console.log(`Getting ${count} entries`);

    let URL;
    console.log(`useLocal=${useLocal} localApp=${localApp}`);
    if (useLocal === 'true' && localApp === 'true') {
        URL = `http://127.0.0.1:17580/sgv.json?count=${count}`;
        return (URL);
    } else {
        URL = getBaseURL() + `/api/v1/entries.json?count=${count}`;
    }
    if (URLtoken != "") {
        URL += "&token=" + URLtoken;
    }
    return (URL);
}

function getGraphURL() {
    let count = 24;
    if (appName() == "radialcgm") count = (66*2);

    let URL;
    if (useLocal === 'true' && localApp === 'true') {
        URL = `http://127.0.0.1:17580/sgv.json?count=${count}`;
        return (URL);
    } else {
        URL = getBaseURL() + `/api/v1/entries.json?count=${count}`;
    }
    if (URLtoken != "") {
        URL += "&token=" + URLtoken;
    }
    return (URL);
}

function getBatteryURL() {
    let URL;

    if (baseURL == "") return "";

// I don't think this devicestatus url works if you're doing "local" mode
    URL = baseURL + `/api/v1/devicestatus.json`;

    if (URLtoken != "") {
        URL += "?token=" + URLtoken;
    }
    return (URL);
}

function getIOBCOBURL() {
    let URL = getBaseURL() + "/pebble";
    if (URLtoken != "") {
        URL += "?token=" + URLtoken;
    }
    return (URL);
}


let fetchTimeoutHandle=0;
let fetchTimeoutTime=0;
let wakeups=0; // count of number of wakeups we currently have waiting
let interval=0; // init.

function setUpdateInterval() {
    var period;
    
    if (lastdate > 0 && lastperiod > 0) {
        // Calculate next update
        let now = new Date();

        //    if (minUpdate > 0) {
        //      period = minUpdate * 60 * 1000; // in milliseconds
        //    } else {
        period = lastperiod;
        //    }

        //    bgNext = lastdate - now.getTime() + period;
        console.log(`Update period is ${period/(60*1000)} mins`);
        for (bgNext = lastdate + period ;
             bgNext < now.getTime() + (minUpdate * 60 * 1000);
             bgNext += period) {
            let y = (bgNext - now.getTime()) / (60 * 1000);
        }
        let y = (bgNext - now.getTime()) / (60 * 1000);
        console.log(`bgNext positioned at ${y} mins in future`);

        /*
        // Let's increase the update interval to double the interval
        if (minUpdate && bgNext < now.getTime() + (minUpdate * 60 * 1000)) {
        bgNext = now.getTime() + minUpdate * 60 * 1000;      
        }
        */
        bgNext += 15 * 1000; // next entry could be a little late
        let m = (bgNext - now.getTime()) / 60000;
        
        console.log(`Need wakeup in ${m} mins`);
        if (BGLow || BGHigh) {
            if (fetchTimeoutHandle) {
                console.log(`>>>> Clearing wakeup from ${now.getTime()-fetchTimeoutTime} msec's ago which didn't happen`);
                clearTimeout(fetchTimeoutHandle);
            }
        }
        return bgNext; // need a wakeup at this time
    }
}

function sendSnoozeTimes() {
    console.log("Sending snooze times");
    
    for (let i = 0 ; i < 8 ; i++) {
        sendSetting("alarmsnooze", i, alarmSnooze[i].toString());
        sendSetting("bgsnooze", i, BGSnooze[i].toString());
    }
    sendSetting("defBgSz", defBgSz, "");
    sendSetting("defAlmSz", defAlmSz, "");
}

function sendLowHigh() {
    
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send({
            key: "limits",
            UL: BGUrgentLow,
            L: BGLow,
            H: BGHigh,
            UH: BGUrgentHigh,
            diff: BGDiff,
            ULC: urgentLowColor,
            LC: lowColor,
            IRC: inRangeColor,
            HC: highColor,
            UHC: urgentHighColor,
        });
    } else {
        console.log("No peerSocket connection");
    }  
}

function sendLongInfo() {

    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send({
            key: "long",
            period: longPeriod,
            diff: longDiff
        });
    } else {
        console.log("No peerSocket connection");
    }  
}

function sendBGFontSize() {
    var size;
    try {
        size = parseInt(JSON.parse(settingsStorage.getItem("bgFont1")).name);
    }
    catch(err) { // Set a default
        settingsStorage.setItem("bgFont1", JSON.stringify({"name": "30"}));
        size = 30;
    }

    sendSetting("bgFont1", size, "");
}

function sendConfiguration() {

    sendBGFontSize();
    sendLongInfo();
    sendSetting("units", 0, units);
    sendSetting("urgent", onlyUrgent, "");

    setTimeout(sendConfiguration2, 2 * 1000); // send rest later
}

function sendConfiguration2() {
    sendLowHigh();
    if (baseURL == "" && !(useLocal === 'true')) {
        console.log("ns false");
        sendSetting("ns", 0, "");
    } else {
        console.log("ns true");
        sendSetting("ns", 1, "");
        setTimeout(getGraphData, 5 * 1000);
    }
    getAndSendPodchange();
    if (typeof(warnStart) != "undefined")
        sendSetting("warn-start", 0, warnStart);
    if (typeof(warnEnd) != "undefined")
        sendSetting("warn-end", 0, warnEnd);
    if (appName() != "orbitsns" && appName() != "orbitsnstesting") {
        sendSetting("gradient", 0, gradientColor);
        sendSetting("hour", 0, hourColor);
        sendSetting("minute", 0, minuteColor);
        sendSetting("second", 0, secondColor);
        if (displaySeconds === 'true') {
            sendSetting("seconds", 1, "");
        } else {
            sendSetting("seconds", 0, "");
        }
    }
    sendSetting("defBgSz", defBgSz, "");
    sendSetting("defAlmSz", defAlmSz, "");
}

messaging.peerSocket.onopen = evt => {

    console.log("Companion is ready");
    setTimeout(sendConfiguration, 2 * 1000);
//    sendConfiguration();
    //  formatReturnData();
}


function onWakeup(companion, event) {
    console.log("wakeup here!");
    //    wakeups--;
    //  fetchTimeoutHandle = 0; // got it!
    //  fetchTimeoutTime = 0;
    formatReturnData();
}

// Init.
settingsStorage.setItem("change", 'false');
try {
    let minUpdateStr = JSON.parse(settingsStorage.getItem("minUpdate"));
    console.log(`C: minUpdateStr = ${minUpdateStr}`);
    minUpdate = parseInt(minUpdateStr.name);
    console.log(`C: minUpdate is ${minUpdate}`);
}
catch (err) {
    settingsStorage.setItem("minUpdate", JSON.stringify({"name": "2"}));
}

try {
//    let podchange = settingsStorage.getItem("podchange");
    let podchange = myCluster.getItem("podchange");
    console.log(`podchange time as read is ${podchange}`);
    let i = parseInt(podchange);
    if (i > 0) {
        let d = new Date(parseInt(podchange));
        settingsStorage.setItem("changeDate", JSON.stringify({"name": d.toLocaleString()}));
    } else {
        console.log("podchange is not positive");
        podChange = 0;
        settingsStorage.setItem("changeDate", JSON.stringify({"name": ""}));
    }
} catch (err) {
    console.log("error in podchange - init'ing");
    podChange = 0;
    settingsStorage.setItem("changeDate", JSON.stringify({"name": ""}));
}

console.log("at timer");
try {
    timerVal = parseInt(JSON.parse(settingsStorage.getItem("timer")).name);
}
catch(err) {
    settingsStorage.setItem("timer", JSON.stringify({"name": "0"}));
}

console.log("at bgurgentlow");
try {
    BGUrgentLow = parseFloat(JSON.parse(settingsStorage.getItem("urgentLow")).name);
    console.log(`BGUrgentLow=${BGUrgentLow}`);
}
catch(err) {
    BGUrgentLow = 0;
}
try {
    urgentLowColor = JSON.parse(settingsStorage.getItem("urgentLowColor")).name;
    console.log(`urgentLowColor=${urgentLowColor}`);
}
catch(err) {
    urgentLowColor = "red";
}

console.log("at bglow");
try {
    BGLow = parseFloat(JSON.parse(settingsStorage.getItem("low")).name);
    console.log(`BGLow=${BGLow}`);
}
catch(err) {
    BGLow = 0;
}

try {
    lowColor = JSON.parse(settingsStorage.getItem("lowColor")).name;
    console.log(`lowColor=${lowColor}`);
}
catch(err) {
    lowColor = "pink";
}

try {
    inRangeColor = JSON.parse(settingsStorage.getItem("inRangeColor")).name;
    console.log(`inRangeColor=${inRangeColor}`);
}
catch(err) {
    inRangeColor = "lightgreen";
}

console.log("at bghigh");
try {
    BGHigh = parseFloat(JSON.parse(settingsStorage.getItem("high")).name);
    console.log(`BGHigh=${BGHigh}`);
}
catch(err) {
    BGHigh = 0;
}
try {
    highColor = JSON.parse(settingsStorage.getItem("highColor")).name;
    console.log(`highColor=${highColor}`);
}
catch(err) {
    highColor = "lightblue";
}

console.log("at bgurgenthigh");
try {
    BGUrgentHigh = parseFloat(JSON.parse(settingsStorage.getItem("urgentHigh")).name);
    console.log(`BGUrgentHigh=${BGUrgentHigh}`);
}
catch(err) {
    BGUrgentHigh = 0;
}
try {
    urgentHighColor = JSON.parse(settingsStorage.getItem("urgentHighColor")).name;
    console.log(`urgentHighColor=${urgentHighColor}`);
}
catch(err) {
    urgentHighColor = "violet";
}

console.log("at bgdiff");
try {
    BGDiff = parseFloat(JSON.parse(settingsStorage.getItem("diff")).name);
    console.log(`BGDiff=${BGDiff}`);
}
catch(err) {}

try {
    longPeriod = parseInt(JSON.parse(settingsStorage.getItem("longPeriod")).name);
    console.log(`longPeriod=${longPeriod} mins`);
}
catch(err) {
    longPeriod = 0;
}

try {
    longDiff = parseFloat(JSON.parse(settingsStorage.getItem("longDiff")).name);
    console.log(`longDiff=${longDiff}`);
}
catch(err) {
    longDiff = 0;
}

console.log("at url");
try {
    baseURL = JSON.parse(settingsStorage.getItem("url")).name;
    if (baseURL != "") {
        baseURL = baseURL.trim();
        baseURL = baseURL.replace(/\/$/, "");
    }
}
catch(err) {
    settingsStorage.setItem("url", JSON.stringify({"name": ""}));
    baseURL = "";
}

console.log("at token");
try {
    URLtoken = JSON.parse(settingsStorage.getItem("token")).name;
    if (URLtoken != "") {
        URLtoken = URLtoken.trim();
    }
}
catch(err) {
    settingsStorage.setItem("token", JSON.stringify({"name": ""}));
    URLtoken = "";
}

console.log("at comet days");
try {
    cometDays = parseInt(JSON.parse(settingsStorage.getItem("cometDays")).name);
}
catch(err) {
    settingsStorage.setItem("cometDays", JSON.stringify({"name": "3"}));
    cometDays = 3;
}

console.log("at comet hours");
try {
    cometHours = parseInt(JSON.parse(settingsStorage.getItem("cometHours")).name);
}
catch(err) {
    settingsStorage.setItem("cometHours", JSON.stringify({"name": "12"}));
    cometHours = 12;
}

console.log("at comet url");
try {
    cometURL = JSON.parse(settingsStorage.getItem("cometURL")).name;
}
catch (err) {}

console.log("at alarm snooze times");
let alarmSnooze = [10,20,30,40,50,60,90,120];
for (let i = 0 ; i < 8; i++) {
    try {
        let as = JSON.parse(settingsStorage.getItem("alarmsnooze"+i.toString()));
        //console.log(`as=${as.name}`);
        if (parseInt(as.name) > 0) {
            alarmSnooze[i] = parseInt(as.name);
            //console.log(`alarmsnooze[${i}]=${alarmSnooze[i]}`);
        }
    } catch(err) {}
    settingsStorage.setItem("alarmsnooze"+i.toString(), JSON.stringify({"name": alarmSnooze[i].toString()}));
}

console.log("at defalmsz");
let defAlmSz = 0;
try {
    let bgs = JSON.parse(settingsStorage.getItem("defAlmSz"));
    if (parseInt(bgs.name) > 0) {
        defAlmSz = parseInt(bgs.name);
    }
} catch (err) {}
settingsStorage.setItem("defAlmSz", JSON.stringify({"name": defAlmSz}));

console.log("at bgsnooze times");
let BGSnooze = [20,40,60,90,120,180,240,480];
for (let i = 0 ; i < 8; i++) {
    try {
        let bgs = JSON.parse(settingsStorage.getItem("bgsnooze"+i.toString()));
        if (parseInt(bgs.name) > 0) {
            BGSnooze[i] = parseInt(bgs.name);
        }
    } catch (err) {}
    settingsStorage.setItem("bgsnooze"+i.toString(), JSON.stringify({"name": BGSnooze[i].toString()}));
}

console.log("at defbgsz");
let defBgSz = 0;
try {
    let bgs = JSON.parse(settingsStorage.getItem("defBgSz"));
    if (parseInt(bgs.name) > 0) {
        defBgSz = parseInt(bgs.name);
    }
} catch (err) {}
settingsStorage.setItem("defBgSz", JSON.stringify({"name": defBgSz}));

console.log("at units");
let toggleValue = settingsStorage.getItem("units");
units = (toggleValue === 'true') ? "mmol/L" : "bg/dl";
console.log(`Got initial value of units as ${units}`);

console.log("at useLocal");
let useLocal = settingsStorage.getItem("local");
console.log(`Got initial value of useLocal as ${useLocal}`);

console.log("at localApp");
let localApp = settingsStorage.getItem("localapp");
console.log(`Got initial value of localApp as ${localApp}`);

console.log("at onlyUrgent");
let onlyUrgent = settingsStorage.getItem("urgent");
console.log(`Got initial value of onlyUrgent as ${onlyUrgent}`);

console.log("at warnstart");
var warnStart;
try {
    warnStart = JSON.parse(settingsStorage.getItem("warn-start")).name;
}
catch(err) {
    warnStart = "";
}

console.log("at warnend");
var warnEnd;
try {
    warnEnd = JSON.parse(settingsStorage.getItem("warn-end")).name;
}
catch(err) {
    warnEnd = "";
}

var gradientColor;
try {
    gradientColor = JSON.parse(settingsStorage.getItem("gradient")).name.toLowerCase();
}
catch(err) {}
if (typeof gradientColor == "undefined" || gradientColor == "")
    gradientColor = "blue";

var hourColor;
try {
    hourColor = JSON.parse(settingsStorage.getItem("hour")).name.toLowerCase();
}
catch(err) {}
if (!hourColor) {
    hourColor = "white";
}
console.log(`hourColor = {$hourColor}`);

var minuteColor;
try {
    minuteColor = JSON.parse(settingsStorage.getItem("minute")).name.toLowerCase();
}
catch(err) {}
if (!minuteColor) {
    minuteColor = "white";
}

var secondColor;
try {
    secondColor = JSON.parse(settingsStorage.getItem("second")).name.toLowerCase();
}
catch(err) {}
if (!secondColor) {
    secondColor = "red";
}

console.log("at displaySeconds");
var displaySeconds;
try {
    displaySeconds = settingsStorage.getItem("seconds");
} catch(e) {}
if (displaySeconds == null) {
    displaySeconds = 'true';
    settingsStorage.setItem("seconds", displaySeconds);
}
console.log(`Got initial value of displaySeconds as ${displaySeconds}`);

console.log("All other initialization depends upon comm channel coming up.");

function logusage(usage) {
    fetch(`https://peacock.place/cgi-bin/cgm.cgi?app=${appName()}&runs=${usage}`);
}

const DAYS = 24 * 60 * 60 * 1000;

try{settingsStorage.removeItem("log")}catch(err){} // first attempt - remove it now

let usage=1;
try {
    let n = JSON.parse(settingsStorage.getItem("usage"));
    usage = parseInt(n.runs);

    if ((n.runs < 50 && (n.runs % 10) == 0) ||
        (n.runs < 1000 && (n.runs % 50) == 0) ||
        (n.runs % 1000) == 0) logusage(usage);
    usage++;
} catch (err) {
    logusage(usage);                 // initial use
}
console.log(`>>> runs = ${usage}`);
settingsStorage.setItem("usage", JSON.stringify({"runs": usage}));

//me.onWakeInterval = () => onWakeup();
//me.wakeInterval = 10 * 60 * 1000;

//setInterval(onWakeup, 5 * 60 * 1000); // Update every 5 minutes

function initConfigString(howCalled) {
    console.log("initconfigstring");

    let conf = "{";
    for (let i = 0 ; i < settingsStorage.length ; i++) {
        let key = settingsStorage.key(i);
//        console.log(`key=${key}`);
        switch (key) {
        case "config":
        case "usage":
        case "change":
        case "podchange":
        case "log2":
        case "export":
        case "import":
            break;
        default:
            var value, name;
            try {
                let value = settingsStorage.getItem(key);
//                console.log(`value=${value}`);
                let name = JSON.parse(value).name;
                if (name != undefined) {
                    conf += `"${key}": "${JSON.parse(value).name}",\r\n`;
                } else {
//                    console.log(`Looks like a toggle? value=${value}`);
                    conf += `"${key}": "${value}",\r\n`;
                }
            } catch (err){console.log(`err=${err}`);}
        }
    }
    conf = conf.replace(/\,\r\n$/, "");
    conf += "}";
    settingsStorage.setItem("config", JSON.stringify({"name": conf}));

    if (howCalled == "export") {
        myCluster.setItem("config", JSON.stringify({"name": conf}));
        console.log(`Setting config of: ${conf}`);
        console.log(`Got cluster of ${myCluster.getItem("config")}`);
    }

    settingsStorage.removeItem("import");
//    console.log(`${conf}`);
}

initConfigString("init");

settingsStorage.removeItem(`import`);
