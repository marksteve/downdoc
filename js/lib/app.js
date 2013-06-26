// Generated by CoffeeScript 1.6.3
(function() {
  var Actions, Editor, Output, apiConfig, app, boundary, closeDelim, delimiter, mimeType, root, _ref, _ref1, _ref2,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  root = this;

  apiConfig = {
    client_id: "561376060487.apps.googleusercontent.com",
    scope: ["https://www.googleapis.com/auth/drive"]
  };

  mimeType = "text/html";

  boundary = "-------314159265358979323846";

  delimiter = "\r\n--" + boundary + "\r\n";

  closeDelim = "\r\n--" + boundary + "--";

  Actions = (function(_super) {
    __extends(Actions, _super);

    function Actions() {
      this.savecancel = __bind(this.savecancel, this);
      this.upload = __bind(this.upload, this);
      this.save = __bind(this.save, this);
      this.auth = __bind(this.auth, this);
      _ref = Actions.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Actions.prototype.el = $("#actions");

    Actions.prototype.events = {
      "click .auth": "auth",
      "click .save": "save",
      "click .upload": "upload",
      "click .savecancel": "savecancel"
    };

    Actions.prototype.elements = {
      ".auth": "$auth",
      ".save": "$save",
      ".title": "$title",
      ".upload": "$upload",
      ".savecancel": "$savecancel",
      ".docurl": "$docurl"
    };

    Actions.prototype.auth = function(e) {
      apiConfig.immediate = false;
      return gapi.auth.authorize(apiConfig, this.proxy(function(token) {
        if (token) {
          this.$auth.hide();
          this.$save.show();
          app.editor.enable();
        }
      }));
    };

    Actions.prototype.save = function(e) {
      this.$save.hide();
      this.$title.show().select();
      this.$upload.show();
      this.$savecancel.show();
      app.editor.disable();
    };

    Actions.prototype.upload = function(e) {
      var base64Data, body, metadata, title;
      this.$title.prop("disabled", true);
      this.$upload.data("oldval", this.$upload.val()).val("Saving...").prop("disabled", true);
      this.$savecancel.prop("disabled", true);
      title = this.$title.val();
      metadata = {
        mimeType: mimeType,
        title: title,
        parents: null,
        userPermission: null
      };
      base64Data = btoa(app.output.el.html());
      body = delimiter + "Content-Type: application/json\r\n\r\n" + JSON.stringify(metadata) + delimiter + ("Content-Type: " + mimeType + "\r\n") + "Content-Transfer-Encoding: base64\r\n" + "\r\n" + base64Data + closeDelim;
      return gapi.client.request({
        path: "/upload/drive/v2/files",
        method: "POST",
        params: {
          uploadType: "multipart",
          convert: true
        },
        headers: {
          "Content-Type": "multipart/mixed; boundary=\"" + boundary + "\""
        },
        body: body
      }).execute(this.proxy(function(doc) {
        this.$title.prop("disabled", false).hide();
        this.$upload.val(this.$upload.data("oldval")).prop("disabled", false).hide();
        this.$savecancel.prop("disabled", false).hide();
        this.$save.data("oldval", this.$save.val()).val("Saved as " + title).show();
        this.$docurl.html($("<a>").attr("href", doc.alternateLink).attr("target", "_blank").append($("<img>").attr("src", doc.iconLink).addClass("icon")).text(doc.alternateLink));
        setTimeout(this.proxy(function() {
          return this.$save.val(this.$save.data("oldval"));
        }), 3000);
        app.editor.enable();
      }));
    };

    Actions.prototype.savecancel = function() {
      this.$title.hide();
      this.$upload.hide();
      this.$savecancel.hide();
      this.$save.show();
      return app.editor.enable();
    };

    return Actions;

  })(Spine.Controller);

  Editor = (function(_super) {
    __extends(Editor, _super);

    function Editor() {
      this.disable = __bind(this.disable, this);
      this.enable = __bind(this.enable, this);
      this.updateOutput = __bind(this.updateOutput, this);
      _ref1 = Editor.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Editor.prototype.el = $("#editor");

    Editor.prototype.events = {
      "keyup": "updateOutput"
    };

    Editor.prototype.updateOutput = function(e) {
      app.output.el.html(marked(this.el.val()));
    };

    Editor.prototype.enable = function() {
      this.el.prop("disabled", false);
      this.el.select();
    };

    Editor.prototype.disable = function() {
      return this.el.prop("disabled", true);
    };

    return Editor;

  })(Spine.Controller);

  Output = (function(_super) {
    __extends(Output, _super);

    function Output() {
      _ref2 = Output.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Output.prototype.el = $("#output");

    return Output;

  })(Spine.Controller);

  app = {
    actions: new Actions(),
    editor: new Editor(),
    output: new Output()
  };

  root.init = function() {
    return setTimeout((function() {
      apiConfig.immediate = true;
      return gapi.auth.authorize(apiConfig, function(token) {
        $("#loading").hide();
        $("#actions").show();
        if (token) {
          app.actions.$auth.hide();
          app.actions.$save.show();
          app.editor.enable();
        } else {
          app.actions.$auth.show();
        }
      });
    }), 1);
  };

  app.editor.el.trigger("keyup");

}).call(this);
