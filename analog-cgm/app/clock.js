import e from"document";import{battery as t}from"power";let o=e.getElementById("hours"),r=e.getElementById("mins"),l=e.getElementById("secs"),n=e.getElementById("hourHand"),s=e.getElementById("minHand"),i=e.getElementById("secHand"),a=e.getElementById("cometorbit"),g=a.getElementById("comet"),m=e.getElementById("grad");function d(e,t){return 30*e+.5*t}function u(e){return 6*e}function c(e){return 6*e}function h(e){return 360/7*e}export class clockFace{constructor(e){this._hourColor="white",this._minColor="white",this._secColor="red",this._gradColor="green"}appName(){return"simplecgm"}setHourColor(e){this._hourColor=e}setMinColor(e){this._minColor=e}setSecColor(e){this._secColor=e}setGradColor(e){this._gradColor=e}updateClock(e,h,y){let C=new Date,f=C.getHours()%12,p=C.getMinutes(),_=C.getSeconds(),B=t.chargeLevel;if(B=B*(e-h)/100+h,m.gradient.x2=B,m.gradient.y2=B,m.gradient.colors.c1=this._gradColor,o.groupTransform.rotate.angle=d(f,p),r.groupTransform.rotate.angle=u(p),l.groupTransform.rotate.angle=c(_),n.style.fill=this._hourColor,s.style.fill=this._minColor,i.style.fill=this._secColor,0!=y&&y<=C){let e=y.getHours(),t=y.getMinutes();a.groupTransform.rotate.angle=d(e,t),g.style.display="inline"}else g.style.display="none"}};