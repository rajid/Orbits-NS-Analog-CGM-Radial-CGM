import e from"clock";import t from"document";import{me as n}from"appbit";import{me as l}from"device";import*as messaging from"messaging";import*as util from"../common/utils";import{readFileSync as i}from"fs";import{writeFileSync as a}from"fs";import{unlinkSync as s}from"fs";import{statSync as o}from"fs";import{vibration as r}from"haptics";import m from"./graph.js";import{inbox as d}from"file-transfer";import{display as y}from"display";import{memory as c}from"system";import{charger as u}from"power";let g=[5,300,5,300,5];function p(){return"mmol/L"===ie?util.oneDecimal(util.mmol(ae)):ae}function f(e){return"mmol/L"===ie?util.mmol(e):e}function h(e){return"mmol/L"===ie?util.mgdl(e):e}c.monitor.onmemorypressurechange=function(e){switch(W.x=H-15,W.y=15,c.monitor.pressure){case"normal":case"high":W.r=10;break;case"critical":W.r=20,W.cx=H-25,W.cy=25}};let B=t.getElementById("noteBG"),I=t.getElementById("noteMess"),x=t.getElementById("noteTime"),T=t.getElementById("dismiss"),E=t.getElementById("snooze");var b=[],v=[],w=[],k=[],$=[];let S=-1,D=0,G=-1;l.screen||(l.screen={width:348,height:250});const H=l.screen.width,M=l.screen.height;e.granularity="seconds";import{clockFace as C}from"./clock.js";let z=new C,L=t.getElementById("month"),U=t.getElementById("date"),j=t.getElementById("hour"),N=t.getElementById("minute"),A=t.getElementById("arrow"),R=t.getElementById("circle"),P=t.getElementById("sgv"),O=t.getElementById("sgvbutton"),W=t.getElementById("state"),F=t.getElementById("forceUpdate"),Y=0,q=5;var J,K,Q,V,X,Z,_;let ee="radialcgm"==z.appName()?1:0;try{Q=t.getElementById("graphWindow"),V=Q.getElementById("graphIOB"),X=Q.getElementById("graphCOB"),Z=Q.getElementById("GraphDismiss"),_=0,Z.onclick=Ft,K=ee?t.getElementById("docGraph"):Q.getElementById("docGraph"),J=new m(K)}catch(e){}function te(e){let t=new Date;y.on&&ne&&re<t.getTime()&&Qe()}F.onclick=function(){ne&&Qe()},y.addEventListener("change",te);let ne=!1;var le=[];let ie="bg/dl",ae=0,se=0,oe=0,re=0,me=0,de=0,ye=0,ce=0,ue=40,ge=!1,pe=0,fe=0,he=0,Be=0,Ie=!1,xe=0,Te=0,Ee=0,be=0,ve=0,we=3,ke=12;var $e,Se,De,Ge;function He(e){Math.abs(me)>20||xe>0&&Math.abs(f(me))>=xe?e.style.fill="red":e.style.fill=_e?"yellow":"lightgreen"}function Me(e){return e>0&&p()>e}function Ce(e){return e>0&&p()<e}const ze=1*M,Le=.55*M;function Ue(){let e=new Date;if($e=e.getHours(),Se=e.getMinutes(),De=e.getDate(),Ge=e.getMonth()+1,u.connected&&y.poke(),z.updateClock(ze,Le,Ee),Y>0?(L.text=`${Ge}`,U.text=`${De}`,j.text=`${$e}`,N.text=`${util.zeroPad(Se)}`,Y--):(L.style.display="none",U.style.display="none",j.style.display="none",N.style.display="none",ne&&(A.style.display="inline",P.style.display="inline",W.style.display="inline"),Qt.style.display="inline"),ne&&Y<=0){P.text=`${p()}`,P.style.fontSize=ue,P.style.fill=J.setColor(p());let e=(new Date).getTime()-se,t=1;(e/=6e4)<5?t=1:(e>5&&(e-=5),(t=(20-e)/20)<0&&(t=0),t>1&&(t=1)),P.style.fillOpacity=t,P.style.display="inline",(fe||he||pe||Be)&&p()>0&&0==t&&(P.style.fillOpacity=1,P.text=`${Math.floor(e)} mins old`);let n=90*me/20;(n=90-n)<0&&(n=0),n>180&&(n=180),ge?(R.style.display="inline",A.style.display="none",He(R)):(R.style.display="none",A.style.display="inline",A.groupTransform.rotate.angle=n,He(A),A.style.opacity=t),W.style.fill=Pe>0?"red":0==Pe?"green":"white"}}function je(e,t,n){if(!e.def||!t.def)return!1;let l=60*e.hours+e.minutes,i=60*t.hours+t.minutes,a=60*n.getHours()+n.getMinutes();if(l==i)return!1;if(l<i){if(l<a&&a<i)return!0}else{if(a>l)return!0;if(a<i)return!0}return!1}function Ne(e){(0==e||!je(Oe,We,e)&&(0==Nt||Nt<e.getTime()))&&(Et(g),y.poke())}function Ae(e){var t;try{o("forceExit");t=!0}catch(e){t=!1}if(t)Ne(e);else{a("forceExit",{time:e},"json");o("forceExit");n.exit()}}let Re=0,Pe=-1,Oe={def:!1},We={def:!1};function Fe(e){var t;let n=new Date;return messaging.peerSocket.readyState===messaging.peerSocket.OPEN?(messaging.peerSocket.send({command:e}),Re=n.getTime(),Pe<0?Pe--:Pe=-1,t=!0):(Pe>0?Pe++:Pe=1,t=!1),Math.abs(Pe)>10&&(fe>0||he>0||pe>0||Be>0)&&Ae(n),t}var Ye=t.getElementById("clicker");function qe(e){let t=new Date(e);if(null==e||isNaN(e))return Ee=0,be=0,void(ve=0);Ee=new Date(t.getTime()+24*we*60*60*1e3-60*ke*60*1e3),be=Ee.getHours(),ve=Ee.getMinutes()}Ye.onclick=function(e){0==Y?(L.text=`${Ge}`,U.text=`${De}`,j.text=`${$e}`,N.text=`${Se}`,L.style.display="inline",U.style.display="inline",j.style.display="inline",N.style.display="inline",A.style.display="none",P.style.display="none",W.style.display="none",R.style.display="none",Qt.style.display="none",Y=q):Y=0},e.ontick=(()=>Ue());let Je=0;function Ke(){clearTimeout(Je),Qe()}function Qe(){ne&&(Fe("data")?(Je&&clearTimeout(Je),Je=setTimeout(Ke,5e3)):(Te&&clearTimeout(Te),Te=setTimeout(Qe,1e4)))}function Ve(){let e=new Date;return Me(he)&&e.getTime()>=mt||Ce(fe)&&e.getTime()>=rt||Me(Be)&&e.getTime()>=yt||Ce(pe)&&e.getTime()>=dt?It():("inline"==ct.style.display&&ft(),"inline"==st.style.display&&(st.style.display="none"),0)}let Xe=0,Ze=0,_e=!1;function et(e){if(_e=!1,0==Xe||0==Ze)return;var t;let n=util.Min2ms(Xe);for(t=0;t<le.length&&e.getTime()-le[t].d<n;t++)if(le.cal)return;if(!(--t<=0))try{new Date(le[t].d);Math.abs(p()-f(le[t].s))>Ze&&(_e=!0,Ne(e))}catch(e){}}function tt(e){1==e?(0==ne&&(ne=!0,Qe()),F.style.display="inline",W.style.display="inline"):(ne=!1,A.style.display="none",P.style.display="none",W.style.display="none",F.style.display="none",R.style.display="none")}function nt(){Me(pe+5)&&(dt=0),Me(fe+5)&&(rt=0),Ce(Be-5)&&(yt=0),Ce(he-5)&&(mt=0)}var lt;messaging.peerSocket.onmessage=(e=>{let t=new Date;switch(e.data.key){case"bg":Pe=0;t.getTime(),e.data.date;if(e.data.bg>0){ae=e.data.bg,se=e.data.date,oe=e.data.period,me=e.data.delta,ge=e.data.cal;let l=3e5;var n;ee&&(l=6e5);try{n=se-le[0].d>=l?1:0}catch(e){n=1}if(t.getTime()-se>=util.Min2ms(20)&&(fe||he||pe||Be))Ne(t);else for(nt(),!Ve()&&ae<=40&&Ne(0),1==n&&(ee?(le.unshift({s:ae,d:se}),J.updateRgraph(le,M,H)):le.unshift({s:ae,d:se,c:ge}));le.length>0&&(le.length>J.maxBGs()||le[le.length-1].d<t.getTime()-396e5);){let e=le.pop();new Date(e.d)}}if(e.data.update>0){re=e.data.update;new Date(re);Te&&clearTimeout(Te),Te=setTimeout(Qe,re-t.getTime()),de=t.getTime()}isNaN(me)&&(me=0),ge?(lt||Ne(t),lt=!0):(lt=!1,xe>0&&Math.abs(f(me))>=xe?Ne(t):et(t)),vt&&qt(le),tt(1);break;case"ack":Pe=0,Je&&(clearTimeout(Je),Je=0);break;case"podchange":let l=parseInt(e.data.value);we=parseInt(e.data.period),ke=parseInt(e.data.before),qe(l),a("podchange",{podchange:l,period:we,before:ke},"json");break;case"alarm":Pt(e.data.number,e.data.value);break;case"mess":Wt(e.data.number,e.data.value);break;case"alarmsnooze":gn[e.data.number]=parseInt(e.data.value),a("alarmSnooze",gn,"json");break;case"timer":at(e.data.number);break;case"limits":J.setUL(h(e.data.UL)),J.setL(h(e.data.L)),J.setH(h(e.data.H)),J.setUH(h(e.data.UH)),pe=e.data.UL,fe=e.data.L,he=e.data.H,Be=e.data.UH,xe=e.data.diff,J.setULColor(e.data.ULC),J.setLColor(e.data.LC),J.setUHColor(e.data.UHC),J.setHColor(e.data.HC),J.setIRColor(e.data.IRC),J.updateRgraph(le,M,H),gt(),Ve();break;case"long":Xe=e.data.period,Ze=e.data.diff;break;case"warn-start":if(""==e.data.value)Oe={def:!1};else{let t=e.data.value.split(":");Oe={hours:parseInt(t[0]),minutes:parseInt(t[1]),def:!0}}a("warn-start",Oe,"json");break;case"warn-end":if(""==e.data.value)We={def:!1};else{let t=e.data.value.split(":");We={hours:parseInt(t[0]),minutes:parseInt(t[1]),def:!0}}a("warn-end",We,"json");break;case"units":ie=e.data.value,Ve();break;case"bgFont1":ue=e.data.number;break;case"bgsnooze":pn[e.data.number]=parseInt(e.data.value),a("BGSnooze",pn,"json");break;case"ns":a("ns",{nsconfigured:e.data.number},"json"),tt(e.data.number);break;case"graphdata":le=[],le=e.data.data,vt&&qt(le);break;case"gradient":z.setGradColor(e.data.value);break;case"hour":z.setHourColor(e.data.value);break;case"minute":z.setMinColor(e.data.value);break;case"second":z.setSecColor(e.data.value);break;case"iobcob":ye=e.data.iob,ce=e.data.cob,V.text=`${ye}`,X.text=`${ce}`;break;case"urgent":Ie=e.data.number,Ve()}try{s("forceExit")}catch(e){}});let it=t.getElementById("timerWindow");function at(e){let t=it.getElementById("timer"),n=0,l=0;l=60*e,n=setInterval(function(){let e=Math.floor(l/60),i=l-60*e;if(t.text=`${util.zeroPad(e)}:${util.zeroPad(i)}`,--l<0)return l=0,clearInterval(n),it.style.display="none",void Et(g);l<5&&r.start("bump"),it.style.display="inline",y.poke()},1e3)}messaging.peerSocket.onopen=(e=>{ne&&Qe()});let st=t.getElementById("snoozeBGTimes");var ot=[];for(let e=0;e<8;e++)ot[e]=st.getElementById(e.toString());let rt=0,mt=0,dt=0,yt=0,ct=t.getElementById("BGgraph"),ut=t.getElementById("suppress");function gt(){a("BGLimits",{BGUL:pe,BGLow:fe,BGHigh:he,BGUH:Be,LS:rt,HS:mt,ULS:dt,UHS:yt,BGDiff:xe},"json")}function pt(e){st.style.display="none";let t=new Date;Ce(pe)?(dt=t.getTime()+6e4*e,rt=dt):Me(Be)?(yt=t.getTime()+6e4*e,mt=yt):Me(he)?mt=t.getTime()+6e4*e:Ce(fe)&&(rt=t.getTime()+6e4*e),gt()}function ft(){I.style.display="none",B.style.display="none",x.style.display="none",ut.style.display="none",ct.style.display="none",r.stop(),clearTimeout(D),Kt(2)}function ht(){ft();for(let e=0;e<8;e++){ot[e].getElementById("text").text=pn[e];let t=pn[e];ot[e].onclick=function(){pt(t)}}st.style.display="inline"}function Bt(){clearTimeout(D),D=setTimeout(St,1e4)}function It(){if(0==p())return 0;if(p()>40){if(0==p()||(0==he||p()<he)&&(0==Be||p()<Be)&&(0==fe||p()>fe)&&(0==pe||p()>pe))return 0;if("inline"==st.style.display)return 0}let e=new Date;"none"!=dn.style.display&&mn(),B.style.fill=J.setColor(p()),B.style.display="inline",T.style.display="none",E.style.display="none",x.text=`${e.getHours()}:${util.zeroPad(e.getMinutes())}`,x.style.display="inline";var t=!1;return Me(Be)?(I.text=`BG of ${p()} is higher than urgent high limit of ${Be}`,t=!0):Me(he)?(I.text=`BG of ${p()} is higher than high limit of ${he}`,0==Be&&(t=!0)):Ce(pe)?(I.text=`BG of ${p()} is lower than urgent limit of ${pe}`,t=!0):Ce(fe)&&(I.text=`BG of ${p()} is lower than limit of ${fe}`,0==pe&&(t=!0)),I.style.display="inline",I.style.fontSize=40,!t&&Ie&&je(Oe,We,e)||(Et(g),y.poke(),Bt()),ct.onactivate=kt,ct.style.display="inline",ut.style.display="inline",ut.onactivate=ht,1}var xt,Tt;function Et(e){xt=e,Tt=0,bt()}function bt(){Tt<xt.length&&(r.start("confirmation-max"),setTimeout(bt,xt[Tt++]))}let vt=!1;function wt(){new Date;vt=!0,J.reset(),le.length>=J.maxBGs()?qt(le):Fe("graph")}function kt(){_=It,Q.style.display="inline",wt()}function $t(e){new Date;-1!=S&&S!=e||("none"!=dn.style.display&&mn(),S=e,B.style.display="inline",B.style.fill="white",x.text=`${b[e].value.hour}:${b[e].value.minute}`,x.style.display="inline",T.style.display="inline",E.style.display="inline",T.onactivate=Mt,E.onactivate=Ut,void 0===v[e]||""==v[e].value?I.text="<no text>":I.text=v[e].value,I.style.display="inline",I.style.fontSize=40,Et(g),y.poke(),Bt(),Ot(S))}function St(){"inline"==I.style.display&&(r.start("nudge-max"),y.poke(),Bt())}function Dt(e){let t=new Date,n=new Date;n.setHours(b[e].value.hour,b[e].value.minute,0);let l=n.getTime()-t.getTime();l+=util.Hour2ms(24),w[e]=setTimeout(Gt,l,e),k[e]=t.getTime()+l}function Gt(e){w[e]>=0&&$t(e)}function Ht(){let e=new Date;for(let t=0;t<10;t++)k[t]>0&&k[t]-e.getTime()<0&&(S=t,Kt(2))}function Mt(){new Date;I.style.display="none",B.style.display="none",x.style.display="none",T.style.display="none",E.style.display="none",r.stop(),Rt(S),G=S,Ot(S),Ht(),S=-1}function Ct(e){let t=e,n=new Date;Rt(S),k[S]=n.getTime()+util.Min2ms(t),$[S]=setTimeout(Gt,util.Min2ms(t),S),G=S,Ot(S),Ht(),S=-1,zt.style.display="none"}let zt=t.getElementById("snoozeTimes");var Lt=[];for(let e=0;e<8;e++)Lt[e]=zt.getElementById(e.toString());function Ut(){jt("BG")}function jt(e){Xt.style.display="none",ln.style.display="none",I.style.display="none",B.style.display="none",x.style.display="none",T.style.display="none",E.style.display="none",clearTimeout(D),r.stop();for(let t=0;t<8;t++){Lt[t].getElementById("text").text=gn[t];let n=gn[t];switch(e){case"BG":Lt[t].onclick=function(){Ct(n)};break;case"comm":Lt[t].onclick=function(){At(n)}}}zt.style.display="inline"}let Nt=0;function At(e){let t=new Date;Nt=t.getTime()+util.Min2ms(e);new Date(Nt);a("commsnooze",{time:Nt},"json"),zt.style.display="none"}function Rt(e){clearTimeout(D),clearTimeout($[e]),$[e]=0,k[e]=0}function Pt(e,t){if(w[e]&&(clearTimeout(w[e]),S==e&&(Rt(e),S=-1)),void 0===t||""==t||isNaN(parseInt(t))){b[e]=void 0;try{s("note"+e)}catch(e){}}else{{let n=t.split(":");b[e]={name:"alarm"+e.toString(),value:{hour:n[0],minute:n[1]}};let l=new Date,i=new Date;i.setHours(n[0],n[1],0);let a=i.getTime()-l.getTime();a<0&&(a+=util.Hour2ms(24)),w[e]=setTimeout(Gt,a,e),k[e]=l.getTime()+a}void 0===v[e]||""==v[e].value?Wt(e,""):Ot(e)}}function Ot(e){a("note"+e,{time:b[e],message:v[e],snooze:k[e]},"json")}function Wt(e,t){v[e]={name:"message"+e.toString(),value:t},Ot(e)}try{let e=i("podchange","json");qe(e.podchange),we=e.period,ke=e.before}catch(e){messaging.peerSocket.readyState===messaging.peerSocket.OPEN&&messaging.peerSocket.send({command:"podchange"})}try{let e=i("BGLimits","json");pe=e.BGUL,fe=e.BGLow,he=e.BGHigh,Be=e.BGUH,rt=e.LS,mt=e.HS,dt=e.ULS,yt=e.UHS,xe=e.BGDiff}catch(e){rt=0,mt=0,dt=0,yt=0,pe=0,fe=0,he=0,Be=0,xe=0}for(let e=0;e<10;e++){let t=new Date;try{let n=i("note"+e,"json"),l="";if(l=void 0===n.message||void 0===n.message.value?"":n.message.value,n&&!isNaN(n.time.value.hour)&&!isNaN(n.time.value.minute)){b[e]=n.time,v[e]={value:l};let i=new Date;i.setHours(n.time.value.hour,n.time.value.minute,0);let a=i.getTime()-t.getTime();a<0&&(a+=util.Hour2ms(24)),w[e]=setTimeout(Gt,a,e),n.snooze>0&&(n.snooze>t.getTime()?($[e]=setTimeout(Gt,n.snooze-t.getTime(),e),k[e]=n.snooze):(S=e,Kt(10)))}}catch(e){}}function Ft(){vt=!1,Q.style.display="none",_&&_()}function Yt(e){le=[],le=i(e,"cbor"),J.updateRgraph(le,M,H),vt&&qt(le)}function qt(e){let t=500,n=0;var l,i;let a=Q.getElementById("graphMin"),s=Q.getElementById("graphMax"),o=Q.getElementById("graphMinAt"),r=Q.getElementById("graphMaxAt"),m=Q.getElementById("graphStartAt"),d=Q.getElementById("graphEndAt");var y,c,u;let g,p,h,B,I;try{y=Q.getElementById("graphStart"),c=Q.getElementById("graphEnd")}catch(e){}ee&&(u=Q.getElementById("arcIn"),g=Q.getElementById("arcAbove"),p=Q.getElementById("arcBelow"),h=Q.getElementById("timeAbove"),B=Q.getElementById("timeIn"),I=Q.getElementById("timeBelow"));for(let a=0;a<e.length;a++)e[a].s<t&&(t=e[a].s,l=e[a].d),e[a].s>n&&(n=e[a].s,i=e[a].d);if(t--,n++,ee){let e=0,l=0,i=0;for(let t=0;t<le.length;t++)he>0&&le[t].s>he?e++:fe>0&&le[t].s<fe?l++:i++;e=100*e/le.length,l=100*l/le.length,i=100*i/le.length,h.text=`High: ${util.oneDecimal(e)}%`,B.text=`In: ${util.oneDecimal(i)}%`,I.text=`Low: ${util.oneDecimal(l)}%`,a.text=`Min:${f(t)}`,s.text=`Max:${f(n)}`,u.startAngle=0,u.sweepAngle=360*i/100,u.style.fill=J.IRC(),g.startAngle=360*i/100,g.sweepAngle=360*e/100,g.style.fill=J.HC(),p.startAngle=g.startAngle+g.sweepAngle,p.sweepAngle=360*l/100,p.style.fill=J.LC()}else y.text=Jt(e[e.length-1].d),c.text=Jt(e[0].d),a.text=`${f(t)}`,s.text=`${f(n)}`;o.text=`${Jt(l)}`,r.text=`${Jt(i)}`,m.text=`Start: ${f(e[e.length-1].s)}`,d.text=`End: ${f(e[0].s)}`,V.text="--",X.text="--",Fe("iobcob"),J.setYRange(t,n),J.setBGColor("black"),J.update(e),Q.style.display="inline"}function Jt(e){let t=new Date(e);return`${t.getHours()}:${util.zeroPad(t.getMinutes())}`}function Kt(e){let t=new Date;-1!=S&&(k[S]-t.getTime()<=1e3*e&&(k[S]=t.getTime()+1e3*e),w[S]=setTimeout(Gt,k[S]-t.getTime(),S))}O.onclick=function(e){Q.style.display="inline",_=0,wt()},d.onnewfile=(()=>{let e;do{(e=d.nextFile())&&Yt(e)}while(e)});let Qt=t.getElementById("menu"),Vt=Qt.getElementById("menuButton");Vt.onclick=function(){Xt.style.display="inline"};let Xt=t.getElementById("menuWindow1"),Zt=Xt.getElementById("more"),_t=Xt.getElementById("exit");var en=[];let tn=Xt.getElementsByClassName("menuItem");for(let e=0;e<tn.length;e++)en[e]=Xt.getElementById(e.toString()),en[e].onclick=function(){nn(en[e].text)};function nn(e){switch(e){case"Redo last alarm":G>=0&&(w[S=G]=0,k[G]=0,Kt(1)),Xt.style.display="none";break;case"Snooze Comm Warnings":jt("comm");break;case"Current Suppressions":yn();break;case"Cancel Suppressions":cn();break;default:Xt.style.display="none"}}null!=Zt&&(Zt.onclick=function(){ln.style.display="inline"}),_t.onclick=mn;let ln=t.getElementById("menuWindow2"),an=ln.getElementById("more"),sn=ln.getElementById("exit");var on=[];tn=ln.getElementsByClassName("menuItem");for(let e=0;e<tn.length;e++)on[e]=ln.getElementById(e.toString()),on[e].onclick=function(){rn(on[e].text)};function rn(e){switch(e){case"Current Suppressions":yn();break;case"Cancel Suppressions":cn();break;default:ln.style.display="none"}}function mn(){B.style.display="none",I.style.display="none",ln.style.display="none",Xt.style.display="none",dn.style.display="none"}tn=[],null!=an&&(an.onclick=function(){}),sn.onclick=mn;let dn=t.getElementById("noticeDismiss");function yn(){let e=new Date;I.text="",I.style.fontSize=30,B.style.fill="white";let t=mt-e.getTime();mt&&t>0&&(I.text=`High BG: ${Math.floor(t/6e4)} mins`);let n=rt-e.getTime();rt&&n>0&&(I.text.length>0&&(I.text+="\n"),I.text+=`Low BG: ${Math.floor(n/6e4)} mins`);let l=dt-e.getTime();dt&&l>0&&(I.text.length>0&&(I.text+="\n"),I.text+=`Urg. Low BG: ${Math.floor(l/6e4)} mins`);let i=yt-e.getTime();yt&&i>0&&(I.text.length>0&&(I.text+="\n"),I.text+=`Urg. High BG: ${Math.floor(i/6e4)} mins`),Nt>e.getTime()&&(I.text.length>0&&(I.text+="\n"),I.text+=`Comm: ${Math.floor((Nt-e.getTime())/6e4)} mins`);for(let t=0;t<10;t++)k[t]>0&&(I.text.length>0&&(I.text+="\n"),I.text+=`Alarm ${t+1}: ${Math.floor((k[t]-e.getTime())/6e4)} mins`);0==I.text.length&&(I.text="No current suppressions"),ln.style.display="none",Xt.style.display="none",B.style.display="inline",I.style.display="inline",dn.style.display="inline",dn.onclick=mn}function cn(){mt=0,rt=0,yt=0,dt=0,Nt=0,gt(),mn()}let un=t.getElementById("menu-list");try{let e=new Date,t=i("snooze","json"),n=t.timeout;-1!=t.number&&(n<e.getTime()&&(n=e.getTime()+1e4),n>e.getTime()&&(n-e.getTime()<=5e3&&(n=e.getTime()+5e3),$[S]=setTimeout(Gt,n-e.getTime(),t.number),k[t.number]=n)),s("snooze")}catch(e){}let gn=[10,20,30,40,50,60,90,120];try{let e=i("alarmSnooze","json");for(let t=0;t<8;t++)e[t]&&(gn[t]=e[t])}catch(e){}let pn=[20,40,60,90,120,180,240,480];try{let e=i("BGSnooze","json");for(let t=0;t<8;t++)e[t]&&(pn[t]=e[t])}catch(e){}try{let e=i("commsnooze","json");e&&(Nt=parseInt(e.time))}catch(e){}try{let e=i("ns","json");ne=e.nsconfigured}catch(e){ne=!1}ne&&setTimeout(Qe,util.Min2ms(1));