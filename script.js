const key = document.querySelector("#key")
const game = document.querySelector("#game")
const button = document.querySelector("#gameBtn")
const src = "https://www.speedrun.com/api/v1/"

button.addEventListener("click", async () => {
	button.disabled = true
	if (game.value != "") {
		try {
			let r = await fetch(src + `games/${game.value}`).then(x => x.json())
			if (r.status == 404) { alert("The game does not exist") } else if (r.status != undefined) { alert("There was an error, please try again later") }
			let lvls = await fetch(src + `games/${r.data.id}/levels`).then(x => x.json()).then(x => x.data)
			let cats = await fetch(src + `games/${r.data.id}/categories`).then(x => x.json()).then(x => x.data)
			let vari = await fetch(src + `games/${r.data.id}/variables`).then(x => x.json()).then(x => x.data)
			let form = document.createElement("form")
			if (cats.length != 0) { 
				let catlb = document.createElement("label")
				catlb.innerHTML = "<label>Category:</label>"
				let catsel = document.createElement("select")
				cats.forEach(cat => {let opt = document.createElement("option"); opt.innerHTML = `<option>${cat["name"]}</option>`; catsel.appendChild(opt)})
				form.appendChild(catlb)
				form.appendChild(catsel)
				document.body.appendChild(form)
			} 
		}
		catch (e) {alert(`There was an error, please try again later. \n\n${e}`); button.disabled = false; throw e}
	}
	button.disabled = false
})
