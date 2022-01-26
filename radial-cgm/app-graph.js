var BGLow;
var BGHigh;
var uLow;
var uHigh;
var logUH;
var logUL;
var logRange;
var widest;

function hoursToAngle(hours, minutes) {
    let hourAngle = (360 / 12) * hours;
    let minAngle = (360 / 12 / 60) * minutes;
    return hourAngle + minAngle;
}

export default class Graph {

    constructor(id) {
        
        this._id = id;
        this._rdots = this._id.getElementsByClassName("rdotx");
        this._pdots = this._id.getElementsByClassName("pdotx");
        this._lowCircle = this._id.getElementById("lowCircle");
        this._midCircle = this._id.getElementById("midCircle");
        this._highCircle = this._id.getElementById("highCircle");
        this._UHC = "violet";
        this._HC = "blue";
        this._IRC = "lightgreen";
        this._LC = "pink";
        this._ULC = "red";
        this._UH = 0;
        this._high = 0;
        this._low = 0;
        this._UL = 0;
        this._PC = "yellow";
//        this._bgValue = 0;
//        this._bgUnits = "bg/dL";

        BGLow = this._low ? this._low : 60;
        uLow = this._UL ? this._UL : 50;
//        uLow -= 10;
        logUL = Math.log(uLow+10);

        BGHigh = this._high ? this._high : 180;
        uHigh = this._UH ? this._UH : 200;
//        uHigh += 10;
        logUH = Math.log(uHigh+10);
        logRange = logUH - logUL;
    }


    setUHC(c) {
        this._UHC = c;
    }

    setHC(c) {
        this._HC = c;
    }

    setIRC(c) {
        this._IRC = c;
    }
    IRC(){return this._IRC}

    setLC(c) {
        this._LC = c;
    }

    setULC(c) {
        this._ULC = c;
    }

    setPC(c) {
        this._PC = c;
    }

    setUH(c) {
        this._UH = c;
        uHigh = this._UH ? this._UH : 200;
//        uHigh += 10;
        logUH = Math.log(uHigh+10);
        logRange = logUH - logUL;
    }

    setH(c) {
        this._high = c;
        BGHigh = this._high ? this._high : 180;
    }
    H(){return this._high}
    HC() {return this._HC}

    setL(c) {
        this._low = c;
        BGLow = this._low ? this._low : 60;
    }
    L(){return this._low}
    LC() {return this._LC}

    setUL(c) {
        this._UL = c;
        uLow = this._UL ? this._UL : 50;
//        uLow -= 10;
        logUL = Math.log(uLow-10);
        logRange = logUH - logUL;
    }

    setBGColor() {}

    setBGYRange() {}
    setPYRange() {}

/*
    setBGValue(v) {
        this._bgValue = v;
    }

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
*/
    
    maxBGs() {
        return (42);            // 7 hours
    }

/*
    bgHigher(v) {
        if (v > 0 && this.bgValue() > v) return true;
        else return false;
    }
    
    bgLower(v) {
        if (v > 0 && this.bgValue() < v) return true;
        else return false;
    }
*/
    
    setColor(v) {
        var c;
        
        if (this._UH > 0 && v > this._UH) {
            c =  this._UHC;
        } else if (this._high > 0 && v > this._high) {
            c =  this._HC;
        } else if (this._UL > 0 && v < this._UL) {
            c =  this._ULC;
        } else if (this._low > 0 && v < this._low) {
            c =  this._LC;
        } else {
            c = this._IRC;
        }
        return(c);
    }

    scale(val, lo) {
        let l = Math.log(val);
        return (15 + (((l-lo) * widest) / logRange));
    }

    update(){}

    calculatePosition(date, value, height) {

        let v = (value >= 0) ? value : 0;
        let dt = new Date(date);

        let h = dt.getHours();
        let m = dt.getMinutes();
        let r = this.scale(v, logUL);
        if (r < 0) r = 0;
        let angle = hoursToAngle(h,m);

        angle = angle % 360;

        let y=Math.cos(angle*0.01745) * r;
        let x=Math.sin(angle*0.01745) * r;

        return([x, y, r]);
    }

