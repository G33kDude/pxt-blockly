/**
 * @license
 * Visual Blocks Language
 * Modified 2020 Philip Taylor
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
 * @fileoverview Generating AutoHotkey for text blocks.
 * @author fraser@google.com (Neil Fraser)
 * @author contact@philipt.net (Philip Taylor)
 */
'use strict';

goog.provide('Blockly.AutoHotkey.texts');

goog.require('Blockly.AutoHotkey');


Blockly.AutoHotkey['text'] = function(block) {
  // Text value.
  var code = Blockly.AutoHotkey.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.AutoHotkey.ORDER_ATOMIC];
};

/**
 * Enclose the provided value in 'String(...)' function.
 * Leave string literals alone.
 * @param {string} value Code evaluating to a value.
 * @return {string} Code evaluating to a string.
 * @private
 */
Blockly.AutoHotkey.text.forceString_ = function(value) {
  if (Blockly.AutoHotkey.text.forceString_.strRegExp.test(value)) {
    return value;
  }
  return '(' + value + ' . "")';
};

/**
 * Regular expression to detect a double-quoted string literal.
 */
Blockly.AutoHotkey.text.forceString_.strRegExp = /^\s*"([^"]|"")*"\s*$/;

Blockly.AutoHotkey['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  switch (block.itemCount_) {
    case 0:
      return ['""', Blockly.AutoHotkey.ORDER_ATOMIC];
    case 1:
      var element = Blockly.AutoHotkey.valueToCode(block, 'ADD0',
          Blockly.AutoHotkey.ORDER_NONE) || '""';
      var code = Blockly.AutoHotkey.text.forceString_(element);
      return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
    case 2:
      var element0 = Blockly.AutoHotkey.valueToCode(block, 'ADD0',
          Blockly.AutoHotkey.ORDER_NONE) || '""';
      var element1 = Blockly.AutoHotkey.valueToCode(block, 'ADD1',
          Blockly.AutoHotkey.ORDER_NONE) || '""';
      var code = Blockly.AutoHotkey.text.forceString_(element0) + ' . ' +
          Blockly.AutoHotkey.text.forceString_(element1);
      return [code, Blockly.AutoHotkey.ORDER_ADDITION];
    default:
      // Define the join helper function
      var functionName = Blockly.AutoHotkey.provideFunction_(
          'Join',
          [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ +
                '(array, delimiter:="")',
            '{',
            '\tfor k, v in array',
            '\t\tresult .= delimiter . v',
            '\treturn SubStr(result, 1 + StrLen(delimiter))',
            '}']);
      var elements = new Array(block.itemCount_);
      for (var i = 0; i < block.itemCount_; i++) {
        elements[i] = Blockly.AutoHotkey.valueToCode(block, 'ADD' + i,
            Blockly.AutoHotkey.ORDER_CONCATENATION) || '""';
      }
      var code = elements.join(' . ');
      return [code, Blockly.AutoHotkey.ORDER_CONCATENATION];
  }
};

Blockly.AutoHotkey['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.AutoHotkey.variableDB_.getName(
      block.getField('VAR').getText(), Blockly.Variables.NAME_TYPE);
  var value = Blockly.AutoHotkey.valueToCode(block, 'TEXT',
      Blockly.AutoHotkey.ORDER_NONE) || '""';
  return varName + ' .= ' + Blockly.AutoHotkey.text.forceString_(value) + '\n';
};

