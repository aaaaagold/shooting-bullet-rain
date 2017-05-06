
"use strict";
//var debugFlag=0;
function switchAutoShot(){msgQ.sys.newMsg((keystat[kbdef.atk]=!keystat[kbdef.atk])?"auto shot enabled":"auto shot disabled");}
function switchMute(){
	muted=!muted;
	for(var j in htmlEle.sound) for(var i in htmlEle.sound[j]){
		htmlEle.sound[j][i].mute(muted);
	}
	msgQ.sys.newMsg(muted?"muted":"not muted");
}
function pressStart(){
	htmlEle.msg.start.style.display="none";
	pause=0;
}
function pressStart_mouse(){
	pressStart();
}
function pressStart_touch(){
	htmlEle.msg.start.removeEventListener('mousedown',pressStart);
	pressStart();
}
function initStart(){
	pause=1;
	sa(htmlEle.msg.start,'class','btn');
	htmlEle.msg.start.innerHTML="start";
	htmlEle.msg.start.style.display="block";
}
function pauseSwitch(){
	var htmlMsg=htmlEle.msg;
	if(pause){
		htmlMsg.pause.style.display="none";
	}else{
		htmlMsg.pause.style.display="block";
	}
	pause=!pause;
}
function pauseSwitch_mouse(){
	if(htmlEle.msg.start.style.display=="block"){pressStart_mouse();return;}
	pauseSwitch();
}
function pauseSwitch_touch(){
	if(htmlEle.msg.start.style.display=="block"){pressStart_touch();return;}
	pauseSwitch();
}

