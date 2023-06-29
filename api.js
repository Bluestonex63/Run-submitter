import {
	json,
	opine,
	urlencoded,
  } from "https://deno.land/x/opine@2.3.3/mod.ts";
function getRandomInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
const symbols = [
"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
"N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
"!", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_",
"+", "=", "[", "]", "{", "}","<", ">", ",", ".", "?", "/"
];
function generatesymbols(nr) {
	let string = ""
	for (let i = 0; i<nr; i++) {
		string += symbols[getRandomInteger(0, symbols.length-1)]
	}
	return string
}
const app = opine();
app.use(json()); 
app.use((req, res, next) => {
	res.append('Access-Control-Allow-Origin', ['*']);
	res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.append('Access-Control-Allow-Headers', 'X-API-key,Content-Type');
	next();
});
app.post('/srcPOSTruns', async (req, res) => {
	let headers = req.headers
	if (req.body != null) {
		//console.log(headers.get("x-api-key"), req.body); 
	}
	if (headers.get("x-api-key") == undefined) {
		res.status = 400
		res.json({status: 400, message: "Please submit an API key"})
	} else if (Object.keys(req.body).length == 0) {
		res.status = 400
		res.json({status: 400, message: "Please submit an array with the desired run/runs"})
	} else {
		res.json({status: 200, message: "Your request has been put in queue!"})
		let id = generatesymbols(5)
		while (true) {
			let sleepTime = 0
			let jsonData = await Deno.readFile('req.json');
			let decoder = new TextDecoder('utf-8');
			let jsonText = decoder.decode(jsonData);
			let jsonDataObj = JSON.parse(jsonText);
			if (!jsonDataObj.queue.some(q => q[1] == id)) {
				let nr = 1
				for (q of jsonDataObj.queue) {
					if (q[0] >= nr) {
						nr = q[0] + 1
					}
				}
				jsonDataObj.queue.push([nr, Object.keys(req.body).length*1.5+1, id])
				let jsonString = JSON.stringify(jsonDataObj);
				await Deno.writeTextFile('req.json', jsonString);
			}
			if (jsonDataObj.queue[0][2] == id) {
				break
			} else {
				for (queue of jsonDataObj.queue) {
					if (queue[2] != id) {
						sleepTime += queue[1]
					}
				}
				await sleep(sleepTime*1000);
			}
		}
		let jsonobj = []
		for (let i = 1;i < Object.keys(req.body).length; i++) {
			console.log(JSON.stringify(req.body[`${i-1}`]), Object.values(req.body).indexOf(req.body[`${i}`]))
			//fetch("https://www.speedrun.com/api/v1/runs", {
			//	method: "POST",
			//	headers: {
			//		"X-API-key": headers.get("x-api-key"),
			//		"Content-Type": "json"
			//	},
			//	body: JSON.stringify(req.body[`${i}`])
			//}).then(x => x.json()).then(r => {
			//	if (!r.ok) {
			//		jsonobj = jsonobj.concat([{status: r.status, message: r.message}])
			//	} else {
			//		jsonobj = jsonobj.concat([{json: r}])
			//	}
			//	if (jsonobj.length == req.body.length) {
			//		res.json(jsonobj)
			//	}
			//})
		}
		let jsonData = await Deno.readFile('req.json');
		let decoder = new TextDecoder('utf-8');
		let jsonText = decoder.decode(jsonData);
		let jsonDataObj = JSON.parse(jsonText);
		jsonDataObj.queue = jsonDataObj.queue.filter((item) => item[2] != id)
		let jsonString = JSON.stringify(jsonDataObj);
		await Deno.writeTextFile('req.json', jsonString);
	}
});

app.listen(3000);
console.log("Running!")