const key = document.querySelector("#key")
const game = document.querySelector("#game")
const button = document.querySelector("#gameBtn")
const src = "https://www.speedrun.com/api/v1/"
let platforms = []
let POSTrun = async (key, run) => {
    //http://localhost:3000/srcPOSTruns
    let api = await fetch("https://blueapi.deno.dev/srcPOSTruns", {
        method: "POST",
        headers: {
            "X-API-key": key,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(run)
    })
    return await api.json()
}
button.addEventListener("click", async () => {
    if (platforms.length == 0) {
        for (let offset = 0; offset < 50; offset++) {
            let plats = await fetch(src + `platforms?max=200&offset=${offset*200}`).then(x => x.json())
            platforms = platforms.concat(plats.data)
            if (plats.data.length < 200) { break }
        }
    }
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
				catlb.innerHTML = "<label><h3 id='catlb'>Category: </h3></label>"
				let catsel = document.createElement("select")
                catsel.id = "catsel"
				cats.forEach(cat => {
                    let opt = document.createElement("option");
                    if (cat["type"] == "per-game") {
                        opt.innerHTML = `<option>${cat["name"]} - FG</option>`
                    } else {
                        opt.innerHTML = `<option>${cat["name"]} - IL</option>`
                    }
                    opt.value = cat["id"]
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
                let isIL = cats.some(cat => (catselv == cat.id && cat.type == "per-level"))
                if (lvlselv == null || !isIL) {
                    if (lvls.length != 0 && isIL) {
                        let lvllb = document.createElement("label")
                        lvllb.innerHTML = "Select the level: "
                        let lvlsel = document.createElement("select")
                        lvlsel.id = "lvlsel"
                        lvls.forEach(lvl => {
                            let opt = document.createElement("option");
                            opt.innerHTML = `${lvl["name"]}`
                            lvlsel.appendChild(opt)
                        })
                        const catsel = document.querySelector("#catsel")
                        form.innerHTML = ""
                        let catlb = document.createElement("label")
                        let ch3 = document.createElement("h3")
                        ch3.innerHTML = "Category & Level: "
                        ch3.id = "catlb"
                        catlb.innerHTML = "Select the category: "
                        form.appendChild(ch3)
                        form.appendChild(document.createElement("p"))
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
                        let cath3 = document.createElement("h3")
                        cath3.innerHTML = "Category: "
                        cath3.id = "catlb"
                        catlb.innerHTML = "Select the category:"
                        document.querySelector("#submissionform").appendChild(cath3)
                        document.querySelector("#submissionform").appendChild(document.createElement("p"))
                        document.querySelector("#submissionform").appendChild(catlb)
                        document.querySelector("#submissionform").appendChild(document.createElement("br"))
                        document.querySelector("#submissionform").appendChild(catsel)
                    }
                }
            }
            let varc = (vari, lvls, cats) => {
                let catselv = document.querySelector("#catsel").value
                let lvlsel = document.querySelector("#lvlsel")
                let appvari = []
                if (lvlsel == null) {
                    appvari = vari.filter(variable => { 
                        if (variable.category != null) {
                            return cats.find(cat => variable.category == cat.id).id == catselv
                        } else {
                            return variable.scope.type == "full-game" || variable.scope.type == "global"
                        }
                    })
                } else {
                    appvari = vari.filter(variable => { 
                        if (variable.category != null && variable.scope.type != "single-level" ) {
                            return cats.find(cat => variable.category == cat.id).id == catselv
                        } else if (variable.scope.type == "single-level" && variable.category != null) {
                            return lvls.find(level => level.id == variable.scope.level).name == lvlsel.value && cats.find(cat => variable.category == cat.id).id == catselv
                        } else {
                            return variable.scope.type == "all-levels" || variable.scope.type == "global"
                        }
                    })
                }
                let form = document.querySelector("#varform")
                form.innerHTML = ""
                if (appvari.length == 0) { document.querySelector("#varh3").classList.add("invisible"); form.innerHTML == "" } else {
                    document.querySelector("#varh3").classList.remove("invisible")
                    appvari.forEach(appvar => {
                        let inp = document.createElement("select")
                        let label = document.createElement("label")
                        if (!appvar.mandatory) {
                            let op = document.createElement("option")
                            op.value = null
                            op.innerHTML = ` - `
                            inp.appendChild(op)
                        }
                        if (appvar["user-defined"]) {
                            let op = document.createElement("option")
                            op.value = 1
                            op.innerHTML = `Define`
                            inp.appendChild(op)
                        }
                        for (value of Object.keys(appvar.values.values)) {
                            let op = document.createElement("option")
                            op.value = value
                            op.innerHTML = `${appvar.values.values[value].label}`
                            inp.appendChild(op)
                        }
                        label.innerHTML = `${appvar.name}: `
                        form.appendChild(document.createElement("p"))
                        form.appendChild(label)
                        form.appendChild(document.createElement("br"))
                        form.appendChild(inp)
                        if (appvar["user-defined"]) {
                            let definedvar = document.createElement("input")
                            definedvar.id = "definedvar"
                            definedvar.type = "text"
                            form.appendChild(definedvar)
                            inp.addEventListener("change", () => {
                                if (document.querySelector("#definedvar") == null && inp.value == 1) {
                                    let definedvar = document.createElement("input")
                                    definedvar.id = "definedvar"
                                    definedvar.type = "text"
                                    form.appendChild(definedvar)
                                } else if (document.querySelector("#definedvar") != null && inp.value != 1) {
                                    form.removeChild(document.querySelector("#definedvar"))
                                } 
                            })
                        }
                    })
                }   
            }
            lvlc(lvls, cats); varc(vari, lvls, cats)
            document.querySelector("#catsel").addEventListener("change", () => {lvlc(lvls); varc(vari, lvls, cats)})
		} catch (e) {alert(`There was an error, please contact Bluestonex64 (Bluestonex64#9816). \n\n${e}`); button.disabled = false; throw e}
	}
	button.disabled = false
})
