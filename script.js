const key = document.querySelector("#key")
const game = document.querySelector("#game")
const button = document.querySelector("#gameBtn")
const src = "https://www.speedrun.com/api/v1/"
let sel = []
let platforms = []
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});
function getSelectValues(select) {
    var result = [];
    var options = select && select.options;
    var opt;
  
    for (var i=0, iLen=options.length; i<iLen; i++) {
      opt = options[i];
  
      if (opt.selected) {
        result.push(opt.value || opt.text);
      }
    }
    return result;
}
let POSTrun = async (key, run) => {
    /*http://localhost:3000/srcPOSTruns*/
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
document.querySelector("#delete").addEventListener("click", (e) => {
    if (document.querySelectorAll(".masterdiv").length != 1) {
        e.target.parentElement.parentElement.parentElement.remove()
    } else {
        alert("You can't delete your only run lmao, cuz I got too much skill issue for that")
    }
})
let lvlc = (lvls, cats, masterdiv) => {
    let form = masterdiv.querySelector("#submissionform")
    let catselv = masterdiv.querySelector("#catsel").value
    let lvlselv = masterdiv.querySelector("#lvlsel")
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
            const catsel = masterdiv.querySelector("#catsel")
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
            masterdiv.querySelector("#submission").innerHTML = ""
            masterdiv.querySelector("#submission").appendChild(form)
            lvlsel.addEventListener("change", () => {varc(vari, lvls, cats, masterdiv)})
        } else {
            const catsel = masterdiv.querySelector("#catsel")
            catsel.addEventListener("change", () => {
                lvlc(lvls, cats, masterdiv); varc(vari, lvls, cats, masterdiv)
                try {masterdiv.querySelector("#lvlsel").addEventListener("change", () => {varc(vari, lvls, cats, masterdiv)})}
                catch {}
            })
            masterdiv.querySelector("#submissionform").innerHTML = ""
            let catlb = document.createElement("label")
            let cath3 = document.createElement("h3")
            cath3.innerHTML = "Category: "
            cath3.id = "catlb"
            catlb.innerHTML = "Select the category:"
            masterdiv.querySelector("#submissionform").appendChild(cath3)
            masterdiv.querySelector("#submissionform").appendChild(document.createElement("p"))
            masterdiv.querySelector("#submissionform").appendChild(catlb)
            masterdiv.querySelector("#submissionform").appendChild(document.createElement("br"))
            masterdiv.querySelector("#submissionform").appendChild(catsel)
        }
    }
}
let varc = (vari, lvls, cats, masterdiv) => {
    let catselv = masterdiv.querySelector("#catsel").value
    let lvlsel = masterdiv.querySelector("#lvlsel")
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
    let form = masterdiv.querySelector("#varform")
    form.innerHTML = ""
    if (appvari.length == 0) { masterdiv.querySelector("#variables").classList.add("invisible"); form.innerHTML == "" } else {
        masterdiv.querySelector("#variables").classList.remove("invisible")
        appvari.forEach(appvar => {
            let inp = document.createElement("select")
            inp.classList.add("variableselector")
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
                    if (masterdiv.querySelector("#definedvar") == null && inp.value == 1) {
                        let definedvar = document.createElement("input")
                        definedvar.id = "definedvar"
                        definedvar.type = "text"
                        form.appendChild(definedvar)
                    } else if (masterdiv.querySelector("#definedvar") != null && inp.value != 1) {
                        form.removeChild(masterdiv.querySelector("#definedvar"))
                    } 
                })
            }
        })
    }   
}
button.addEventListener("click", async function() {
    if (platforms.length == 0) {
        for (let offset = 0; offset < 50; offset++) {
            let plats = await fetch(src + `platforms?max=200&offset=${offset*200}`).then(x => x.json())
            platforms = platforms.concat(plats.data)
            if (plats.data.length < 200) { break }
        }
    }
    button.disabled = true
    let r = {}
        lvls = {}
        cats = {}
        vari = {}
    try {
        r = await fetch(src + `games/${game.value}`).then(x => x.json())
        if (r.status == 404) { alert("The game does not exist"); button.disabled = false; return} else if (r.status != undefined) { alert("There was an error, please try again later") }
        lvls = await fetch(src + `games/${r.data.id}/levels`).then(x => x.json()).then(x => x.data)
        cats = await fetch(src + `games/${r.data.id}/categories`).then(x => x.json()).then(x => x.data)
        vari = await fetch(src + `games/${r.data.id}/variables`).then(x => x.json()).then(x => x.data)
        } catch (e) {alert(`There was an error, please contact Bluestonex64 (Bluestonex64#9816). \n\n${e}`); button.disabled = false; throw e}
    for (masterdiv of document.querySelectorAll(".masterdiv")) {
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
            masterdiv.querySelector("#submission").innerHTML = ""
            masterdiv.querySelector("#submission").appendChild(form)
        } 
        let appplats = platforms.filter(platform => {
            return r.data.platforms.includes(platform.id)
        })
        if (appplats.length == 0) { if (!masterdiv.querySelector("#platforms").classList.contains("invisible")) {masterdiv.querySelector("#platforms").classList.add("invisible")} } else {
            let plath3 = masterdiv.querySelector("#plath3")
            let pform = masterdiv.querySelector("#pform")
            let defplatform = document.querySelector("#default_platform")
            defplatform.innerHTML = ""
            masterdiv.querySelector("#platforms").classList.remove("invisible") 
            let sel = document.createElement("select")
            pform.innerHTML = ""
            for (plat of appplats) {
                let o = document.createElement("option")
                o.innerHTML = plat.name
                o.value = plat.id
                sel.appendChild(o)
            }
            pform.appendChild(document.createElement("p"))
            let lbl = document.createElement("label")
            let lbldef = document.createElement("label")
            if (r.data.ruleset["emulators-allowed"]) {
                lbl.innerHTML = "Choose the platform: ("
                lbldef.innerHTML = "<strong>Set the default platform:</strong>"
                let emulbl = document.createElement("label")
                let emulbldef = document.createElement("label")
                emulbl.innerHTML = "Emulator )"
                emulbldef.innerHTML = "(<input type='checkbox' id='defemulator'>Emulator)"
                let inp = document.createElement("input")
                inp.type = "checkbox"
                inp.id = "emulator"
                defplatform.appendChild(lbldef)
                defplatform.appendChild(document.createElement("br"))
                defplatform.appendChild(emulbldef)
                defplatform.appendChild(document.createElement("br"))
                defplatform.appendChild(sel)
                pform.appendChild(lbl.cloneNode(true));
                pform.appendChild(inp.cloneNode(true));
                pform.appendChild(emulbl.cloneNode(true));
                pform.appendChild(document.createElement("br"));
                pform.appendChild(sel.cloneNode(true));
            } else {
                lbl.innerHTML = "Choose the platform:"
                lbldef.innerHTML = "<strong>Set the default platform:</strong>"
                defplatform.appendChild(lbldef)
                defplatform.appendChild(document.createElement("br"))
                defplatform.appendChild(sel)
                pform.appendChild(lbl.cloneNode(true));
                pform.appendChild(document.createElement("br"));
                pform.appendChild(sel.cloneNode(true));
            }
        }
        masterdiv.querySelector('#date').value = new Date().toDateInputValue();
        if (masterdiv.querySelector("#comment").classList.contains("invisible")) {masterdiv.querySelector("#comment").classList.remove("invisible")}
        if (masterdiv.querySelector("#time").classList.contains("invisible")) {masterdiv.querySelector("#time").classList.remove("invisible")}
        if (masterdiv.querySelector("#video").classList.contains("invisible")) {masterdiv.querySelector("#video").classList.remove("invisible")}
        for (time of ["realtime", "realtime_noloads", "ingame"]) {
            if (r.data.ruleset["run-times"].includes(time)) {
                if(masterdiv.querySelector("#" + time + "mdiv").classList.contains("invisible")) {
                    masterdiv.querySelector("#" + time + "mdiv").classList.remove("invisible")
                }
            } else {
                if(!masterdiv.querySelector("#" + time + "mdiv").classList.contains("invisible")) {
                    masterdiv.querySelector("#" + time + "mdiv").classList.add("invisible")
                }
            }
        }
        lvlc(lvls, cats, masterdiv); varc(vari, lvls, cats, masterdiv)
        masterdiv.querySelector("#catsel").addEventListener("change", () => {
            lvlc(lvls, cats, masterdiv); varc(vari, lvls, cats, masterdiv)
            try {masterdiv.querySelector("#lvlsel").addEventListener("change", () => {varc(vari, lvls, cats, masterdiv)})}
            catch {}
        })
        try {masterdiv.querySelector("#lvlsel").addEventListener("change", () => {varc(vari, lvls, cats, masterdiv)})}
        catch {}
    }
    document.querySelector("#defaultcat").innerHTML = ""
    let opt = document.createElement("option");
    document.querySelector("#defaultcat").appendChild(opt)
    cats.forEach(cat => {
        let opt = document.createElement("option");
        if (cat["type"] == "per-game") {
            opt.innerHTML = `<option>${cat["name"]} - FG</option>`
        } else {
            opt.innerHTML = `<option>${cat["name"]} - IL</option>`
        }
        opt.value = cat["id"]
        document.querySelector("#defaultcat").appendChild(opt)
    })
    let lvlup = (cats, lvls) => {
        let catselv = document.querySelector("#defaultcat").value
        let lvlselv = document.querySelector("#defaultlvl")
        lvlselv.innerHTML = ""
        let isIL = cats.some(cat => (catselv == cat.id && cat.type == "per-level") || catselv == "")
        if (lvls.length != 0 && isIL) {   
            lvls.forEach(lvl => {
                let opt = document.createElement("option");
                opt.innerHTML = `${lvl["name"]}`
                lvlselv.appendChild(opt)
            })
            if (lvlselv.parentElement.classList.contains("invisible")) { lvlselv.parentElement.classList.remove("invisible") }
        } else {
            if (!lvlselv.parentElement.classList.contains("invisible")) { lvlselv.parentElement.classList.add("invisible") }
        }
    }
    lvlup(cats, lvls)
    document.querySelector("#defaultcat").addEventListener("change", () => {lvlup(cats, lvls)})
    button.disabled = false
})

