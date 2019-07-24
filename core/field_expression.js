'use strict';

/*global uuid */
/*global InterfaceActions */
goog.provide('Blockly.FieldExpression');

goog.require('Blockly.Field');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.userAgent');

Blockly.FieldExpression = function() {
    this.size_ = new goog.math.Size(94, 20);
};
goog.inherits(Blockly.FieldExpression, Blockly.Field);

Blockly.FieldExpression.prototype.CURSOR = 'pointer';
Blockly.FieldExpression.prototype.value_ = null;

Blockly.FieldExpression.prototype.init = function() {
    if (this.fieldGroup_) {
        return; // already been initialized once
    }
    this.fieldGroup_ = Blockly.utils.createSvgElement('g',
        { 'class': 'blocklyIconGroup' }, null);
    this.block_ = this.sourceBlock_;
    this.drawIcon_(this.fieldGroup_);
    this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);
    this.mouseUpWrapper_ =
        Blockly.bindEventWithChecks_(this.fieldGroup_, 'mousedown', this,
            Blockly.FieldExpression.superClass_.onMouseDown_);
};

/**
 * Close the input widget if this input is being deleted.
 */
Blockly.FieldExpression.prototype.dispose = function() {
    Blockly.FieldExpression.superClass_.dispose.call(this);
    this.block_ = null;
    if (this.modal_) {
        this.modal_.close();
    }
    this.modal__ = null;
    this.size_ = null;
    this.block_ = null;
    this.fieldGroup_ = null;
};

Blockly.FieldExpression.prototype.getSize = function() {
    return this.size_;
};

Blockly.FieldExpression.prototype.showEditor_ = function() {
    this.modal_ = new Blockly.WorkspaceModal({
        workspace: this.block_.workspace,
        title: 'Expression',
        visible: true,
        changeListener: this.workspaceChanged_.bind(this),
        value: this.value_,
    });
};

Blockly.FieldExpression.prototype.workspaceChanged_ = function(newValue) {
    this.setValue(newValue);
};

Blockly.FieldExpression.prototype.contextChanged_ =
    function(namedContextKey, newContextValues, value) {
        if (this.modal_) {
            this.modal_.contextChanged_(namedContextKey, newContextValues, value, {
                workspace: this.block_.workspace,
                title: 'Expression',
                visible: true,
                changeListener: this.workspaceChanged_.bind(this),
                value: this.value_,
            });
        }
    };

Blockly.FieldExpression.prototype.drawIcon_ = function(group) {

    // Necessary to keep symbols under control
    var box = Blockly.utils.createSvgElement('g',
        {},
        group);
    // Box
    Blockly.utils.createSvgElement('path',
        {
            'fill': '#F26522',
            'd': 'M2,18.5c-0.8,0-1.5-0.7-1.5-1.5V2.5C0.5,1.7,1.2,1,2,1h92.2c0.8,0,1.5,0.7,1.5,1.5V17   c0,0.8-0.7,1.5-1.5,1.5H2z'
        },
        box);
    // Box outline
    Blockly.utils.createSvgElement('path',
        {
            'fill': '#A0410D',
            'd': 'M94.2,1.5c0.6,0,1,0.5,1,1V17c0,0.6-0.5,1-1,1H2c-0.6,0-1-0.5-1-1V2.5c0-0.6,0.5-1,1-1H94.2 M94.2,0.5H2   c-1.1,0-2,0.9-2,2V17c0,1.1,0.9,2,2,2h92.2c1.1,0,2-0.9,2-2V2.5C96.3,1.4,95.3,0.5,94.2,0.5L94.2,0.5z'
        },
        box);

    // Text
    var text = Blockly.utils.createSvgElement('text',
        {
            'transform': 'matrix(1 0 0 1 2.755 14.0562)',
            'class': 'blocklyText'
        },
        group);
    text.appendChild(document.createTextNode('Expression'));

    // Arrow
    var arrowWrapper = Blockly.utils.createSvgElement('g',
        {
            'transform': 'translate(1472 0) scale(-1 1)'
        },
        group);
    Blockly.utils.createSvgElement('path',
        {
            'fill': '#FFFFFF',
            'd': 'M1387.7,11.6l-0.7,0.7c-0.2,0.2-0.4,0.3-0.7,0.3c-0.2,0-0.5-0.1-0.6-0.2l-3.7-3.7l0,3.1   c0,0.3-0.1,0.5-0.3,0.7s-0.4,0.3-0.7,0.3l-0.8,0c-0.3,0-0.5-0.1-0.7-0.3c-0.2-0.2-0.3-0.4-0.3-0.7l0-6.9c0-0.3,0.1-0.5,0.3-0.7   c0.2-0.2,0.4-0.3,0.7-0.3l6.9,0c0.3,0,0.5,0.1,0.7,0.3c0.2,0.2,0.3,0.4,0.3,0.7l0,0.8c0,0.3-0.1,0.5-0.3,0.7   c-0.2,0.2-0.4,0.3-0.7,0.3h-3.1l3.7,3.7c0.2,0.2,0.3,0.4,0.2,0.6C1388,11.2,1387.9,11.4,1387.7,11.6z'
        },
        arrowWrapper);
};

