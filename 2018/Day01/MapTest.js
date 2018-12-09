/**
* Test play with a JS map object 
*
* So it seems that it is actually much slower to do as several blog's seem to suggest and use the Map in place of a plain JS Object
* also interestingly Edge kills in its implementation of MAP, it takes only 33% of the time chrome/V8 does...
*
*/

const iterations = 100000;
let testMap = new Map();

console.time('MapTimer');

for (let i = iterations - 1; i >= 0; i--) {

	// Create item for deletion in this round
	testMap.set("alpha", {egg: "yay"});

	// Create an additional object each round
	testMap.set("alpha" + i , {egg: "yay"});	

	// console.log(testMap.get("alpha"));

	testMap.delete("alpha");

	// console.log(testMap.get("alpha")) // Test, should produce undefined


}

console.timeEnd('MapTimer');


let testObj = {};

console.time('JSObjectTimer');

for (let i = iterations - 1; i >= 0; i--) {

	// Create item for deletion in this round
	testObj['alpha'] = {egg: "yay"};

	// Create an additional object each round
	testObj['alpha'+ i] = {egg: "yay"};

	// console.log(testObj['alpha'])

	delete testObj['alpha'];

	// console.log(testObj['alpha']) // Test, should produce undefined
}

console.timeEnd('JSObjectTimer');
