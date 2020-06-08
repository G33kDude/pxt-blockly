/**
 * @license
 * Copyright 2012 Google LLC
 * Modified 2020 Philip Taylor
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
 * @fileoverview Generating AutoHotkey for colour blocks.
 * @author fraser@google.com (Neil Fraser)
 * @author contact@philipt.net (Philip Taylor)
 */
'use strict';

goog.provide('Blockly.AutoHotkey.colour');

goog.require('Blockly.AutoHotkey');


Blockly.AutoHotkey['colour_picker'] = function(block) {
  // Colour picker.
  var code = block.getFieldValue('COLOUR').replace('#', '0x');
  return [code, Blockly.AutoHotkey.ORDER_ATOMIC];
};

Blockly.AutoHotkey['colour_random'] = function(block) {
  // Generate a random colour.
  var functionName = Blockly.AutoHotkey.provideFunction_(
      'RandomColor',
      [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '()',
        '{',
        '\tRandom, rand, 0x000000, 0xFFFFFF',
        '\treturn rand',
        '}']);
  var code = functionName + '()';
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  var red = Blockly.AutoHotkey.valueToCode(block, 'RED',
      Blockly.AutoHotkey.ORDER_COMMA) || 0;
  var green = Blockly.AutoHotkey.valueToCode(block, 'GREEN',
      Blockly.AutoHotkey.ORDER_COMMA) || 0;
  var blue = Blockly.AutoHotkey.valueToCode(block, 'BLUE',
      Blockly.AutoHotkey.ORDER_COMMA) || 0;
  var functionName = Blockly.AutoHotkey.provideFunction_(
      'ColorFromRGB',
      [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(r, g, b)',
       '{',
       '  return Format("0x{:02x}{:02x}{:02x}"',
       '    , Max(Min(r*2.55, 255), 0)',
       '    , Max(Min(g*2.55, 255), 0)',
       '    , Max(Min(b*2.55, 255), 0))',
       '}']);
  var code = functionName + '(' + red + ', ' + green + ', ' + blue + ')';
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['colour_blend'] = function(block) {
  // Blend two colours together.
  var c1 = Blockly.AutoHotkey.valueToCode(block, 'COLOUR1',
      Blockly.AutoHotkey.ORDER_COMMA) || '000000';
  var c2 = Blockly.AutoHotkey.valueToCode(block, 'COLOUR2',
      Blockly.AutoHotkey.ORDER_COMMA) || '000000';
  var ratio = Blockly.AutoHotkey.valueToCode(block, 'RATIO',
      Blockly.AutoHotkey.ORDER_COMMA) || 0.5;
  var functionName = Blockly.AutoHotkey.provideFunction_(
      'BlendColors',
      [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(c1, c2, ratio)',
       '{',
       '\tratio := Max(Min(ratio, 1), 0)',
       '\tr1 := (c1>>16) & 0xFF, g1 := (c1>>8)&0xFF, b1 := c1&0xFF',
       '\tr2 := (c2>>16) & 0xFF, g2 := (c2>>8)&0xFF, b2 := c2&0xFF',
       '\tr := Round(r1 * (1 - ratio) + r2 * ratio)',
       '\tg := Round(g1 * (1 - ratio) + g2 * ratio)',
       '\tb := Round(b1 * (1 - ratio) + b2 * ratio)',
       '\treturn (r&0xFF)<<16 | (g&0xFF)<<8 | (b&0xFF)',
       '}']);
  var code = functionName + '(' + c1 + ', ' + c2 + ', ' + ratio + ')';
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};