Blockly.FieldExpression.prototype.setValue = function(newValue) {
    var oldValue = this.value_;

    if (oldValue != newValue) {
        this.value_ = newValue;
        Blockly.Events.fire(new Blockly.Events.Ui(
            this.block_, 'field', oldValue, newValue));
    }
};

Blockly.FieldExpression.prototype.getValue = function() {
    return this.value_;
};

/**
 * Expression SVGs are fixed width, no need to render.
 * @private
 */
Blockly.FieldExpression.prototype.render_ = function() {
    // NOP
};

/**
 * Expression SVGs are fixed width, no need to render even if forced.
 */
Blockly.FieldExpression.prototype.forceRerender = function() {
    // NOP
};

/**
 * Expression SVGs are fixed width, no need to update.
 * @private
 */
Blockly.FieldExpression.prototype.updateWidth = function() {
    // NOP
};

// Custom Modal for expression build requires bootstrap 4(alpha)
Blockly.WorkspaceModal = function(options) {
    this.options_ = options || {};
    this.uuid = this.uuid || uuid.v4();
    this.initBackdrop_();
    this.initModal_();
};

Blockly.WorkspaceModal.prototype.contextChanged_ =
    function(namedContextKey, newContextValues, oldValue, options) {

        if (!options) {
            return;
        }

        var ws = options['workspace'],
            value = options['value'],
            changeListener = options['changeListener'],
            toolbox = document.getElementById('expressionToolbox').children[0],
            neutralName = newContextValues[1],
            newTable = newContextValues[2];

        var workspace = new Blockly.Workspace({ media: ws.options.pathToMedia, toolbox: toolbox });

        var namedContexts = ws.namedContexts || {};
        ws.getAllBlocks().forEach(function(block) {
            var blockNamedContexts = block.namedContexts || {};
            Object.keys(blockNamedContexts).forEach(function(key) {
                namedContexts[block.id + key] = blockNamedContexts[key];
            });
        });
        workspace.namedContexts = namedContexts;


        // We need to update this to also handle table changes.
        if (value) {

            var xmlDom = Blockly.Xml.textToDom(value);
            Blockly.Xml.domToWorkspace(xmlDom, workspace);

            workspace.namedContexts = namedContexts;

            // Loop over all blocks within the Workspace
            // and swap out for the new namedContext info where appropriate
            var descendants = workspace.getAllBlocks() || [], fields = [];
            descendants.forEach(function(descendant) {
                if (descendant.tableChanged) {
                    descendant.tableChanged(newTable, neutralName);
                }
                //Also update all FieldExpression blocks
                if (descendant.inputList) {
                    descendant.inputList.forEach(function(input) {
                        var selectorFields = (input.fieldRow || []).filter(function(field) {
                            return !!field.isNamedContextSelector && (field.getValue() == oldValue);
                        });
                        (input.fieldRow || []).forEach(function(field) {
                            if (field.contextChanged_) {
                                field.contextChanged_(this.sourceBlock_.id + this.name,
                                    this.sourceBlock_.namedContexts[this.name],
                                    oldValue);
                            }
                        }.bind(this));
                        fields = fields.concat(selectorFields);
                    }.bind(this));
                }
            }.bind(this));
            fields.forEach(function(field) {
                field.setValue(neutralName);
            });

            var newValue = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));

            this.value_ = newValue;

            if (changeListener) {
                changeListener(newValue);
            }
        }
    };

Blockly.WorkspaceModal.prototype.close = function() {
    var changeListener = this.options_ ? this.options_['changeListener'] : null;
    if (changeListener) {
        changeListener(this.value_);
    }

    if (this.closeBtn_) {
        this.closeBtn_.removeEventListener('click', this.close);
    }
    if (this.bg_) {
        this.bg_.remove();
    }
    if (this.modal_) {
        this.modal_.remove();
    }
    if (this.workspace) {
        this.workspace_.dispose();
    }
    if (this.options_ && this.options_['workspace']) {
        Blockly.JavaScript.variableDB_.setVariableMap(this.options_['workspace'].getVariableMap());
    }
    this.workspace_ = null;
    this.options_ = null;
    this.modal_ = null;
    this.bg_ = null;
};

