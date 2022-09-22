const key = document.querySelector("#key")
const game = document.querySelector("#game")
const button = document.querySelector("#gameBtn")
const src = "https://www.speedrun.com/api/v1/"


button.addEventListener("click", async () => {
	button.disabled = true
	if (game.value != "") {
		try {
			let r = await fetch(src + `games/${game.value}`).then(x => x.json())
			if (r.status == 404) { alert("The game does not exist"); button.disabled = false; return} else if (r.status != undefined) { alert("There was an error, please try again later") }
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
                let catselv = document.querySelector("#catsel").value
                let lvlselv = document.querySelector("#lvlsel")
                let isIL = catselv.split(" - ").splice(catselv.split(" - ").length-1).includes("IL")
                if (lvlselv == null || !isIL) {
                    if (lvls.length != 0 && isIL) {
                        let lvllb = document.createElement("label")
                        lvllb.innerHTML = "<label>Levels: </label>"
                        let lvlsel = document.createElement("select")
                        lvlsel.id = "lvlsel"
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
                        lvlsel.addEventListener("change", () => {varc(vari, lvls, cats)})
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
            }
            let varc = (vari, lvls, cats) => {
                let catselv = document.querySelector("#catsel").value
                let lvlsel = document.querySelector("#lvlsel")
                let popcatselv = catselv.split(" - ")
                let appvari = []
                popcatselv.pop()
                if (lvlsel == null) {
                    appvari = vari.filter(variable => { 
                        if (variable.category != null) {
                            return cats.find(cat => variable.category == cat.id).name == popcatselv.join("")
                        } else {
                            return variable.scope.type == "full-game" || variable.scope.type == "global"
                        }
                    })
                } else {
                    appvari = vari.filter(variable => { 
                        if (variable.category != null && variable.scope.type != "single-level" ) {
                            return cats.find(cat => variable.category == cat.id).name == popcatselv.join("")
                        } else if (variable.scope.type == "single-level" && variable.category != null) {
                            return lvls.find(level => level.id == variable.scope.level).name == lvlsel.value && cats.find(cat => variable.category == cat.id).name == popcatselv.join("")
                        } else {
                            return variable.scope.type == "all-levels" || variable.scope.type == "global"
                        }
                    })
                }
                let form = document.querySelector("#varform")
                if (appvari.length == 0) { form.innerHTML == "" } else {
                    appvari.forEach(appvar => {
// put every variable in display, dont forget to make non mandatory variables have a blank option
                        let inp = document.createElement("select")
                        if (appvar.mandatory && !appvar["user-defined"]) {
                            for (value of Object.keys(appvar.values.values)) {
                                let op = document.createElement("option")
                                op.value = value
                                op.innerHTML = `<option>${appvar.values.values[value].label}</option>`
                                inp.appendChild(op)
                            }
                            form.appendChild(inp)
                        }
                    })
                }
            }
            lvlc(lvls); varc(vari, lvls, cats)
            document.querySelector("#catsel").addEventListener("change", () => {lvlc(lvls); varc(vari, lvls, cats)})
		}
		catch (e) {alert(`There was an error, please contact Bluestonex64. \n\n${e}`); button.disabled = false; throw e}
	}
	button.disabled = false
})
