// lets try adding in a button, which will be a text element that when you click on it,
// the "editor" is to do the file choose menu.
'use strict';

goog.provide('Blockly.FieldButton');

goog.require('Blockly.Field');
goog.require('Blockly.Msg');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.userAgent');


/**
 * Class for an editable text field.
 * @param {string} text The initial content of the field.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldButton = function(text, opt_validator) {
    Blockly.FieldButton.superClass_.constructor.call(this, text);
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

    var grayscaleImg;
    var painted;
    var brightnessSlider = document.getElementById('BrightnessSlider');
    var brightnessValue = document.getElementById('BrightnessValue');
    var contrastSlider = document.getElementById('ContrastSlider');
    var contrastValue = document.getElementById('ContrastValue');
    var ind;
    brightnessSlider.addEventListener('change', function (event) {
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext( "2d" );
        if (!painted) return;
        reDraw(grayscaleImg, ctx);
        var imageData;
        brightnessValue.innerText = event.currentTarget.value;
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        applyBrightness(imageData.data, parseInt(brightnessSlider.value, 10));
        applyContrast(imageData.data, parseInt(contrastSlider.value, 10));
        ctx.putImageData(imageData, 0, 0);
    });
    contrastSlider.addEventListener('change', function (event) {
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext( "2d" );
        if (!painted) return;
        reDraw(grayscaleImg, ctx);
        var imageData;
        contrastValue.innerText = event.currentTarget.value;
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        applyContrast(imageData.data, parseInt(contrastSlider.value, 10));
        applyBrightness(imageData.data, parseInt(brightnessSlider.value, 10));
        ctx.putImageData(imageData, 0, 0);
    });

    function applyBrightness(data, brightness) {
        for (var i = 0; i < data.length; i+= 4) {
            data[i] += 255 * (brightness / 100);
            data[i+1] += 255 * (brightness / 100);
            data[i+2] += 255 * (brightness / 100);
        }
    }

    function truncateColor(value) {
        if (value < 0) {
            value = 0;
        } else if (value > 255) {
            value = 255;
        }
        return value;
    }

    function applyContrast(data, contrast) {
        var factor = (259.0 * (contrast + 255.0)) / (255.0 * (259.0 - contrast));
        for (var i = 0; i < data.length; i+= 4) {
            data[i] = truncateColor(factor * (data[i] - 128.0) + 128.0);
            data[i+1] = truncateColor(factor * (data[i+1] - 128.0) + 128.0);
            data[i+2] = truncateColor(factor * (data[i+2] - 128.0) + 128.0);
        }
    }
    function reDraw(contents, ctx){
        ctx.putImageData( contents, 0, 0 );
    }

    var input = document.createElement('input');
    input.type = 'file';
    input.accept = ".png, .jpg, .jpeg, .svg";
    input.addEventListener("change", (evnt) =>{
        var file = input.files[0];
        ind = this.name.replace("IMG", '');
        brightnessSlider.value = 0;
        contrastSlider.value = 0;
        brightnessValue.innerText = 0;
        contrastValue.innerText = 0;
        if(file.type.includes("image/")) {
            this.setText(file.name);
            var buttonText = this.getText();
            var reader = new FileReader();
            reader.onload = function () {
                var contents = reader.result;
                //alert(contents);
                painted = false;

                var img = new Image();
                img.src = contents;
                img.onload = function() {
                    var canvas = document.getElementById('canvas');
                    var scale = 1;
                    if ( img.height > 128 ) {
                        scale = 128.0 / img.height;
                    }
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    var ctx = canvas.getContext( "2d" );
                    ctx.scale( scale, scale );
                    ctx.clearRect(0, 0, 178, 128);
                    ctx.drawImage( img, 0, 0 );
                    console.log(canvas.width+" "+canvas.height);
                    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    var data = imageData.data;
                    for (var i = 0; i < data.length; i += 4) {
                        var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        data[i]     = avg; // red
                        data[i + 1] = avg; // green
                        data[i + 2] = avg; // blue
                    }
                    ctx.putImageData(imageData, 0, 0);
                    if(!painted) {
                        grayscaleImg = imageData;
                    }
                    painted = true;
                    $("#basicModal").modal();

                    var container = Blockly.Workspace.getByContainer("bricklyDiv");
                    if (container) {
                        var blocks = Blockly.Workspace.getByContainer("bricklyDiv").getAllBlocks();
                        for (var x = 0; x < blocks.length; x++) {
                            var func = blocks[x].getAsset;
                            if (func) {
                                var func2 = blocks[x].setImageDataIndex;
                                func2.call(blocks[x], ind);
                                blocks[x].setFieldValue('', "IMG_DATA" + ind);
                                console.log("GOING TO SET: "+ind);
                               // blocks[x].setFieldValue(canvas.toDataURL(), "IMG_DATA" + ind);
                            }
                        }
                    }
                    //ctx.clearRect(0, 0, 178, 128);
                };
            };
        }
        reader.readAsDataURL(file);
    });
    input.click();
};
/*
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
};*/

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