// class/foos
function initBoss(id,canvas,XY,WH,inertia,speed,maps,mapName,HP,MP){
	var rtv=new initObj("boss",id,canvas,XY,WH,inertia,speed,maps,mapName,HP,MP);
	rtv.ptr=new initObj("ptr","ptr-"+id,
		drawArc(newCanvas(40,40),[20,20],15,[0,2*Math.PI],'rgba(0,233,0,0.75)','0px','rgba(0,233,0,0.75)'),
		[0,consts.hideY],[0,0]
	);
	ac(htmlEle.ptr.boss,packObj([rtv.ptr])[0]);
	return rtv;
}
function refreshView(maps,view){
	let tmp;
	// physics
	tmp=maps.mapPhy.getNear(view.objDispWd,'');
	for(let x=0;x<tmp.length;x++) tmp[x].refresh();
	// effects
	tmp=maps.mapEff.getNear(view.objDispWd,'');
	for(let x=0;x<tmp.length;x++) tmp[x].refresh();
}
function updateBossStat(game,status,bossHitIt){
	if(bossHitIt==undefObj) bossHitIt=0;
	if(bossHitIt==-1) return;
	let b=game.boss[bossHitIt];
	if(b.cHP==0) game.ende=1;
	if(b.cHP<0) b.cHP=0;
	status.hp.innerHTML="HP: "+b.cHP;
	if(b.cMP<0) b.cMP=0;
	status.mp.innerHTML="MP: "+b.cMP;
}
function updatePlayerStat(game,status){
	var p=game.players[0];
	if(p.cHP==0) game.ende=-1;
	if(p.cHP<0) p.cHP=0;
	status.hp.innerHTML="HP: "+p.cHP;
	if(p.cMP<0) p.cMP=0;
	status.mp.innerHTML="MP: "+p.cMP;
}
function updatePannel(game,status){
	updateBossStat(game,status.boss);
	updatePlayerStat(game,status.player);
}
function _createHitEffect(map,effectList,XY,dXY){
	let hes=effectList;
	let it=hes.iter; hes.iter=(hes.iter+1)%hes.length;
	let he=effectList[it];
	if(he.html==undefObj) he.html=ge(he.id);
	if(he.html==null) return;
	he.mapUpdateTo(XY);
	//for(var x=0;x<XY.length;x++) he.XY[x]=XY[x];
	for(let x=0;x<XY.length;x++) he.inertia[x]=dXY[x]/4;
	while(he.html.childNodes.length) he.html.removeChild(he.html.childNodes[0]);
	ac(he.html,he.canvas[0]);
	he.animatedIt=1%he.canvas.length;
	he.disappear=0;
}
//function createHitEffectPlayer(game,XY,dXY){_createHitEffect(game.mapEffect,game.hitEffectsPlayer,XY,dXY);}
//function createHitEffectBoss(game,XY,dXY){_createHitEffect(game.mapEffect,game.hitEffectsBoss,XY,dXY);}
function moveHitEffects(game){
	let he=game.hitEffectsPlayer;
	let bhe=game.hitEffectsBoss;
	for(let x=0;x<he.length;x++){
		//var h=he[x];
		//moveObj(h,h.inertia);
		h.moveObj(h.inertia);
		//for(var z=0;z<h.inertia.length;z++) h.inertia[z]*=7/8;
	}
	for(let x=0;x<bhe.length;x++){
		//var h=bhe[x];
		//moveObj(h,h.inertia);
		h.moveObj(h.inertia);
		//for(var z=0;z<h.inertia.length;z++) h.inertia[z]*=7/8;
	}
}
function moveBullets(game){
	let setq;
	// players' bullets
	setq=game.bullets.q;
	while(setq.buff.length!=0 && game.bullets[setq.buff[0]].disappear==1) setq.pop();
	for(let x=0;x<setq.buff.length;x++){
		let i=setq.buff[x];
		if(game.bullets[i].move==undefObj) continue;
		game.bullets[i].move(game.boss[game.getNearestBossIt(game.bullets[i].XY)].XY);
	}
	// boss' bullets
	setq=game.bossBullets.q;
	while(setq.buff.length!=0 && game.bossBullets[setq.buff[0]].disappear==1) setq.pop();
	for(let x=0;x<setq.buff.length;x++){
		let i=setq.buff[x];
		if(game.bossBullets[i].move==undefObj) continue;
		game.bossBullets[i].move(game.players[0].XY);
	}
}
function createBosses(game,bossblkid,id){
}
function moveBoss(game){
	let bs=game.boss;
	let spd=consts.initMoveSpeed/2; // 2.3
	let ss=spd*spd;
	for(let x=0;x<bs.length;x++)
	{
		let oriMP=bs[x].cMP;
		game.moveBossAtk(x,htmlEle.sound);
		
		// boss moving
		
		let dx=game.players[0].XY[0]-bs[x].XY[0];
		if(ss<dx*dx) dx=dx<0?-spd:spd;
		bs[x].moveObj(minArr.new(dx,0),minArr.new(consts.minX,consts.minY),minArr.new(consts.maxX,consts.maxY));
		
		// update status
		if(bs[x].cMP<bs[x].mMP) bs[x].cMP+=1;
		if(bs[x].cMP!=oriMP) updateBossStat(game,htmlEle.status.boss,x);
	}
}
function collide(game,htmlStatus,htmlSound){
	let hit_playSound=0;
	// bullet X boss
	//var bu=game.bullets;
	let bo=game.boss;
	let bossHitIt=-1;
	for(let o=0;o<bo.length;o++)
	{
		if(bo[o].disappear) continue;
		let bu=game.map.getNear(bo[o],'bullet-player-');
		for(let u=0;u<bu.length;u++)
		{
			if(bu[u].disappear) continue;
			let dXY=minArr.minus(bo[o].XY,bu[u].XY);
				//dXY.length=Math.min(bo[o].XY.length, bu[u].XY.length);
				//for(var x=0;x<dXY.length;x++) dXY[x]=bo[o].XY[x]-bu[u].XY[x];
			let sWH=minArr.add(bo[o].WH,bu[u].WH);
				//sWH.length=Math.min(bo[o].WH.length, bu[u].WH.length);
				//for(var x=0;x<sWH.length;x++) sWH[x]=bo[o].WH[x]+bu[u].WH[x];
			let hit=1;
			for(let x=0;x<dXY.length && x<sWH.length;x++)
				if(4*dXY[x]*dXY[x] > sWH[x]*sWH[x])
					hit=0;
			if(hit){
				hit_playSound=1;
				bu[u].disappear=1;
				bo[o].cHP-=(bo[o].cHP<bu[u].cHP)?bo[o].cHP:bu[u].cHP;
				bossHitIt=o;
				//createHitEffectPlayer(game,bu[u].XY,bu[u].inertia);
				game.createHitEffectPlayer(bu[u].XY,bu[u].inertia);
				//msgQ.boss.newMsg('HP-'+bu[u].cHP);
			}
		}
	}
	if(bossHitIt!=-1) updateBossStat(game,htmlStatus.boss,bossHitIt);

	// bossbulles X player
	let p=game.players[0];
	let bbu=game.map.getNear(p,'bullet-boss-');
	//var bbu=game.bossBullets;
	let playerHit=0;
	for(let u=0;u<bbu.length;u++)
	{
		if(bbu[u].disappear) continue;
		let dXY=minArr.minus(p.XY,bbu[u].XY);
			//dXY.length=Math.min(p.XY.length, bbu[u].XY.length);
			//for(var x=0;x<dXY.length;x++) dXY[x]=p.XY[x]-bbu[u].XY[x];
		let sWH=minArr.add(p.WH,bbu[u].WH);
			//sWH.length=Math.min(p.WH.length, bbu[u].WH.length);
			//for(var x=0;x<sWH.length;x++) sWH[x]=p.WH[x]+bbu[u].WH[x];
		let hit=1;
		for(let x=0;x<dXY.length && x<sWH.length;x++)
			if(4*dXY[x]*dXY[x] > sWH[x]*sWH[x])
				hit=0;
		if(hit){
			hit_playSound=1;
			bbu[u].disappear=1;
			p.cHP-=(p.cHP<bbu[u].cHP)?p.cHP:bbu[u].cHP;
			//createHitEffectBoss(game,bbu[u].XY,bbu[u].inertia);
			game.createHitEffectBoss(bbu[u].XY,bbu[u].inertia);
			//msgQ.oth.newMsg('HP-'+bbu[u].cHP);
			playerHit=1;
		}
	}
	if(playerHit) updatePlayerStat(game,htmlStatus.player);
	if(hit_playSound) htmlSound.global.hit.play();
}
function eatDrop(game,htmlStatus,htmlSound){
	let parr=game.players;
	let darr=game.drops;
	let eat_playSound=0;
	for(let i=0;i<darr.length;i++){
		if(darr[i].disappear) continue;
		let dXY=minArr.minus(parr[0].XY,darr[i].XY);
		let sWH=minArr.add  (parr[0].WH,darr[i].WH);
		let eat=1;
		for(let x=0;x<dXY.length && x<sWH.length;x++)
			if(4*dXY[x]*dXY[x] > sWH[x]*sWH[x])
				eat=0;
		if(eat){
			eat_playSound=1;
			darr[i].disappear=1;
			for(let x in darr[i].enhance){
				if(parr[0].stat[x]==undefObj) parr[0].stat[x]=darr[i].enhance[x];
				else parr[0].stat[x]+=darr[i].enhance[x];
				//if(x=='batk') ge('dynamicstyle').innerHTML="#bullet-player>div>canvas{transform:scale("+(1+parr[0].stat[x]/10)+","+(1+parr[0].stat[x]/10)+") rotateX(180deg);}";
			}
			game.createHitEffectEnhance(darr[i].XY,darr[i].inertia);
			msgQ.oth.newMsg(darr[i].msg);
		}
	}
	if(eat_playSound) htmlSound.global.buffed.play();
}

