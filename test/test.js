function runTest(asyncExtra){

	let operation = asyncExtra.function(async () => {
		await asyncExtra.sleep(100);
		return 'test 1';
	});

	operation.add(() => {
		return 'test 2';
	});

	operation.add(() => {
		return 'test 3';
	});

	operation.addIndex(5, () => {
		return 'test new index';
	});


	operation.onFinish((result) => {
		console.log(result);
	});

	async function test(){
		let result = await operation.result();
		console.log(result);
	}
	test();

	async function test2(){
		await operation.wait();
		console.log('done');
	}
	test2();

	async function test3(){
		await asyncExtra.sleep(10);
		let result = operation.resultSync();
		console.log('current result:', result);
	}
	test3();


	async function testLoop(){
		let list = [1, 2, 3];

		list = (await asyncExtra.map(list, async (item, index, obj) => {
			if(item === 2){
				await asyncExtra.sleep(1);
			}
			console.log(item *= 10);
			return item;
		})).result;

		console.log('test loop:', list);
	}
	testLoop();

	async function testResultIndex(){
		let result = await operation.firstResult();
		console.log(result);

		result = await operation.resultIndex(5);
		console.log(result);
	}
	testResultIndex();

}

module.exports = runTest;
