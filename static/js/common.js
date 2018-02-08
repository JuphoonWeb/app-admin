document.write(
'<script src="lib/jquery/1.9.1/jquery.min.js"></script>'+
'<script type="text/javascript" src="static/h-ui/js/H-ui.min.js"></script>'+
'<script type="text/javascript" src="lib/layer/2.4/layer.js"></script>'+
'<script type="text/javascript" src="static/h-ui.admin/js/H-ui.admin.js"></script>'
);

// var domain = 'https://download.juphoon.com/app';
var domain = 'http://192.168.0.46:8083/app';
// var domain = 'http://192.168.20.38:8083/app';

function ajax(option){
	$(document).unbind('ajaxStart');
    $(document).ajaxStart(function(){
		layer.load(1);
	});
	var ajaxDomain = (/^http:[\/]{2}/).test(option.url ) ? 
					'' : domain;
	var url = ajaxDomain + option.url;
	var menuUrl = window.location.href.split('?')[0].replace('#','').split('/').reverse()[0];

	if(menuUrl){
		var reg = /(.+?html)/;
		menuUrl = reg.exec(menuUrl)[1];
	}


	$.ajax({
		url: url,
		type: option.type || 'get',
		cache: option.cache,
		processData: option.processData,
	    contentType: option.contentType,
		headers: {
			token: $.cookie('uuid'),
			// 'Menu-Url': menuUrl 
		},
		dataType : 'json',
		data: option.data,
		timeout: option.timeout || 5*1000,
		xhr: option.xhr,
		beforeSend: function(xhr, settings){
	    	option.beforeSend && option.beforeSend(xhr, settings);
	    },
		success: function(res){
	    	layer.closeAll();
	    	if(res.code === -2){
	    		layer.open({
	    			type: 0,
					closeBtn: 0,
					title: '提示',
					icon: 7,
					content: '您没有权限'
	    		});
	    	}else if(res.code === -1){
	    		relogin();
	    	}else if(res.code === 0){
	    		layer.msg(res.error);
	    	}else{
		    	option.success && option.success(res);
		    }
	    },
		error: function(xhr, status){
	    	layer.closeAll();
	    	option.error ? option.error(xhr, status) : errorFunc(xhr, status);
	    }, 
	});
}

