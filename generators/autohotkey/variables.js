/**
 * @license
 * Visual Blocks Language
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
 * @fileoverview Generating AutoHotkey for variable blocks.
 * @author fraser@google.com (Neil Fraser)
 * @author contact@philipt.net (Philip Taylor)
 */
'use strict';

goog.provide('Blockly.AutoHotkey.variables');

goog.require('Blockly.AutoHotkey');


Blockly.AutoHotkey['variables_get'] = function(block) {
  // Variable getter.
  var code = Blockly.AutoHotkey.variableDB_.getName(block.getField('VAR').getText(),
      Blockly.Variables.NAME_TYPE);
  return [code, Blockly.AutoHotkey.ORDER_ATOMIC];
};

Blockly.AutoHotkey['variables_get_reporter'] =
    Blockly.AutoHotkey['variables_get'];

Blockly.AutoHotkey['variables_set'] = function(block) {
  // Variable setter.
  var argument0 = Blockly.AutoHotkey.valueToCode(block, 'VALUE',
      Blockly.AutoHotkey.ORDER_ASSIGNMENT) || '""';
  var varName = Blockly.AutoHotkey.variableDB_.getName(
      block.getField('VAR').getText(), Blockly.Variables.NAME_TYPE);
  return varName + ' := ' + argument0 + '\n';
};
