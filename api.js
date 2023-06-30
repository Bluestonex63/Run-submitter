import {
	json,
	opine,
	urlencoded,
  } from "https://deno.land/x/opine@2.3.3/mod.ts";
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
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
		res.json({status: 400, message: "Please submit an object with the desired run/runs and order"})
	} else {
		res.json({status: 200, message: `Your request has been recieved sucessefully!\n\nThe estimated time until the runs are submitted is: ${Object.keys(req.body).length*2.4 + 2.4} seconds.\n\nIf your runs aren't submitted soon, please contact Bluestonex64 on discord.`})
		let b = false
		for (let i = 1;i < Object.keys(req.body).length; i++) {
			let h = false
			let start = Date.now()
			let count = 0
			while (true) {
				let r = await fetch("https://www.speedrun.com/api/v1/runs", {
					method: "POST",
					headers: {
						"X-API-key": headers.get("x-api-key"),
						"Content-Type": "json"
					},
					body: JSON.stringify(req.body[`${i}`])
				})
				r = await r.json()
				if (r.data == undefined) {
					if (r.status == 420) {
						if (count < 3) {
							await sleep(60000)
							count += 1
						} else {
							console.log("Rate limiting")
							b = true
						}
					} else {
						console.log(r.message)
						b = true
					}
				} else {
					h = true
				}
				if (b || h) {
					break
				}
			}
			if (b) {
				break
			}
			let time = Date.now() - start
			if (2400 > time) {
				await sleep(2400-time)
			}
		}
	}
});

app.listen(3000);
console.log("Running!")