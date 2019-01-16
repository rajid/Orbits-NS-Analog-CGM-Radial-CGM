var BGLow;
var BGHigh;
var uLow;
var uHigh;
var logUH;
var logUL;
var logRange;

function hoursToAngle(hours, minutes) {
    let hourAngle = (360 / 12) * hours;
    let minAngle = (360 / 12 / 60) * minutes;
    return hourAngle + minAngle;
}

export default class Graph {

    constructor(id) {
        
        this._id = id;
        this._rdots = this._id.getElementsByClassName("rdotx");
        this._lowCircle = this._id.getElementById("lowCircle");
        this._midCircle = this._id.getElementById("midCircle");
        this._highCircle = this._id.getElementById("highCircle");
        this._urgentHighColor = "violet";
        this._highColor = "blue";
        this._inRangeColor = "lightgreen";
        this._lowColor = "pink";
        this._urgentLowColor = "red";
        this._urgentHigh = 0;
        this._high = 0;
        this._low = 0;
        this._urgentLow = 0;
        this._bgValue = 0;
        this._bgUnits = "bg/dL";

        BGLow = this._low ? this._low : 60;
        uLow = this._urgentLow ? this._urgentLow : 50;
//        uLow -= 10;
        logUL = Math.log(uLow+10);

        BGHigh = this._high ? this._high : 180;
        uHigh = this._urgentHigh ? this._urgentHigh : 200;
//        uHigh += 10;
        logUH = Math.log(uHigh+10);
    }


    setUHColor(c) {
        this._urgentHighColor = c;
    }

    setHColor(c) {
        this._highColor = c;
    }

    setIRColor(c) {
        this._inRangeColor = c;
    }
    IRC(){return this._inRangeColor}

    setLColor(c) {
        this._lowColor = c;
    }

    setULColor(c) {
        this._urgentLowColor = c;
    }

    setUH(c) {
        this._urgentHigh = c;
        uHigh = this._urgentHigh ? this._urgentHigh : 200;
//        uHigh += 10;
        logUH = Math.log(uHigh+10);
        logRange = logUH - logUL;
    }

    setH(c) {
        this._high = c;
        BGHigh = this._high ? this._high : 180;
    }
    H(){return this._high}
    HC() {return this._highColor}

    setL(c) {
        this._low = c;
        BGLow = this._low ? this._low : 60;
    }
    L(){return this._low}
    LC() {return this._lowColor}

    setUL(c) {
        this._urgentLow = c;
        uLow = this._urgentLow ? this._urgentLow : 50;
//        uLow -= 10;
        logUL = Math.log(uLow-10);
        logRange = logUH - logUL;
    }

    setBGValue(v) {
        this._bgValue = v;
    }

    setBGColor() {}

    setYRange() {}

    setBGUnits(v) {
        this._bgUnits = v;
    }

    bgValue() {
        if (this._bgUnits === 'mmol/L') {
            return(util.oneDecimal(util.mmol(this._bgValue)));
        } else {
            return(this._bgValue);
        }
    }
    maxBGs() {
        return (66);
    }

    bgHigher(v) {
        if (v > 0 && this.bgValue() > v) return true;
        else return false;
    }
    
    bgLower(v) {
        if (v > 0 && this.bgValue() < v) return true;
        else return false;
    }

    setColor(v) {
        var c;
        
        if (this._urgentHigh > 0 && v > this._urgentHigh) {
            c =  this._urgentHighColor;
        } else if (this._high > 0 && v > this._high) {
            c =  this._highColor;
        } else if (this._urgentLow > 0 && v < this._urgentLow) {
            c =  this._urgentLowColor;
        } else if (this._low > 0 && v < this._low) {
            c =  this._lowColor;
        } else {
            c = this._inRangeColor;
        }
        return(c);
    }


    update(){}



    updateRgraph(BG, height, width) {
        let widest = (height / 2) - 15;

        function scale(val, lo) {
            let l = Math.log(val);
            
            return (15 + (((l-lo) * widest) / logRange));
//            return(15 + (((val-low) * widest) / range));
        }
        let heightCenter = height / 2;
        let widthCenter = width / 2;

//        uLow -= 10;
//        uHigh += 10;

//        console.log(`updateGraph, BG length = ${BG.length}`);
//        if (BG.length < 60) return; // make sure we have a good number

//        let range = uHigh - uLow;
        
//        console.log(`rdots length = ${this._rdots.length}`);

        let c=this._lowCircle;

        c=this._lowCircle;
        c.width = 2*scale(BGLow,logUL);
        c.height = 2*scale(BGLow, logUL);
        c.x = widthCenter - scale(BGLow, logUL);
        c.y = heightCenter - scale(BGLow, logUL);
        c.style.display = "inline";
        c.style.fill = this._lowColor;

        c=this._midCircle;
        c.width = 2*scale(100, logUL);
        c.height = 2*scale(100, logUL);
        c.x = widthCenter - scale(100, logUL);
        c.y = heightCenter - scale(100, logUL);

        c=this._highCircle;
        c.width = 2*scale(BGHigh, logUL);
        c.height = 2*scale(BGHigh, logUL);
        c.x = widthCenter - scale(BGHigh, logUL);
        c.y = heightCenter - scale(BGHigh, logUL);
        c.style.display = "inline";
        c.style.fill = this._highColor;

        var dt,h,m,r,angle,radius,i,v;

        //        for (let i = 0 ; i < BG.length && i < this._rdots.length ; i++)
        for (i = 0 ; i < BG.length && i < this._rdots.length ; i++) {
            v = BG[i].s;
            dt = new Date(BG[i].d);
            h = dt.getHours();
            m = dt.getMinutes();
            r = scale(v, logUL);
            angle = hoursToAngle(h,m);

            angle = angle % 360;

            let y=Math.cos(angle*0.01745) * r;
            let x=Math.sin(angle*0.01745) * r;

            this._rdots[i].cx = widthCenter + x;
            this._rdots[i].cy = heightCenter - y;

            this._rdots[i].style.fill = this.setColor(v);
            this._rdots[i].style.display = "inline";
        }

        while (i < this._rdots.length) {
            this._rdots[i].style.display = "none";
            i++;
        }
    }

    reset() {}

}
