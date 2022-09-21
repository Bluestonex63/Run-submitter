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
            form.id = "submissionform"
			if (cats.length != 0) { 
				let catlb = document.createElement("label")
				catlb.innerHTML = "<label>Category: </label>"
				let catsel = document.createElement("select")
                catsel.id = "catsel"
				cats.forEach(cat => {
                    let opt = document.createElement("option");
                    if (cat["type"] == "per-game") {
                        opt.innerHTML = `<option>${cat["name"]} - FG</option>`
                    } else {
                        opt.innerHTML = `<option>${cat["name"]} - IL</option>`
                    }
                    catsel.appendChild(opt)
                })
				form.appendChild(catlb)
                form.appendChild(document.createElement("br"))
				form.appendChild(catsel)
                document.querySelector("#submission").innerHTML = ""
				document.querySelector("#submission").appendChild(form)
			} 
            let lvlc = (lvls) => {
                let form = document.querySelector("#submissionform")
                if (lvls.length != 0 && document.querySelector("#catsel").value.split(" - ").splice(document.querySelector("#catsel").value.split(" - ").length-1).includes("IL")) {
                    let lvllb = document.createElement("label")
                    lvllb.innerHTML = "<label>Levels: </label>"
                    let lvlsel = document.createElement("select")
                    lvls.forEach(lvl => {
                        let opt = document.createElement("option");
                        opt.innerHTML = `<option>${lvl["name"]}</option>`
                        lvlsel.appendChild(opt)
                    })
                    const catsel = document.querySelector("#catsel")
                    form.innerHTML = ""
                    let catlb = document.createElement("label")
				    catlb.innerHTML = "<label>Category: </label>"
                    form.appendChild(catlb)
                    form.appendChild(document.createElement("br"))
                    form.appendChild(catsel)
                    form.appendChild(document.createElement("p"))
                    form.appendChild(lvllb)
                    form.appendChild(document.createElement("br"))
                    form.appendChild(lvlsel)
                    document.querySelector("#submission").innerHTML = ""
                    document.querySelector("#submission").appendChild(form)
                } else {
                    const catsel = document.querySelector("#catsel")
                    document.querySelector("#submissionform").innerHTML = ""
                    let catlb = document.createElement("label")
				    catlb.innerHTML = "<label>Category: </label>"
                    document.querySelector("#submissionform").appendChild(catlb)
                    document.querySelector("#submissionform").appendChild(document.createElement("br"))
                    document.querySelector("#submissionform").appendChild(catsel)
                }
            }
            lvlc(lvls)
            document.querySelector("#catsel").addEventListener("change", () => {lvlc(lvls)})
		}
		catch (e) {alert(`There was an error, please try again later. \n\n${e}`); button.disabled = false; throw e}
	}
	button.disabled = false
})