// Date对象格式化
Date.prototype.Format = function (fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
	    if (/(y+)/.test(fmt)){ 
        	fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
	    for (var k in o){
            
            if (new RegExp("(" + k + ")").test(fmt)){
            	 fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
	    }
        return fmt;
};

//将时间戳转换为'yyyy-MM-dd hh:mm:ss'形式
function timeFormat(time){
	time = (time && time.toString().length == 10 )? time*1000 : time; //若是10位，则转换为13位
	return new Date(time).Format('yyyy-MM-dd hh:mm:ss');
}

function dateFormat(time){
	time = (time && time.toString().length == 10 )? time*1000 : time; //若是10位，则转换为13位
	return new Date(time).Format('yyyy-MM-dd');
}

//取得10位时间戳
function getTime10(timeStr){
	var tempDate = new Date(timeStr);
	tempDate.setHours(0);
	return Date.parse(tempDate)/1000;
}

Array.prototype.remove = function(val){
	var index = this.indexOf(val);
	if(index > -1){
		this.splice(index, 1);
		return val;
	}
	return null;
};

function removeRepeat(array){
	var resultArray = [];
	for(var i = 0; i < array.length; i++){
		if(resultArray.indexOf(array[i]) == -1){
			resultArray.push(array[i]);
		}
	}
	return resultArray;
}

function relogin(){
	$.removeCookie('domainId');
	$.removeCookie('domainName');
	$.removeCookie('uuid');
	top.layer.open({
		type: 0,
		closeBtn: 0,
		icon:7, 
		title: '重新登录',
		content: '超过30分钟未操作，已自动登出，请重新登录',
		yes: function() {
			top.open('login.html', '_self');
		}
	});
}

//查询到没有数据时显示“暂无数据”的图片
function showNodata(){
	$('#nodata').show();
	$('tbody').children().remove();
	$('#data-num').text(0);
}

//隐藏“暂无数据”的图片
function hideNodata(){
	$('#nodata').hide();
}

//Ajax error函数
function errorFunc(xhr, status){
	layer.open({
		type: 0,
		closeBtn: 0,
		icon:7, 
		title: '出现错误',
		content: status
	});
}

//获取应用列表,参数leadOption为true则添加value为空的option
function getAppList(callBack, leadOption){
    ajax({
        url: 'app/getAppList',
        type: 'post',
        data: {
            domainId: $.cookie('domainId'),
            domainName: $.cookie('domainName')
        },
        success: function(response){
            if(response.code === 1){
            	//当leadOption为true，添加value为空的option
                var options = leadOption ? '<option value="">所有APP</option> ':'';
                response.data.forEach(function(item){
                    options += '<option value="'+item.id+'">'+item.appName+'</option> ';
                });
                $('#search-app').html(options);
                callBack && callBack();
            }
        }
    });
}

//根据请求url获取参数
function GetQueryString(name){
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var currUrl = window.location.search;
     var r = currUrl.substr(1).match(reg);
     if(r!=null)return  decodeURIComponent(r[2]); return null;
}

//取得页面地址Hash
function GetUrlHash(){
	return location.hash.slice(1);
}

 // durationType值定义： 1: 最近一个月 2：最近半年 3：自定义  
function setDuration(durationType){
if(durationType != 3){
    var nowTime = new Date();
    var endTime = nowTime.Format('yyyy-MM-dd');
    var startTime = new Date();
    if(durationType == 1){
        startTime.setMonth(nowTime.getMonth()-1);
    }else if(durationType == 2){
        startTime.setMonth(nowTime.getMonth()-6);
    }
    
    startTime = startTime.Format('yyyy-MM-dd');

    searchPara.startTime = getTime10(startTime);
    searchPara.endTime = getTime10(nowTime.Format('yyyy-MM-dd'));
    $('#search-start-date').val(startTime);
    $('#search-end-date').val(endTime); 
}
}

//上传文件
function upLoadFile(file, callBack){

		var formData = new FormData();
		formData.append('file', file);
		var xhrOnpregress = function(fun){
			xhrOnpregress.onprogress = fun;

			return function(){
				var xhr = $.ajaxSettings.xhr();
				if(typeof xhrOnpregress !== 'function'){
					return xhr;
				}
				if(xhrOnpregress.onprogress && xhr.upload){
					xhr.upload.onprogress = xhrOnpregress.onprogress;
				}
				return xhr;
			};
		};
		ajax({
			url: 'http://123.125.97.186:8083/file/fastdfs/uploadFile',
			type: 'post',
			timeout: 10 * 60 * 1000,
			data: formData,
			cache: false,
			processData: false,
		    contentType: false,
		    beforeSend: function(){
		    	layer.closeAll();
		    	layer.open({
				  type: 1,
				  title: false,
				  closeBtn: 0,
				  area: ['430px', '100px'],
				  content:  '<div style="padding:15px;">' +
				  				'<p id="progress-text" >文件上传中 0%</p>' +   
				  				'<div class="progress">'+
					  				'<div class="progress-bar-success" style="background-color: rgb(234,234,234);">' + 
					  					'<span id="progress-bar" class="sr-only" style="width:0%"></span>'+
				  					'</div>' + 
			  					'</div>' +
			  				'<div>'
				});
		    },
		   	xhr: xhrOnpregress(function(e){
		   		var percent = Math.ceil(e.loaded / e.total * 100);
		   		$('#progress-bar').css('width', percent + '%');
		   		$('#progress-text').text('文件上传中 ' + percent + '%');
		   		if(percent === 100){
			   		setTimeout(function(){
			   			layer.closeAll();
			   		}, 1000);
		   		}

		   	}),
		    success: function(response){
		    	if(response.code === -100){
		    		layer.msg('文件上传失败');
		    	}
		    	callBack && callBack(response);
		    }
		});

}

$('input').on('input', function(){
	var val = $(this).val();
	var jsReg = /.*(<script>).*(<\/script>)*.*/i;
	if(jsReg.test(val)){
		$(this).val('');
	}

	if(val.length > 50){
		layer.msg('内容限制为50字');
		$(this).val(val.slice(0,50));
	}
});

$('textarea').on('input', function(){
	var val = $(this).val();
	var jsReg = /.*(<script>).*(<\/script>)*.*/i;
	if(jsReg.test(val)){
		$(this).val('');
	}

	if(val.length > 150){
		layer.msg('内容限制为150字');
		$(this).val(val.slice(0,150));
	}
});