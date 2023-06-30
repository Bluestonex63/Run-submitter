const key = document.querySelector("#key")
const game = document.querySelector("#game")
const button = document.querySelector("#gameBtn")
const src = "https://www.speedrun.com/api/v1/"
let sel = []
let platforms = []
let regions = []
let sellist = []
let ge = false
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
    let api = await fetch("https://submitter.deno.dev/srcPOSTruns", {
        method: "POST",
        headers: {
            "X-API-key": key,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(run)
    })
    api = await api.json()
    alert(api.message)
    location.reload()
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
                opt.value = `${lvl["id"]}`
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
                return lvls.find(level => level.id == variable.scope.level).id == lvlsel.value && cats.find(cat => variable.category == cat.id).id == catselv
            } else if (variable.scope.type == "single-level" && variable.category == null) {
                return lvls.find(level => level.id == variable.scope.level).id == lvlsel.value
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
            inp.id = appvar.id
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
    document.querySelector("#submit").disabled = true
    document.querySelector("#generate").disabled = true
    document.querySelector("#addarun").disabled = true
    button.disabled = true
    if (platforms.length == 0) {
        for (let offset = 0; offset < 50; offset++) {
            let plats = await fetch(src + `platforms?max=200&offset=${offset*200}`).then(x => x.json())
            platforms = platforms.concat(plats.data)
            if (plats.data.length < 200) { break }
        }
    }
    if (regions.length == 0) {
        for (let offset = 0; offset < 50; offset++) {
            let reg = await fetch(src + `regions?max=200&offset=${offset*200}`).then(x => x.json())
            regions = regions.concat(reg.data)
            if (reg.data.length < 200) { break }
        }
    }
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
        document.querySelector('#defdate').value = new Date().toDateInputValue();
        if (masterdiv.querySelector("#comment").classList.contains("invisible")) {masterdiv.querySelector("#comment").classList.remove("invisible")}
        if (masterdiv.querySelector("#time").classList.contains("invisible")) {masterdiv.querySelector("#time").classList.remove("invisible")}
        if (masterdiv.querySelector("#video").classList.contains("invisible")) {masterdiv.querySelector("#video").classList.remove("invisible")}
        if (r.data.ruleset["show-milliseconds"]) {
            for (time of ["realtime", "realtime_noloads", "ingame"]) {
                masterdiv.querySelector("#" + time + "ms").disabled = false
                document.querySelector("#def" + time + "ms").disabled = false
            }
        } else {
            for (time of ["realtime", "realtime_noloads", "ingame"]) {
                masterdiv.querySelector("#" + time + "ms").disabled = true
                masterdiv.querySelector("#" + time + "ms").value = ""
                document.querySelector("#def" + time + "ms").disabled = true
                document.querySelector("#def" + time + "ms").value = ""
            }
        }
        masterdiv.querySelector("#regionsel").innerHTML = ""
        document.querySelector("#defregionsel").innerHTML = ""
        if (r.data["regions"].length == 0) {
            if (!masterdiv.querySelector("#regiondiv").classList.contains("invisible")) {masterdiv.querySelector("#regiondiv").classList.add("invisible")}
            if (!document.querySelector("#defregiondiv").classList.contains("invisible")) {document.querySelector("#defregiondiv").classList.add("invisible")}
        } else {
            if (masterdiv.querySelector("#regiondiv").classList.contains("invisible")) {masterdiv.querySelector("#regiondiv").classList.remove("invisible")}
            let re = document.createElement("option")
            re.innerHTML = "None"
            re.value = null
            masterdiv.querySelector("#regionsel").appendChild(re)
            for (region of regions) {
                if (r.data["regions"].includes(region.id)) {
                    let re = document.createElement("option")
                    re.innerHTML = region.name
                    re.value = region.id
                    masterdiv.querySelector("#regionsel").appendChild(re)
                }
            }
            if (document.querySelector("#defregiondiv").classList.contains("invisible")) {document.querySelector("#defregiondiv").classList.remove("invisible")}
            re = document.createElement("option")
            re.innerHTML = "None"
            re.value = null
            document.querySelector("#defregionsel").appendChild(re)
            for (region of regions) {
                if (r.data["regions"].includes(region.id)) {
                    let re = document.createElement("option")
                    re.innerHTML = region.name
                    re.value = region.id
                    document.querySelector("#defregionsel").appendChild(re)
                }
            }
        }
        for (time of ["realtime", "realtime_noloads", "ingame"]) {
            if (r.data.ruleset["run-times"].includes(time)) {
                if(masterdiv.querySelector("#" + time + "mdiv").classList.contains("invisible")) {
                    masterdiv.querySelector("#" + time + "mdiv").classList.remove("invisible")
                }
                if(document.querySelector("#def" + time + "mdiv").classList.contains("invisible")) {
                    document.querySelector("#def" + time + "mdiv").classList.remove("invisible")
                }
            } else {
                if(!masterdiv.querySelector("#" + time + "mdiv").classList.contains("invisible")) {
                    masterdiv.querySelector("#" + time + "mdiv").classList.add("invisible")
                }
                if(!document.querySelector("#def" + time + "mdiv").classList.contains("invisible")) {
                    document.querySelector("#def" + time + "mdiv").classList.add("invisible")
                }
                for (i of ["hours", "secs", "mins", "ms"]) {
                    masterdiv.querySelector("#" + time + i).value = ""
                    document.querySelector("#def" + time + i).value = ""
                }
            }
        }
        lvlc(lvls, cats, masterdiv); varc(vari, lvls, cats, masterdiv)
        let old_element = masterdiv.querySelector("#catsel");
        let new_element = old_element.cloneNode(true);
        old_element.parentNode.replaceChild(new_element, old_element);
        masterdiv.querySelector("#catsel").addEventListener("change", () => {
            lvlc(lvls, cats, masterdiv); varc(vari, lvls, cats, masterdiv)
            try {
                let sellvl = masterdiv.querySelector("#lvlsel").options[masterdiv.querySelector("#lvlsel").selectedIndex]
                let old_element = masterdiv.querySelector("#lvlsel");
                let new_element = old_element.cloneNode(true);
                old_element.parentNode.replaceChild(new_element, old_element);
                Array.from(new_element.options).find(option => option.value == sellvl.value).selected = true
                masterdiv.querySelector("#lvlsel").addEventListener("change", () => {varc(vari, lvls, cats, masterdiv)})}
            catch {}
        })
        try {
            let sellvl = masterdiv.querySelector("#lvlsel").options[masterdiv.querySelector("#lvlsel").selectedIndex]
            let old_element = masterdiv.querySelector("#lvlsel");
            let new_element = old_element.cloneNode(true);
            Array.from(new_element.options).find(option => option.value == sellvl.value).selected = true
            old_element.parentNode.replaceChild(new_element, old_element);
            masterdiv.querySelector("#lvlsel").addEventListener("change", () => {varc(vari, lvls, cats, masterdiv)})}
        catch {}
    }
    document.querySelector("#defaultcat").innerHTML = ""
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
        let catselv = document.querySelector("#defaultcat")
        let lvlselv = document.querySelector("#defaultlvl")
        let sellvls = getSelectValues(lvlselv)
        lvlselv.innerHTML = ""
        let isIL = getSelectValues(catselv).find(val => Array.from(catselv).map(a => a.value).includes(val)) //.text.split(" - ")[1] == "IL"
        if (isIL != undefined) {  
            for (gene of document.getElementsByName("runsgen")) {gene.disabled = false}
            if (Array.from(catselv).find(val => val.value == isIL).text.split(" - ")[1] == "IL") {
                lvls.forEach(lvl => {
                    let opt = document.createElement("option");
                    opt.innerHTML = `${lvl["name"]}`
                    opt.value = `${lvl["id"]}`
                    lvlselv.appendChild(opt)
                })
                for (sellvl of sellvls) {
                    Array.from(lvlselv).find(a => a.value == sellvl).selected = true
                }
                if (lvlselv.parentElement.classList.contains("invisible")) { lvlselv.parentElement.classList.remove("invisible") }
            } else {
                for (gene of document.getElementsByName("runsgen")) {gene.disabled = true}
                if (!lvlselv.parentElement.classList.contains("invisible")) { lvlselv.parentElement.classList.add("invisible") }
            }
        } else {
            for (gene of document.getElementsByName("runsgen")) {gene.disabled = true}
            if (!lvlselv.parentElement.classList.contains("invisible")) { lvlselv.parentElement.classList.add("invisible") }
        }
    }
    let varup = (vari, cats, lvls) => {
        let catselv = document.querySelector("#defaultcat")
        let lvlselv = document.querySelector("#defaultlvl")
        let appvari = []
        if (lvlselv.parentElement.classList.contains("invisible")) {
            appvari = vari.filter(variable => { 
                if (variable.category != null) {
                    return getSelectValues(catselv).includes(cats.find(cat => variable.category == cat.id).id)
                } else {
                    return variable.scope.type == "full-game" || variable.scope.type == "global"
                }
            })
        } else {
            appvari = vari.filter(variable => { 
                if (variable.category != null && variable.scope.type != "single-level" ) {
                    return getSelectValues(catselv).includes(cats.find(cat => variable.category == cat.id).id)
                } else if (variable.scope.type == "single-level" && variable.category != null) {
                    return getSelectValues(lvlselv).includes(lvls.find(level => level.id == variable.scope.level).id) && getSelectValues(catselv).includes(cats.find(cat => variable.category == cat.id).id)
                } else if (variable.scope.type == "single-level" && variable.category == null) {
                    return getSelectValues(lvlselv).includes(lvls.find(level => level.id == variable.scope.level).id)
                } else {
                    return variable.scope.type == "all-levels" || variable.scope.type == "global"
                }
            })
        }
        let form = document.querySelector("#defvariables")
        form.innerHTML = ""
        if (appvari.length == 0) { form.parentElement.classList.add("invisible"); form.innerHTML == "" } else {
            form.parentElement.classList.remove("invisible")
            appvari.forEach(appvar => {
                let inp = document.createElement("select")
                inp.id = appvar.id
                inp.classList.add("defvariableselector")
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
                    op.innerHTML = `${appvar.values.values[value].label}`
                    op.value = value
                    inp.appendChild(op)
                }
                label.innerHTML = `${appvar.name}: `
                if (appvar.category != null && appvar.scope.type != "single-level" ) { 
                    label.innerHTML = `${appvar.name} - ${cats.find(cat => cat.id == appvar.category).name}:`
                } else if (appvar.scope.type == "single-level" && appvar.category != null) {
                    label.innerHTML = `${appvar.name} - (${lvls.find(lvl => lvl.id == appvar.scope.level).name}) ${cats.find(cat => cat.id == appvar.category).name}:`
                } else if (appvar.scope.type == "single-level" && appvar.category == null) {
                    label.innerHTML = `${appvar.name} - ${lvls.find(lvl => lvl.id == appvar.scope.level).name}:`
                }
                form.appendChild(document.createElement("p"))
                form.appendChild(label)
                form.appendChild(document.createElement("br"))
                form.appendChild(inp)
                if (appvar["user-defined"]) {
                    inp.addEventListener("change", () => {
                        if (document.querySelector("#defdefinedvar") == null && inp.value == 1) {
                            let definedvar = document.createElement("input")
                            definedvar.id = "defdefinedvar"
                            definedvar.type = "text"
                            form.appendChild(definedvar)
                        } else if (document.querySelector("#defdefinedvar") != null && inp.value != 1) {
                            form.removeChild(document.querySelector("#defdefinedvar"))
                        } 
                    })
                }
            })
        }   
    }
    lvlup(cats, lvls); 
    varup(vari, cats, lvls)
    let old_element = document.querySelector("#defaultcat");
    let new_element = old_element.cloneNode(true);
    old_element.parentNode.replaceChild(new_element, old_element);
    document.querySelector("#defaultcat").addEventListener("change", (e) => {
        if(getSelectValues(e.target).some(v => {
            if(Array.from(e.target).find(val => v == val.value).text.split(" - ")[1] == "IL") {
                if(getSelectValues(e.target).some(va => {return Array.from(e.target).find(val => va == val.value).text.split(" - ")[1] == "FG"})) {return true}
            }
        })) {
            try {
                for (scope of ["IL", "FG"]) {
                    if (Array.from(e.target).find(val => val.value == getSelectValues(e.target).find(v => {
                        if (!sellist.includes(v)) {return v}
                    })).text.split(" - ")[1] == scope) {
                        for (v of getSelectValues(e.target)) {
                            if (Array.from(e.target).find(val => val.value == v).text.split(" - ")[1] == scope) {
                                Array.from(e.target).find(val => val.value == v).selected = false
                            }
                        }
                    }
                }
            } 
            catch {}
        }
        sellist = getSelectValues(e.target)  
    })
    document.querySelector("#defaultcat").addEventListener("change", () => {lvlup(cats, lvls); varup(vari, cats, lvls)})
    let old_element2 = document.querySelector("#defaultlvl");
    let new_element2 = old_element2.cloneNode(true);
    old_element2.parentNode.replaceChild(new_element2, old_element2);
    document.querySelector("#defaultlvl").addEventListener("change", () => {varup(vari, cats, lvls)})
    button.disabled = false
    ge = true
    document.querySelector("#generate").disabled = false
    document.querySelector("#submit").disabled = false
    document.querySelector("#addarun").disabled = false
})