Blockly.AutoHotkey['text_length'] = function(block) {
  // String or array length.
  var text = Blockly.AutoHotkey.valueToCode(block, 'VALUE',
      Blockly.AutoHotkey.ORDER_FUNCTION_CALL) || '""';
  return ['StrLen(' + text + ')', Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var text = Blockly.AutoHotkey.valueToCode(block, 'VALUE',
      Blockly.AutoHotkey.ORDER_NONE) || '""';
  return ['!StrLen(' + text + ')', Blockly.AutoHotkey.ORDER_LOGICAL_NOT];
};

Blockly.AutoHotkey['text_indexOf'] = function(block) {
  // Search the text for a substring.
  var findLast = block.getFieldValue('END') == 'LAST';
  var substring = Blockly.AutoHotkey.valueToCode(block, 'FIND',
      Blockly.AutoHotkey.ORDER_NONE) || '""';
  var text = Blockly.AutoHotkey.valueToCode(block, 'VALUE',
      Blockly.AutoHotkey.ORDER_MEMBER) || '""';
  var code = 'InStr(' + text + ', ' + substring + (findLast ? ',, 0)' : ')');
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var textOrder = (where == 'RANDOM') ? Blockly.AutoHotkey.ORDER_NONE :
      Blockly.AutoHotkey.ORDER_MEMBER;
  var text = Blockly.AutoHotkey.valueToCode(block, 'VALUE',
      textOrder) || '""';
  switch (where) {
    case 'FIRST':
      var code = 'SubStr(' + text + ', 1, 1)';
      return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
    case 'LAST':
      var code = 'SubStr(' + text + ', 0, 1)';
      return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
    case 'FROM_START':
      var at = Blockly.AutoHotkey.getAdjusted(block, 'AT');
      var code = 'SubStr(' + text + ', ' + at + ', 1)';
      return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
    case 'FROM_END':
      var at = Blockly.AutoHotkey.getAdjusted(block, 'AT', -1, true);
      var code = 'SubStr(' + text + ', ' + at + ', 1)';
      return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
    case 'RANDOM':
      var functionName = Blockly.AutoHotkey.provideFunction_(
          'RandomLetter',
          [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(text)',
            '{',
            '\tRandom, rand, 1, StrLen(text)',
            '\treturn SubStr(text, rand, 1)',
            '}']);
      var code = functionName + '(' + text + ')';
      return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
  }
  throw Error('Unhandled option (text_charAt).');
};

/**
 * Returns an expression calculating the index into a string.
 * @param {string} stringName Name of the string, used to calculate length.
 * @param {string} where The method of indexing, selected by dropdown in Blockly
 * @param {string=} opt_at The optional offset when indexing from start/end.
 * @return {string} Index expression.
 * @private
 */
Blockly.AutoHotkey.text.getIndex_ = function(stringName, where, opt_at) {
  if (where == 'FIRST') {
    return '1';
  } else if (where == 'FROM_END') {
    return 'StrLen(' + stringName + ') - ' + opt_at;
  } else if (where == 'LAST') {
    return 'StrLen(' + stringName + ')';
  } else {
    return opt_at;
  }
};

Blockly.AutoHotkey['text_getSubstring'] = function(block) {
  // Get substring.
  var text = Blockly.AutoHotkey.valueToCode(block, 'STRING',
      Blockly.AutoHotkey.ORDER_FUNCTION_CALL) || '""';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = text;
  } else {
    // TODO: Fails:
    // Letter # From End to Letter #

    switch (where1) {
      case 'FROM_START':
        var at1 = Blockly.AutoHotkey.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        var at1 = Blockly.AutoHotkey.getAdjusted(block, 'AT1', -1, true);
        break;
      case 'FIRST':
        var at1 = '1';
        break;
      default:
        throw Error('Unhandled option (text_getSubstring).');
    }

    switch (where2) {
      case 'FROM_START':
        // TODO: Cache the value of at1
        var at2 = Blockly.AutoHotkey.getAdjusted(block, 'AT2', 1);
        at2 += ' - ' + at1;
        break;
      case 'FROM_END':
        var at2 = Blockly.AutoHotkey.getAdjusted(block, 'AT2', -1, true);
        break;
      case 'LAST':
        var at2 = '';
        break;
      default:
        throw Error('Unhandled option (text_getSubstring).');
    }
    code = 'SubStr(' + text + ', ' + at1 + (at2 ? ', ' + at2 : '') + ')';

  }
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['text_changeCase'] = function(block) {
  // Change capitalization.
  var OPERATORS = {
    'UPPERCASE': 'Format("{:U}", ',
    'LOWERCASE': 'Format("{:L}", ',
    'TITLECASE': 'Format("{:T}", '
  };
  var operator = OPERATORS[block.getFieldValue('CASE')];
  var textOrder = operator ? Blockly.AutoHotkey.ORDER_MEMBER :
      Blockly.AutoHotkey.ORDER_NONE;
  var text = Blockly.AutoHotkey.valueToCode(block, 'TEXT',
      textOrder) || '""';
  var code = operator + text + ')';
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    'LEFT': 'LTrim(',
    'RIGHT': 'RTrim(',
    'BOTH': 'Trim('
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var text = Blockly.AutoHotkey.valueToCode(block, 'TEXT',
      Blockly.AutoHotkey.ORDER_MEMBER) || '""';
  return [operator + text + ')', Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['text_print'] = function(block) {
  // Print statement.
  var msg = Blockly.AutoHotkey.valueToCode(block, 'TEXT',
      Blockly.AutoHotkey.ORDER_NONE) || '""';
  var functionName = Blockly.AutoHotkey.provideFunction_(
      'Print',
      [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ +
          '(value)',
        '{',
        '\tMsgBox, % IsObject(value) ? "<object>" : value',
        '}']);
  return functionName + '(' + msg + ')\n';
};

Blockly.AutoHotkey['text_prompt_ext'] = function(block) {
  // Prompt function.
  if (block.getField('TEXT')) {
    // Internal message.
    var msg = Blockly.AutoHotkey.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    var msg = Blockly.AutoHotkey.valueToCode(block, 'TEXT',
        Blockly.AutoHotkey.ORDER_NONE) || '""';
  }
  var functionName = Blockly.AutoHotkey.provideFunction_(
      'InputBox',
      [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(message)',
        '{',
        '\tInputBox, result,, % message',
        '\treturn result',
        '}']);
  var code = functionName + '(' + msg + ')';
  // TODO: Typecasting
  // var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['text_prompt'] = Blockly.AutoHotkey['text_prompt_ext'];

Blockly.AutoHotkey['text_count'] = function(block) {
  var text = Blockly.AutoHotkey.valueToCode(block, 'TEXT',
      Blockly.AutoHotkey.ORDER_MEMBER) || '""';
  var sub = Blockly.AutoHotkey.valueToCode(block, 'SUB',
      Blockly.AutoHotkey.ORDER_NONE) || '""';
  var functionName = Blockly.AutoHotkey.provideFunction_(
      'StrCount',
      [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(haystack, needle)',
        '{',
        '\tStrReplace(haystack, needle,, count)',
        '\treturn count',
        '}']);
  var code = functionName + '(' + text + ', ' + sub + ')';
  return [code, Blockly.AutoHotkey.ORDER_SUBTRACTION];
};

Blockly.AutoHotkey['text_replace'] = function(block) {
  var text = Blockly.AutoHotkey.valueToCode(block, 'TEXT',
      Blockly.AutoHotkey.ORDER_MEMBER) || '""';
  var from = Blockly.AutoHotkey.valueToCode(block, 'FROM',
      Blockly.AutoHotkey.ORDER_NONE) || '""';
  var to = Blockly.AutoHotkey.valueToCode(block, 'TO',
      Blockly.AutoHotkey.ORDER_NONE) || '""';
  var code = 'StrReplace(' + text + ', ' + from + ', ' + to + ')';
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['text_reverse'] = function(block) {
  var text = Blockly.AutoHotkey.valueToCode(block, 'TEXT',
      Blockly.AutoHotkey.ORDER_MEMBER) || '\'\'';
  var functionName = Blockly.AutoHotkey.provideFunction_(
      'StrRev',
      [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(str)',
        '{',
        '\tDllCall("msvcrt\\_" (A_IsUnicode ? "wcs" : "str") "rev"',
        '\t\t, "UInt", &str, "CDecl")',
        '\treturn str',
        '}']);
  var code = functionName + '(' + text + ')';
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};