document.querySelector("#addarun").addEventListener("click", () => {
    let run2 = document.querySelectorAll(".masterdiv")[0]
    run2 = run2.cloneNode(true)
    if (!run2.querySelector("#runinfo").classList.contains("invisible")) {run2.querySelector("#runinfo").classList.add("invisible")}
    run2.children[0].children[0].children[0].innerHTML = `Run ${document.querySelectorAll(".masterdiv").length +1}`
    if (document.querySelectorAll(".masterdiv").length +1 >= 100) {
        run2.querySelector("#retractdiv").style.width = "115px"
    } else if (document.querySelectorAll(".masterdiv").length +1 >= 10) {
        run2.querySelector("#retractdiv").style.width = "100px"
    }
    run2.querySelector("#delete").addEventListener("click", (e) => {
        if (document.querySelectorAll(".masterdiv").length != 1) {
            e.target.parentElement.parentElement.parentElement.remove()
        } else {
            alert("You can't delete your only run lmao, cuz I got too much skill issue for that")
        }
    })
    if (run2.querySelector(".runwrapdiv").classList.contains("runinvisible")) {run2.querySelector(".runwrapdiv").classList.remove("runinvisible"); run2.querySelector("#retract").innerHTML = "-"}
    try {lvlc(lvls, cats, run2); varc(vari, lvls, cats, run2); run2.querySelector("#catsel").addEventListener("change", () => {lvlc(lvls, cats, run2); varc(vari, lvls, cats, run2)})}
    finally {document.querySelectorAll(".masterdiv")[document.querySelectorAll(".masterdiv").length-1].parentElement.appendChild(run2)}
})

