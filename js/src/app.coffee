root = @
apiConfig =
    client_id: "561376060487.apps.googleusercontent.com"
    scope: ["https://www.googleapis.com/auth/drive"]


mimeType = "text/html"
boundary = "-------314159265358979323846"
delimiter = "\r\n--#{boundary}\r\n"
closeDelim = "\r\n--#{boundary}--"


class Actions extends Spine.Controller
    el: $("#actions")
    events:
        "click .auth": "auth"
        "click .save": "save"
        "click .upload": "upload"
        "click .savecancel": "savecancel"
    elements:
        ".auth": "$auth"
        ".save": "$save"
        ".title": "$title"
        ".upload": "$upload"
        ".savecancel": "$savecancel"
        ".docurl": "$docurl"
    auth: (e) =>
        apiConfig.immediate = false
        gapi.auth.authorize(apiConfig, @proxy((token) ->
            if token
                @$auth.hide()
                @$save.show()
                app.editor.enable()
            return
            ))
    save: (e) =>
        @$save.hide()
        @$title.show().select()
        @$upload.show()
        @$savecancel.show()
        app.editor.disable()
        return
    upload: (e) =>
        @$title.prop("disabled", true)
        @$upload
            .data("oldval", @$upload.val())
            .val("Saving...")
            .prop("disabled", true)
        @$savecancel.prop("disabled", true)

        title = @$title.val()
        metadata =
            mimeType: mimeType
            title: title
            parents: null
            userPermission: null
        base64Data = btoa(app.output.el.html())
        body =
            delimiter +
            "Content-Type: application/json\r\n\r\n" +
            JSON.stringify(metadata) +
            delimiter +
            "Content-Type: #{mimeType}\r\n" +
            "Content-Transfer-Encoding: base64\r\n" +
            "\r\n" +
            base64Data +
            closeDelim

        gapi.client.request(
            path: "/upload/drive/v2/files",
            method: "POST",
            params:
                uploadType: "multipart",
                convert: true
            headers:
                "Content-Type": "multipart/mixed; boundary=\"#{boundary}\""
            body: body
            )
            .execute(@proxy((doc) ->
                @$title
                    .prop("disabled", false)
                    .hide()
                @$upload
                    .val(@$upload.data("oldval"))
                    .prop("disabled", false)
                    .hide()
                @$savecancel
                    .prop("disabled", false)
                    .hide()
                @$save
                    .data("oldval", @$save.val())
                    .val("Saved as #{title}")
                    .show()
                @$docurl
                    .html($("<a>")
                        .attr("href", doc.alternateLink)
                        .attr("target", "_blank")
                        .append($("<img>")
                            .attr("src", doc.iconLink)
                            .addClass("icon"))
                        .text(doc.alternateLink))
                setTimeout(@proxy(->
                    @$save.val(@$save.data("oldval"))
                    ), 3000)
                app.editor.enable()
                return
                ))
    savecancel: =>
        @$title.hide()
        @$upload.hide()
        @$savecancel.hide()
        @$save.show()
        app.editor.enable()

class Editor extends Spine.Controller
    el: $("#editor")
    events:
        "keyup": "updateOutput"
    updateOutput: (e) =>
        app.output.el.html(marked(@el.val()))
        return
    enable: =>
        @el.prop("disabled", false)
        @el.select()
        return
    disable: =>
        @el.prop("disabled", true)


class Output extends Spine.Controller
    el: $("#output")


app =
    actions: new Actions()
    editor: new Editor()
    output: new Output()


root.init = ->
    setTimeout((-> # For some reason a timeout is required
        apiConfig.immediate = true
        gapi.auth.authorize(apiConfig, (token) ->
            $("#loading").hide()
            $("#actions").show()
            if token
                app.actions.$auth.hide()
                app.actions.$save.show()
                app.editor.enable()
            else
                app.actions.$auth.show()
            return
            )
        ), 1)


app.editor.el.trigger("keyup")
