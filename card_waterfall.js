
var log4js = require("log4js");
log4js.configure({
  appenders: {
    cheeseLogs: { type: 'dateFile', filename: './logs/', alwaysIncludePattern: true, pattern: '-yyyy-MM-dd-hh.log', category: 'normal' },
    console: { type: 'console' }
  },
  categories: {
    cheese: { appenders: ['cheeseLogs'], level: 'error' },
    another: { appenders: ['console'], level: 'trace' },
    default: { appenders: ['console', 'cheeseLogs'], level: 'trace' }
  }
})
var LogFile = log4js.getLogger('normal');
var async =require('async');

var request=require('request');
var md5=require('./md5.js');
var urls={ 
	'cardcount':'http://api.cmpyun.com/api/serviceAccept/getAllCardCount',
	'cardiccids':'http://api.cmpyun.com/api/serviceAccept/getCardList',
	'availmainpackagelist':'http://api.cmpyun.com/api/serviceAccept/getMainPackageList',
	'availpackagelist':'http://api.cmpyun.com/api/serviceAccept/getPackageList',
	'cardpackcode':'http://api.cmpyun.com/api/serviceAccept/findCardInfoList',
	'canrecharge':'http://api.cmpyun.com/api/serviceAccept/checkRecharge',
	'mainpackageorder':'http://api.cmpyun.com/api/serviceAccept/orderMainFlow',
	'packageorder':'http://api.cmpyun.com/api/serviceAccept/orderFlow',
}
var appid='LYWLxK9ecfDllidm3nih';
var dt='1539593700';
var secret='EqyhIReOOBS3gUFIUw4dJUg1XWAoZRqI';
var appSecrect='5Ktul9tEP2';
function getSign(senddata){
	var arr=[];//new Array();//senddata.keys().length+1// var arr=new Array(4+n);// arr[0]='&appid='+appid;// arr[1]='&dt='+dt;// arr[2]='&secret='+secret;
	var i=0;
	for(key in senddata){
		arr[i]="&"+key+"="+senddata[key];
		i+=1;
	}
	// console.log(arr);
	var arr1=arr.sort();
	arr1[arr.length]='&appSecret='+appSecrect;
	str=arr1.toString().replace(/,/g,"").substring(1);
	md5str=md5.hex_md5(str).toUpperCase();
	//console.log("["+str+"]");
	//console.log(md5str);
	return md5str;
}
function getRandStr(num){
	var str="OSEN";
	var num=Math.round(Math.random(8)*100000000);
	var date=new Date();
	str+=date.getUTCFullYear()+""+(date.getUTCMonth()+1)+""+date.getUTCDate();
	str+=num.toString();
	//console.log(str);
	return str;
}
function getSenddata(type,param1,param2){
	var senddata={
		'appid':appid,
		'dt':dt,
		'secret':secret,	
	}

	if(type=='canrecharge'){
		senddata['iccid']=param1;
		senddata['packageInfo']=param2;
	}else{
		if(type=='mainpackageorder' || type=='packageorder'){
			senddata['iccid']=param1;
			senddata['packageInfo']=param2;
			senddata['ordernum']=getRandNum(20);
		}
		if(type=='packageorder'){
			senddata['activeTime']=1;
		}
	}	
		
	senddata['sign']=getSign(senddata);
	
	if(type=='cardiccids'){
		senddata['cardStart']=param1;
		senddata['cardEnd']=param2;
	}else if(type=='availpackagelist'){
		senddata['operator']=param1;
		senddata['platform']='1';
	}else if(type=='cardpackcode'){
		senddata['iccids']=param1;
	}
	// console.log(senddata);
	return senddata;
}