let retract = (e) => {
    let fset = e.target.parentElement.parentElement.parentElement
    if (fset.querySelector(".runwrapdiv").classList.contains("runinvisible")) {
        fset.querySelector(".runwrapdiv").classList.remove("runinvisible")
        fset.querySelector("#runinfo").classList.add("invisible")
        e.target.innerHTML = "-"
    } else {
        fset.querySelector(".runwrapdiv").classList.add("runinvisible")
        fset.querySelector("#runinfo").classList.remove("invisible")
        e.target.innerHTML = "+"
    }
    // ADD VARIABLES AND MAKE IT PRETTY
    for (opt of fset.querySelector("#catsel").options) {if (opt.value == fset.querySelector("#catsel").value) {fset.querySelector("#catinfo").innerHTML = opt.text}}
    if (fset.querySelectorAll(".variableselector").length == 0) {fset.querySelector("#varinfo").innerHTML = ""}
    for (variable of fset.querySelectorAll(".variableselector")) {
        for (opt of variable) {
            if (opt.value == variable.value) {
                if (fset.querySelectorAll(".variableselector").length > 1) {
                    if (Array.from(fset.querySelectorAll(".variableselector")).indexOf(variable) == 0) {
                        fset.querySelector("#varinfo").innerHTML = "(" + opt.text + ", "
                    } else if (Array.from(fset.querySelectorAll(".variableselector")).indexOf(variable) == fset.querySelectorAll(".variableselector").length-1) {
                        fset.querySelector("#varinfo").innerHTML += opt.text + ")"
                    } else {
                        fset.querySelector("#varinfo").innerHTML += opt.text + ", "
                    }
                } else {
                    fset.querySelector("#varinfo").innerHTML = "(" + opt.text + ")"
                }
                break
            }
        }
    }
    try {fset.querySelector("#lvlinfo").innerHTML = fset.querySelector("#lvlsel").value; if (fset.querySelector("#lvlinfodiv").classList.contains("invisible")) {fset.querySelector("#lvlinfodiv").classList.remove("invisible")}}
    catch {if (!fset.querySelector("#lvlinfodiv").classList.contains("invisible")) {fset.querySelector("#lvlinfodiv").classList.add("invisible")}}
}

document.querySelector("#defaultcat").addEventListener("change", (e) => {
    for (v of getSelectValues(e.target)) {
        //console.log(Array.from(e.target).find(val => v == val.value).text)
    }
})
