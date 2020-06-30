## Async Extra

![npm](https://img.shields.io/npm/v/async-extra)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/async-extra)
![GitHub top language](https://img.shields.io/github/languages/top/aspiesoft/async-extra)
![NPM](https://img.shields.io/npm/l/async-extra)

![npm](https://img.shields.io/npm/dw/async-extra)
![npm](https://img.shields.io/npm/dm/async-extra)

[![paypal](https://img.shields.io/badge/buy%20me%20a%20coffee-paypal-blue)](https://buymeacoffee.aspiesoft.com/from-npm/async-extra)

Some additional functions to advance the capabilities of asynchronous code in javascript.

Ever wanted to do more with javascript async. If you simply use async/await, all your doing is making a function sync itself, but not affecting other functions.
Why not instead, start an async process, and await the result later in the function when you actually need it.
That's what this module does, it simplifies that process, and adds some additional functions that may be useful.

This module uses no dependencies, and does not rely on nodejs. It is capable of running in the browser (might add in a future update).

What about for loops? Why not make an async version of .map()? Check the rest of this readme file, this function was added to the module.
The .map() and .forEach() methods of this module also support objects in the loop (auto running Object.keys()). Strings, numbers, booleans, etc. will also be converted to be in an array.

### Installation

```shell script
npm install @aspiesoft/async-extra
```

### Setup

```js
const asyncExtra = require('@aspiesoft/async-extra');
```

### Usage

```js
async function myFunction(){
    
    let options = {
        timeout: 3000,
        checkInterval: 10,
    };
    
    let operation = asyncExtra.function(options, myLongProcess1, myLongProcess2, myLongProcess3);
    
    // do stuff...
    
    await operation.onFinish((result, index, results, finished) => {
        // onFinish loops through each result, and runs this callback.
        // "result" is the result of the current callback.
        // "index" is the index of the callback (which matches the order you put your functions in).
        // "results" is the array of results (in order) of all the functions.
        // finished returns true or false. If timeout runs before all processes are finished, this returns false.
        // you can run this function again, if finished === false.
    });

    // an alternative to onFinish
    let result = await operation.result();
    console.log(result); // output: {results: [resultArray], finished: true || false, unfinished: number of processes left}
    
    // if you need some results as soon as possible
    result = operation.resultSync();
    console.log(result); // output: same as result(), but a much higher chance for empty results.
    if(result[0]){
        //first process finished
    }
    
    // to simply try and wait for results to finish
    await operation.wait();

    // you can also change the timeout at any time
    operation.setOptions({timeout: 3000, checkInterval: 5});
    // timeout is the number of milliseconds before the function gives up waiting for a result.
    // checkInterval is the number of milliseconds to wait between checking if the result is there yet.

    // you can also set the results to use an object type (only works when you first create the operation)
    operation = asyncExtra.function({resultObject: true}); // results will output {0: result1, 1: result2} instead of [result1, result2]

    // you can get the first available result, and skip waiting for more results
    result = await operation.firstResult(); // output: {result, index, results, finished, unfinished}

    // you can get a result at a specific index
    result = await operation.resultIndex(index); // output: {result, index}

    // you can add a function at a specific index
    operation.addIndex(index, callback);
}

// other methods

// run an async forEach loop, and wait for it to finish
await asyncExtra.forEach(objectOrArray, callback);
// output: {finished: true || false, unfinished: number of items left}

// run an async map loop, and wait for the results, and if an array, in the same order they were originally in
await asyncExtra.map(objectOrArray, callback, {timeout: 5000, checkInterval: 5});
// output: {result: [resultArray], finished: true || false, unfinished: number of items left}

// make an async function sleep for a number of milliseconds
await asyncExtra.sleep(ms);

// the function this module uses to wait for results from async operations
let value = false;
// set value in async function...
await asyncExtra.waitForValue(() => value, timeout, checkInterval);
```
