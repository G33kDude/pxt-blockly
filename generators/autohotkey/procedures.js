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
 * @fileoverview Generating AutoHotkey for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 * @author contact@philipt.net (Philip Taylor)
 */
'use strict';

goog.provide('Blockly.AutoHotkey.procedures');

goog.require('Blockly.AutoHotkey');


Blockly.AutoHotkey['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcName = Blockly.AutoHotkey.variableDB_.getName(
      block.getFieldValue('NAME') || block.getName(),
      Blockly.PROCEDURE_CATEGORY_NAME);
  var xfix1 = '';
  if (Blockly.AutoHotkey.STATEMENT_PREFIX) {
    xfix1 += Blockly.AutoHotkey.injectId(Blockly.AutoHotkey.STATEMENT_PREFIX,
        block);
  }
  if (Blockly.AutoHotkey.STATEMENT_SUFFIX) {
    xfix1 += Blockly.AutoHotkey.injectId(Blockly.AutoHotkey.STATEMENT_SUFFIX,
        block);
  }
  if (xfix1) {
    xfix1 = Blockly.AutoHotkey.prefixLines(xfix1, Blockly.AutoHotkey.INDENT);
  }
  var loopTrap = '';
  if (Blockly.AutoHotkey.INFINITE_LOOP_TRAP) {
    loopTrap = Blockly.AutoHotkey.prefixLines(
        Blockly.AutoHotkey.injectId(Blockly.AutoHotkey.INFINITE_LOOP_TRAP,
        block), Blockly.AutoHotkey.INDENT);
  }
  var branch = Blockly.AutoHotkey.statementToCode(block, 'STACK');
  var returnValue = Blockly.AutoHotkey.valueToCode(block, 'RETURN',
      Blockly.AutoHotkey.ORDER_NONE) || '';
  var xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = Blockly.AutoHotkey.INDENT + 'return ' + returnValue + '\n';
  }
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.AutoHotkey.variableDB_.getName(
        block.arguments_[i].name || block.arguments_[i],
        Blockly.VARIABLE_CATEGORY_NAME);
  }
  var code = funcName + '(' + args.join(', ') + ')\n{\n\tglobal\n' +
      xfix1 + loopTrap + branch + xfix2 + returnValue + '}';
  code = Blockly.AutoHotkey.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.AutoHotkey.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.AutoHotkey['procedures_defnoreturn'] =
    Blockly.AutoHotkey['procedures_defreturn'];
Blockly.AutoHotkey['function_definition'] =
    Blockly.AutoHotkey['procedures_defreturn'];

Blockly.AutoHotkey['function_return'] = function(block) {
  var returnValue = Blockly.AutoHotkey.valueToCode(block, 'RETURN_VALUE',
      Blockly.AutoHotkey.ORDER_NONE) || '';
  return 'return ' + returnValue + '\n';
}

Blockly.AutoHotkey['argument_reporter_custom'] = function(block) {
  var name = Blockly.AutoHotkey.variableDB_.getName(
      block.getFieldValue('VALUE'),
      Blockly.VARIABLE_CATEGORY_NAME);
  return [name, Blockly.AutoHotkey.ORDER_ATOMIC];
}
Blockly.AutoHotkey['argument_reporter_boolean'] =
    Blockly.AutoHotkey['argument_reporter_custom'];
Blockly.AutoHotkey['argument_reporter_number'] =
    Blockly.AutoHotkey['argument_reporter_custom'];
Blockly.AutoHotkey['argument_reporter_string'] =
    Blockly.AutoHotkey['argument_reporter_custom'];

Blockly.AutoHotkey['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.AutoHotkey.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.PROCEDURE_CATEGORY_NAME);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.AutoHotkey.valueToCode(block, 'ARG' + i,
        Blockly.AutoHotkey.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  var tuple = Blockly.AutoHotkey['procedures_callreturn'](block);
  return tuple[0] + '\n';
};

Blockly.AutoHotkey['function_call'] = function(block) {
  // Call a function with a return value.
  var funcName = Blockly.AutoHotkey.variableDB_.getName(
      block.getName(), Blockly.PROCEDURE_CATEGORY_NAME);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.AutoHotkey.valueToCode(block, block.arguments_[i].id,
        Blockly.AutoHotkey.ORDER_COMMA) || '';
  }
  var code = funcName + '(' + args.join(', ') + ')\n';
  return code;
}

Blockly.AutoHotkey['function_call_output'] = function(block) {
  // Call a function with a return value.
  var funcName = Blockly.AutoHotkey.variableDB_.getName(
      block.getName(), Blockly.PROCEDURE_CATEGORY_NAME);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.AutoHotkey.valueToCode(block, block.arguments_[i].id,
        Blockly.AutoHotkey.ORDER_COMMA) || '';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
}

Blockly.AutoHotkey['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.AutoHotkey.valueToCode(block, 'CONDITION',
      Blockly.AutoHotkey.ORDER_NONE) || 'False';
  var code = 'if (' + condition + ')\n{\n';
  if (Blockly.AutoHotkey.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code += Blockly.AutoHotkey.prefixLines(
        Blockly.AutoHotkey.injectId(Blockly.AutoHotkey.STATEMENT_SUFFIX, block),
        Blockly.AutoHotkey.INDENT);
  }
  if (block.hasReturnValue_) {
    var value = Blockly.AutoHotkey.valueToCode(block, 'VALUE',
        Blockly.AutoHotkey.ORDER_NONE) || 'null';
    code += Blockly.AutoHotkey.INDENT + 'return ' + value + '\n';
  } else {
    code += Blockly.AutoHotkey.INDENT + 'return\n';
  }
  code += '}\n';
  return code;
};
