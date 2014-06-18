/**
 * @authors yangqinjiang (yangqinjiang@gmail.com)
 * @date    2014-06-09 16:45:10
 * @version 1.0
 *
 * 主要是使用观察者模式来实现的代码,
 * 功能是通过异步加载Ajax的执行前后,运行一些代码,
 * 比如:在ajax之前,提升正在'loading',ajax完成之后,再还原回来.
 * 用法:
 *	
 	var o = document.getElementById('o');
 *  //必须实现一个update方法,并且还有一个参数,
	o.update = function(observee){//observee true or false
		$(this).html(observee ? "OK":"END");//改变o元素上的文字
	};

	//注册一个观察者
	$$.attch('o',o);//该方法的第一个参数是字符串,用作 key,o 是一个实现了update方法的对象
	//注销一个观察者
	$$.detach('o');//注销后,该观察者o就不会被通知了

	//调用方式与jquery的getJSON一致,
	//最后一个参数可为空字符串,
	//可以是$$attch时候的key,
	//这时,在ajax返回时,自动执行o.update的方法
	$$.getJSON(your_url,your_data,function(d) {
		console.log('返回的结果:');
		console.log(d);
	},your_key);

 */

/*
扩展Function对象,加入addFuncList函数,
作用是:形成一个函数执行列表,
//用法:
	 var other_func =  function(){
	 	alert(1);
	 };
	 var btn_get_click = function(){
		alert(0);
	 };
	 btn_get_click();//output:
	 				 //alert(0);

	 btn_get_click = btn_get_click.addFuncList(other_func);
	 
	 btn_get_click();//output:
	 				 //alert(0)
	 				 //alert(1)
 */
Function.prototype.addFuncList = function(newfunc) {
	var oldF = this;
	return function(arguments){
		oldF(arguments);
		newfunc(arguments);
	};
};

//生成$$ 对象
var $$ = $$ || {};
//observers对象
$$.observers = $$.observers || {};
//注册一个key对应的observer观察者
$$.attch = function(key,observer){
	if(key && this.observers[key]){
		console.error('observers 对象已经存在  '+key+'  的观察者了')
	}else{
		key && (this.observers[key] = observer);
	}
};
//注销一个key对应的observer观察者
$$.detach = function(key){
	return key && this.observers[key] && (delete this.observers[key]) || false;
};

//通知指定key或所有的观察者,并可带上给定的值,
//不指定值时,则默认为this,
$$.notify = function(key,val){
	val = (val != null || typeof val != 'undefined') ? val : this;
	if (key) {//如果指定key,则通知单个key的value
		this.observers[key].update(val);
	}else{//否则,通知所有
		for(var k in this.observers){
			this.observers[k].update(val);
		}
	}
};
//扩展的方法,用在ajax请求之前,发出的通知
$$.notifyStart = function(key){
	this.notify(key,true);
};
//扩展的方法,用在ajax请求完成之后,发出的通知
$$.notifyEnd = function(key){
	this.notify(key,false);
};

//扩展的getJSON
$$.getJSON = function(url,data,callback,key){
	$$.notifyStart(key);//通知观察者
	//请匿名函数加到callback之后
	callback = callback.addFuncList(function  () {
		$$.notifyEnd(key);
	});
	$.getJSON(url,data,callback);
};
//扩展的get
$$.get = function(url,data,success,dataType,key){
	$$.notifyStart(key);//通知观察者
	//请匿名函数加到success之后
	success = success.addFuncList(function(){
		$$.notifyEnd(key);
	});
	$.get(url,data,success,dataType);
};
//扩展的post
$$.post = function(url,data,success,dataType,key){
	$$.notifyStart(key);//通知观察者
	//请匿名函数加到success之后
	success = success.addFuncList(function(){
		$$.notifyEnd(key);
	});
	$.post(url,data,success,dataType);
};
