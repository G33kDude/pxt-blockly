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
 * @fileoverview Generating AutoHotkey for loop blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.AutoHotkey.loops');

goog.require('Blockly.AutoHotkey');


Blockly.AutoHotkey['controls_repeat_ext'] = function(block) {
  // Repeat n times.
  if (block.getField('TIMES')) {
    // Internal number.
    var repeats = String(Number(block.getFieldValue('TIMES')));
  } else {
    // External number.
    var repeats = Blockly.AutoHotkey.valueToCode(block, 'TIMES',
        Blockly.AutoHotkey.ORDER_ASSIGNMENT) || '0';
  }
  var branch = Blockly.AutoHotkey.statementToCode(block, 'DO');
  branch = Blockly.AutoHotkey.addLoopTrap(branch, block);
  var code = '';
  var loopVar = Blockly.AutoHotkey.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var endVar = repeats;
  if (!repeats.match(/^\w+$/) && !Blockly.isNumber(repeats)) {
    var endVar = Blockly.AutoHotkey.variableDB_.getDistinctName(
        'repeat_end', Blockly.Variables.NAME_TYPE);
    code += 'var ' + endVar + ' = ' + repeats + ';\n';
  }
  code += 'for (var ' + loopVar + ' = 0; ' +
      loopVar + ' < ' + endVar + '; ' +
      loopVar + '++) {\n' +
      branch + '}\n';
  return code;
};

Blockly.AutoHotkey['controls_repeat'] =
    Blockly.AutoHotkey['controls_repeat_ext'];

Blockly.AutoHotkey['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.AutoHotkey.valueToCode(block, 'BOOL',
      until ? Blockly.AutoHotkey.ORDER_LOGICAL_NOT :
      Blockly.AutoHotkey.ORDER_NONE) || 'false';
  var branch = Blockly.AutoHotkey.statementToCode(block, 'DO');
  branch = Blockly.AutoHotkey.addLoopTrap(branch, block);
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