function updatePtrs(game){
	let b=game.boss;
	//if(b==undefObj) return;
	for(let x=0;x<b.length;x++){
		let ptr=b[x].ptr;
		if(ptr.html==undefObj) ptr.html=ge(ptr.id);
		if(view_ldur.isOutOfRange(b[x].XY)){
			view_ldur.inRangeMove(ptr, minArr.minus(b[x].XY,ptr.XY));
			ptr.refresh();
			ptr.html.style.opacity="1";
		}else{
			ptr.html.style.opacity="0";
		}
	}
}
function moveCamera(currentPos,htmlView,resized){
	let updateFlag=resized?1:0;
	// 2.3
	let XY=minArr.copy(currentPos);
	let stl=htmlView.in.style;
	let stlxy={};
		stlxy[0]=Number(htmlView.in.style.left.slice(0,-2));
		stlxy[1]=Number(htmlView.in.style.top.slice(0,-2));
	let cwh={};
		cwh[0]=htmlView.out.clientWidth;
		cwh[1]=htmlView.out.clientHeight;
	let cwh4={};
		cwh4[0]=cwh[0]/4;
		cwh4[1]=cwh[1]/4;
	let dxy={};
		dxy[0]=XY[0]+stlxy[0];
		dxy[1]=XY[1]+stlxy[1];
	let cy=(cwh[1]-(consts.maxY-consts.minY))/2+"px";
	if((consts.maxX-consts.minX)<cwh[0]){
		if(htmlView.in.style.left!="0px"){
			updateFlag=1;
			htmlView.in.style.left="0px";
		}
	}else{
		let distx=0,M=-consts.minX-cwh4[0]*2,m=-consts.maxX+cwh4[0]*2;
		if(outOfRange(stlxy[0],m,M) || outOfRange(dxy[0],-cwh4[0],cwh4[0])){
			updateFlag=1;
			if(dxy[0]<0){
				distx=stlxy[0]-dxy[0]-cwh4[0];
			}else{
				distx=stlxy[0]-dxy[0]+cwh4[0];
			}
			htmlView.in.style.left=strictInRange(distx,m,M)+"px";
		}
	}
	if(consts.maxY-consts.minY<cwh[1]){
		if(htmlView.in.style.top!=cy){
			updateFlag=1;
			htmlView.in.style.top=cy;
		}
	}else{
		let disty=0,M=-consts.minY,m=-consts.maxY+cwh[1];
		if(outOfRange(stlxy[1],m,M) || outOfRange(dxy[1],cwh4[1],cwh4[1]*2)){
			updateFlag=1;
			if(dxy[1]<cwh4[1]){
				disty=stlxy[1]-dxy[1]+cwh4[1];
			}else{
				disty=stlxy[1]-dxy[1]+cwh4[1]*2;
			}
			htmlView.in.style.top=strictInRange(disty,m,M)+"px";
		}
	}
	// update boundary
	if(updateFlag){
		view_ldur.update(resized);
	}
}
function resetView(game,playView,view_ldur){
	moveCamera(game.players[0].XY,playView,1);
	updatePtrs(game);
	refreshView(game.maps,view_ldur);
}
function moveBgPos(playViewBg,dx,dy){
	let bgs=playViewBg.in.style,tmp=bgs.backgroundPosition.match(/(-?[0-9]*)px[ ]*(-?[0-9]*)px/);
	let basex=(tmp==null||tmp[1]=="")?0:Number(tmp[1]);
	let basey=(tmp==null||tmp[2]=="")?0:Number(tmp[2]);
	bgs.backgroundPosition=(basex+dx)+"px "+(basey+dy)+"px";
}
function updateTime(game,htmlTime){
	let sec_=game.frameTime*consts.updatePeriod;
	let sec=parseInt(sec_/1000);
	let min=parseInt(sec/60);
	let hr=parseInt(min/60);
	sec_%=1000;
	sec%=60;
	min%=60;
	if(hr<10) hr="0"+hr;
	if(min<10) min="0"+min;
	if(sec<10) sec="0"+sec;
	for(let x=0,s=3-sec_.toString().length;x<s;x++) sec_="0"+sec_;
	htmlTime.data.innerHTML=hr+":"+min+":"+sec+"."+sec_;
}
function mainloop1(game,htmlEle){
	if(pause && !nextFrame){
		updatePtrs(game);
		msgQ.sys.update();
		return;
	}
	nextFrame=0;
	if(game.ende!=0 && game.endless==0){
		let htmlEnd=htmlEle.ende;
		let type=(game.ende<0)?"lose":"win";
		let disp=htmlEnd[type].style.display;
		htmlEnd[type].style.display="block";
		sa(htmlEle.menu.rankSubmit,'class','btn');
		htmlEnd.parent.style.top=(htmlEnd.parent.parentNode.clientHeight-htmlEnd.parent.clientHeight)/2+"px";
		msgQ.sys.update();
		if(disp!="block" && game.ende>0){
			let ranksubmit=htmlEle.rankSubmit;
			htmlEle.sound.ende[type].play();
			game.updateResult();
			msgQ.sys.newMsg("your last result is prepared",99);
		}
		return;
	}
	//usrkb(game); // <- movePlayer(game);
	game.movePlayer0(keystat,htmlEle.sound);
	moveBoss(game);
	if(game.frameTime!=0 && parseInt(game.frameTime/32)==game.frameTime/32)
		game.createDrop(game.boss[0].XY,[0,-15]);
	moveCamera(game.players[0].XY,htmlEle.playView);
	moveBullets(game);
	game.moveDrop();
	//moveHitEffects(game); // extra movement
	refreshView(game.maps,view_ldur);
	collide(game,htmlEle.status,htmlEle.sound);
	eatDrop(game,htmlEle.status,htmlEle.sound);
	updatePtrs(game);
	moveBgPos(htmlEle.playViewBg,0,8);
	for(let x in msgQ) msgQ[x].update();
	updateTime(game,htmlEle.status.time);
	game.frameTime+=1;
}
function mainloop(game){
	setTimeout(function(){
		mainloop(game);
		mainloop1(game,htmlEle);
	},consts.updatePeriod);
}
function reduce_plus(pre,ths){return pre+ths;}
var varified=0,varifiedDoDone=0;
function varify(){return imgloaded.reduce(reduce_plus)==imgloaded.length;}
function varifiedDo(){
	// game
	game=new initGame(htmlEle.blk);
	// evts
	//   start banner
	//htmlEle.msg.start.innerHTML="loading...";
	ae(htmlEle.msg.start,'touchstart',pressStart_touch);
	ae(htmlEle.msg.start,'mousedown',pressStart_mouse);
	//   restart
	//ae(ge('menu-restart'),'mousedown',function(){ if(confirm('restart?')) game.reset(); });
	ae(ge(consts.restartConfirm),'mousedown',function(){ game.reset(); this.parentNode.parentNode.style.display="none"; msgQ.sys.newMsg("game reset",23); });
	//   reset camera
	//ae(ge('menu-resetView'),'mousedown',function(){ resetView(game,htmlEle.playView,view_ldur); });
	//   pause
	ae(htmlEle.menuFunction.pause,'click',pauseSwitch_mouse);
	//   touch-pannel
	for(let x=0;x<touchBtns.length;x++) {
		let div=ac(ge(touchBtns[x].id),drawImg(ce('canvas'),ge(touchBtns[x].imgid),touchBtns[x].deg));
		ae(div,'touchstart',touchStrt);
		ae(div,'touchend',touchEnd);
	}
	ae(ge(consts.touchPauseID),'touchstart',pauseSwitch_touch);
	ae(ge(consts.touchMuteID),'touchstart',switchMute);
	// pannel
	updatePannel(game,htmlEle.status);
	// mainloop
	moveCamera(game.players[0].XY,htmlEle.playView,1);
	updatePtrs(game);
	moveBgPos(htmlEle.playViewBg,0,0);
	mainloop(game);
	window.onresize=function(){
		resetView(game,htmlEle.playView,view_ldur);
	};
	initStart();
	varifiedDoDone=1;
}
function varifyLoop(){
	setTimeout(function(){
		let lp=16;
		htmlEle.msg.start.style.opacity=0.5+Math.abs(loadingClk%lp-lp/2)/lp+"";
		loadingClk=(loadingClk+1)%lp;
		if(varifiedDoDone==0) varifyLoop();
		if(varified==0 && varify()){
			varified=1;
			varifiedDo();
			//alert(htmlEle.msg.helpString);
		}
	},66);
}

