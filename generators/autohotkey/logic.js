/**
 * @license
 * Copyright 2012 Google LLC
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
 * @fileoverview Generating AutoHotkey for logic blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.AutoHotkey.logic');

goog.require('Blockly.AutoHotkey');


Blockly.AutoHotkey['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var code = '', branchCode, conditionCode;
  if (Blockly.AutoHotkey.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += Blockly.AutoHotkey.injectId(Blockly.AutoHotkey.STATEMENT_PREFIX,
        block);
  }
  do {
    conditionCode = Blockly.AutoHotkey.valueToCode(block, 'IF' + n,
        Blockly.AutoHotkey.ORDER_NONE) || 'false';
    branchCode = Blockly.AutoHotkey.statementToCode(block, 'DO' + n);
    if (Blockly.AutoHotkey.STATEMENT_SUFFIX) {
      branchCode = Blockly.AutoHotkey.prefixLines(
          Blockly.AutoHotkey.injectId(Blockly.AutoHotkey.STATEMENT_SUFFIX,
          block), Blockly.AutoHotkey.INDENT) + branchCode;
    }
    code += (n > 0 ? ' else ' : '') +
        'if (' + conditionCode + ') {\n' + branchCode + '}';
    ++n;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || Blockly.AutoHotkey.STATEMENT_SUFFIX) {
    branchCode = Blockly.AutoHotkey.statementToCode(block, 'ELSE');
    if (Blockly.AutoHotkey.STATEMENT_SUFFIX) {
      branchCode = Blockly.AutoHotkey.prefixLines(
          Blockly.AutoHotkey.injectId(Blockly.AutoHotkey.STATEMENT_SUFFIX,
          block), Blockly.AutoHotkey.INDENT) + branchCode;
    }
    code += ' else {\n' + branchCode + '}';
  }
  return code + '\n';
};

Blockly.AutoHotkey['controls_ifelse'] = Blockly.AutoHotkey['controls_if'];

Blockly.AutoHotkey['logic_compare'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = (operator == '==' || operator == '!=') ?
      Blockly.AutoHotkey.ORDER_EQUALITY : Blockly.AutoHotkey.ORDER_RELATIONAL;
  var argument0 = Blockly.AutoHotkey.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.AutoHotkey.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.AutoHotkey['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  var order = (operator == '&&') ? Blockly.AutoHotkey.ORDER_LOGICAL_AND :
      Blockly.AutoHotkey.ORDER_LOGICAL_OR;
  var argument0 = Blockly.AutoHotkey.valueToCode(block, 'A', order);
  var argument1 = Blockly.AutoHotkey.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == '&&') ? 'true' : 'false';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.AutoHotkey['logic_negate'] = function(block) {
  // Negation.
  var order = Blockly.AutoHotkey.ORDER_LOGICAL_NOT;
  var argument0 = Blockly.AutoHotkey.valueToCode(block, 'BOOL', order) ||
      'true';
  var code = '!' + argument0;
  return [code, order];
};

Blockly.AutoHotkey['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.AutoHotkey.ORDER_ATOMIC];
};

Blockly.AutoHotkey['logic_null'] = function(block) {
  // Null data type.
  return ['null', Blockly.AutoHotkey.ORDER_ATOMIC];
};

Blockly.AutoHotkey['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.AutoHotkey.valueToCode(block, 'IF',
      Blockly.AutoHotkey.ORDER_CONDITIONAL) || 'false';
  var value_then = Blockly.AutoHotkey.valueToCode(block, 'THEN',
      Blockly.AutoHotkey.ORDER_CONDITIONAL) || 'null';
  var value_else = Blockly.AutoHotkey.valueToCode(block, 'ELSE',
      Blockly.AutoHotkey.ORDER_CONDITIONAL) || 'null';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Blockly.AutoHotkey.ORDER_CONDITIONAL];
};
