const { ipcRenderer } = require('electron')
var active = ".main"
var last //only used when going back from the settings
var setting = false
var cache = {}
const $ = require('jquery')

function back() {
    $(active).hide()
    active = last
    $(".meta #savesettings").hide()
    console.log(`Last was: ${last}`)
    if (last == ".meta") {
        var game = $("#game").val() //conversion
        if (game == `"gta5", "rdr3"`) {
            game = "both"
        }
        if (game == "'common'") {
            game = "common"
        }
        $(".meta #fxv").val(cache.fxv.charAt(0).toUpperCase() + cache.fxv.slice(1) || "Cerulean").change()
        $(".meta #game").val(game).change()
        $(".meta #author").val(cache.auth)
        $(".meta #descr").val(cache.descr)
        $(".meta h1").show()
        $(".meta #metaD").show()
        $(".meta #quickmode").remove()
        $(".oneclick").remove()
        $(".meta .ql").remove()

    } else {
        $(".meta").hide()
    }
    $(".meta h1").show()
    $(".meta #metaD").show()
    $(".sett").show()
    $(".settings").hide()
    $(".meta #quickmode").remove()
    $(".oneclick").remove()
    $(".meta .ql").remove()
    $(".meta #goback").hide()
    console.log(`Showing: ${last}`)
    $(last).show()
}

$(() => {
    $(".main").fadeIn(500)
    $(".meta").hide()
    $(".parse").hide()
    $(".finalize").hide()
    $(".done").hide()
    $(".settings").hide()
    console.log("Running browser thread")
    $(".open").click(() => {
        ipcRenderer.send("openFolder")
    })

    $("#metaD").click(() => {
        var game = $("#game").val()
        if (game == "both") {
            game = `"gta5", "rdr3"`
        }
        if (game == "common") {
            game = "'common'"
        }
        const meta = {
            fxv: $("#fxv").val(),
            game: game,
            auth: $("#author").val() || "no one",
            descr: $("#descr").val() || "nothing"
        }
        ipcRenderer.send("metadata", meta)
        $(".meta").fadeOut(100, () => {
            active = ".parse"
            $(".parse").fadeIn(100)
        })

    })
    $("#createFile").click(() => {
        ipcRenderer.send("build")
    })
    $("#exit").click(() => {
        ipcRenderer.send("exit")
    })
    $(".sett").click(() => {
        $(".sett").hide()
        $(active).hide() //TODO! all .hide(), .show() should use the active variable instead of hardcoded values but nah too much work (10 seconds) and I love inconsistent code, also there should be only one .click event and do checks there for the currently clicked button
        last = active

        if (active == ".meta") {
            var game = $("#game").val()
            if (game == "both") {
                game = `"gta5", "rdr3"`
            }
            if (game == "common") {
                game = "'common'"
            }
            console.log("Defining cache")
            cache = {
                fxv: $("#fxv").val(),
                game: game,
                auth: $("#author").val() || "no one",
                descr: $("#descr").val() || "nothing",
            }
        }
        active = ".sett"
        ipcRenderer.send("getSettings")
    })
    $("#goback").click(() => {
        back()
    })
    $("#savesettings").click(() => {
        //TODO! Save settings
        var game = $("#game").val()
        if (game == "both") {
            game = `"gta5", "rdr3"`
        }
        if (game == "common") {
            game = "'common'"
        }

        const meta = {
            fxv: $("#fxv").val(),
            game: game,
            auth: $("#author").val() || "no one",
            descr: $("#descr").val() || "nothing",
            quickMode: $("#quickmode").is(':checked')
        }

        ipcRenderer.send("setSettings", meta)
        back()
    })
})
ipcRenderer.on("settings", (ev, data) => {
    active = ".settings"
    $(".settings").show()
    setting = true
    $(".meta").prepend(`
    <center>
    <div class="oneclick">
    <label for="quickmode" class="ql"> One click manifest creation</label>
    <input type="checkbox" id="quickmode" name="quickmode" value="Quick mode"> <br><br>
    </div>
    </center>
    `)
    var game = data.games.charAt(0).toUpperCase() + data.games.slice(1) //conversion
    if (game == `"gta5", "rdr3"`) {
        game = "both"
    }
    if (game == "'common'") {
        game = "common"
    }
    console.log(game)
    $(".meta").show() //reusing the meta form with some changes
    $(".meta h1").hide()
    $(".meta #metaD").hide() //filling the settings form with the data read from the settings file
    $(".meta #fxv").val(data.version.charAt(0).toUpperCase() + data.version.slice(1) || "Cerulean").change()
    $(".meta #game").val(game).change()
    $("#quickmode").prop("checked", data.autoBuild || false)
    $(".meta #author").val(data.author)
    $(".meta #descr").val(data.description)
    $(".meta #savesettings").show()
    $(".meta #goback").show()
})
ipcRenderer.on("openForm", (event, data) => {
    $(".main").fadeOut(500, () => {
        active = ".meta"
        $(".meta").fadeIn(500)
    })
})

ipcRenderer.on("parsedFiles", (event, data) => {
    $(".parse").empty()
    active = ".finalize"
    $(".finalize").show()
    $(".results").empty()
    $(".results").append(`<tr>
    <th>Name</th>
    <th>Entry type</th>
</tr>`)
    data.forEach(entry => {
        $(".results").append(`<tr><td>${entry.name}</td><td>${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}</td></tr>`)
    })
})

ipcRenderer.on("written", (event) => {
    $(".finalize").fadeOut(500, () => {
        active = ".done"
        $(".done").fadeIn(500)
    })
})
ipcRenderer.on("parse", (event) => {
    $(active).fadeOut(500, () => {
        $(".done").fadeIn(500)
    })
})


ipcRenderer.on("redir", (ev, data) => {
    ipcRenderer.send(data.__name, data)
})