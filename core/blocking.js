/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Object representing a blocking symbol.
 * @author Beate
 */
'use strict';

goog.provide('Blockly.Blocking');

goog.require('Blockly.Icon');
goog.require('Blockly.Tooltip');

/**
 * Class for a comment.
 * 
 * @param {!Blockly.Block}
 *            block The block associated with this blocking symbol.
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.Blocking = function(block) {
    Blockly.Blocking.superClass_.constructor.call(this, block);
    this.SIZE = 8;
    this.createIcon();
};
goog.inherits(Blockly.Blocking, Blockly.Icon);

/**
 * Create the icon on the block.
 */
Blockly.Blocking.prototype.createIcon = function() {
    if (this.iconGroup_) {
        // Icon already exists.
        return;
    }
    this.iconGroup_ = Blockly.createSvgElement('g', {
        'class' : 'no' //so no opacity in toolbox flyout
    }, null);
    this.drawIcon_(this.iconGroup_);
    this.block_.getSvgRoot().appendChild(this.iconGroup_);
};

/**
 * Draw the comment icon.
 * 
 * @param {!Element}
 *            group The icon group.
 * @private
 */
Blockly.Blocking.prototype.drawIcon_ = function(group) {
    var rect = Blockly.createSvgElement('rect', {
        'class' : 'blocklyIconShape',
        'height' : '16',
        'width' : '16',
        'fill-opacity' : '0',
        'stroke-opacity' : '0',
    }, group);
    rect.tooltip = Blockly.Msg.ICON_BLOCKING_TOOLTIP || "ICON_BLOCKING_TOOLTIP";
    Blockly.Tooltip.bindMouseEvents(rect);
    Blockly.createSvgElement('path', {
        'class' : 'blocklyIconBlocking',
        'd' : 'M18.055 20.504v-2.348c0-3.18-2.801-5.195-4.594-6.156 1.789-.96 4.594-2.977 4.594-6.156V3.496c.539-.32.898-.863.898-1.48 0-.98-.906-1.778-2.023-1.778H7.07c-1.117 0-2.023.797-2.023 1.778 0 .617.36 1.16.898 1.48v2.348c0 3.18 2.801 5.195 4.594 6.156-1.789.96-4.594 2.977-4.594 6.156v2.348c-.539.32-.898.863-.898 1.48 0 .98.906 1.778 2.023 1.778h9.86c1.117 0 2.023-.797 2.023-1.778 0-.617-.36-1.16-.898-1.48zM8.203 5.844V3.949c0-.312.254-.562.563-.562h6.468c.309 0 .563.25.563.562v1.895c0 2.113-2.383 3.62-3.406 4.168l-.125.066a.54.54 0 0 1-.532 0l-.125-.066c-1.023-.547-3.406-2.055-3.406-4.168zm7.594 14.207a.566.566 0 0 1-.563.566H8.766a.566.566 0 0 1-.563-.566v-1.89c0-2.114 2.383-3.622 3.406-4.173l.125-.066a.565.565 0 0 1 .536 0l.125.066c1.023.551 3.406 2.059 3.406 4.172zm0 0 M12 15.762c-1.629 1.02-2.61 2.144-2.61 3.035v.695h5.223v-.695c-.004-.895-.984-2.02-2.613-3.035zm0 0M12 9.258c1.137-.711 1.82-1.492 1.82-2.117v-.485h-3.64v.485c0 .625.683 1.41 1.82 2.117zm0 0',
        'transform' : 'scale(0.5),translate(0,3)',
    }, group);
};

Blockly.Blocking.prototype.setVisible = function(visible) {
    if (visible == this.isVisible()) {
        // No change.
        return;
    }
    Blockly.Events.fire(new Blockly.Events.Ui(this.block_, 'commentOpen', !visible, visible));
    if ((!this.block_.isEditable() && !this.textarea_) || goog.userAgent.IE) {
        // Steal the code from warnings to make an uneditable text bubble.
        // MSIE does not support foreignobject; textareas are impossible.
        // http://msdn.microsoft.com/en-us/library/hh834675%28v=vs.85%29.aspx
        // Always treat comments in IE as uneditable.
        Blockly.Warning.prototype.setVisible.call(this, visible);
        return;
    }
}