    updateRgraph(BGval, BGdate, height, width, caldate, pvals) {
        let heightCenter = height / 2;
        let widthCenter = width / 2;
        widest = (height / 2) - 15;

        let c=this._lowCircle;

        c=this._lowCircle;
        c.width = 2*this.scale(BGLow,logUL);
        c.height = 2*this.scale(BGLow, logUL);
        c.x = widthCenter - this.scale(BGLow, logUL);
        c.y = heightCenter - this.scale(BGLow, logUL);
        c.style.display = "inline";
        c.style.fill = this._LC;

        c=this._midCircle;
        c.width = 2*this.scale(100, logUL);
        c.height = 2*this.scale(100, logUL);
        c.x = widthCenter - this.scale(100, logUL);
        c.y = heightCenter - this.scale(100, logUL);

        c=this._highCircle;
        c.width = 2*this.scale(BGHigh, logUL);
        c.height = 2*this.scale(BGHigh, logUL);
        c.x = widthCenter - this.scale(BGHigh, logUL);
        c.y = heightCenter - this.scale(BGHigh, logUL);
        c.style.display = "inline";
        c.style.fill = this._HC;

        let dt,h,m,r,angle,radius,i,j;

        let usedCal = false;

        // BGdate values are in reverse time order - newest first
        for (i = 0 ; i < Math.min(BGval.length,this._rdots.length) ; i++) {
            let xy = this.calculatePosition(BGdate[i], BGval[i], height);
            let x = xy[0];
            let y = xy[1];
	    if (xy[2] == 0) continue;

            this._rdots[i].cx = widthCenter + x;
            this._rdots[i].cy = heightCenter - y;

            this._rdots[i].r = 2;
            if (!usedCal && caldate > BGdate[i] && i > 0) {
                this._rdots[i-1].r = 4;
                //console.log(">>>>> used calibration")
                usedCal = true; // found the latest calibration time
            }

            this._rdots[i].style.fill = this.setColor(BGval[i]);
            this._rdots[i].style.display = "inline";
        }
        while (i < this._rdots.length)
            this._rdots[i++].style.display = "none";

        /*
         * Graph any predicted values
         */

        let timeval = BGdate[0] + (10*60*1000); // newest plus 10 minutes

        // Graph our prediction values
        for (i = 0 ;
             i < pvals.length && i < this._pdots.length ;
             i++, timeval += (10*60*1000)) {
            let xy = this.calculatePosition(timeval, pvals[i], height);
            let x = xy[0];
            let y = xy[1];
	    if (xy[2] == 0) continue;

            this._pdots[i].cx = widthCenter + x;
            this._pdots[i].cy = heightCenter - y;
            this._pdots[i].r = 2;
            this._pdots[i].style.fill = this._PC;
            this._pdots[i].style.display = "inline";
        }
        while (i < this._pdots.length)
            this._pdots[i++].style.display = "none";
    }

    updatePredicts(height, width, pvals) {
/*
        var i;

        let heightCenter = height / 2;
        let widthCenter = width / 2;
        let dt,h,m,r,angle,radius,i,v;

        let usedCal = false;

        let timeval = new Date();
        timeval = timeval.getTime() + (5 * 60 * 1000);

        for (i = 0 ; i < this._pdots.length ; i++) {
            this._pdots[i].style.display = "none";
        }

        // Graph our prediction values
        for (i = 0 ;
             i < Math.min(pvals.length,this._pdots.length) ;
             i++ , timeval += (10*60*1000)) {
            let xy = this.calculatePosition(timeval, pvals[i], height);
            let x = xy[0];
            let y = xy[1];
	    if (xy[2] == 0) continue;

            this._pdots[i].cx = widthCenter + x;
            this._pdots[i].cy = heightCenter - y;

            this._pdots[i].r = 2;

            this._pdots[i].style.fill = this._PC;
            this._pdots[i].style.display = "inline";
        }
*/
    }

    reset() {}

}
