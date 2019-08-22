/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Controle blocks for EV3.
 * @requires Blockly.Blocks
 * @author beate.jost@iais.fraunhofer.de (Beate Jost)
 */

'use strict';

goog.provide('Blockly.Blocks.mbedControls');

goog.require('Blockly.Blocks');

/**
 * @lends Block
 */

// not used.
Blockly.Blocks['mbedControls_start'] = {
    /**
     * The starting point for the main program. This block is not deletable and
     * it should not be available in any toolbox. This is also the block where
     * variable declaration can be instantiated via the plus mutator. For new
     * task see {@link Block.mbedControls_activity}.
     * 
     * @constructs mbedControls_start
     * @this.Blockly.Block
     * @returns immediately
     * @see {@link mbedControls_activity}
     * @memberof Block
     */

    init : function() {
        this.setColour(Blockly.CAT_ACTIVITY_RGB);
        this.appendDummyInput().appendField(Blockly.Msg.START_PROGRAM);
        this.declare_ = false;
        this.setPreviousStatement(false);
        this.setNextStatement(true);
        this.setDeletable(false);
        this.setMutatorPlus(new Blockly.MutatorPlus([ 'mbedControls_start' ]));
        this.setTooltip(Blockly.Msg.START_TOOLTIP);
    },
    /**
     * Create XML to represent whether a statement list of variable declarations
     * should be present.
     * 
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom : function() {
        if (!this.declare_ === undefined) {
            return false;
        }
        var container = document.createElement('mutation');
        container.setAttribute('declare', (this.declare_ == true));
        return container;
    },

    /**
     * Parse XML to restore the statement list.
     * 
     * @param {!Element}
     *            xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation : function(xmlElement) {
        this.declare_ = (xmlElement.getAttribute('declare') != 'false');
        if (this.declare_) {
            this.appendStatementInput('ST');
            this.getInput('ST').connection.setCheck('declaration_only');
        }
    },
    /**
     * Update the shape according, if declarations exists.
     * 
     * @param {Number}
     *            number 1 add a variable declaration, -1 remove a variable
     *            declaration.
     * @this Blockly.Block
     */
    updateShape_ : function(num) {
        if (num == 1) {
            if (!this.declare_) {
                this.appendStatementInput('ST');
                // making sure only declarations can connect to the statement list
                this.getInput('ST').connection.setCheck('declaration_only');
                this.declare_ = true;
            }
            var vd = this.workspace.newBlock('robGlobalVariables_declare');
            vd.initSvg();
            vd.render();
            var value = vd.getInput('VALUE');
            var block = this.workspace.newBlock('math_number');
            block.initSvg();
            block.render();
            value.connection.connect(block.outputConnection);
            var connection;
            if (this.getInput('ST').connection.targetConnection) {
                var block = this.getInput('ST').connection.targetConnection.sourceBlock_;
                if (block) {
                    // look for the last variable declaration block in the sequence
                    while (block.getNextBlock()) {
                        block = block.getNextBlock();
                    }
                }
                block.setNext(true);
                connection = block.nextConnection;
            } else {
                connection = this.getInput('ST').connection;
            }
            connection.connect(vd.previousConnection);
        } else if (num == -1) {
            // if the last declaration in the stack has been removed, remove the declaration statement
            this.removeInput('ST');
            this.declare_ = false;
        }
    }
};

/**
 * Block waiting for sensor values.
 * 
 * @constructs mbedControls_wait_for
 * @param {Boolean} -
 *            sensor condition.
 * @returns after (first) condition is true.
 * @memberof Block
 */

Blockly.Blocks['mbedControls_wait_for'] = {

    init : function() {
        this.setColour(Blockly.CAT_CONTROL_RGB);
        this.appendValueInput('WAIT0').appendField(Blockly.Msg.WAIT_UNTIL).setCheck('Boolean');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.waitCount_ = 0;
        this.setBlocking(true);
        this.setMutatorPlus(new Blockly.MutatorPlus(this));
        this.setTooltip(Blockly.Msg.WAIT_FOR_TOOLTIP);
    },
    /**
     * Create XML to represent the number of wait counts.
     * 
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom : function() {
        if (!this.waitCount_) {
            return null;
        }
        var container = document.createElement('mutation');
        if (this.waitCount_) {
            container.setAttribute('wait', this.waitCount_);
        }
        return container;
    },
    /**
     * Parse XML to restore the wait inputs.
     * 
     * @param {!Element}
     *            xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation : function(xmlElement) {
        this.waitCount_ = parseInt(xmlElement.getAttribute('wait'), 10);
        for (var x = 1; x <= this.waitCount_; x++) {
            if (x == 1) {
                this.appendStatementInput('DO0').appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
            }
            this.appendValueInput('WAIT' + x).appendField(Blockly.Msg.WAIT_OR).setCheck('Boolean');
            this.appendStatementInput('DO' + x).appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
        }
        if (this.waitCount_ >= 1) {
            this.setMutatorMinus(new Blockly.MutatorMinus(this));
        }
    },
    /**
     * Update the shape according to the number of wait inputs.
     * 
     * @param {Number}
     *            number of waits inputs.
     * @this Blockly.Block
     */
    updateShape_ : function(num) {
        Blockly.dragMode_ = Blockly.DRAG_NONE;
        if (num == 1) {
            this.waitCount_++;
            if (this.waitCount_ == 1)
                this.appendStatementInput('DO0').appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
            this.appendValueInput('WAIT' + this.waitCount_).appendField(Blockly.Msg.WAIT_OR).setCheck('Boolean');
            this.appendStatementInput('DO' + this.waitCount_).appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
            var lc = this.workspace.newBlock('logic_compare');
            lc.initSvg();
            lc.render();
            lc.updateShape('BOOL');
            var connection = this.getInput('WAIT' + this.waitCount_).connection;
            connection.connect(lc.outputConnection);

            var s = this.workspace.newBlock('robSensors_getSample');
            s.initSvg();
            s.render();
            connection = lc.getInput('A').connection;
            connection.connect(s.outputConnection);

            var v = this.workspace.newBlock('logic_boolean');
            v.initSvg();
            v.render();
            connection = lc.getInput('B').connection;
            connection.connect(v.outputConnection);
        } else if (num == -1) {
            var target = this.getInputTargetBlock('DO' + this.waitCount_);
            if (target) {
                target.unplug();
                target.bumpNeighbours_();
            }
            var target = this.getInputTargetBlock('WAIT' + this.waitCount_);
            if (target) {
                target.unplug();
                target.bumpNeighbours_();
            }
            this.removeInput('DO' + this.waitCount_);
            this.removeInput('WAIT' + this.waitCount_);
            this.waitCount_--;
            if (this.waitCount_ == 0) {
                this.removeInput('DO0');
            }
        }
        if (this.waitCount_ >= 1) {
            if (this.waitCount_ == 1) {
                this.setMutatorMinus(new Blockly.MutatorMinus(this));
                this.render();
            }
        } else {
            this.mutatorMinus.dispose();
            this.mutatorMinus = null;
            this.render();
        }
    }
};