Blockly.WorkspaceModal.prototype.toggle = function(visible) {
    this.toggleBg_(visible);
    this.toggleModal_(visible);
};

Blockly.WorkspaceModal.prototype.initBackdrop_ = function() {
    this.bg_ = document.getElementById('modal-backdrop-expression' + this.uuid);
    if (!this.bg_) { // initialize backdrop
        this.bg_ = document.createElement('div');
        this.bg_.id = 'modal-backdrop-expression' + this.uuid;
        this.bg_.className = 'modal-backdrop fade ' + ((this.options_.visible) ? 'show' : 'hide');
        document.body.appendChild(this.bg_);
    }
};

Blockly.WorkspaceModal.prototype.copyWorkspace = function() {
    try {
        localStorage.expressionClipboard = this.value_;
        InterfaceActions.notification({ 'level': 'success', 'message': 'Copying logic to clipboard...' });
    } catch (err) {
        console.error('Error when copying logic: ', err);
        InterfaceActions.notification({ 'level': 'error', 'message': 'Error when copying logic!' });
    }
};

Blockly.WorkspaceModal.prototype.pasteWorkspace = function() {
    var pastedworkspaceXML = localStorage.expressionClipboard;
    try {

        // Attempts to parse the pasted Blockly XML if it exists.
        // If there is none, quietly ignore it; it was likely a blank workspace value.
        // Invalid configurations will fail on textToDom and be caught by the catch
        var pastedxmldom = pastedworkspaceXML ? Blockly.Xml.textToDom(pastedworkspaceXML) : null;
        // We really want the inner blocks of any workspace in order to splice them together;
        // we get the pasted DOM block's inner HTML if it exists
        var pastedinnerblocks = pastedxmldom ? pastedxmldom.innerHTML : '';

        // Get the existing block XML and convert it to DOM blocks
        var oldworkspaceXML = this.value_ ? this.value_ : '';
        var oldxmldom = oldworkspaceXML ? Blockly.Xml.textToDom(oldworkspaceXML) : null;

        // If we have blocks in the workspace, get them using innerHTML
        var oldinnerblocks = oldxmldom ? oldxmldom.innerHTML : '';

        // Splice together the old and new blocks within a parent XML wrapper (as Blockly does)
        var newxml = '<xml xmlns="http://www.w3.org/1999/xhtml">' + pastedinnerblocks + oldinnerblocks + '</xml>';

        // Fire off the change listener and var the workspace know about it.
        var newdom = Blockly.Xml.textToDom(newxml);
        if (newdom) {
            this.value_ = newxml;
            if (this.workspace_) {
                Blockly.Xml.domToWorkspace(newdom, this.workspace_);
            }
            InterfaceActions.notification({ 'level': 'success', 'message': 'Pasting new logic below existing logic. Please check your new blocks to make sure they don\'t overlap!' });
        }
    } catch (err) {
        InterfaceActions.notification({ 'level': 'error', 'message': 'Attempted to paste invalid value into workspace.' });
        console.warn('Attempted to paste with invalid data in clipboard. Value was', pastedworkspaceXML);
    }
};

