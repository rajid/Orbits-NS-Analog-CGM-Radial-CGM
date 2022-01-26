import e from"clock";import t from"document";import{me as n}from"appbit";import{me as l}from"device";import*as msg from"messaging";import*as util from"../common/utils";import{readFileSync as a}from"fs";import{writeFileSync as i}from"fs";import{unlinkSync as o}from"fs";import{statSync as s}from"fs";import{vibration as r}from"haptics";import c from"./graph.js";import{inbox as d}from"file-transfer";import{display as m}from"display";import{memory as y}from"system";import{charger as u}from"power";let g=[300,300];function p(){return"mmol/L"===ie?util.oneDecimal(util.mmol(oe)):oe}function f(e){return"mmol/L"===ie?util.mmol(e):e}function h(e){return"mmol/L"===ie?util.mgdl(e):e}y.monitor.onmemorypressurechange=function(){switch(y.monitor.pressure){case"normal":case"high":F.r=10;break;case"critical":F.r=30}};let B=t.getElementById("noteBG"),k=t.getElementById("noteMess"),b=t.getElementById("noteTime"),I=t.getElementById("dismiss");I.onactivate=At,I.onclick=At;let T=t.getElementById("snooze");T.onactivate=Nt,T.onclick=Nt;var w=[],E=[],v=[],x=[];let S=-1,D=0,$=-1;l.screen||(l.screen={width:348,height:250});const C=l.screen.width,z=l.screen.height;import{clockFace as G}from"./clock.js";let H=new G,M=H.appName(),j="radialcgm"==M?1:0,L="orbitsns"==M?1:0;e.granularity="seconds";var A=1;let U=t.getElementById("arrowDisp"),R=U.getElementById("arrow"),N=U.getElementById("arrowTxt"),O=t.getElementById("circle"),P=t.getElementById("sgv"),W=t.getElementById("sgvbutton"),F=t.getElementById("state"),Y=t.getElementById("forceUpdate"),_=0;var q,J,K,Q,V,X,Z;try{J=j?t.getElementById("docGraph"):(K=t.getElementById("graphWindow")).getElementById("docGraph"),q=new c(J)}catch(e){}function ee(){In=new Date,m.aodActive&&(Dt=!1,K.style.display="none",pn()),m.on&&te&&ce<In.getTime()&&et(),H.changeDisplay(m.aodActive,A)}Y.onclick=function(){try{o("forceExit")}catch(e){}te&&et()},m.addEventListener("change",ee);let te=!1;var ne=[],le=[],ae=[];let ie="bg/dl",oe=0,se=0,re=0,ce=0,de=0,me=0,ye=0,ue=0,ge=0,pe=0,fe=0,he=0,Be=!1,ke=0,be=0,Ie=0,Te=0,we=72,Ee=12;var ve,xe,Se,De;function $e(e){Math.abs(de)>20||ke>0&&Math.abs(f(de))>=ke?(e.style.fill="red",N.style.fill="red"):at?(e.style.fill="yellow",N.style.fill="yellow"):(e.style.fill="lightgreen",N.style.fill="lightgreen")}let Ce=t.getElementById("arrowButton"),ze=0;function Ge(){0==ze?(R.style.display="inline",N.style.display="none"):(R.style.display="none",N.style.display="inline")}function He(e){return e>0&&p()>e}function Me(e){return e>0&&p()<e}Ce.onclick=function(e){ze=1-ze,Ge()},Ce.onactivate=Ce.onclick;const je=1*z,Le=.55*z;function Ae(){In=new Date;let e=t.getElementById("month"),n=t.getElementById("date"),l=t.getElementById("hour"),a=t.getElementById("minute");In.getTime()<_?(e.text=`${De}`,n.text=`${Se}`,l.text=`${ve}`,a.text=`${util.zeroPad(xe)}`,e.style.display="inline",n.style.display="inline",l.style.display="inline",a.style.display="inline",U.style.display="none",P.style.display="none",F.style.display="none",O.style.display="none",an.style.display="none"):(e.style.display="none",n.style.display="none",l.style.display="none",a.style.display="none",te&&(Ue(),F.style.display="inline"),an.style.display="inline",_=0)}function Ue(){if(In=new Date,te&&0==_&&0!=se){P.text=`${p()}`,P.style.fill=q.setColor(p());let e=In.getTime()-se,t=1;if((e/=6e4)<5?t=1:(e>5&&(e-=5),(t=(20-e)/20)<0&&(t=0),t>1&&(t=1)),P.style.fillOpacity=t,P.style.display="inline",(pe||fe||ge||he)&&p()>0&&0==t&&(P.style.fillOpacity=1,P.text=`${Math.floor(e)} mins old`),N.text=`${Math.floor(de+.5)}`,void 0!=me&&180!=me){let e=90-me;rt>Tn?(O.style.display="inline",U.style.display="none",$e(O),Tn=In.getTime()):(O.style.display="none",R.groupTransform.rotate.angle=e,$e(R),R.style.opacity=t,U.style.display="inline")}else U.style.display="none";Ge(),Re()}}function Re(){F.style.fill=_e>0?"red":0==_e?"green":"white"}function Ne(){m.poke(),u.connected?35!=l.modelId&&(e.granularity="seconds"):L&&(e.graularity="minutes")}function Oe(){m.aodActive&&pn(),In=new Date,ve=In.getHours(),xe=In.getMinutes(),Se=In.getDate(),De=In.getMonth()+1,H.updateClock(je,Le,Ie,Te,In,A);y.js.used,y.js.total;u.connected&&35!=l.modelId&&m.poke()}function Pe(e,t,n){if(!e.def||!t.def)return!1;let l=60*e.hours+e.minutes,a=60*t.hours+t.minutes,i=60*n.getHours()+n.getMinutes();if(l==a)return!1;if(l<a){if(l<i&&i<a)return!0}else{if(i>l)return!0;if(i<a)return!0}return!1}function We(e){(0==e||!Pe(qe,Je,e)&&(0==Wt||Wt<e.getTime()))&&(xt(g),m.poke())}function Fe(e){var t;try{s("forceExit");t=!0}catch(e){t=!1}if(t)We(e);else{i("forceExit",{time:e},"json");s("forceExit");n.exit()}}u.onchange=Ne;let Ye=0,_e=-1,qe={def:!1},Je={def:!1};function Ke(e){var t;return In=new Date,msg.peerSocket.readyState===msg.peerSocket.OPEN?(msg.peerSocket.send({command:e}),Ye=In.getTime(),_e<0?_e--:_e=-1,t=!0):(_e>0?_e++:_e=1,t=!1),Re(),Math.abs(_e)>10&&(pe>0||fe>0||ge>0||he>0)&&Fe(In),t}var Qe=t.getElementById("clicker");function Ve(e){let t=new Date(e);null==e||isNaN(e)?Ie=0:(Ie=new Date(t.getTime()+60*we*60*1e3-60*Ee*60*1e3),Te=new Date(t.getTime()+60*we*60*1e3))}Qe.onclick=function(e){0==_?(_=(_=new Date).getTime()+5e3,setTimeout(Ae,5e3),Ae()):(_=0,Ae())},e.ontick=(()=>Oe());let Xe=0;function Ze(){clearTimeout(Xe),et()}function et(){te&&(Ke("data")?(Xe&&clearTimeout(Xe),Xe=setTimeout(Ze,5e3)):(be&&clearTimeout(be),be=setTimeout(et,1e4)))}function tt(){return In=new Date,He(fe)&&In.getTime()>=ut||Me(pe)&&In.getTime()>=yt||He(he)&&In.getTime()>=pt||Me(ge)&&In.getTime()>=gt?wt():("inline"==ft.style.display&&bt(),"inline"==mt.style.display&&(mt.style.display="none"),0)}let nt=0,lt=0,at=!1;function it(e){if(at=!1,0==nt||0==lt)return;var t;let n=60*nt*1e3;for(t=0;t<ae.length&&e.getTime()-ae[t]<n;t++)if(rt>=ae[t])return;try{Math.abs(p()-f(le[t]))>lt&&(at=!0,We(e))}catch(e){}}function ot(e){1==e?(0==te&&(te=!0,et()),Y.style.display="inline",F.style.display="inline"):(te=!1,U.style.display="none",P.style.display="none",F.style.display="none",Y.style.display="none",O.style.display="none"),Ue()}function st(){He(ge+1)&&(gt=0),He(pe+1)&&(yt=0),Me(he-1)&&(pt=0),Me(fe-1)&&(ut=0)}let rt=0;msg.peerSocket.onmessage=(t=>{switch(In=new Date,t.data.key){case"bg":_e=0;let n=0;if(t.data.bg>0){oe=t.data.bg,se=t.data.date,re=t.data.period,de=t.data.delta,me=t.data.dir;let e=3e5;j&&(e=6e5),se-ae[0]>=e&&(n=1,le.unshift(oe),ae.unshift(se))}for(;ae.length>0&&(ae.length>q.maxBGs()||ae[ae.length-1]<In.getTime()-252e5);)n=1,le.pop(),ae.pop()>rt&&(rt=0);In.getTime()-se>=12e5&&(pe||fe||ge||he)?We(In):(st(),ke>0&&Math.abs(f(de))>=ke?We(In):!tt()&&oe<=40?We(0):it(In),n&&(Dt&&tn(le,ae,Zt),j&&q.updateRgraph(le,ae,z,C,rt,Zt))),t.data.update>0&&(ce=t.data.update,be&&clearTimeout(be),be=setTimeout(et,ce-In.getTime())),ot(1);break;case"ack":_e=0,Xe&&(clearTimeout(Xe),Xe=0),Re();break;case"podchange":let l=parseInt(t.data.value);we=parseInt(t.data.period),Ee=parseInt(t.data.before),Ve(l),Oe(),i("podchange",{podchange:l,period:we,before:Ee},"json");break;case"alarm":_t(t.data.number,t.data.value);break;case"mess":Jt(t.data.number,t.data.value);break;case"alarmsnooze":wn[t.data.number]=parseInt(t.data.value),i("alarmSnooze",wn,"json");break;case"timer":dt(t.data.number);break;case"limits":let a=t.data.UL,o=t.data.L,s=t.data.H,r=t.data.UH,c=t.data.diff;q.setUL(h(a)),q.setL(h(o)),q.setH(h(s)),q.setUH(h(r)),ge=a,pe=o,fe=s,he=r,ke=c,q.setULC(t.data.ULC),q.setLC(t.data.LC),q.setUHC(t.data.UHC),q.setHC(t.data.HC),q.setIRC(t.data.IRC),q.updateRgraph(le,ae,z,C,rt,Zt),Bt(),tt();break;case"predCol":q.setPC(t.data.value);break;case"long":nt=t.data.period,lt=t.data.diff;break;case"cal":rt=t.data.number;break;case"warn-start":if(""==t.data.value)qe={def:!1};else{let e=t.data.value.split(":");qe={hours:parseInt(e[0]),minutes:parseInt(e[1]),def:!0}}i("warn-start",qe,"json");break;case"warn-end":if(""==t.data.value)Je={def:!1};else{let e=t.data.value.split(":");Je={hours:parseInt(e[0]),minutes:parseInt(e[1]),def:!0}}i("warn-end",Je,"json");break;case"units":ie=t.data.value,tt();break;case"bgFont1":P.style.fontSize=t.data.number,N.style.fontSize=t.data.number;break;case"bgsnooze":vn[t.data.number]=parseInt(t.data.value),i("BGSnooze",vn,"json");break;case"defBgSz":xn=t.data.number;break;case"defAlmSz":En=t.data.number;break;case"ns":i("ns",{nsconfigured:t.data.number},"json"),ot(t.data.number);break;case"graphdata":let d=t.data.data;for(let e=0;e<t.data.data.length;e++)le[e]=d[e].s,ae[e]=d[e].d;setTimeout(function(){},0),Dt&&tn(le,ae,Zt);break;case"gradient":H.setGradColor(t.data.value);break;case"hour":H.setHourColor(t.data.value);break;case"minute":H.setMinColor(t.data.value);break;case"second":H.setSecColor(t.data.value);break;case"iobcob":ye=t.data.iob,ue=t.data.cob,Q.text=`IOB: ${ye}`,V.text=`COB: ${ue}`;break;case"urgent":Be=t.data.number,tt();break;case"message":I.style.display="inline",B.style.fill="white",k.onclick=At,k.style.fontSize=40,zt(t.data.value,!0);break;case"seconds":A=t.data.number,e.granularity=1==A?"seconds":"minutes",Oe();break;case"confDone":et()}try{o("forceExit")}catch(e){}});let ct=t.getElementById("timerWindow");function dt(e){let t=ct.getElementById("timer"),n=0,l=0;l=60*e,n=setInterval(function(){let e=Math.floor(l/60),a=l-60*e;if(t.text=`${util.zeroPad(e)}:${util.zeroPad(a)}`,--l<0)return l=0,clearInterval(n),ct.style.display="none",void xt(g);l<5&&r.start("bump"),ct.style.display="inline",m.poke()},1e3)}msg.peerSocket.onopen=(e=>{});let mt=t.getElementById("snoozeTimes"),yt=0,ut=0,gt=0,pt=0,ft=t.getElementById("BGgraph");ft.onactivate=Ct,ft.onclick=Ct;let ht=t.getElementById("suppress");function Bt(){i("BGLimits",{BGUL:ge,BGLow:pe,BGHigh:fe,BGUH:he,LS:yt,HS:ut,ULS:gt,UHS:pt,BGDiff:ke},"json")}function kt(e){mt.style.display="none",In=new Date,Me(ge)?(gt=In.getTime()+6e4*e,yt=gt):He(he)?(pt=In.getTime()+6e4*e,ut=pt):He(fe)?ut=In.getTime()+6e4*e:Me(pe)&&(yt=In.getTime()+6e4*e),Bt()}function bt(){k.style.display="none",B.style.display="none",b.style.display="none",ht.style.display="none",ft.style.display="none",r.stop(),clearTimeout(D),ln(2)}function It(){bt(),Pt("bg")}function Tt(){clearTimeout(D),D=setTimeout(Ht,1e4)}function wt(){if(0==p())return 0;if(p()>40){if(0==p()||(0==fe||p()<fe)&&(0==he||p()<he)&&(0==pe||p()>pe)&&(0==ge||p()>ge))return 0;if("inline"==mt.style.display)return 0}In=new Date,"none"!=fn.style.display&&pn(),B.style.fill=q.setColor(p()),B.style.display="inline",I.style.display="none",T.style.display="none";var e=!1,t=`${p()}`;He(he)?e=!0:He(fe)?0==he&&(e=!0):Me(ge)?e=!0:Me(pe)&&0==ge&&(e=!0),k.onclick=!e&&xn>0?function(){bt(),kt(xn)}:void 0;let n=!1;return!e&&Be&&Pe(qe,Je,In)||(n=!0),ft.style.display="inline",ht.style.display="inline",k.style.fontSize=80,k.textAnchor="middle",zt(t,n),1}var Et,vt;function xt(e){Et=e,vt=0,St()}function St(){r.start("confirmation-max"),vt<Et.length&&setTimeout(St,Et[vt++])}ht.onactivate=It,ht.onclick=It;let Dt=!1;function $t(){In=new Date,K=t.getElementById("graphWindow"),Q=K.getElementById("graphIOB"),V=K.getElementById("graphCOB"),X=K.getElementById("GraphDismiss"),Z=0,X.onclick=Vt,K.style.display="inline",Dt=!0,q.reset(),le.length>=q.maxBGs()?tn(le,ae,Zt):(setTimeout(function(){},0),Ke("graph"))}function Ct(){Z=wt,$t()}function zt(e,t,n){In=new Date,Dt&&(Dt=!1,K.style.display="none"),"none"!=fn.style.display&&pn(),B.style.display="inline",k.text=""!=e?e:"No message",k.style.display="inline",void 0!==n?(b.text=n,B.style.fill="white",k.style.fontSize=30,b.style.display="inline",T.style.display="inline",I.style.display="inline"):(b.text=`${In.getHours()}:${In.getMinutes()}`,T.style.display="none"),t&&(xt(g),m.poke(),Tt())}function Gt(e){if(In=new Date,-1!=S&&S!=e)return;if(void 0===w[e])return;if(e<10)w[e].hour,w[e].minute;S=e;let t="<no message>";try{t=a("mess"+e,"json").message}catch(e){}ft.style.display="none",ht.style.display="none",k.onclick=En>0?function(){Ot(),Ut(En)}:void 0,k.style.fontSize=40,zt(t,!0,timeStamp)}function Ht(){"inline"==k.style.display&&(r.start("nudge-max"),m.poke(),Tt())}function Mt(e){In=new Date;let t=new Date;t.setHours(w[e].hour,w[e].minute,0);let n=t.getTime()-In.getTime();n+=864e5,E[e]=setTimeout(jt,n,e)}function jt(e){Gt(e),e<10&&Mt(e)}function Lt(){In=new Date;for(let e=0;e<10;e++)v[e]>0&&v[e]-In.getTime()<0&&(S=e,ln(2))}function At(){In=new Date,k.style.display="none",B.style.display="none",b.style.display="none",I.style.display="none",T.style.display="none",r.stop(),-1!=S&&(Yt(S),$=S,qt(S),Lt(),S=-1)}function Ut(e){let t=e;In=new Date,-1!=S&&(Yt(S),v[S]=In.getTime()+60*t*1e3,x[S]=setTimeout(jt,60*t*1e3,S),$=S,qt(S),Lt(),S=-1),Rt.style.display="none",tt()}let Rt=t.getElementById("snoozeTimes");function Nt(){Pt("note")}function Ot(){sn.style.display="none",yn.style.display="none",k.style.display="none",B.style.display="none",b.style.display="none",I.style.display="none",T.style.display="none",clearTimeout(D),r.stop()}function Pt(e){var t;Ot(),t="comm"==e||"bg"==e?vn:wn;for(let n=0;n<8;n++){let l=Rt.getElementById(n.toString());l.getElementById("text").text=t[n];let a=t[n];switch(e){case"note":l.onclick=function(){Ut(a)},l.onactivate=l.onclick;break;case"comm":l.onclick=function(){Ft(a)},l.onactivate=l.onclick;break;case"bg":l.onclick=function(){kt(a)},l.onactivate=l.onclick}}Rt.style.display="inline"}let Wt=0;function Ft(e){In=new Date,Wt=In.getTime()+60*e*1e3;new Date(Wt);i("commsnooze",{time:Wt},"json"),Rt.style.display="none"}function Yt(e){clearTimeout(D),clearTimeout(x[e]),x[e]=0,v[e]=0}function _t(e,t){if(E[e]&&(clearTimeout(E[e]),S==e&&(Yt(e),S=-1)),void 0===t||""==t||isNaN(parseInt(t))){w[e]=void 0;try{o("note"+e)}catch(e){}}else{{let n=t.split(":");w[e]={hour:n[0],minute:n[1]},In=new Date;let l=new Date;l.setHours(n[0],n[1],0);let a=l.getTime()-In.getTime();a<0&&(a+=864e5),E[e]=setTimeout(jt,a,e)}qt(e)}}function qt(e){e>=10&&(w[e]={hour:0,minute:0});try{i("note"+e,{hour:w[e].hour,minute:w[e].minute,snooze:v[e]},"json")}catch(e){}}function Jt(e,t){i("mess"+e,{message:t},"json")}try{let e=a("podchange","json");Ve(e.podchange),we=e.period,Ee=e.before}catch(e){msg.peerSocket.readyState===msg.peerSocket.OPEN&&msg.peerSocket.send({command:"podchange"})}try{let e=a("BGLimits","json");ge=e.BGUL,pe=e.BGLow,fe=e.BGHigh,he=e.BGUH,yt=e.LS,ut=e.HS,gt=e.ULS,pt=e.UHS,ke=e.BGDiff}catch(e){yt=0,ut=0,gt=0,pt=0,ge=0,pe=0,fe=0,he=0,ke=0}for(let e=0;e<10;e++){In=new Date;try{let t=a("note"+e,"json");var Kt,Qt;try{let e=t.time;Kt=(e=e.value).hour,Qt=e.minute}catch(e){Kt=t.hour,Qt=t.minute}t.snooze>0&&(t.snooze>In.getTime()?(x[e]=setTimeout(jt,t.snooze-In.getTime(),e),v[e]=t.snooze):(S=e,ln(10))),_t(e,`${Kt}:${Qt}`)}catch(e){}}function Vt(){Dt=!1,K.style.display="none",Z&&Z()}function Xt(e){le=[],ae=[];let t=a(e,"cbor");for(let e=0;e<t.length;e++)le[e]=t[e].s,ae[e]=t[e].d;t=[],q.updateRgraph(le,ae,z,C,rt,Zt),Dt&&tn(le,ae,Zt)}W.onclick=function(e){Z=0,$t()},W.onactivate=W.onclick,d.onnewfile=(()=>{let e;do{"graph.json"==(e=d.nextFile())?Xt(e):"predict.json"==e&&en(e)}while(e)});var Zt=[];function en(e){Zt=a(e,"cbor"),console.log(`reading predictions file length is ${Zt.length}`),q.updateRgraph(le,ae,z,C,rt,Zt),Dt&&tn(le,ae,Zt)}function tn(e,t,n){var l,a;let i=K.getElementById("graphMin"),o=K.getElementById("graphMax"),s=K.getElementById("graphMinAt"),r=K.getElementById("graphMaxAt"),c=K.getElementById("graphStartAt"),d=K.getElementById("graphEndAt");var m,y,u;let g,p,h,B,k;try{m=K.getElementById("graphStart"),y=K.getElementById("graphEnd")}catch(e){}var b;j&&(u=K.getElementById("arcIn"),g=K.getElementById("arcAbove"),p=K.getElementById("arcBelow"),h=K.getElementById("timeAbove"),B=K.getElementById("timeIn"),k=K.getElementById("timeBelow")),q.reset(),(b=j?e.length:Zt.length>0?24:48)>e.length&&(b=e.length);let I=1e3,T=0;for(let n=0;n<b-1;n++)e[n]<I&&(I=e[n],l=t[n]),e[n]>T&&(T=e[n],a=t[n]);if(I--,T++,q.setBGYRange(I,T),j){let e=0,t=0,n=0;for(let l=0;l<b;l++)fe>0&&le[l]>fe?e++:pe>0&&le[l]<pe?t++:n++;e=100*e/b,t=100*t/b,n=100*n/b,h.text=`High: ${util.oneDecimal(e)}%`,B.text=`In: ${util.oneDecimal(n)}%`,k.text=`Low: ${util.oneDecimal(t)}%`,i.text=`Min: ${f(I)}`,o.text=`Max: ${f(T)}`,u.startAngle=0,u.sweepAngle=360*n/100,u.style.fill=q.IRC(),g.startAngle=360*n/100,g.sweepAngle=360*e/100,g.style.fill=q.HC(),p.startAngle=g.startAngle+g.sweepAngle,p.sweepAngle=360*t/100,p.style.fill=q.LC()}else if(Dt){if(m.text=nn(t[b-1]),y.text=nn(t[0]),Zt.length>0){let e=1e3,n=0;for(let t=0;t<Zt.length;t++)Zt[t]>n&&(n=Zt[t]),Zt[t]<e&&(e=Zt[t]);q.setPredYRange(e,n),y.text=nn(t[0]+72e5)}for(let e=0;e<n.length;e++)n[e]<I&&(I=n[e]),n[e]>T&&(T=n[e]);i.text=`${f(I)}`,o.text=`${f(T)}`}s.text=`${nn(l)}`,r.text=`${nn(a)}`,c.text=`Start: ${f(e[b-1])}`,d.text=`End: ${f(e[0])}`,Q.text="--",V.text="--",Ke("iobcob"),q.setBGColor("black"),q.update(e,t,rt,n),K.style.display="inline"}function nn(e){let t=new Date(e);return`${t.getHours()}:${util.zeroPad(t.getMinutes())}`}function ln(e){In=new Date,-1!=S&&(v[S]-In.getTime()<=1e3*e&&(v[S]=In.getTime()+1e3*e),E[S]=setTimeout(jt,v[S]-In.getTime(),S))}let an=t.getElementById("menu"),on=an.getElementById("menuButton");on.onclick=function(){sn.style.display="inline"};let sn=t.getElementById("menuWindow1"),rn=sn.getElementsByClassName("menuItem");for(let e=0;e<rn.length;e++){let t=sn.getElementById(e.toString()),n=t.getElementById("text");t.onclick=function(){cn(n.text)}}function cn(e){switch(e){case"Redo last alarm":$>=0&&(E[S=$]=0,v[$]=0,ln(1)),sn.style.display="none";break;case"Snooze Comm Warnings":Pt("comm");break;case"Current Suppressions":Bn();break;case"Cancel Suppressions":kn();break;case"Reset Interval":hn();break;default:sn.style.display="none"}}let dn=sn.getElementById("more");dn.onclick=function(){yn.style.display="inline"},dn.onactivate=dn.onclick;let mn=sn.getElementById("exit");mn.onclick=pn,mn.onactivate=pn;let yn=t.getElementById("menuWindow2");rn=yn.getElementsByClassName("menuItem");for(let e=0;e<rn.length;e++){let t=yn.getElementById(e.toString()),n=t.getElementById("text");t.onclick=function(){un(n.text)},t.onactivate=t.onclick}function un(e){switch(e){case"Current Suppressions":Bn();break;case"Cancel Suppressions":kn();break;case"Reset Interval":hn();break;default:yn.style.display="none"}}rn=void 0;try{let e=yn.getElementById("more");e.onclick=function(){},e.onactivate=e.onclick}catch(e){}let gn=yn.getElementById("exit");function pn(){B.style.display="none",k.style.display="none",yn.style.display="none",sn.style.display="none",fn.style.display="none"}gn.onclick=pn,gn.onactivate=pn;let fn=t.getElementById("noticeDismiss");function hn(){msg.peerSocket.send({command:"podreset"}),pn()}function Bn(){In=new Date,k.text="",k.style.fontSize=30,B.style.fill="white";let e=ut-In.getTime();ut&&e>0&&(k.text=`High BG: ${Math.floor(e/6e4)} mins`);let t=yt-In.getTime();yt&&t>0&&(k.text.length>0&&(k.text+="\n"),k.text+=`Low BG: ${Math.floor(t/6e4)} mins`);let n=gt-In.getTime();gt&&n>0&&(k.text.length>0&&(k.text+="\n"),k.text+=`Urg. Low BG: ${Math.floor(n/6e4)} mins`);let l=pt-In.getTime();pt&&l>0&&(k.text.length>0&&(k.text+="\n"),k.text+=`Urg. High BG: ${Math.floor(l/6e4)} mins`),Wt>In.getTime()&&(k.text.length>0&&(k.text+="\n"),k.text+=`Comm: ${Math.floor((Wt-In.getTime())/6e4)} mins`);for(let e=0;e<10;e++)v[e]>0&&(k.text.length>0&&(k.text+="\n"),k.text+=`Alarm ${e+1}: ${Math.floor((v[e]-In.getTime())/6e4)} mins`);0==k.text.length&&(k.text="No current suppressions"),yn.style.display="none",sn.style.display="none",B.style.display="inline",k.style.display="inline",fn.style.display="inline",fn.onclick=pn,fn.onactivate=pn}function kn(){ut=0,yt=0,pt=0,gt=0,Wt=0,Bt();for(let e=0;e<10;e++)Yt(e),qt(e);pn(),tt()}let bn=t.getElementById("menu-list"),In=new Date,Tn=In.getTime();try{let e=a("snooze","json"),t=e.timeout;-1!=e.number&&(t<In.getTime()&&(t=In.getTime()+1e4),t>In.getTime()&&(t-In.getTime()<=5e3&&(t=In.getTime()+5e3),x[S]=setTimeout(jt,t-In.getTime(),e.number),v[e.number]=t)),o("snooze")}catch(e){}let wn=[10,20,30,40,50,60,90,120],En=0,vn=[20,40,60,90,120,180,240,480],xn=0;try{qe=a("warn-start","json")}catch(e){qe={def:!1}}try{Je=a("warn-end","json")}catch(e){Je={def:!1}}try{let e=a("commsnooze","json");e&&(Wt=parseInt(e.time))}catch(e){}try{let e=a("ns","json");te=e.nsconfigured}catch(e){te=!1}te&&setTimeout(et,6e4),Ae(),m.aodAvailable&&n.permissions.granted("access_aod")&&(m.aodAllowed=!0);