function near(datestr){
	var datearr=datestr.split("-");
	//console.log(datearr);
	var expiredate=new Date();
	expiredate.setFullYear(datearr[0],parseInt(datearr[1])-1,datearr[2]);//expiredate.setFullYear('2018',9,'30');
	var now=new Date();
	// console.log(now);
	//console.log(expiredate);
	// console.log(now-expiredate);
	isexpireornear=false;
	if(now.getFullYear()-expiredate.getFullYear()>0){
		isexpireornear=true;
	}else if(now.getFullYear()-expiredate.getFullYear()==0){
		if(now.getMonth()-expiredate.getMonth()>0){
			isexpireornear=true;
		}else if(now.getMonth()-expiredate.getMonth()==0){
			if(expiredate.getDay()-now.getDay()<14){
				isexpireornear=true;
			}
		}
	}
	//console.log(isexpireornear);
	return isexpireornear;
}
var data;
function postReq(){
	outofdata_iccids=[  { iccid: '8986031644202756228', operator: 3 },
						{ iccid: '8986031644202756433', operator: 3 },
						{ iccid: '898602B8231770237437', operator: 1 } ];	

	console.log("===outofdata_iccids===");
	console.log(outofdata_iccids);
	//LogFile.info(outofdata_iccids);
				

	// var card;

	// for(var j=0;j<outofdata_iccids.length;j+=1){
		// card=outofdata_iccids[j];
		// console.log("-------"+j+"--------");
		// console.log(card);
		// request.post(urls['availpackagelist'],{json :getSenddata('availpackagelist',outofdata_iccids[j]['operator'],"")
		// },function(error2,response2,body2){	
			// console.log("******body2*******");
			// console.log(body2);
			// console.log(card);
			

		// })		
	// }
	var index=0;
	async.waterfall([
		function(callback){
			request.post(urls['cardcount'],{json : getSenddata('cardcount',"",""),
			},function(error0,response0,body0){
				console.log("---body0---");
				console.log(body0);
				callback(null,body0['cardCount']);
			});
			
		},
		function(arg1,callback){
			var arr=[];
			for(var i=0;i<Math.ceil((arg1-1080)/4);i+=1){//Math.ceil(
				//arr[i]=i*50
				arr[i]=i*4;
			}
			console.log(arg1);
			console.log(arr);
			async.mapSeries(arr,function(index,cb){
				request.post(urls['cardiccids'],{json :getSenddata('cardiccids',index,index+3)				
				},function(error1,response1,body1){
					console.log("===body1===");
					//console.log(body1);	
					console.log(body1['cardCount']);	
					var expire_iccids=[];
					var outofdata_iccids=[];
					for(var j=0;j<body1['cardCount'];j+=1){
						var card=body1['cardList'][j];
						if (near(card['expirationTime'])){
							expire_iccids.push(card['iccid']);
						}
						if (card['totaldata']-card['outdata']<=2){
							outofdata_iccids.push({'iccid':card['iccid'],'operator':card['operator']});
						}
					}
					console.log("===expire_iccids===");		
					console.log(expire_iccids.length);
					//console.log(expire_iccids);
					//LogFile.info(expire_iccids);
					console.log("===outofdata_iccids===");
					console.log(outofdata_iccids);
					//LogFile.info(outofdata_iccids);	
					var res={'expire_iccids':expire_iccids,'outofdata_iccids':outofdata_iccids};
					// var res1={'expire_iccids':expire_iccids};
					// var res2={'outofdata_iccids':outofdata_iccids};
					cb(null,res);
					// cb(null,res1,res2);
					//cb(null,expire_iccids,outofdata_iccids);
				});				

			},function(err1,results1){
				console.log("======="+err1+"=======");
				console.log("======="+results1+"=======");
				callback(null,results1);
			});	
			
		},
		function (arg2,callback){
			console.log("#############");
			//console.log(arg2);

			async.mapSeries(arg2,function(item,callback1){
				expire_iccids=item['expire_iccids'];
				outofdata_iccids=item['outofdata_iccids'];
				var card;

				if (outofdata_iccids.length>0){
					async.mapSeries(outofdata_iccids,function(iccid,callback2){

						async.waterfall([
							function (callback3){
								request.post(urls['availpackagelist'],{json :getSenddata('availpackagelist',iccid['operator'],"")
								},function(error2,response2,body2){	
									console.log("******body2*******");
									var packcode=null;
									if(body2['package'].length>0){
										packcode=body2['package'][0]['packageCode'];																				
									}
									console.log(packcode);
									callback3(null,packcode);
								})
							},
							function(arg1,callback3){
								console.log(arg1);
								request.post(urls['canrecharge'],{json :getSenddata('canrecharge',iccid['iccid'],arg1)
								},function(error3,response3,body3){
									console.log(body3);
									callback3(null,arg1,body3['code']);
								})
							},
							function(arg1,arg2,callback3){
								if(arg2==0){																
									request.post(urls['packageorder'],{json :getSenddata('packageorder',iccid['iccid'],arg1)
									},function(error4,response4,body4){	
										console.log(body4);			
									})
								}
								callback3(null,"");
							},													
						],function(err4,result4){							
						})	
						callback2(null,"");						
					},function(err3,result3){
					});
				}
				
				if (expire_iccids.length>0){
					console.log(expire_iccids);
					console.log(expire_iccids.length);
					async.mapSeries(expire_iccids,function(expire_iccid,callback4){
						console.log(expire_iccid);
						
						async.waterfall([
							function(callback5){
								console.log('a');
								//callback5(null,'a')
								request.post(urls['cardpackcode'],{json :getSenddata('cardpackcode',[expire_iccid],"")
								},function(error5,response5,body5){
									console.log('body5');
									var packcode=body5['cardList'][0]['packageCode'];
									console.log(packcode);
									callback5(null,packcode);
								})
							},
							function(arg1,callback5){
								console.log('b');
								//callback5(null,'b','c')
								request.post(urls['canrecharge'],{json :getSenddata('canrecharge',expire_iccid,arg1)
								},function(error6,response6,body6){
									console.log('body6');
									console.log(body6);
									if(body6['code']==0){
										callback5(null,arg1,body6['code']);
									}else{
										callback5(null,"",body6['code']);
									}
								})
							},
							function(arg1,arg2,callback5){
								console.log('c');
								//callback5(null,'d')

								console.log(arg1);	
								if(arg2==0){
									request.post(urls['mainpackageorder'],{json :getSenddata('mainpackageorder',expire_iccid,getRandStr())
									},function(error7,response7,body7){	
										console.log('body7');
										console.log(body7);
										callback5(null,"");
									})	
								}else{
									callback5(null,"");	
								}
							},													
						],function(err6,result6){	
							callback4(null,"");
						})
						
					},function(err5,result5){
						callback1(null,"");
					})
				}
				
				
			},function(err2,result2){
				
			});
			callback(null,"");
		}
	], function (err, result) {
		if(err){
			console.log('处理错误!');
		}else{
			console.log('处理成功！');
		}
	});

	
	console.log("+++++++");
	console.log(data);
}

//console.log(urls['cardcount']);
//postReq('');
getRandNum();
				