document.querySelector("#addarun").addEventListener("click", () => {
    if (document.querySelectorAll(".masterdiv").length + 1 > 100) {
        alert("You can't have more than 100 runs!")
        return
    }
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
    try {fset.querySelector("#lvlinfo").innerHTML = fset.querySelector("#lvlsel").options[fset.querySelector("#lvlsel").selectedIndex].text; if (fset.querySelector("#lvlinfodiv").classList.contains("invisible")) {fset.querySelector("#lvlinfodiv").classList.remove("invisible")}}
    catch {if (!fset.querySelector("#lvlinfodiv").classList.contains("invisible")) {fset.querySelector("#lvlinfodiv").classList.add("invisible")}}
}
function hours_ms(e) {
    if (isNaN(Number(e.target.value)) || Number(e.target.value) < 0 || !Number.isInteger(Number(e.target.value))) {
        e.target.value = ""
    } else if (Number(e.target.value) > 999) {
        e.target.value = "999"
    } 
}
function mins_secs(e) {
    if (isNaN(Number(e.target.value)) || Number(e.target.value) < 0 || !Number.isInteger(Number(e.target.value))) {
        e.target.value = ""
    } else if (Number(e.target.value) > 59) {
        e.target.value = "59"
    } 
}
document.querySelector("#generate").addEventListener("click", (e) => {
    e.preventDefault()
    if (!ge) {
        alert("Please first input a game to generate runs")
    } else {
        let catsel = document.querySelector("#defaultcat")
        let lvlsel = document.querySelector("#defaultlvl")
        let video = document.querySelector("#defaultvid")
        let platform = document.querySelector("#default_platform").querySelector("select")
        let emulator;
        if (document.querySelector("#defemulator") != null) {
            emulator = document.querySelector("#defemulator").checked
        }
        let splits = document.querySelector("#defsplits")
        let comment = document.querySelector("#defcomment")
        let region = document.querySelector("#defregionsel")
        let date = document.querySelector("#defdate")
        let time = {"realtime": [], "ingame": [], "realtime_noloads": []}
        let model = document.querySelectorAll(".masterdiv")[0]
        model = model.cloneNode(true)
        if (!document.getElementsByName("runsgen")[0].disabled) {
            if (getSelectValues(lvlsel).length == 0) {
                alert("Please select at least 1 level")
                return
            }
            if (getSelectValues(catsel).length*getSelectValues(lvlsel).length > 100) {
                alert("This will result in more than 100 runs!")
                return
            }
        }
        if (getSelectValues(catsel).length == 0) {
            alert("Please select at least 1 category")
            return
        }
        if (getSelectValues(catsel).length > 100) {
            alert("This will result in more than 100 runs!")
            return
        }
        if (!splits.checkValidity()) {
            alert("Please input valid splits!")
        }
        for (m of document.querySelectorAll(".masterdiv")) {
            m.remove()
        }
        Array.from(document.querySelector("#deftime").children).forEach(t => {
            if (!t.classList.contains("invisible")) {
                time[Object.keys(time).find(key => t.id.includes(key))] = [t.children[2].children[0].value, t.children[2].children[2].value, t.children[2].children[4].value, t.children[2].children[6].value]
            }
        })
        if (document.getElementsByName("runsgen")[0].disabled) {
            for (cat of getSelectValues(catsel)) {
                let run2 = model.cloneNode(true)
                if (!run2.querySelector("#runinfo").classList.contains("invisible")) {run2.querySelector("#runinfo").classList.add("invisible")}
                run2.children[0].children[0].children[0].innerHTML = `Run ${document.querySelectorAll(".masterdiv").length +1}`
                if (document.querySelectorAll(".masterdiv").length +1 >= 100) {
                    run2.querySelector("#retractdiv").style.width = "115px"
                } else if (document.querySelectorAll(".masterdiv").length +1 >= 10) {
                    run2.querySelector("#retractdiv").style.width = "100px"
                }
                run2.querySelector("#videolink").value = video.value
                run2.querySelector("#catsel").value = cat
                run2.querySelector("#regionsel").value = region.value
                run2.querySelector("#pform").querySelector("select").value = platform.value
                if (document.querySelector("#defemulator") != null) {
                    run2.querySelector("#emulator").checked = emulator
                }
                run2.querySelector("#commentarea").value = comment.value
                run2.querySelector("#splits").value = splits.value
                run2.querySelector("#date").value = date.value
                Object.keys(time).forEach(t => {
                    if (time[t].length != 0) {
                        if (!time[t].every(timething => timething == "")) {
                            for (let i = 0; i < 4; i++) {
                                let hmsms = ["hours", "mins", "secs", "ms"]
                                run2.querySelector(`#${t}${hmsms[i]}`).value = time[t][i]
                            }
                        }
                    }
                })
                run2.querySelector("#delete").addEventListener("click", (e) => {
                    if (document.querySelectorAll(".masterdiv").length != 1) {
                        e.target.parentElement.parentElement.parentElement.remove()
                    } else {
                        alert("You can't delete your only run lmao, cuz I got too much skill issue for that")
                    }
                })
                if (run2.querySelector(".runwrapdiv").classList.contains("runinvisible")) {run2.querySelector(".runwrapdiv").classList.remove("runinvisible"); run2.querySelector("#retract").innerHTML = "-"}
                try {
                    varc(vari, lvls, cats, run2); 
                    for (variable of document.querySelectorAll(".defvariableselector")) {
                        for (v of run2.querySelectorAll(".variableselector")) {
                            if (v.id == variable.id) {
                                if (variable.value != "1") { 
                                    v.value = variable.value
                                } else {
                                    v.value = variable.value
                                    let definedvar = document.createElement("input")
                                    definedvar.id = "definedvar"
                                    definedvar.type = "text"
                                    definedvar.value = variable.parentElement.querySelector("#defdefinedvar").value
                                    v.parentElement.appendChild(definedvar)
                                }
                            }
                        }
                    }
                    run2.querySelector("#catsel").addEventListener("change", () => {lvlc(lvls, cats, run2); varc(vari, lvls, cats, run2)})
                }
                finally {
                    document.querySelector("#runsdisplayer").appendChild(run2)
                }
            }
        } else {
            if (document.getElementsByName("runsgen")[0].checked) {
                for (lvl of getSelectValues(lvlsel)) {
                    for (cat of getSelectValues(catsel)) {
                        let run2 = model.cloneNode(true)
                        if (!run2.querySelector("#runinfo").classList.contains("invisible")) {run2.querySelector("#runinfo").classList.add("invisible")}
                        run2.children[0].children[0].children[0].innerHTML = `Run ${document.querySelectorAll(".masterdiv").length +1}`
                        if (document.querySelectorAll(".masterdiv").length +1 >= 100) {
                            run2.querySelector("#retractdiv").style.width = "115px"
                        } else if (document.querySelectorAll(".masterdiv").length +1 >= 10) {
                            run2.querySelector("#retractdiv").style.width = "100px"
                        }
                        run2.querySelector("#videolink").value = video.value
                        run2.querySelector("#catsel").value = cat
                        run2.querySelector("#regionsel").value = region.value
                        run2.querySelector("#pform").querySelector("select").value = platform.value
                        if (document.querySelector("#defemulator") != null) {
                            run2.querySelector("#emulator").checked = emulator
                        }
                        run2.querySelector("#commentarea").value = comment.value
                        run2.querySelector("#splits").value = splits.value
                        run2.querySelector("#date").value = date.value
                        Object.keys(time).forEach(t => {
                            if (time[t].length != 0) {
                                if (!time[t].every(timething => timething == "")) {
                                    for (let i = 0; i < 4; i++) {
                                        let hmsms = ["hours", "mins", "secs", "ms"]
                                        run2.querySelector(`#${t}${hmsms[i]}`).value = time[t][i]
                                    }
                                }
                            }
                        })
                        run2.querySelector("#delete").addEventListener("click", (e) => {
                            if (document.querySelectorAll(".masterdiv").length != 1) {
                                e.target.parentElement.parentElement.parentElement.remove()
                            } else {
                                alert("You can't delete your only run lmao, cuz I got too much skill issue for that")
                            }
                        })
                        if (run2.querySelector(".runwrapdiv").classList.contains("runinvisible")) {run2.querySelector(".runwrapdiv").classList.remove("runinvisible"); run2.querySelector("#retract").innerHTML = "-"}
                        try {
                            lvlc(lvls, cats, run2); 
                            run2.querySelector("#lvlsel").value = lvl; 
                            varc(vari, lvls, cats, run2); 
                            for (variable of document.querySelectorAll(".defvariableselector")) {
                                for (v of run2.querySelectorAll(".variableselector")) {
                                    if (v.id == variable.id) {
                                        if (variable.value != "1") { 
                                            v.value = variable.value
                                        } else {
                                            v.value = variable.value
                                            let definedvar = document.createElement("input")
                                            definedvar.id = "definedvar"
                                            definedvar.type = "text"
                                            definedvar.value = variable.parentElement.querySelector("#defdefinedvar").value
                                            v.parentElement.appendChild(definedvar)
                                        }
                                    }
                                }
                            }
                            run2.querySelector("#catsel").addEventListener("change", () => {lvlc(lvls, cats, run2); varc(vari, lvls, cats, run2)})
                        }
                        finally {
                            document.querySelector("#runsdisplayer").appendChild(run2)
                        }
                    }
                }
            } else {
                for (cat of getSelectValues(catsel)) {
                    for (lvl of getSelectValues(lvlsel)) {
                        let run2 = model.cloneNode(true)
                        if (!run2.querySelector("#runinfo").classList.contains("invisible")) {run2.querySelector("#runinfo").classList.add("invisible")}
                        run2.children[0].children[0].children[0].innerHTML = `Run ${document.querySelectorAll(".masterdiv").length +1}`
                        if (document.querySelectorAll(".masterdiv").length +1 >= 100) {
                            run2.querySelector("#retractdiv").style.width = "115px"
                        } else if (document.querySelectorAll(".masterdiv").length +1 >= 10) {
                            run2.querySelector("#retractdiv").style.width = "100px"
                        }
                        run2.querySelector("#videolink").value = video.value
                        run2.querySelector("#catsel").value = cat
                        run2.querySelector("#regionsel").value = region.value
                        run2.querySelector("#pform").querySelector("select").value = platform.value
                        if (document.querySelector("#defemulator") != null) {
                            run2.querySelector("#emulator").checked = emulator
                        }
                        run2.querySelector("#commentarea").value = comment.value
                        run2.querySelector("#splits").value = splits.value
                        run2.querySelector("#date").value = date.value
                        Object.keys(time).forEach(t => {
                            if (time[t].length != 0) {
                                if (!time[t].every(timething => timething == "")) {
                                    for (let i = 0; i < 4; i++) {
                                        let hmsms = ["hours", "mins", "secs", "ms"]
                                        run2.querySelector(`#${t}${hmsms[i]}`).value = time[t][i]
                                    }
                                }
                            }
                        })
                        run2.querySelector("#delete").addEventListener("click", (e) => {
                            if (document.querySelectorAll(".masterdiv").length != 1) {
                                e.target.parentElement.parentElement.parentElement.remove()
                            } else {
                                alert("You can't delete your only run lmao, cuz I got too much skill issue for that")
                            }
                        })
                        if (run2.querySelector(".runwrapdiv").classList.contains("runinvisible")) {run2.querySelector(".runwrapdiv").classList.remove("runinvisible"); run2.querySelector("#retract").innerHTML = "-"}
                        try {
                            lvlc(lvls, cats, run2); 
                            run2.querySelector("#lvlsel").value = lvl; 
                            varc(vari, lvls, cats, run2); 
                            for (variable of document.querySelectorAll(".defvariableselector")) {
                                for (v of run2.querySelectorAll(".variableselector")) {
                                    if (v.id == variable.id) {
                                        if (variable.value != "1") { 
                                            v.value = variable.value
                                        } else {
                                            v.value = variable.value
                                            let definedvar = document.createElement("input")
                                            definedvar.id = "definedvar"
                                            definedvar.type = "text"
                                            definedvar.value = variable.parentElement.querySelector("#defdefinedvar").value
                                            v.parentElement.appendChild(definedvar)
                                        }
                                    }
                                }
                            }
                            run2.querySelector("#catsel").addEventListener("change", () => {lvlc(lvls, cats, run2); varc(vari, lvls, cats, run2)})
                        }
                        finally {
                            document.querySelector("#runsdisplayer").appendChild(run2)
                        }
                    }
                }
            }
        }
    }
})
document.querySelector("#submit").addEventListener("click", function() {
    if (confirm(`Are you sure you want to go through with this? \n \nYou are about to submit ${document.querySelectorAll(".masterdiv").length} runs. \n\nPlease double check everything before proceeding. \n\nClick "OK" to proceed.`)) {
        if (key.value == "") {
            al += "Please input an api key"
        }
        let allruns = {}
        al = ""
        for (run2 of document.querySelectorAll(".masterdiv")) {
            let time = {"realtime": 0, "ingame": 0, "realtime_noloads": 0}
            for (i of [["hours", 3600], ["mins", 60], ["secs", 1], ["ms", 0.001]]) {
                for (i2 of Object.keys(time)) {
                    if (!isNaN(Number(run2.querySelector("#" + i2 + i[0]).value))) {
                        time[i2] += Number(run2.querySelector("#" + i2 + i[0]).value) * i[1]
                    }
                }
            }
            try {
                let u = new URL(run2.querySelector("#videolink").value)
            } catch {
                al += run2.querySelector("#retractdiv").querySelector("h2").innerHTML + " doesn't have a valid video url.\n"
            }
            run = {
                "run": {
                    "category": run2.querySelector("#catsel").value ,
                    "date": run2.querySelector("#date").value,
                    "platform": run2.querySelector("#pform").querySelector("select").value,
                    "times": {},
                    "video": run2.querySelector("#videolink").value,
                    "variables": {}
                }
            }
            for (v of run2.querySelectorAll(".variableselector")) {
                run["run"]["variables"][v.id] = {}
                if (Array.from(v.options).every(op => op.value != 1)) {
                    run["run"]["variables"][v.id]["type"] = "pre-defined"
                    run["run"]["variables"][v.id]["value"] = v.value
                } else {
                    run["run"]["variables"][v.id]["type"] = "user-defined"
                    if (v.value == 1) {
                        run["run"]["variables"][v.id]["value"] = v.parentElement.querySelector("#definedvar").value
                        if (run["run"]["variables"][v.id]["value"] == "") {
                            al += run2.querySelector("#retractdiv").querySelector("h2").innerHTML + " doesn't have a valid value for the variable.\n"
                        }
                    } else {
                        run["run"]["variables"][v.id]["value"] = v.value
                    }
                }
            }
            if (run2.querySelector("#date").value == "") {
                al += run2.querySelector("#retractdiv").querySelector("h2").innerHTML + " doesn't have a valid date.\n"
            }
            if (run2.querySelector("#splits").value != "") {
                if (!run2.querySelector("#splits").checkValidity()) {
                    al += run2.querySelector("#retractdiv").querySelector("h2").innerHTML + " doesn't have a valid splits url.\n"
                }
                run["run"]["splitsio"] = run2.querySelector("#splits").value
            }
            if (run2.querySelector("#commentarea").value != "") {
                run["run"]["comment"] = run2.querySelector("#commentarea").value
            }
            console.log(run["run"]["variables"])
            if (run2.querySelector("#lvlsel") != null) {
                run["run"]["level"] = run2.querySelector("#lvlsel").value
            }
            if (run2.querySelector("#emulator") != null) {
                run["run"]["emulated"] = run2.querySelector("#emulator").checked
            }
            console.log(run2.querySelector("#regiondiv").classList)
            if (!run2.querySelector("#regiondiv").classList.contains("invisible")) {
                run["run"]["region"] = run2.querySelector("#regionsel").value
            }
            for (i of ["ingame", "realtime_noloads", "realtime"]) {
                if (!run2.querySelector("#"+i+"mdiv").classList.contains("invisible")) {
                    if (time[i] != 0) {
                        run["run"]["times"][i] = time[i]
                    } 
                }
            }
            if (Object.keys(run["run"]["times"]).length == 0) {
                al += run2.querySelector("#retractdiv").querySelector("h2").innerHTML + " doesn't have any valid times.\n"
            }
            allruns[`${Array.from(document.querySelectorAll(".masterdiv")).indexOf(run2)}`] = run
        }
        if (al != "") {
            alert(al)
            return
        } else {
            POSTrun(key.value, allruns)
        }
    }
}) 