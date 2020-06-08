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
 * @fileoverview Generating AutoHotkey for math blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 * @author contact@philipt.net (Philip Taylor)
 */
'use strict';

goog.provide('Blockly.AutoHotkey.math');

goog.require('Blockly.AutoHotkey');


Blockly.AutoHotkey['math_number'] = function(block) {
  // Numeric value.
  var code = parseFloat(block.getFieldValue('NUM'));
  var order = code >= 0 ? Blockly.AutoHotkey.ORDER_ATOMIC :
              Blockly.AutoHotkey.ORDER_UNARY_NEGATION;
  return [code, order];
};

Blockly.AutoHotkey['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', Blockly.AutoHotkey.ORDER_ADDITION],
    'MINUS': [' - ', Blockly.AutoHotkey.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', Blockly.AutoHotkey.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', Blockly.AutoHotkey.ORDER_DIVISION],
    'POWER': [' ** ', Blockly.AutoHotkey.ORDER_EXPONENTIATION]
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.AutoHotkey.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.AutoHotkey.valueToCode(block, 'B', order) || '0';
  var code;
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.AutoHotkey['math_single'] = function(block) {
  // Math operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.AutoHotkey.valueToCode(block, 'NUM',
        Blockly.AutoHotkey.ORDER_UNARY_NEGATION) || '0';
    if (arg[0] == '-') {
      // --3 is not legal in AHK.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, Blockly.AutoHotkey.ORDER_UNARY_NEGATION];
  }
  if (operator == 'SIN' || operator == 'COS' || operator == 'TAN') {
    arg = Blockly.AutoHotkey.valueToCode(block, 'NUM',
        Blockly.AutoHotkey.ORDER_DIVISION) || '0';
  } else if (operator == 'POW10') {
    arg = Blockly.AutoHotkey.valueToCode(block, 'NUM',
        Blockly.AutoHotkey.ORDER_EXPONENTIATION) || '0';
  } else {
    arg = Blockly.AutoHotkey.valueToCode(block, 'NUM',
        Blockly.AutoHotkey.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = 'Abs(' + arg + ')';
      break;
    case 'ROOT':
      code = 'Sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'Ln(' + arg + ')';
      break;
    case 'EXP':
      code = 'Exp(' + arg + ')';
      break;
    case 'ROUND':
      code = 'Round(' + arg + ')';
      break;
    case 'ROUNDUP':
      code = 'Ceil(' + arg + ')';
      break;
    case 'ROUNDDOWN':
      code = 'Floor(' + arg + ')';
      break;
    case 'SIN':
      code = 'Sin(' + arg + ' / 180 * ' + Math.PI + ')';
      break;
    case 'COS':
      code = 'Cos(' + arg + ' / 180 * ' + Math.PI + ')';
      break;
    case 'TAN':
      code = 'Tan(' + arg + ' / 180 * ' + Math.PI + ')';
      break;
    case 'LOG10':
      code = 'Log(' + arg + ')';
      break;
  }
  if (code) {
    return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ASIN':
      code = 'ASin(' + arg + ') / ' + Math.PI + ' * 180';
      break;
    case 'ACOS':
      code = 'ACos(' + arg + ') / ' + Math.PI + ' * 180';
      break;
    case 'ATAN':
      code = 'ATan(' + arg + ') / ' + Math.PI + ' * 180';
      break;
  }
  if (code) {
    return [code, Blockly.AutoHotkey.ORDER_DIVISION];
  }
  // Third, handle cases which generate values that use other assorted operators
  switch (operator) {
    case 'POW10':
      code = arg + ' ** 10';
      return [code, Blockly.AutoHotkey.ORDER_EXPONENTIATION];
  }
  throw Error('Unknown math operator: ' + operator);
};