Blockly.AutoHotkey['controls_for'] = function(block) {
  // For loop.
  var variable0 = Blockly.AutoHotkey.variableDB_.getName(
      block.getField('VAR').getText(), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.AutoHotkey.valueToCode(block, 'FROM',
      Blockly.AutoHotkey.ORDER_ASSIGNMENT) || '0';
  var argument1 = Blockly.AutoHotkey.valueToCode(block, 'TO',
      Blockly.AutoHotkey.ORDER_ASSIGNMENT) || '0';
  var increment = Blockly.AutoHotkey.valueToCode(block, 'BY',
      Blockly.AutoHotkey.ORDER_ASSIGNMENT) || '1';
  var branch = Blockly.AutoHotkey.statementToCode(block, 'DO');
  branch = Blockly.AutoHotkey.addLoopTrap(branch, block);
  var code;
  if (Blockly.isNumber(argument0) && Blockly.isNumber(argument1) &&
      Blockly.isNumber(increment)) {
    // All arguments are simple numbers.
    var up = parseFloat(argument0) <= parseFloat(argument1);
    code = 'for (' + variable0 + ' = ' + argument0 + '; ' +
        variable0 + (up ? ' <= ' : ' >= ') + argument1 + '; ' +
        variable0;
    var step = Math.abs(parseFloat(increment));
    if (step == 1) {
      code += up ? '++' : '--';
    } else {
      code += (up ? ' += ' : ' -= ') + step;
    }
    code += ') {\n' + branch + '}\n';
  } else {
    code = '';
    // Cache non-trivial values to variables to prevent repeated look-ups.
    var startVar = argument0;
    if (!argument0.match(/^\w+$/) && !Blockly.isNumber(argument0)) {
      startVar = Blockly.AutoHotkey.variableDB_.getDistinctName(
          variable0 + '_start', Blockly.Variables.NAME_TYPE);
      code += 'var ' + startVar + ' = ' + argument0 + ';\n';
    }
    var endVar = argument1;
    if (!argument1.match(/^\w+$/) && !Blockly.isNumber(argument1)) {
      var endVar = Blockly.AutoHotkey.variableDB_.getDistinctName(
          variable0 + '_end', Blockly.Variables.NAME_TYPE);
      code += 'var ' + endVar + ' = ' + argument1 + ';\n';
    }
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    var incVar = Blockly.AutoHotkey.variableDB_.getDistinctName(
        variable0 + '_inc', Blockly.Variables.NAME_TYPE);
    code += 'var ' + incVar + ' = ';
    if (Blockly.isNumber(increment)) {
      code += Math.abs(increment) + ';\n';
    } else {
      code += 'Math.abs(' + increment + ');\n';
    }
    code += 'if (' + startVar + ' > ' + endVar + ') {\n';
    code += Blockly.AutoHotkey.INDENT + incVar + ' = -' + incVar + ';\n';
    code += '}\n';
    code += 'for (' + variable0 + ' = ' + startVar + '; ' +
        incVar + ' >= 0 ? ' +
        variable0 + ' <= ' + endVar + ' : ' +
        variable0 + ' >= ' + endVar + '; ' +
        variable0 + ' += ' + incVar + ') {\n' +
        branch + '}\n';
  }
  return code;
};

Blockly.AutoHotkey['controls_forEach'] = function(block) {
  // For each loop.
  var variable0 = Blockly.AutoHotkey.variableDB_.getName(
      block.getField('VAR').getText(), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.AutoHotkey.valueToCode(block, 'LIST',
      Blockly.AutoHotkey.ORDER_ASSIGNMENT) || '[]';
  var branch = Blockly.AutoHotkey.statementToCode(block, 'DO');
  branch = Blockly.AutoHotkey.addLoopTrap(branch, block);
  var code = '';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  var listVar = argument0;
  if (!argument0.match(/^\w+$/)) {
    listVar = Blockly.AutoHotkey.variableDB_.getDistinctName(
        variable0 + '_list', Blockly.Variables.NAME_TYPE);
    code += 'var ' + listVar + ' = ' + argument0 + ';\n';
  }
  var indexVar = Blockly.AutoHotkey.variableDB_.getDistinctName(
      variable0 + '_index', Blockly.Variables.NAME_TYPE);
  branch = Blockly.AutoHotkey.INDENT + variable0 + ' = ' +
      listVar + '[' + indexVar + '];\n' + branch;
  code += 'for (var ' + indexVar + ' in ' + listVar + ') {\n' + branch + '}\n';
  return code;
};

Blockly.AutoHotkey['controls_flow_statements'] = function(block) {
  // Flow statements: continue, break.
  var xfix = '';
  if (Blockly.AutoHotkey.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    xfix += Blockly.AutoHotkey.injectId(Blockly.AutoHotkey.STATEMENT_PREFIX,
        block);
  }
  if (Blockly.AutoHotkey.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the break/continue is triggered.
    xfix += Blockly.AutoHotkey.injectId(Blockly.AutoHotkey.STATEMENT_SUFFIX,
        block);
  }
  if (Blockly.AutoHotkey.STATEMENT_PREFIX) {
    var loop = Blockly.Constants.Loops
        .CONTROL_FLOW_IN_LOOP_CHECK_MIXIN.getSurroundLoop(block);
    if (loop && !loop.suppressPrefixSuffix) {
      // Inject loop's statement prefix here since the regular one at the end
      // of the loop will not get executed if 'continue' is triggered.
      // In the case of 'break', a prefix is needed due to the loop's suffix.
      xfix += Blockly.AutoHotkey.injectId(Blockly.AutoHotkey.STATEMENT_PREFIX,
          loop);
    }
  }
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return xfix + 'break;\n';
    case 'CONTINUE':
      return xfix + 'continue;\n';
  }
  throw Error('Unknown flow statement.');
};
