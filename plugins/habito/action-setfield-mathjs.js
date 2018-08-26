created: 20180826054036690
modified: 20180826054110829
module-type: widget
title: $:/plugins/Guitlle/helpers/action-setfield-mathjs.js
type: application/javascript

/*\
title: $:/plugins/Guitlle/helpers/action-setfield-mathjs.js
type: application/javascript
module-type: widget
Action widget to set a single field or index on a tiddler.
Author: @Guitlle 
Date: 2018-08-21
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var mathjs = require("$:/plugins/mklauber/math.js/math.js");

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var SetFieldWidgetEval = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
SetFieldWidgetEval.prototype = new Widget();

/*
Render this widget into the DOM
*/
SetFieldWidgetEval.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();
};

/*
Compute the internal state of the widget
*/
SetFieldWidgetEval.prototype.execute = function() {
	this.actionTiddler = this.getAttribute("$tiddler",this.getVariable("currentTiddler"));
        this.tiddler = this.wiki.getTiddler(this.actionTiddler);
	this.actionField = this.getAttribute("$field");
	this.actionIndex = this.getAttribute("$index");
	this.actionValue = this.getAttribute("$value");
	this.actionEval = this.getAttribute("$eval");
	this.actionTimestamp = this.getAttribute("$timestamp","yes") === "yes";
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
SetFieldWidgetEval.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes["$tiddler"] || changedAttributes["$field"] || changedAttributes["$index"] || changedAttributes["$value"]) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

/*
Invoke the action associated with this widget
*/
SetFieldWidgetEval.prototype.invokeAction = function(triggeringWidget,event) {
	var self = this,
		options = {};
	options.suppressTimestamp = !this.actionTimestamp;
        if ((typeof this.actionEval== "string")) { 
                var scope = new Object(); 
                $tw.utils.each(this.attributes,function(attribute,name) {
                    if(name.charAt(0) !== "$") {
                        scope[name] = attribute;
                    }
                });
                Object.assign(scope, this.getTiddlerData());
                try {
			var result = mathjs.eval(this.actionEval, scope);
			this.wiki.setText(this.actionTiddler,this.actionField,this.actionIndex,result,options);
                } catch (e) {
			console.log("Error in widget action-setfield-eval", this, e);
                }
		}
	else if((typeof this.actionField == "string") || (typeof this.actionIndex == "string")  || (typeof this.actionValue == "string")) {
			this.wiki.setText(this.actionTiddler,this.actionField,this.actionIndex,this.actionValue,options);
	}
	return true; // Action was invoked
};

SetFieldWidgetEval.prototype.getTiddlerData = function() {
	if(this.tiddler) {
		if (this.actionIndex) {
			var data = this.wiki.getTiddlerData(this.actionTiddler)
			return data;
		} else if (this.actionField) {
			return this.tiddler.fields;
		}
	} else {
		return undefined;            
	}
};


exports["action-setfield-mathjs"] = SetFieldWidgetEval;

})();