Blockly.WorkspaceModal.prototype.initModal_ = function() {
    this.modal_ = document.getElementById('modal-workspace-expression' + this.uuid);
    if (!this.modal_) {
        this.modal_ = document.createElement('div');
        this.modal_.id = 'modal-workspace-expression' + this.uuid;
        this.modal_.className = 'modal fade ' + ((this.options_.visible) ? 'show d-block' : 'hide');
    }
    var dialog = document.createElement('div'),
        content = document.createElement('div');
    dialog.className = 'modal-dialog modal-lg';
    content.className = 'modal-content';
    dialog.appendChild(content);
    this.modal_.appendChild(dialog);
    var header = document.createElement('div');
    header.className = 'modal-header';
    content.appendChild(header);

    // Add the "Expression" title
    if (this.options_.title) {
        var title = document.createElement('h5'),
            text = document.createTextNode(this.options_.title);
        title.className = 'modal-title';
        title.appendChild(text);
        header.appendChild(title);
    }

    this.closeBtn_ = document.createElement('button');

    var closeTxt = document.createTextNode('x');

    this.closeBtn_.type = 'button';
    this.closeBtn_.className = 'close';
    this.closeBtn_.addEventListener('click', this.close.bind(this));
    this.closeBtn_.appendChild(closeTxt);
    header.appendChild(this.closeBtn_);

    var contentWrapper = document.createElement('div');
    contentWrapper.id = 'modal-body-expression-wrapper' + this.uuid;

    var buttonWrapper = document.createElement('h2');
    buttonWrapper.id = 'modal-body-expression-button-wrapper' + this.uuid;
    buttonWrapper.className = 'd-flex w-100 justify-content-between';

    var buttonWrapperDiv = document.createElement('div');
    buttonWrapperDiv.id = 'modal-body-expression-button-wrapper-div' + this.uuid;
    buttonWrapperDiv.className = 'btn-wrapper';

    var copyButton = document.createElement('button');
    var copyText = document.createTextNode('Copy');
    copyButton.appendChild(copyText);
    copyButton.className = 'btn btn-primary btn-sm';
    copyButton.onclick = this.copyWorkspace.bind(this);
    copyButton['aria-label'] = 'Copy';

    var pasteButton = document.createElement('button');
    var pasteText = document.createTextNode('Paste');
    pasteButton.appendChild(pasteText);
    pasteButton.className = 'btn btn-primary btn-sm';
    pasteButton.onclick = this.pasteWorkspace.bind(this);
    pasteButton['aria-label'] = 'Paste';

    var contentBody = document.createElement('div');

    contentBody.id = 'modal-body-expression' + this.uuid;
    contentBody.className = 'modal-body';
    contentBody.style.height = (window.innerHeight * .75) + 'px';
    buttonWrapperDiv.appendChild(copyButton);
    buttonWrapperDiv.appendChild(pasteButton);
    buttonWrapper.appendChild(buttonWrapperDiv);
    contentWrapper.appendChild(buttonWrapper);
    contentWrapper.appendChild(contentBody);
    content.appendChild(contentWrapper);

    document.body.appendChild(this.modal_);

    var ws = this.options_['workspace'],
        value = this.options_['value'],
        toolbox = document.getElementById('expressionToolbox').children[0];

    this.workspace_ = Blockly.inject('modal-body-expression' + this.uuid,
        { media: ws.options.pathToMedia, toolbox: toolbox });

    Blockly.JavaScript.variableDB_.setVariableMap(this.workspace_.getVariableMap());

    var namedContexts = ws.namedContexts || {};
    var parentVariables = [];
    if (ws.getAllVariables) {
        parentVariables = ws.getAllVariables() || [];
    } else {
        parentVariables = ws.variableList || [];
    }
    // Create a variable corresponding to each variable in the parent workspace
    parentVariables.forEach(function(variable) {
        var varName = variable.name;
        var varId = variable.getId();
        if (this.workspace_.getVariable) {
            if (!this.workspace_.getVariable(varName)) {
                this.workspace_.createVariable(varName, undefined, varId);
            }
        } else {
            if ((this.workspace_.variableList && this.workspace_.variableList.indexOf(variable) === -1)) {
                this.workspace_.createVariable(variable);
            }
        }
    }.bind(this));
    ws.getAllBlocks().forEach(function(block) {
        var blockNamedContexts = block.namedContexts || {};
        Object.keys(blockNamedContexts).forEach(function(key) {
            namedContexts[block.id + key] = blockNamedContexts[key];
        });
    });
    this.workspace_.namedContexts = namedContexts;
    this.workspace_.triggerName = ws.triggerName;
    this.workspace_.runTimeVariables = ws.runTimeVariables;

    if (value) {
        var xmlDom = Blockly.Xml.textToDom(value);
        Blockly.Xml.domToWorkspace(xmlDom, this.workspace_);
    }

    this.workspace_.addChangeListener(this.onWorkspaceChanged_.bind(this));
};

Blockly.WorkspaceModal.prototype.toggleBg_ = function(visible) {
    if (!this.bg_) {
        this.options_.visible = visible;
        this.initBackdrop_();
        return;
    }
    // clean className
    var className = this.bg_.className.replace(/(show|hide)\s*/g, '');
    className += visible ? ' show' : ' hide';

    this.bg_.className = className;
};

Blockly.WorkspaceModal.prototype.toggleModal_ = function(visible) {
    if (!this.modal_) {
        this.options_.visible = visible;
        this.initModal_();
        return;
    }
    var className = this.bg_.className.replace(/(d-block|show|hide)\s*/g, '');
    className += visible ? ' show d-block' : ' hide';

    this.modal_.className = className;
};

Blockly.WorkspaceModal.prototype.onWorkspaceChanged_ = function() {
    if (!this.workspace_) {
        console.warn('Attempting to run onWorkspaceChanged_ with no workspace');
    }
    var newValue = this.workspace_ ? Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(this.workspace_)) : '';
    this.value_ = newValue;
};