// main
d.onselectstart=function(){return false}
// main-game
var game;
ae(d,'keydown',function(e){
	let evt=e||event;
	let k=evt.keyCode?evt.keyCode:evt.which;
	keystat_pre[k]=keystat[k];
	keystat[k]=1;
	switch(k){
	case kbdef.ultra:
		break;
	case kbdef.pause:
		pauseSwitch_mouse();
		break;
	case kbdef.mute:
		switchMute();
		break;
	case kbdef.restart:
		fullScreenMsgShow(htmlEle.fullScreenMsg.restart);
		break;
	case kbdef.help:
		fullScreenMsgShow(htmlEle.fullScreenMsg.help);
		break;
	case kbdef.close:
		fullScreenMsgHideAll();
		break;
	//case kbdef.msg:
	//	nomsg=!nomsg;
	//	break;
	default:
		break;
	}
	if(keystat[16])/* shift */{
		if(k==kbdef.restart) game.reset();
		if(k==73) /* I */ switchAutoShot();
	}
});
ae(d,'keyup',function(event){
	let k=event.keyCode?event.keyCode:event.which;
	keystat_pre[k]=keystat[k];
	keystat[k]=0;
});
for(let x=0;x<imgSet.length;x++){
	ge(imgSet[x].id).onload=imgload;
}
for(let x=0;x<imgSet.length;x++) setImg(imgSet[x].id,imgSet[x].path);
varifyLoop();
// evts
function fullScreenMsgHideAll(){ for(let x in htmlEle.fullScreenMsg) htmlEle.fullScreenMsg[x].style.display="none"; }
function fullScreenMsgBtn(me){
	if(me.style.display=="block") me.style.display="none";
	else{
		fullScreenMsgHideAll();
		me.style.display="block";
		if(!pause && game.ende==0) pauseSwitch();
	}
}
function fullScreenMsgShow(me){ if(me.style.display!="block") fullScreenMsgBtn(me); }
//   restartConfirm
ae(htmlEle.menu.restart,'mousedown',function(){ fullScreenMsgBtn(htmlEle.fullScreenMsg.restart); });
//   readme
//   readme-put_msg
ge(consts.msgPregame).childNodes[1].childNodes[0].innerHTML=("How to play?\n\n"+htmlEle.msg.helpString).replace(/\n/g,"<br>");
htmlEle.fullScreenMsg.help.style.display="block";
//   readme-evt
ae(htmlEle.menu.readme,'mousedown',function(){ fullScreenMsgBtn(htmlEle.fullScreenMsg.help); });
//ae(ge(consts.msgPregameClose),'mousedown',function(){this.parentNode.style.display="none";})
//   rank
//     rank-view
ae(htmlEle.menu.rankView,'mousedown',function(){ fullScreenMsgBtn(htmlEle.fullScreenMsg.rankView); });
function rankDataClear(htmlTarget){
	rmca(htmlTarget.childNodes[1]);
	rmca(htmlTarget.childNodes[0]);
}
function rankDataPut(htmlTarget,data){
	let names=htmlTarget.childNodes[0];
	let values=htmlTarget.childNodes[1];
	for(let x=0;x<data.length;x++){
		let divn=ce('div');
		divn.innerHTML=data[x].name;
		ac(names,divn);
		let divv=ce('div');
		divv.innerHTML=data[x].value;
		ac(values,divv);
	}
}
function rankRefreshAllQuery(){
	if (this.readyState==4 && this.status.toString().slice(0,1)=='2'){
		let res=JSON.parse(this.responseText);
		rankDataClear(htmlEle.rankView.dataTime);
		rankDataPut(htmlEle.rankView.dataTime,res['time']);
		rankDataClear(htmlEle.rankView.dataHp);
		rankDataPut(htmlEle.rankView.dataHp,res['php']);
	}
}
function rankRefreshAll(){
	const host=consts.rankServer;
	const query='getAll';
	var xx=new XMLHttpRequest();
	xx.onreadystatechange=rankRefreshAllQuery;
	xx.open('GET',"http://"+host+'?'+query, true);
	xx.send(null);
	console.log('send query');
}
ae(htmlEle.rankView.refreshAll,'mousedown',rankRefreshAll);
//     rank-submit
ae(htmlEle.menu.rankSubmit,'mousedown',function(){
	htmlEle.rankSubmit.confirm.innerHTML="confirm";
	fullScreenMsgBtn(htmlEle.fullScreenMsg.rankSubmit);
});
//     rank-submit-confirm
function rankSubmit(){
}
ae(htmlEle.rankSubmit.confirm,'mousedown',function(){
	if(game.isNoRankDataToSubmit()){
		this.innerHTML="no data to submit yet";
		return;
	}
	if(htmlEle.rankSubmit.input_id.value==""){
		this.innerHTML="please set your nickname, or the system will decide it for you.";
		return;
	}
	game.lastResult.id=htmlEle.rankSubmit.input_id.value;
	var rtv=confirm("your nick name: "+htmlEle.rankSubmit.input_id.value+"\nis that correct?\nWARNING: you CANNOT re-submit this result after submitting.");
	if(rtv) game.submitResult();
});
ae(htmlEle.rankSubmit.input_id,'focus',function(){ if(!game.isNoRankDataToSubmit()) htmlEle.rankSubmit.confirm.innerHTML="confirm"; });
//  fullScreenMsgClose
function fullScreenMsgClose(){this.parentNode.style.display="none";}
for(var x in htmlEle.fullScreenMsg) ae(htmlEle.fullScreenMsg[x].childNodes[0],'mousedown',fullScreenMsgClose);
//   touch-enabling
ae(ge('menu-touch'),'touchstart',function(){
	var ctls=ge('touch-ctl').style;
	if(this.touch){
		ctls.display="none";
		this.touch=0;
	}else{
		ctls.display="inline";
		this.touch=1;
	}
});
//  mute
ae(htmlEle.menuFunction.mute,'click',switchMute);
//  auto-shot
ae(htmlEle.menuFunction.auto.shot,'click',switchAutoShot);

