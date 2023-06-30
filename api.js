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
const __dirname = new URL('.', import.meta.url).pathname;
app.get('/', (req, res) => {
	res.sendFile("index.html", { root: __dirname })
})
app.get('/script.js', (req, res) => {
	res.sendFile("script.js", { root: __dirname })
})
app.get('/style.css', (req, res) => {
	res.sendFile("style.css", { root: __dirname })
})
app.get('/x.png', (req, res) => {
	res.sendFile("x.png", { root: __dirname })
})
app.post('/srcPOSTruns', async (req, res) => {
	let headers = req.headers
	if (headers.get("x-api-key") == undefined) {
		res.status = 400
		res.json({status: 400, message: "Please submit an API key"})
	} else if (Object.keys(req.body).length == 0) {
		res.status = 400
		res.json({status: 400, message: "Please submit an array with the desired run/runs"})
	} else {
		let jsonData = await Deno.readFile('req.json');
		let decoder = new TextDecoder('utf-8');
		let jsonText = decoder.decode(jsonData);
		let jsonDataObj = JSON.parse(jsonText);
		let sleepT = 0
		for (let i = 0; i < jsonDataObj["queue"].length; i++) {
			if (jsonDataObj["queue"][i][2] != id) {
				sleepT += jsonDataObj["queue"][i][1]
			}
		}
		res.json({status: 200, message: `Your request has been put in queue!\n\nThere are ${jsonDataObj.queue.length} other requests in queue, for an estimated time of ${sleepT} seconds until we get to your request!\n\nIf your runs aren't submitted soon, please contact Bluestonex64 on discord.`})
		let id = generatesymbols(5)
		let it = 0
		let qb = []
		let nr = 1
		try {
			while (true) {
				it += 1
				let sleepTime = 0
				let jsonData = await Deno.readFile('req.json');
				let decoder = new TextDecoder('utf-8');
				let jsonText = decoder.decode(jsonData);
				let jsonDataObj = JSON.parse(jsonText);
				if (!jsonDataObj.queue.some(q => q[2] == id)) {
					nr = 1
					console.log(nr, jsonDataObj["queue"][0])
					for (let i = 0; i < jsonDataObj["queue"].length; i++) {
						if (jsonDataObj["queue"][i][0] >= nr) {
							nr = jsonDataObj["queue"][i][0] + 1
						}
					}
					jsonDataObj.queue.push([nr, Object.keys(req.body).length*1.5+5, id])
					let jsonString = JSON.stringify(jsonDataObj);
					await Deno.writeTextFile('req.json', jsonString);
				}
				if (jsonDataObj.queue[0][2] == id) {
					break
				} else {
					if (qb.every(value => jsonDataObj.queue.some(q => q[2] == value[2])) && it >= 6) {
						let newData = jsonDataObj
						newData.queue.sort((a, b) => a[0] - b[0]).shift()
						let jsonString2 = JSON.stringify(newData);
						await Deno.writeTextFile('req.json', jsonString2);
					}
					for (let i = 0; i < jsonDataObj["queue"].length; i++) {
						if (jsonDataObj["queue"][i][2] != id) {
							sleepTime += jsonDataObj["queue"][i][1]
						}
					}
					qb = jsonDataObj.queue
					await sleep(sleepTime*1000);
				}
			}
			let jsonobj = {"body": req.body, "response": []}
			let b = false
			for (let i = 1;i < Object.keys(req.body).length; i++) {
				let start = Date.now()
				fetch("https://www.speedrun.com/api/v1/runs", {
					method: "POST",
					headers: {
						"X-API-key": headers.get("x-api-key"),
						"Content-Type": "json"
					},
					body: JSON.stringify(req.body[`${i}`])
				}).then(x => x.json()).then(r => {
					if (!r.ok) {
						jsonobj.response = jsonobj.response.concat([{status: r.status, message: r.message}])
						b = true
					} else {
						jsonobj.response = jsonobj.response.concat([{json: r}])
					}
				})
				if (b) {
					break
				}
				let time = Date.now() - start
				if (1500 > time) {
					await sleep(1500-time)
				}
			}
			let jsonData = await Deno.readFile('log.json');
			let decoder = new TextDecoder('utf-8');
			let jsonText = decoder.decode(jsonData);
			let jsonDataObj = JSON.parse(jsonText);
			jsonDataObj[id] = jsonobj
			let jsonString = JSON.stringify(jsonDataObj, null, "\t");
			await Deno.writeTextFile('log.json', jsonString);
		} finally {
			let jsonData = await Deno.readFile('req.json');
			let decoder = new TextDecoder('utf-8');
			let jsonText = decoder.decode(jsonData);
			let jsonDataObj = JSON.parse(jsonText);
			jsonDataObj.queue = jsonDataObj.queue.filter((item) => item[2] != id)
			let jsonString = JSON.stringify(jsonDataObj);
			await Deno.writeTextFile('req.json', jsonString);
		}
	}
});

app.listen(3000);
console.log("Running!")