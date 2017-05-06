
"use strict";

// html
function htmlGamePlayView(IDin,IDout){
	if(IDin!=undefObj) this.in=ge(IDin);
	if(IDout!=undefObj) this.out=ge(IDout);
}
function htmlGamePlayBlk(playerID,bossID,bulletPlayerID,bulletBossID,hitEffectID,dropID){
	if(playerID!=undefObj) this.player=ge(playerID);
	if(bossID!=undefObj) this.boss=ge(bossID);
	if(bulletPlayerID!=undefObj) this.bulletPlayer=ge(bulletPlayerID);
	if(bulletBossID!=undefObj) this.bulletBoss=ge(bulletBossID);
	if(hitEffectID!=undefObj) this.hitEffect=ge(hitEffectID);
	if(dropID!=undefObj) this.drop=ge(dropID);
}
function htmlSound(soundID){
	this.primary=ge(soundID);
	this.createMore(3);
}
htmlSound.prototype.createMore=function(n){
	this.backups={}; this.backups.last=n;
	let neededAttr={"muted":0,"type":0};
	for(let x=1;x<=this.backups.last;x++){
		this.backups[x]=sa(ce('audio'),'id',this.primary.id+'-backup-'+x);
		sa(this.backups[x],'muted',this.primary.muted?"":"false");
		sa(this.backups[x],'type',ga(this.primary,'type'));
		ac(this.primary.parentNode,ac(this.backups[x],sa(ce('source'),'src',ga(this.primary.childNodes[0],'src'))));
	}
};
htmlSound.prototype.play=function(){
	if(muted) return;
	if(this.primary.paused){
		//this.primary.currentTime=0;
		this.primary.play();
		return;
	}
	for(let x=1;x<=this.backups.last;x++)
		if(this.backups[x].paused){
			//this.backups[x].currentTime=0;
			this.backups[x].play();
			return;
		}
	//this.backups[this.backups.last].pause();
	////this.backups[this.backups.last].currentTime=0;
	//this.backups[this.backups.last].play();
};
htmlSound.prototype.mute=function(muted){
	this.primary.muted=muted;
	for(let x=1;x<this.backups.last;x++) this.backups[x].muted=muted;
};
// key map
function kbObj(){
	// move
	this.left=c2i("A");
	this.down=c2i("S");
	this.up=c2i("W");
	this.right=c2i("D");
	this.atk=c2i("O");
	this.ultra=c2i("U");
	// sys
	this.pause=c2i("P");
	this.mute=c2i("M");
	this.restart=c2i("R");
	this.help=c2i("H");
	this.close=27;
	//this.msg=c2i("G");
}
// storage
function fixedCircularBuffer(size){
	this.iter=0;
	this.length=size;
	for(let x=0;x<this.length;x++) this[x]={};
}
fixedCircularBuffer.prototype.getNext=function(){
	let rtvit=this.iter;
	this.iter=(this.iter+1)%this.length;
	return this[rtvit];
};
fixedCircularBuffer.prototype.curr=function(){
	return this[this.iter];
};
function setQ(begin,end){
	this.buff=[];
	this.base=begin;
	this.bitMap=[]; this.bitMap.length=end-begin;
	for(let x=0;x<this.bitMap.length;x++) this.bitMap[x]=0;
}
setQ.prototype.push=function(n){
	if(this.bitMap[n-this.base]) return;
	this.bitMap[n-this.base]=1;
	this.buff.push(n);
};
setQ.prototype.pop=function(n){
	if(this.buff[0]==undefObj) return;
	this.bitMap[this.buff[0]-this.base]=0;
	this.buff.shift();
};
// msg
function classMsgQ(idBase,maxCnt,maxClk,htmlMsg){
	this.buff=[];
	this.idBase=idBase;
	this.maxCnt=maxCnt;
	this.maxClk=maxClk;
	this.sn=0;
	this.html=htmlMsg;
}
classMsgQ.prototype.update=function(){
	while(this.buff.length!=0 
		&& this.buff[0].clk==0 
		|| this.buff.length>this.maxCnt){
		this.buff[0].html.parentNode.removeChild(this.buff[0].html);
		this.buff.shift();
	}
	for(let x=0;x<this.buff.length;x++){
		this.buff[x].html.style.opacity=this.buff[x].clk/this.maxClk+"";
		this.buff[x].clk=this.buff[x].clk-1;
	}
}
classMsgQ.prototype.newMsg=function(msgString,addedClk){
	if(nomsg) return;
	let msg={};
	msg.msg=msgString;
	msg.clk=this.maxClk;
	if(addedClk!=undefObj) msg.clk+=addedClk;
	msg.id="msg-"+this.idBase+this.sn;
	this.sn=(this.sn+1)%256;
	this.buff.push(msg);
	let tmp=ge(msg.id);
	if(tmp!=null) tmp.parentNode.removeChild(tmp);
	msg.html=sa(ce('div'),'id',msg.id);
	msg.html.innerHTML=msg.msg;
	ac(this.html,msg.html);
	this.update();
};
classMsgQ.prototype.clearMsgs=function(){
	while(this.buff.length!=0){
		let tmp=ge(this.buff[0].id);
		if(tmp!=null) tmp.parentNode.removeChild(tmp);
		this.buff.shift();
	}
}
// obj
function initObj(type,id,canvas,XY,WH,inertia,speed,maps,mapName,HP,MP){
	this.type=type;
	this.id=id.toString();
	this.canvas=canvas;
	this.animated=(isundef(canvas.length)==false);
	this.animatedIt=0;
	this.XY=minArr.copy(XY);
		this.XY.init=minArr.copy(this.XY);
	this.disappear=0;
	//this.move=howToMove;
	
	// common
	switch(type){
	case "player":
	case "bullet":
	case "drop":
	case "boss":
		this.mHP=Number(HP);
		this.mMP=Number(MP);
	case "effect":
		this.WH=minArr.copy(WH);
		this.speed=speed;
		this.maps=maps;
		this.mapName=mapName;
	}
	switch(type){
	case "player":
	case "bullet":
	case "drop":
	case "effect":
		this.inertia={};
			this.inertia.length=inertia.length;
			for(let x=0;x<inertia.length;x++) this.inertia[x]=inertia[x];
	}
	// specialized
	switch(type){
	case "player":
		break;
	case "boss":
		break;
	case "bullet":
		this.isBullet=1;
		this.disappear=1;
		this.maps=maps;
		this.mapName=mapName;
		this.tracingBullet=0;
		this.bulletLife=0;
		break;
	case "effect":
		this.isEffect=1;
		this.disappear=1;
		break;
	case "drop":
		this.isDrop=1;
		this.disappear=1;
		break;
	default:
		break;
	}
	this.reset();
}
initObj.prototype.reset=function(){
	// for all
	for(let i=0;i<this.XY.init.length;i++) this.XY[i]=this.XY.init[i];
	// common
	switch(this.type){
	case "player":
		this.stat={};
	case "drop":
		for(let i=0;i<this.inertia.length;i++) this.inertia[i]=0;
	case "boss":
		this.cHP=this.mHP;
		this.cMP=this.mMP;
	}
	// specialized
	switch(this.type){
	case "boss":
		this.bossClk=0;
		this.atkTimes=0;
		this.atkType=-1;
		this.atkcd={};
			this.atkcd.length=16;
			for(let x=0;x<this.atkcd.length;x++) this.atkcd[x]=0;
		this.crazy=0;
	case "player":
		this.disappear=0;
		break;
	case "bullet":
	case "drop":
	case "effect":
		this.disappear=1;
		break;
	default:
		break;
	}
	if(ge(this.id)!=null){
		this.refresh();
		this.refresh();
	}
	//return this;
};
initObj.prototype.moveObj=function(dXY,minXY,maxXY){
	let tmpXY={}; tmpXY.length=this.XY.length;
	for(let x=0;x<this.XY.length;x++) tmpXY[x]=this.XY[x]+dXY[x];
	if(minXY!=undefObj) for(let x=0;x<tmpXY.length;x++) if(tmpXY[x]<minXY[x]) tmpXY[x]=minXY[x];
	if(maxXY!=undefObj) for(let x=0;x<tmpXY.length;x++) if(tmpXY[x]>maxXY[x]) tmpXY[x]=maxXY[x];
	if(this.id.slice(0,4)=="ptr-") this.XY=tmpXY;
	else this.mapUpdateTo(tmpXY);
	//this.XY=tmpXY;
	//return this;
};
initObj.prototype.mapUpdateTo=function(XY){
	this.maps[this.mapName].updateTo(this,XY);
	//return this;
};
initObj.prototype.move=function(game){};
initObj.prototype.refreshHide=function refreshHide(){
	this.inertia=[0,0];
	this.maps[this.mapName].remove(this);
	this.XY[1]=consts.hideY;
	//return this;
};
initObj.prototype.refresh=function refresh(){
	if(this.disappear){
		this.refreshHide();
	}
	else if(this.animated){
		while(this.html.childNodes.length) this.html.removeChild(this.html.childNodes[0]);
		let it=this.animatedIt; this.animatedIt=(this.animatedIt+1)%this.canvas.length;
		ac(this.html,this.canvas[it]);
		if(this.animatedIt==0 && this.isEffect==1) this.disappear=1;
	}
	if(typeof this.html.style!="object"){
		sa(this.html,'style','left:'+this.XY[0]+'px;top:'+this.XY[1]+'px;');
	}
	else{
		this.html.style.left=this.XY[0]+'px';
		this.html.style.top =this.XY[1]+'px';
		//this.html.style.transform="rotate()";
	}
	//return this;
};
// game
function initGame(htmlGamePlayBlk){

	// parseArg

	// initializing
	this.endless=0;
	this.ende=0;
	this.frameTime=0;
	this.lastResult={};
	//this.mod=[];
	//this.mod.char=[];
	//this.mod.bullet=[];
	{
		let Dx=consts.maxX-consts.minX, Dy=consts.maxY-consts.minY;
		let x=consts.minX-Dx,X=consts.maxX+Dx;
		let y=consts.hideY,Y=consts.maxY+Dy;
		this.mapEffect=newMap([[x,X],[y,Y]],[512,512]);
		this.map      =newMap([[x,X],[y,Y]],[256,256]);
		this.maps={};
		this.maps.mapPhy=this.map;
		this.maps.mapEff=this.mapEffect;
	}
	
	this.players=[];
	this.players[0]=new initObj("player",'player00',
		drawImgS(ge(consts.player0imgID),5,2),
		consts.playerInitXY,[40,40],
		[0,0],consts.initMoveSpeed,
		this.maps,'mapPhy',
		consts.maxHP,consts.maxMP);
	this.bullets=new fixedCircularBuffer(consts.maxBullet);
	this.bullets.parentId=htmlGamePlayBlk.bulletPlayer.id;
	{
		let r=6,w=r*2,h=r*2;
		for(let x=0;x<consts.maxBullet;x++){
			this.bullets[x]=new initObj("bullet",this.bullets.parentId+'-'+x,
				//drawImg(newCanvas(40,40),ge('img-bullet')),
				drawArc(newCanvas(40,40),[20,20],r,[0,2*Math.PI],'rgba(0,23,255,1)','0px','rgba(0,23,255,1)'),
				//drawFont(newCanvas(40,20),'NO!!','18px',"rgba(255,255,255,1)"),
				consts.hideInitXY,[w,h],
				[0,0],5,
				this.maps,'mapPhy',
				consts.bulletAtk,0
			);
			this.bullets[x].disappear=1;
			this.bullets[x].tracingBullet=1;
			this.bullets[x].bulletLife=consts.bulletLife;
		}
	}
	this.bullets.q=new setQ(0,consts.maxBullet);
	this.boss=[];
	let bossids=[consts.bossImgID];
	for(let x=0;x<bossids.length;x++)
	{
		this.boss[0]=initBoss(htmlGamePlayBlk.boss.id+'-'+bossids[x],
			//drawImg(newCanvas(),ge(bossids[x])),
			drawImgS(ge(bossids[x]),5,2),
			consts.bossInitXY,[80,80],
			[0,0],consts.initMoveSpeed/2,
			this.maps,'mapPhy',
			consts.maxHP*100,consts.maxMP*10);
		// this.boss[x].lv=10*x;
	}
	//this.boss[0].skill[0];
	this.bossBullets=new fixedCircularBuffer(consts.maxBossBullet);
	this.bossBullets.parentId=htmlGamePlayBlk.bulletBoss.id;
	{
		let r=7,w=r*2,h=r*2;
		for(let x=0;x<consts.maxBossBullet;x++){
			this.bossBullets[x]=new initObj("bullet",this.bossBullets.parentId+'-'+x,
				//drawImg(newCanvas(40,40),ge('test-arrow'),180),
				drawArc(newCanvas(40,40),[20,20],r,[0,2*Math.PI],'rgba(255,23,0,1)','0px','rgba(255,23,0,1)'),
				//drawFont(newCanvas(100,20),'UPGRADE','18px',"rgba(255,255,255,1)"),
				consts.hideInitXY,[w,h],
				[0,0],consts.initMoveSpeed,
				this.maps,'mapPhy',
				consts.bulletAtk,0
			);
			this.bossBullets[x].tracingBullet=1;
			this.bossBullets[x].bulletLife=consts.bulletLife;
		}
	}
	this.bossBullets.q=new setQ(0,consts.maxBossBullet);
	this.hitEffectsPlayer=new fixedCircularBuffer(consts.maxHitEffect);
	for(let x=0;x<consts.maxHitEffect;x++){
		this.hitEffectsPlayer[x]=new initObj("effect",htmlGamePlayBlk.hitEffect.id+'-player-'+x,
			newHitEffectCanvasStr(8,8,1.5,7,
				[23,23,255],1,
				'○'),
			consts.hideInitXY,[0,0],
			[0,0],0,
			this.maps,'mapEff'
		);
	}
	this.hitEffectsBoss=new fixedCircularBuffer(consts.maxHitEffect);
	for(let x=0;x<consts.maxHitEffect;x++){
		this.hitEffectsBoss[x]=new initObj("effect",htmlGamePlayBlk.hitEffect.id+'-boss-'+x,
			newHitEffectCanvasStr(8,8,2.5,7,
				[255,23,23],0.5,
				'○'),
			consts.hideInitXY,[0,0],
			[0,0],0,
			this.maps,'mapEff'
		);
	}
	this.hitEffectsEnhance=new fixedCircularBuffer(consts.maxHitEffect);
	for(let x=0;x<consts.maxHitEffect;x++){
		this.hitEffectsEnhance[x]=new initObj("effect",htmlGamePlayBlk.hitEffect.id+'-enhance-'+x,
			newHitEffectCanvasStr(16,16,8,7,
				[23,255,23],0.75,
				'○'),
			consts.hideInitXY,[0,0],
			[0,0],0,
			this.maps,'mapEff'
		);
	}
	this.dropTemplate={};
	this.dropTemplate[0]; // atk
	this.dropTemplate[1]; // more bullets @once
	this.dropTemplate[2]; // longer distance
	this.dropTemplate[3]; // faster
	this.dropTemplate[4]; // tracing
	// .enhance={'batk':1,'bsplit':1,'blife':1,'bspeed':1,'btrace':1};
	this.drops=new fixedCircularBuffer(consts.maxDrop);
	this.drops.parentId=htmlGamePlayBlk.drop.id;
	for(let x=0;x<this.drops.length;x++){
		switch(x%5){
		default:
			break;
		case 2:
		case 3:
		case 0:
			this.drops[x]=new initObj("drop",this.drops.parentId+'-'+x,
				newDropCanvasImg(ge('img-atk'),0.5,'roll',{'x':23,'y':11}),
				consts.hideInitXY,[40,40],
				[0,-5],5,
				this.maps,'mapPhy',
				0,0
			);
			this.drops[x].msg="atk++";
			this.drops[x].enhance={'batk':1};
			break;
		case 1:
			let h=drawImg(newCanvas(),ge('img-atk'),0,undefObj,undefObj,0,0,0.5,0.5);
			let q=drawImg(newCanvas(),h,0,undefObj,undefObj,0,0,0.5,0.5);
			clearCanvas(h);
			drawImg(h,q,0,h.width,h.height, q.width*0.5,    0, 1,1);
			drawImg(h,q,0,h.width,h.height, 0,       q.height, 1,1);
			drawImg(h,q,0,h.width,h.height, q.width, q.height, 1,1);
			this.drops[x]=new initObj("drop",this.drops.parentId+'-'+x,
				newDropCanvasImg(h,1,'roll',{'x':23,'y':11}),
				consts.hideInitXY,[40,40],
				[0,-5],5,
				this.maps,'mapPhy',
				0,0
			);
			this.drops[x].msg="split++";
			this.drops[x].enhance={'bsplit':1};
			break;
		case 4:
			this.drops[x]=new initObj("drop",this.drops.parentId+'-'+x,
				newDropCanvasImg(ge('img-trace'),0.5,'roll',{'x':23,'y':11}),
				consts.hideInitXY,[40,40],
				[0,-5],5,
				this.maps,'mapPhy',
				0,0
			);
			this.drops[x].msg="trace++";
			this.drops[x].enhance={'btrace':1};
			break;
		}
	}
	// appendChilds
	let divs;
	divs=this.packObj(this.players);
	for(let x=0;x<divs.length;x++) ac(htmlGamePlayBlk.player,divs[x]);
	divs=this.packObj(this.bullets);
	for(let x=0;x<divs.length;x++) ac(htmlGamePlayBlk.bulletPlayer,divs[x]);
	divs=this.packObj(this.boss);
	for(let x=0;x<divs.length;x++) ac(htmlGamePlayBlk.boss,divs[x]);
	divs=this.packObj(this.bossBullets);
	for(let x=0;x<divs.length;x++) ac(htmlGamePlayBlk.bulletBoss,divs[x]);
	divs=this.packObj(this.hitEffectsPlayer);
	for(let x=0;x<divs.length;x++) ac(htmlGamePlayBlk.hitEffect,divs[x]);
	divs=this.packObj(this.hitEffectsBoss);
	for(let x=0;x<divs.length;x++) ac(htmlGamePlayBlk.hitEffect,divs[x]);
	divs=this.packObj(this.hitEffectsEnhance);
	for(let x=0;x<divs.length;x++) ac(htmlGamePlayBlk.hitEffect,divs[x]);
	divs=this.packObj(this.drops);
	for(let x=0;x<divs.length;x++) ac(htmlGamePlayBlk.drop,divs[x]);
	this.reset();
}
initGame.prototype.resetMap=function(){
	this.map.cleanList();
	let arr;
	arr=this.players;
	for(let x=0;x<arr.length;x++) arr[x].mapUpdateTo(arr[x].XY);
	arr=this.boss;
	for(let x=0;x<arr.length;x++) arr[x].mapUpdateTo(arr[x].XY);
};
initGame.prototype.reset=function reset(){
	this.frameTime=0;
	let v;
	// clear key state
	v=keystat_pre;
	for(let x=0;x<v.length;x++) v[x]=0;
	v=keystat;
	for(let x=0;x<v.length;x++) v[x]=0;
	// init game var
	v=this.players;
	for(let x=0;x<v.length;x++) v[x].reset();
	v=this.boss;
	for(let x=0;x<v.length;x++) v[x].reset();
	v=this.bullets;
	for(let x=0;x<v.length;x++) v[x].reset();
	v=this.bossBullets;
	for(let x=0;x<v.length;x++) v[x].reset();
	v=this.hitEffectsPlayer;
	for(let x=0;x<v.length;x++) v[x].reset();
	v=this.hitEffectsBoss;
	for(let x=0;x<v.length;x++) v[x].reset();
	v=this.hitEffectsEnhance;
	for(let x=0;x<v.length;x++) v[x].reset();
	v=this.drops;
	for(let x=0;x<v.length;x++) v[x].reset();
	// adjust camera
	let stl=htmlEle.playView.in.style;
	stl.left="0px";
	stl.top="0px";
	moveCamera(this.players[0].XY,htmlEle.playView,1);
	// hide pause
	if(pause) pauseSwitch();
	// clear ends
	htmlEle.ende.lose.style.display="none";
	htmlEle.ende.win.style.display="none";
	this.ende=0;
	// refresh pannel
	updatePannel(this,htmlEle.status);
	// clear msgs
	for(let x in msgQ) if(x!='sys') msgQ[x].clearMsgs();
	// show start
	initStart();
	// reset searching map
	this.resetMap();
};
initGame.prototype.packObj=function(objs){
	let divs={};
	divs.length=objs.length;
	for(let x=0;x<objs.length;x++)
	{
		divs[x]=sa(ce('div'),'style',"left:"+objs[x].XY[0]+"px;top:"+objs[x].XY[1]+"px;");
		objs[x].html=sa(ac(divs[x],(objs[x].animated)?objs[x].canvas[0]:objs[x].canvas),'id',objs[x].id);
	}
	return divs;
};
initGame.prototype.getNearestBossIt=function(XY){
	let minDistIt=0;
	for(let bb=1;bb<this.boss.length;bb++){
		if(dist(XY,this.boss[bb].XY)<dist(XY,this.boss[minDistIt].XY))
			minDistIt=bb;
	}
	return minDistIt;
};
initGame.prototype.createBullet=function(bulletList,strtXY,emitDir,addedSpeed,bulletLife,addedatk,moveFunction,moveInfo){
	bulletList.q.push(bulletList.iter);
	let b=bulletList.getNext();
	b.disappear=0; b.bulletLife=bulletLife;
	b.move=moveFunction;
	b.moveSpeed=addedSpeed+b.speed;
	if(b.cHP!=b.mHP+addedatk){
		b.cHP=b.mHP+addedatk;
		let rate=(1+addedatk/10);
		let csstf="scale("+rate+","+rate+") rotateX(180deg)";
		if(b.canvas.length==undefObj) b.canvas.style.transform=csstf;
		else for(let x=0;x<b.canvas.length;x++) b.canvas[x].style.transform=csstf;
	}
	b.moveStat=0;
	b.frameTime=1;
	b.moveInfo=moveInfo; // [ [#frames,dir], ... ]
	let rate=(b.moveSpeed)/dist(emitDir);
	for(let x=0;x<emitDir.length;x++) b.inertia[x]=emitDir[x]*rate;
	b.mapUpdateTo(strtXY);
	//return b;
};
initGame.prototype.createEffect=function(effectList,XY,dXY){
	let he=effectList.getNext();
	if(he.html==undefObj) he.html=ge(he.id);
	if(he.html==null) return;
	he.mapUpdateTo(XY);
	//for(let x=0;x<XY.length;x++) he.XY[x]=XY[x];
	for(let x=0;x<XY.length;x++) he.inertia[x]=dXY[x]/4;
	while(he.html.childNodes.length) he.html.removeChild(he.html.childNodes[0]);
	ac(he.html,he.canvas[0]);
	he.animatedIt=1%he.canvas.length;
	he.disappear=0;
};
initGame.prototype.createHitEffectPlayer=function(XY,dXY){ this.createEffect(this.hitEffectsPlayer,XY,dXY); };
initGame.prototype.createHitEffectBoss=function(XY,dXY){ this.createEffect(this.hitEffectsBoss,XY,dXY); };
initGame.prototype.createHitEffectEnhance=function(XY,dXY){ this.createEffect(this.hitEffectsEnhance,XY,dXY); };
initGame.prototype.createDrop=function(XY,dXY){
	let dp=this.drops.getNext();
	if(dp.html==undefObj) dp.html=ge(dp.id);
	if(dp.html==null) return;
	//dp.html.style.opacity="1";
	dp.mapUpdateTo(XY);
	for(let x=0;x<XY.length;x++) dp.inertia[x]=dXY[x];
	while(dp.html.childNodes.length) dp.html.removeChild(dp.html.childNodes[0]);
	ac(dp.html,dp.canvas[0]);
	dp.animatedIt=1%dp.canvas.length;
	dp.disappear=0;
};
initGame.prototype.movePlayer0=function(keystat,htmlSound){
	let s=this.players[0].speed;
	let XY=this.players[0].XY;
	let l=keystat[kbdef.left];
	let d=keystat[kbdef.down];
	let u=keystat[kbdef.up];
	let r=keystat[kbdef.right];
	let a=keystat[kbdef.atk];
	let dXY=[(r-l)*s,(u-d)*s];
	this.players[0].moveObj(dXY,[consts.minX,consts.minY],[consts.maxX,consts.maxY]);
	//moveCamera(this.players[0].XY,htmlEle.playView);
	if(a){
		let atkinc=0; if(this.players[0].stat.batk!=undefObj) atkinc=this.players[0].stat.batk;
		htmlSound.global.shot.play();
		let life_1=parseInt(consts.bulletLife  );
		let life_2=parseInt(consts.bulletLife/2);
		let bmove=((this.players[0].stat.btrace!=undefObj) && this.players[0].stat.btrace>0)?(moves.bullet.hardTrace):(moves.bullet.softTrace);
		if((this.players[0].stat.btrace!=undefObj) && this.players[0].stat.btrace>0){
			this.createBullet(
				this.bullets, this.players[0].XY, [0,1], this.players[0].speed, life_1, atkinc,
				moves.bullet.hardTrace
			);
		}else{
			this.createBullet(
				this.bullets, this.players[0].XY, [0,1], this.players[0].speed, life_1, atkinc,
				moves.bullet.softTrace
			);
		}
		// this.players[0].stat.bsplit > 0
		{
			for(let x=1;x<4 && x<=this.players[0].stat.bsplit;x++)
			{
				let bmove=(x<this.players[0].stat.btrace)?(moves.bullet.hardTrace):(moves.bullet.softTrace);
				this.createBullet(
					this.bullets, this.players[0].XY, [ 1+x,7], this.players[0].speed, life_1, atkinc,
					bmove
				);
				this.createBullet(
					this.bullets, this.players[0].XY, [-1-x,7], this.players[0].speed, life_1, atkinc,
					bmove
				);
			}
		}
		/*
		if(this.players[0].stat.bsplit!=undefObj) switch(this.players[0].stat.bsplit){
		default:{
				let bmove=(2<this.players[0].stat.btrace)?(moves.bullet.hardTrace):(moves.bullet.softTrace);
				this.createBullet(
					this.bullets, this.players[0].XY, [ 1,1], this.players[0].speed, life_1, atkinc,
					bmove
				);
				this.createBullet(
					this.bullets, this.players[0].XY, [-1,1], this.players[0].speed, life_1, atkinc,
					bmove
				);
			}
		case 1:{
				let bmove=(1<this.players[0].stat.btrace)?(moves.bullet.hardTrace):(moves.bullet.softTrace);
				this.createBullet(
					this.bullets, this.players[0].XY, [ 1,2], this.players[0].speed, life_1, atkinc,
					bmove
				);
				this.createBullet(
					this.bullets, this.players[0].XY, [-1,2], this.players[0].speed, life_1, atkinc,
					bmove
				);
			}
		}
		*/
	}
};
// move-boss
//initGame.prototype.newMoveBossAtkInfo=function(mp,frame,cd,func){ return {"mp":mp,"frame":frame,"cd":cd,"func":func}; };
initGame.prototype.moveBossAtk=function(bossit,htmlSound){
	let life_1=parseInt(consts.bulletLife  );
	let life_2=parseInt(consts.bulletLife/2);
	let life_4=parseInt(consts.bulletLife/4);
	let atk=0;
	//let typecd=this.boss[bossit].atkcd[this.boss[bossit].atkType];
	let mp=[-2,2,3,5,7,11];
	let frame=[9,29,29,39,19,9];
	let cd=[0,0,9,19,19,39];
	if(this.boss[bossit].atkType==(this.boss[bossit].crazy?-5:-10)){
		let lv={0:2+cd[0]-this.boss[bossit].atkcd[0]}; lv.length=cd.length;
		if(this.boss[bossit].crazy==0 && this.boss[bossit].cHP*2<this.boss[bossit].mHP) lv[0]+=this.boss[bossit].mHP-this.boss[bossit].cHP;
		for(let x=1;x<lv.length;x++) lv[x]=1+cd[x]-this.boss[bossit].atkcd[x]+lv[x-1];
		let rnd=Math.random()*lv[lv.length-1];
		this.boss[bossit].atkType=lowerbound(lv,rnd);
		if(this.boss[bossit].crazy && this.boss[bossit].cMP<mp[this.boss[bossit].atkType]*frame[this.boss[bossit].atkType])
			this.boss[bossit].atkType=Math.random()<0.125?999:0;
	}
	if(this.boss[bossit].atkType>=0) switch(this.boss[bossit].atkType){
	case 0:
		if(this.boss[bossit].atkcd[this.boss[bossit].atkType]>0){
			this.boss[bossit].atkType=-1;
			break;
		}
		if(this.boss[bossit].atkTimes>frame[this.boss[bossit].atkType] || this.boss[bossit].cMP<mp[this.boss[bossit].atkType]){
			this.boss[bossit].atkTimes=0;
			this.boss[bossit].atkcd[this.boss[bossit].atkType]=cd[this.boss[bossit].atkType];
			this.boss[bossit].atkType=-1;
			break;
		}
		if(this.boss[bossit].atkTimes==0){
			htmlSound.bossAtk[this.boss[bossit].atkType].play();
			msgQ.boss.newMsg("recovering MP");
		}
		if(this.boss[bossit].crazy==0 && this.boss[bossit].cHP*2<this.boss[bossit].mHP){
			if(this.boss[bossit].atkTimes==frame[this.boss[bossit].atkType]) this.boss[bossit].crazy=1;
			if((this.boss[bossit].atkTimes&3)==0){
				this.createHitEffectEnhance(this.boss[bossit].XY,[0,0]);
				htmlSound.bossAtk['T'].play();
				if(this.boss[bossit].atkTimes==0) msgQ.boss.newMsg("crazy");
			}
		}
		this.boss[bossit].cMP-=((this.boss[bossit].crazy)?mp[this.boss[bossit].atkType]*3:mp[this.boss[bossit].atkType]); if(this.boss[bossit].cMP>this.boss[bossit].mMP) this.boss[bossit].cMP=this.boss[bossit].mMP;
		atk=1;
		break;
	case 1:
		if(this.boss[bossit].atkcd[this.boss[bossit].atkType]>0){
			this.boss[bossit].atkType=-1;
			break;
		}
		if(this.boss[bossit].atkTimes>29 || this.boss[bossit].cMP<mp[this.boss[bossit].atkType]){
			this.boss[bossit].atkTimes=0;
			this.boss[bossit].atkcd[this.boss[bossit].atkType]=cd[this.boss[bossit].atkType];
			this.boss[bossit].atkType=-1;
			break;
		}
		if(this.boss[bossit].atkTimes==0){
			htmlSound.bossAtk[this.boss[bossit].atkType].play();
			//msgQ.boss.newMsg("");
		}
		if(this.boss[bossit].crazy==1 || this.boss[bossit].atkTimes&1){
			game.createBullet(
				game.bossBullets, this.boss[bossit].XY, [-1,-1], this.boss[bossit].speed, life_1, 0,
				moves.bullet.softTrace
			);
			game.createBullet(
				game.bossBullets, this.boss[bossit].XY, [ 0,-1], this.boss[bossit].speed, life_1, 0,
				moves.bullet.softTrace
			);
			game.createBullet(
				game.bossBullets, this.boss[bossit].XY, [ 1,-1], this.boss[bossit].speed, life_1, 0,
				moves.bullet.softTrace
			);
			this.boss[bossit].cMP-=mp[this.boss[bossit].atkType];
		}
		atk=1;
		break;
	case 2:
		if(this.boss[bossit].atkcd[this.boss[bossit].atkType]>0){
			this.boss[bossit].atkType=-1;
			break;
		}
		if(this.boss[bossit].atkTimes>29 || this.boss[bossit].cMP<mp[this.boss[bossit].atkType]){
			this.boss[bossit].atkTimes=0;
			this.boss[bossit].atkcd[this.boss[bossit].atkType]=cd[this.boss[bossit].atkType];
			this.boss[bossit].atkType=-1;
			break;
		}
		if(this.boss[bossit].atkTimes==0){
		   htmlSound.bossAtk[this.boss[bossit].atkType].play();
			msgQ.boss.newMsg("one traced");
		}
		if(this.boss[bossit].crazy==1 || this.boss[bossit].atkTimes&1){
			game.createBullet(
				game.bossBullets, this.boss[bossit].XY, [ 0,-1], this.boss[bossit].speed-5, life_1, 0,
				moves.bullet.hardTrace
			);
			this.boss[bossit].cMP-=mp[this.boss[bossit].atkType];
		}
		atk=1;
		break;
	case 3:
		if(this.boss[bossit].atkcd[this.boss[bossit].atkType]>0){
			this.boss[bossit].atkType=-1;
			break;
		}
		if(this.boss[bossit].atkTimes>39 || this.boss[bossit].cMP<mp[this.boss[bossit].atkType]){
			this.boss[bossit].atkTimes=0;
			this.boss[bossit].atkcd[this.boss[bossit].atkType]=cd[this.boss[bossit].atkType];
			this.boss[bossit].atkType=-1;
			break;
		}
		if(this.boss[bossit].atkTimes==0){
			htmlSound.bossAtk[this.boss[bossit].atkType].play();
			msgQ.boss.newMsg("rain");
		}
		if(this.boss[bossit].crazy==1 || this.boss[bossit].atkTimes&1){
			let tracks=moves.bullet.track.type1;
			for(let x=0;x<tracks.length;x++)
				game.createBullet(
					game.bossBullets, this.boss[bossit].XY, {}, this.boss[bossit].speed, life_1, 0,
					moves.bullet.edgesTrace, tracks[x]
				);
			this.boss[bossit].cMP-=mp[this.boss[bossit].atkType];
		}
		atk=1;
		break;
	case 4:
		if(this.boss[bossit].atkcd[this.boss[bossit].atkType]>0){
			this.boss[bossit].atkType=-1;
			break;
		}
		if(this.boss[bossit].atkTimes>19 || this.boss[bossit].cMP<mp[this.boss[bossit].atkType]){
			this.boss[bossit].atkTimes=0;
			this.boss[bossit].atkcd[this.boss[bossit].atkType]=cd[this.boss[bossit].atkType];
			this.boss[bossit].atkType=-1;
			break;
		}
		if(this.boss[bossit].atkTimes==0){
			htmlSound.bossAtk[this.boss[bossit].atkType].play();
			msgQ.boss.newMsg("cannon");
		}
		if(this.boss[bossit].crazy==1 || this.boss[bossit].atkTimes&1){
			game.createBullet(
				game.bossBullets, this.boss[bossit].XY, [ 1, 0], this.boss[bossit].speed-5, life_4, 0,
				moves.bullet.hardTrace
			);
			game.createBullet(
				game.bossBullets, this.boss[bossit].XY, [ 1,-2], this.boss[bossit].speed, life_1, 0,
				moves.bullet.softTrace
			);
			game.createBullet(
				game.bossBullets, this.boss[bossit].XY, [ 0,-1], this.boss[bossit].speed-5, life_2, 0,
				moves.bullet.hardTrace
			);
			game.createBullet(
				game.bossBullets, this.boss[bossit].XY, [-1,-2], this.boss[bossit].speed, life_1, 0,
				moves.bullet.softTrace
			);
			game.createBullet(
				game.bossBullets, this.boss[bossit].XY, [-1, 0], this.boss[bossit].speed-5, life_4, 0,
				moves.bullet.hardTrace
			);
			this.boss[bossit].cMP-=mp[this.boss[bossit].atkType];
		}
		atk=1;
		break;
	case 5:
		if(this.boss[bossit].atkcd[this.boss[bossit].atkType]>0){
			this.boss[bossit].atkType=-1;
			break;
		}
		if(this.boss[bossit].atkTimes>9 || this.boss[bossit].cMP<mp[this.boss[bossit].atkType]){
			this.boss[bossit].atkTimes=0;
			this.boss[bossit].atkcd[this.boss[bossit].atkType]=cd[this.boss[bossit].atkType];
			this.boss[bossit].atkType=-1;
			break;
		}
		if(this.boss[bossit].atkTimes==0){
		   htmlSound.bossAtk[this.boss[bossit].atkType].play();
			msgQ.boss.newMsg("multiple traced");
		}
		if(this.boss[bossit].crazy==1 || this.boss[bossit].atkTimes&1){
			game.createBullet(
				game.bossBullets, this.boss[bossit].XY, [ 2,-1], this.boss[bossit].speed- 5, life_1, 0,
				moves.bullet.hardTrace
			);
			game.createBullet(
				game.bossBullets, this.boss[bossit].XY, [ 1,-2], this.boss[bossit].speed-10, life_2, 0,
				moves.bullet.hardTrace
			);
			game.createBullet(
				game.bossBullets, this.boss[bossit].XY, [ 0,-1], this.boss[bossit].speed- 5, life_1, 0,
				moves.bullet.hardTrace
			);
			game.createBullet(
				game.bossBullets, this.boss[bossit].XY, [-1,-2], this.boss[bossit].speed-10, life_2, 0,
				moves.bullet.hardTrace
			);
			game.createBullet(
				game.bossBullets, this.boss[bossit].XY, [-2,-1], this.boss[bossit].speed- 5, life_1, 0,
				moves.bullet.hardTrace
			);
			this.boss[bossit].cMP-=mp[this.boss[bossit].atkType];
		}
		atk=1;
		break;
	default:
		if(this.boss[bossit].atkTimes==0){
			htmlSound.bossAtk[this.boss[bossit].atkType,0].play();
			msgQ.boss.newMsg("recovering all MP");
		}
		this.createHitEffectEnhance(this.boss[bossit].XY,[0,0]);
		this.boss[bossit].cMP=this.boss[bossit].mMP;
		this.boss[bossit].atkType=-1;
		break;
	}else{
		this.boss[bossit].atkType-=1;
	}
	if(atk) this.boss[bossit].atkTimes+=1;
	for(let x=0;x<this.boss[bossit].atkcd.length;x++)
		if(this.boss[bossit].atkcd[x]>0)
			this.boss[bossit].atkcd[x]-=1;
};
initGame.prototype.moveDrop=function(){
	for(let x=0;x<this.drops.length;x++){
		if(this.drops[x].disappear==1) continue;
		if(this.drops[x].XY[1]<consts.minY) this.drops[x].disappear=1;
		this.drops[x].moveObj(this.drops[x].inertia);
	}
};
initGame.prototype.updateResult=function(){
	this.lastResult.time=game.frameTime*consts.updatePeriod/1000;
	this.lastResult.php=this.players[0].cHP;
	this.lastResult.bhp=this.boss[0].cHP;
	this.lastResult.c=this.boss[0].crazy;
};
initGame.prototype.isNoRankDataToSubmit=function(){ return (this.lastResult.time==undefObj || this.lastResult.php==undefObj || this.lastResult.bhp==undefObj ); };
initGame.prototype.submitResult=function(){
	if(this.isNoRankDataToSubmit()) return;
	const host=consts.rankServer;
	const query='submit'+JSON.stringify(this.lastResult);
	var xx=new XMLHttpRequest();
	xx.onreadystatechange=function(){ if(this.readyState==4 && this.status.toString().slice(0,1)=='2'){ msgQ.sys.newMsg('submission succeeded'); if(rankRefreshAll!=undefObj) rankRefreshAll(); } };
	xx.open('GET',"http://"+host+'?'+query, true);
	xx.send(null);
	this.lastResult={};
};
initGame.prototype.loadRanks=function(){
};
// bullet
function bulletTrackPartInfo(timeMax,attack,isTrace,targetXY,speedType,speed_s,speed_e,speed_m){
	this.time=timeMax;
	this.attack=attack;
	if(isTrace) this.targetXY=targetXY;
	else{
		this.targetXY={};
			this.targetXY.length=targetXY.length;
			for(let x=0;x<this.targetXY.length;x++) this.targetXY[x]=targetXY[x];
	}
	this.speedType=(typeof speedType=="number")?speedType:this.speedTypeString2int[speedType];
	this.speed_s=speed_s; // start speed
	this.speed_e=speed_e; // last speed
	this.speed_m=speed_m; // middle speed for higher order
}
bulletTrackPartInfo.prototype.speedTypeString2int=['linear','second-order','exp'];
function bulletTrackPart(type,time,info){
	this.type=type;
	this.time=time;
	this.info=info;
}
bulletTrackPart.prototype.dXY=function(bulletObj){
	let speed=0;
	let dir={};
		dir.length=this.targetXY.length;
		for(let x=0;x<this.targetXY.length;x++) dir[x]=this.targetXY[x]-bulletObj.XY[x];
	switch(this.speedType){
	default:
	case 0:
		speed=(this.speed_e-this.speed_s)*(bulletObj.timePass/this.timeMax)+this.speed_s;
		break;
	case 1:
		break;
	case 2:
		break;
	}
	let ratio=speed/dist(dir);
	for(let x=0;x<dir.length;x++) dir[x]*=ratio;
	return dir;
};
function bulletTrackModel(strt,dure,hitt,ende){
	this.strt=strt;
	this.dure=dure;
	this.hitt=hitt;
	this.ende=ende;
}
// skill
function initSkill(prob,mp,bullets,targeting){
	if(targeting==undefObj) targeting=0;
	this.prob=prob;
	this.mp=mp;
	this.bullets=bullets;
	this.targeting=targeting;
}