Blockly.AutoHotkey['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    'PI': [Math.PI, Blockly.AutoHotkey.ORDER_ATOMIC],
    'E': [Math.E, Blockly.AutoHotkey.ORDER_ATOMIC],
    'GOLDEN_RATIO':
        ['(1 + Sqrt(5)) / 2', Blockly.AutoHotkey.ORDER_DIVISION],
    'SQRT2': ['Sqrt(2)', Blockly.AutoHotkey.ORDER_FUNCTION_CALL],
    'SQRT1_2': ['Sqrt(1 / 2)', Blockly.AutoHotkey.ORDER_FUNCTION_CALL],
    'INFINITY': ['2**63-1', Blockly.AutoHotkey.ORDER_SUBTRACTION]
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

Blockly.AutoHotkey['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.AutoHotkey.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.AutoHotkey.ORDER_RELATIONAL) || '0';
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    var functionName = Blockly.AutoHotkey.provideFunction_(
        'IsPrime',
        [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(n)',
          '{',
          '\t; https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
          '\tif (n == 2 || n == 3)',
          '\t\treturn True',
          '\t; False if n is NaN, negative, is 1, or not whole.',
          '\t; And false if n is divisible by 2 or 3.',
          '\tif (n <= 1 || Mod(n, 1) != 0 || Mod(n, 2) == 0 || Mod(n, 3) == 0)',
          '\t\treturn False',
          '\t; Check all the numbers of form 6k +/- 1, up to Sqrt(n).',
          '\tx := 6, z := Sqrt(n) + 1',
          '\twhile (x <= z)',
          '\t{',
          '\t\tif (Mod(n, x - 1) == 0 || Mod(n, x + 1) == 0)',
          '\t\t\treturn False',
          '\t\tx += 6',
          '\t}',
          '\treturn True',
          '}']);
    code = functionName + '(' + number_to_check + ')';
    return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
  }
  switch (dropdown_property) {
    case 'EVEN':
      code = 'Mod(' + number_to_check + ', 2) == 0';
      break;
    case 'ODD':
      code = 'Mod(' + number_to_check + ', 2) == 1';
      break;
    case 'WHOLE':
      code = 'Mod(' + number_to_check + ', 1) == 0';
      break;
    case 'POSITIVE':
      code = number_to_check + ' > 0';
      break;
    case 'NEGATIVE':
      code = number_to_check + ' < 0';
      break;
    case 'DIVISIBLE_BY':
      var divisor = Blockly.AutoHotkey.valueToCode(block, 'DIVISOR',
          Blockly.AutoHotkey.ORDER_COMMA) || '0';
      code = 'Mod(' + number_to_check + ', ' + divisor + ') == 0';
      break;
  }
  return [code, Blockly.AutoHotkey.ORDER_RELATIONAL];
};

Blockly.AutoHotkey['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.AutoHotkey.valueToCode(block, 'DELTA',
      Blockly.AutoHotkey.ORDER_ASSIGNMENT) || '0';
  var varName = Blockly.AutoHotkey.variableDB_.getName(
      block.getField('VAR').getText(), Blockly.Variables.NAME_TYPE);
  return varName + ' += ' + argument0 + '\n';
};

// Rounding functions have a single operand.
Blockly.AutoHotkey['math_round'] = Blockly.AutoHotkey['math_single'];
// Trigonometry functions have a single operand.
Blockly.AutoHotkey['math_trig'] = Blockly.AutoHotkey['math_single'];

