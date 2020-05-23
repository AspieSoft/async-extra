function asyncFunction(){
	let options = {timeout: 10000, checkInterval: 10};

	let funcCount = 0;
	let functionsRan = 0;
	let results = [];

	if(arguments && arguments.length > 0){
		if(typeof arguments[0] === 'object' && typeof arguments[0] !== 'function'){Object.assign(options, arguments[0]);}
		if(options.resultObject){results = {};}
		funcCount = arguments.length;
		forEach(arguments, async (func, i) => {
			if(typeof func === 'function'){results[i] = await func();}
			functionsRan++;
		});
	}

	function setOptions(opts, opt){
		if(typeof opts === 'object'){Object.assign(options, opts);}
		else if(typeof opts === 'string'){options[opts] = opt;}
	}

	function addFunction(){
		if(typeof arguments[0] === 'object' && typeof arguments[0] !== 'function'){Object.assign(options, arguments[0]);}
		let origSize = funcCount;
		funcCount += arguments.length;
		forEach(arguments, async (func, i) => {
			i = Number(i)+Number(origSize);
			if(typeof func === 'function'){results[i] = await func();}
			functionsRan++;
		});
	}

	function addFunctionIndex(index, callback){
		funcCount++;
		(async () => {
			results[index] = await callback();
			functionsRan++;
		})();
	}

	function onFinish(callback){
		return waitForValue(() => functionsRan >= funcCount, options.timeout, options.checkInterval).then(() => {
			const finished = functionsRan >= funcCount;
			if(typeof callback === 'function'){
				results.forEach((result, i) => {
					if(result !== undefined){callback(result, i, results, finished);}
				});
			}return {results, finished, unfinished: funcCount-functionsRan};
		});
	}

	async function wait(){
		await waitForValue(() => functionsRan >= funcCount, options.timeout, options.checkInterval);
		if(functionsRan < funcCount){return false;}
		return funcCount-functionsRan;
	}

	async function getResult(){
		await waitForValue(() => functionsRan >= funcCount, options.timeout, options.checkInterval);
		const finished = functionsRan >= funcCount;
		return {results, finished, unfinished: funcCount-functionsRan};
	}

	function getResultSync(){
		const finished = functionsRan >= funcCount;
		return {results, finished, unfinished: funcCount-functionsRan};
	}

	function getFirstResult(){
		return waitForValue(() => functionsRan >= 1, options.timeout, options.checkInterval).then(() => {
			const finished = functionsRan >= funcCount;
			let result = undefined; let index = false;
			forEach(results, (r, i) => {
				if(result === undefined && r !== undefined){
					result = r; index = i;
				}
			});
			return {result, index, results, finished, unfinished: funcCount-functionsRan};
		});
	}

	function getResultIndex(index = 0){
		return waitForValue(() => results[index] !== undefined, options.timeout, options.checkInterval).then(() => {
			return {result: results[index], index};
		});
	}

	return {
		options: setOptions,
		add: addFunction,
		addIndex: addFunctionIndex,
		onFinish: onFinish,
		wait: wait,
		result: getResult,
		resultSync: getResultSync,
		firstResult: getFirstResult,
		resultIndex: getResultIndex,
	};
}


function asyncForEach(obj, callback, opts){
	if(!obj || typeof callback !== 'function'){return undefined;}
	if(typeof obj !== 'object' && !Array.isArray(obj)){obj = [obj];}
	let options = {timeout: 10000, checkInterval: 10};
	if(typeof opts === 'object'){Object.assign(options, opts);}
	let itemCount = obj.length;
	if(typeof obj === 'object'){itemCount = Object.keys(obj).length;}
	forEach(obj, async (item, index) => {
		await callback(item, index, obj);
		itemCount--;
	});
	return waitForValue(() => itemCount <= 0, options.timeout, options.checkInterval).then(() => {
		const finished = itemCount <= 0;
		return {finished, unfinished: itemCount};
	});
}

function asyncMap(obj, callback, opts){
	if(!obj || typeof callback !== 'function'){return undefined;}
	if(typeof obj !== 'object' && !Array.isArray(obj)){obj = [obj];}
	let options = {timeout: 10000, checkInterval: 10};
	if(typeof opts === 'object'){Object.assign(options, opts);}
	let itemCount = obj.length;
	if(typeof obj === 'object'){itemCount = Object.keys(obj).length;}
	let result = getObjType(obj);
	forEach(obj, async (item, i) => {
		result[i] = await callback(item, i, obj);
		itemCount--;
	});
	return waitForValue(() => itemCount <= 0, options.timeout, options.checkInterval).then(() => {
		const finished = itemCount <= 0;
		return {result, finished, unfinished: itemCount};
	});
}

function getObjType(obj){
	if(Array.isArray(obj)){return [];}
	else if(typeof obj === 'object'){return {};}
	return undefined;
}


const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForValue(value, timeout = 10000, checkInterval = 10){
	if(checkInterval < 1){checkInterval = 1;}
	if(typeof value === 'function'){
		if(value()){value();}
		let loops = 0;
		while(!value()){
			await sleep(checkInterval);
			loops++;
			if(timeout !== false && loops >= timeout / checkInterval){break;}
		}
		return value();
	}
	console.error('TypeError: waitForValue expects a function with a return value');
	return false;
}

function forEach(obj, callback){
	if(typeof obj === 'string'){obj = [obj];}
	if(obj && typeof obj === 'object'){
		let keys = Object.keys(obj);
		for(let i = 0; i < keys.length; i++){
			callback(obj[keys[i]], keys[i], obj);
		}
	}else if(obj && Array.isArray(obj)){
		for(let i = 0; i < obj.length; i++){
			callback(obj[i], i, obj);
		}
	}
}


module.exports = {
	function: asyncFunction,
	forEach: asyncForEach,
	map: asyncMap,
	sleep: sleep,
	waitForValue: waitForValue,
};
