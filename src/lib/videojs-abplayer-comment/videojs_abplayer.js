import videojs from 'video.js/core';
import { CommentManager } from './CommentCoreLibrary';

export function initPlugin() {
	videojs.plugin('ABP', ABPinit);
}

function ABPinit(){
	function Danmu(ele){
		///////////////////////////////////////////
		///Prepare the html element for the plugin.
		///////////////////////////////////////////
		const _this=this;
		this.danmuDiv = document.createElement('div');
		this.danmuDiv.className = 'vjs-danmu';
		ele.el().insertBefore(this.danmuDiv,ele.el().getElementsByClassName('vjs-poster')[0]);

		this.danmuShowControl = document.createElement('div');
		this.danmuShowControl.className = 'vjs-danmu-control vjs-menu-button vjs-control';
		this.danmuShowControlContent = document.createElement('span');
		this.danmuShowControlContent.className = 'glyphicon glyphicon-eye-open';
		this.danmuShowControl.appendChild(this.danmuShowControlContent);
		ele.el().getElementsByClassName('vjs-control-bar')[0].appendChild(this.danmuShowControl);

		///////////////////////////////////////////
		//Bind CommentManager.
		///////////////////////////////////////////
		if(typeof CommentManager !== "undefined"){
			this.cmManager = new CommentManager(this.danmuDiv);
			this.cmManager.display = true;
			this.cmManager.init();
			this.cmManager.clear();

			//Bind control to video.
			var video=ele.el().children[0];
			var lastPosition = 0;
			video.addEventListener("progress", function(){
				if(lastPosition === video.currentTime){
					video.hasStalled = true;
					_this.cmManager._stopTimer();
				}else
				lastPosition = video.currentTime;
			});

			video.addEventListener("timeupdate", function(){
				if(_this.cmManager.display === false) return;
				if(video.hasStalled){
					_this.cmManager._startTimer();
					video.hasStalled = false;
				}
				_this.cmManager.time(Math.floor(video.currentTime * 1000));
			});

			video.addEventListener("play", function(){
				_this.cmManager._startTimer();
			});

			video.addEventListener("pause", function(){
				_this.cmManager._stopTimer();
			});

			video.addEventListener("waiting", function(){
				_this.cmManager._stopTimer();
			});

			video.addEventListener("playing",function(){
				_this.cmManager._startTimer();
			});

			video.addEventListener("seeked",function(){
				_this.cmManager.clear();
			});

			if(window){
				window.addEventListener("resize", function(){
					_this.cmManager.setBounds();
				});
			}

			//Bind Control to button
			this.danmuShowControl.addEventListener("click", function(){
				if(_this.cmManager.display === true){
					_this.cmManager.display=false;
					_this.cmManager.clear();
					_this.danmuShowControlContent.setAttribute("class","glyphicon glyphicon-eye-close");
				}else{
					_this.cmManager.display=true;
					_this.danmuShowControlContent.setAttribute("class","glyphicon glyphicon-eye-open");
				}
			});

			//Create Load function
			this.load = function(url,callback){
				if(callback == null)
					callback = function(){return;};
				let xmlhttp;
				if (window.XMLHttpRequest){
					xmlhttp=new XMLHttpRequest();
				}
				else{
					xmlhttp=new window.ActiveXObject("Microsoft.XMLHTTP");
				}
				xmlhttp.open("GET",url,true);
				xmlhttp.send();
				var cm = this.cmManager;
				var cmvideo = video;
				xmlhttp.onreadystatechange = function(){
					if (xmlhttp.readyState === 4 && xmlhttp.status === 200){
						if(navigator.appName === 'Microsoft Internet Explorer'){
							var f = new window.ActiveXObject("Microsoft.XMLDOM");
							f.async = false;
							f.loadXML(xmlhttp.responseText);
							cm.load(BilibiliParser(f));
							cm.seek(cmvideo.currentTime*1000);
							callback(true);
						}else{
							const parser = new DOMParser();
							const xmlDoc = parser.parseFromString(xmlhttp.responseText, "text/xml");
							cm.seek(cmvideo.currentTime*1000);
							cm.load(BilibiliParser(xmlDoc));
							callback(true);
						}
					}else
					  callback(false);
				}
			}

		}
		return this;
	}
	this.danmu = new Danmu(this);
}

/** 
Bilibili Format
Licensed Under MIT License
 Takes in an XMLDoc and parses that into a Generic Comment List
**/
function BilibiliParser(xmlDoc){
	//Parse into Array
	function fillRGB(string){
		while(string.length < 6){
			string = "0" + string;
		}
		return string;
	}
	
	//Format the bili output to be json-valid
	function format(string){
		return string.replace(/\t/,"\\t");	
	}
	
	var elems = xmlDoc.getElementsByTagName('d');
	var tlist = [];
	for(var i=0;i<elems.length;i++){
		if(elems[i].getAttribute('p') != null){
			var opt = elems[i].getAttribute('p').split(',');
			var text = elems[i].childNodes[0].nodeValue;
			var obj = {};
			obj.stime = Math.round(parseFloat(opt[0]*1000));
			obj.size = parseInt(opt[2]);
			obj.color = "#" + fillRGB(parseInt(opt[3]).toString(16));
			obj.mode = parseInt(opt[1]);
			obj.date = parseInt(opt[4]);
			obj.pool = parseInt(opt[5]);
			if(opt[7] != null)
				obj.dbid = parseInt(opt[7]);
			obj.hash = opt[6];
			obj.border = false;
			if(obj.mode < 7){
				obj.text = text.replace(/(\/n|\\n|\n|\r\n)/g, "\n");
			}else{
				if(obj.mode === 7){
					try{
						const adv = JSON.parse(format(text));
						obj.shadow = true;
						obj.x = parseInt(adv[0]);
						obj.y = parseInt(adv[1]);
						obj.text = adv[4].replace(/(\/n|\\n|\n|\r\n)/g, "\n");
						obj.rZ = 0;
						obj.rY = 0;
						if(adv.length >= 7){
							obj.rZ = parseInt(adv[5]);
							obj.rY = parseInt(adv[6]);
						}
						obj.movable = false;
						if(adv.length >= 11){
							obj.movable = true;
							obj.toX = adv[7];
							obj.toY = adv[8];
							obj.moveDuration = 500;
							obj.moveDelay = 0;
							if(adv[9]!=='')
								obj.moveDuration = adv[9];
							if(adv[10]!=="")
								obj.moveDelay = adv[10];
							if(adv.length > 11){
								obj.shadow = adv[11];
								if(obj.shadow === "true"){
									obj.shadow = true;
								}
								if(obj.shadow === "false"){
									obj.shadow = false;
								}
								if(adv[12]!=null)
									obj.font = adv[12];
							}
						}
						obj.duration = 2500;
						if(adv[3] < 12){
							obj.duration = adv[3] * 1000;
						}
						obj.alphaFrom = 1;
						obj.alphaTo = 1;
						var tmp = adv[2].split('-');
						if(tmp != null && tmp.length>1){
							obj.alphaFrom = parseFloat(tmp[0]);
							obj.alphaTo = parseFloat(tmp[1]);
						}
					}catch(e){
						console.log('[Err] Error occurred in JSON parsing');
						console.log('[Dbg] ' + text);
					}
				}else if(obj.mode === 8){
					obj.code = text; //Code comments are special
				}
			}
			//Before we push
			if(obj.text != null)
				obj.text = obj.text.replace(/\u25a0/g,"\u2588");
			tlist.push(obj);
		}
	}
	return tlist;
}