Blockly.AutoHotkey['math_on_list'] = function(block) {
  // Math functions for lists.
  var func = block.getFieldValue('OP');
  var list, code;
  // Define a Mean helper for those operations that need it
  if (func === 'MEAN' || func === 'STD_DEV') {
    var meanFunctionName = Blockly.AutoHotkey.provideFunction_(
        'Mean',
        [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(values*)',
          '{',
          '\tsum := 0, i := 0',
          '\tfor k, v in values',
          '\t\tif v is Number',
          '\t\t\ti++, sum += v',
          '\treturn sum / i',
          '}']);
  }
  switch (func) {
    case 'SUM':
      // Sum(["", "", 1, 3]) == 4
      var functionName = Blockly.AutoHotkey.provideFunction_(
          'Sum',
          [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(values*)',
            '{',
            '\tsum := 0',
            '\tfor k, v in values',
            '\t\tsum += v',
            '\treturn sum',
            '}']);
      list = Blockly.AutoHotkey.valueToCode(block, 'LIST',
          Blockly.AutoHotkey.ORDER_MEMBER) || '[]';
      code = functionName + '(' + list + '*)';
      break;
    case 'MIN':
      list = Blockly.AutoHotkey.valueToCode(block, 'LIST',
          Blockly.AutoHotkey.ORDER_COMMA) || '[]';
      code = 'Min(' + list + '*)';
      break;
    case 'MAX':
      list = Blockly.AutoHotkey.valueToCode(block, 'LIST',
          Blockly.AutoHotkey.ORDER_COMMA) || '[]';
      code = 'Max(' + list + '*)';
      break;
    case 'AVERAGE':
      // Mean(["", "", 1, 3]) == 2.0.
      list = Blockly.AutoHotkey.valueToCode(block, 'LIST',
          Blockly.AutoHotkey.ORDER_NONE) || '[]';
      code = meanFunctionName + '(' + list + '*)';
      break;
    case 'MEDIAN':
      // Median(["", "", 1, 3]) == 2.0.
      var sortFunctionName = Blockly.AutoHotkey.getSort();
      var functionName = Blockly.AutoHotkey.provideFunction_(
          'Median',
          [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(values*)',
            '{',
            '\ta := []',
            '\tfor k, v in values',
            '\t\tif v is Number',
            '\t\t\ta.Push(v)',
            '\tif (!a.Length())',
            '\t\treturn ""',
            '\t' + sortFunctionName + '(a, 1, a.Length())',
            '\tif (Mod(a.Length(), 2))',
            '\t\treturn a[(a.Length() + 1) // 2]',
            '\treturn a[a.Length() // 2] / 2 + a[a.Length() // 2 + 1] / 2',
            '}']);
      list = Blockly.AutoHotkey.valueToCode(block, 'LIST',
          Blockly.AutoHotkey.ORDER_NONE) || '[]';
      code = functionName + '(' + list + '*)';
      break;
    case 'MODE':
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, "x", "x", 1, 1, 2, "3"] -> ["x", 1].
      var functionName = Blockly.AutoHotkey.provideFunction_(
          'Modes',
          [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(values*)',
            '{',
            '\tcounts := [], maxCount := 0, modes := []',
            '\tfor i, value in values',
            '\t{',
            '\t\tfor j, count in counts',
            '\t\t{',
            '\t\t\tif (count[1] == value)',
            '\t\t\t{',
            '\t\t\t\tmaxCount := Max(++count[2], maxCount)',
            '\t\t\t\tcontinue, 2',
            '\t\t\t}',
            '\t\t}',
            '\t\tcounts.Push([value, 1])',
            '\t\tmaxCount := Max(1, maxCount)',
            '\t}',
            '\tfor j, count in counts',
            '\t\tif (count[2] == maxCount)',
            '\t\t\tmodes.push(count[1])',
            '\treturn modes',
            '}']);
      list = Blockly.AutoHotkey.valueToCode(block, 'LIST',
          Blockly.AutoHotkey.ORDER_NONE) || '[]';
      code = functionName + '(' + list + '*)';
      break;
    case 'STD_DEV':
      var functionName = Blockly.AutoHotkey.provideFunction_(
          'mathStandardDeviation',
          [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(numbers*)',
            '{',
            '\tif (!numbers.Length())',
            '\t\treturn',
            '\tmean := ' + meanFunctionName + '(numbers*)',
            '\tvariance_sum := 0',
            '\tfor number in numbers',
            '\t\tvariance_sum += (number - mean) ** 2',
            '\treturn Sqrt(variance_sum / numbers.Length())',
            '}']);
      list = Blockly.AutoHotkey.valueToCode(block, 'LIST',
          Blockly.AutoHotkey.ORDER_NONE) || '[]';
      code = functionName + '(' + list + '*)';
      break;
    case 'RANDOM':
      var functionName = Blockly.AutoHotkey.provideFunction_(
          'RandomItem',
          [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ +
              '(array, remove:=False)',
            '{',
            '\tRandom, i, array.MinIndex(), array.MaxIndex()',
            '\treturn remove ? array.RemoveAt(i) : array[i]',
            '}']);
      list = Blockly.AutoHotkey.valueToCode(block, 'LIST',
          Blockly.AutoHotkey.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    default:
      throw Error('Unknown operator: ' + func);
  }
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.AutoHotkey.valueToCode(block, 'DIVIDEND',
      Blockly.AutoHotkey.ORDER_COMMA) || '0';
  var argument1 = Blockly.AutoHotkey.valueToCode(block, 'DIVISOR',
      Blockly.AutoHotkey.ORDER_COMMA) || '0';
  var code = 'Mod(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  var argument0 = Blockly.AutoHotkey.valueToCode(block, 'VALUE',
      Blockly.AutoHotkey.ORDER_COMMA) || '0';
  var argument1 = Blockly.AutoHotkey.valueToCode(block, 'LOW',
      Blockly.AutoHotkey.ORDER_COMMA) || '0';
  var argument2 = Blockly.AutoHotkey.valueToCode(block, 'HIGH',
      Blockly.AutoHotkey.ORDER_COMMA) || '2**63-1';
  var code = 'Min(Max(' + argument0 + ', ' + argument1 + '), ' + argument2 +
      ')';
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  var argument0 = Blockly.AutoHotkey.valueToCode(block, 'FROM',
      Blockly.AutoHotkey.ORDER_COMMA) || '0';
  var argument1 = Blockly.AutoHotkey.valueToCode(block, 'TO',
      Blockly.AutoHotkey.ORDER_COMMA) || '0';
  var functionName = Blockly.AutoHotkey.provideFunction_(
      'RandomInt',
      [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(min, max) {',
        '\tRandom, rand, Ceil(min), Floor(max)',
        '\treturn rand',
        '}']);
  var code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  var functionName = Blockly.AutoHotkey.provideFunction_(
      'RandomFraction',
      [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(min, max) {',
        '\tRandom, rand, min, max',
        '\treturn rand',
        '}']);
  return [functionName + '(0.0, 1.0)', Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['math_atan2'] = function(block) {
  // Arctangent of point (X, Y) in degrees from -180 to 180.
  var argument0 = Blockly.AutoHotkey.valueToCode(block, 'X',
      Blockly.AutoHotkey.ORDER_COMMA) || '0';
  var argument1 = Blockly.AutoHotkey.valueToCode(block, 'Y',
      Blockly.AutoHotkey.ORDER_COMMA) || '0';
  var functionName = Blockly.AutoHotkey.provideFunction_(
      'ATan2',
      [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(y, x) {',
        '\treturn DllCall("msvcrt\\atan2", "Double", y, "Double", x, ' +
            '"Cdecl Double") / ' + Math.PI + ' * 180',
        '}']);
  var code = functionName + '(' + argument1 + ', ' + argument0 + ')';
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};
