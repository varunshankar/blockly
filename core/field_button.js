// lets try adding in a button, which will be a text element that when you click on it,
// the "editor" is to do the file choose menu.
goog.provide('Blockly.FieldButton');

goog.require('Blockly.Field');
goog.require('Blockly.Msg');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.userAgent');


/**
 * Class for an editable text field.
 * @param {string} text The initial content of the field.
 * @param {Function=} opt_changeHandler An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldButton = function(text, opt_imageData, opt_validator) {
    var value = {};
    value.imageData = opt_imageData;
    value.text = text;
    Blockly.FieldButton.superClass_.constructor.call(this, value);
    this.setValidator(opt_validator);
};
goog.inherits(Blockly.FieldButton, Blockly.Field);

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldButton.prototype.CURSOR = 'default';
/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.FieldButton.prototype.EDITABLE = true;

/**
 * Close the input widget if this input is being deleted.
 */
Blockly.FieldButton.prototype.dispose = function() {
    Blockly.WidgetDiv.hideIfOwner(this);
    Blockly.FieldButton.superClass_.dispose.call(this);
};

/**
 * Set the text in this field.
 * @param {?string} text New text.
 * @override
 */
Blockly.FieldButton.prototype.setText = function(text) {
    if (text === null) {
        // No change if null.
        return;
    }
    if (this.sourceBlock_ && this.validator_) {
        var validated = this.validator_(text);
        // If the new text is invalid, validation returns null.
        // In this case we still want to display the illegal result.
        if (validated !== null && validated !== undefined) {
            text = validated;
        }
    }
    Blockly.Field.prototype.setText.call(this, text);
};

/**
 * Show the inline free-text editor on top of the text.
 * @param {boolean=} opt_quietInput True if editor should be created without
 *     focus.  Defaults to false.
 * @private
 */
Blockly.FieldButton.prototype.showEditor_ = function(opt_quietInput) {
    var input = document.createElement('input');
    input.type = 'file';
    input.addEventListener("change", (evnt) =>{
        var file = input.files[0];
        this.setText(file.name);
        alert(this.value_);
        //this.value_.imageData = file.name;
        var reader = new FileReader();
        reader.onload = function() {
            var contents = reader.result;
            alert(contents);
        };
        reader.readAsDataURL(file);
    });
    input.click();
};

// Saves the field's value to an XML node. Allows for custom serialization.
Blockly.FieldButton.prototype.toXml = function(fieldElement) {
    // The default implementation of this function creates a node that looks
    // like this: (where value is returned by getValue())
    // <field name="FIELDNAME">value</field>
    // But this doesn't work for our field because it stores an /object/.

    fieldElement.setAttribute('imageData', this.value_.imageData);
    // The textContent usually contains whatever is closest to the field's
    // 'value'. The textContent doesn't need to contain anything, but saving
    // something to it does aid in readability.
    fieldElement.textContent = this.value_.text;

    // Always return the element!
    return fieldElement;
};

// Sets the field's value based on an XML node. Allows for custom
// de-serialization.
Blockly.FieldButton.prototype.fromXml = function(fieldElement) {
    // Because we had to do custom serialization for this field, we also need
    // to do custom de-serialization.

    var value = {};
    value.imageData = fieldElement.getAttribute('imageData');
    value.text = fieldElement.textContent;
    // The end goal is to call this.setValue()
    this.setValue(value);
};

/**
 * Close the editor, save the results, and dispose of the editable
 * text field's elements.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldButton.prototype.widgetDispose_ = function() {
    var thisField = this;
    return function() {
        var htmlInput = Blockly.FieldButton.htmlInput_;
        // Save the edit (if it validates).
        var text = htmlInput.value;
        if (thisField.sourceBlock_ && thisField.validator_) {
            var text1 = thisField.validator_(text);
            if (text1 === null) {
                // Invalid edit.
                text = htmlInput.defaultValue;
            } else if (text1 !== undefined) {
                // Change handler has changed the text.
                text = text1;
            }
        }
        thisField.setText(text);
        thisField.sourceBlock_.rendered && thisField.sourceBlock_.render();
        Blockly.unbindEvent_(htmlInput.onKeyDownWrapper_);
        Blockly.unbindEvent_(htmlInput.onKeyUpWrapper_);
        Blockly.unbindEvent_(htmlInput.onKeyPressWrapper_);
        Blockly.unbindEvent_(htmlInput.onWorkspaceChangeWrapper_);
        Blockly.FieldButton.htmlInput_ = null;
        // Delete the width property.
        Blockly.WidgetDiv.DIV.style.width = 'auto';
    };
};

//Blockly.Field.register('field_button', Blockly.FieldButton);