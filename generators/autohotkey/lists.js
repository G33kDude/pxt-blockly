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
 * @fileoverview Generating AutoHotkey for list blocks.
 * @author fraser@google.com (Neil Fraser)
 * @author contact@philipt.net (Philip Taylor)
 */
'use strict';

goog.provide('Blockly.AutoHotkey.lists');

goog.require('Blockly.AutoHotkey');


Blockly.AutoHotkey['lists_create_empty'] = function(block) {
  // Create an empty list.
  return ['[]', Blockly.AutoHotkey.ORDER_ATOMIC];
};

Blockly.AutoHotkey['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.AutoHotkey.valueToCode(block, 'ADD' + i,
        Blockly.AutoHotkey.ORDER_COMMA) || '""';
  }
  var code = '[' + elements.join(', ') + ']';
  return [code, Blockly.AutoHotkey.ORDER_ATOMIC];
};

Blockly.AutoHotkey['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  var functionName = Blockly.AutoHotkey.provideFunction_(
      'ArrayRepeat',
      [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(value, n)',
       '{',
       '\tarray := []',
       '\tloop, % n',
       '\t\tarray.Push(value)',
       '\treturn array',
       '}']);
  var element = Blockly.AutoHotkey.valueToCode(block, 'ITEM',
      Blockly.AutoHotkey.ORDER_COMMA) || '""';
  var repeatCount = Blockly.AutoHotkey.valueToCode(block, 'NUM',
      Blockly.AutoHotkey.ORDER_COMMA) || '0';
  var code = functionName + '(' + element + ', ' + repeatCount + ')';
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['lists_length'] = function(block) {
  // String or array length.
  var list = Blockly.AutoHotkey.valueToCode(block, 'VALUE',
      Blockly.AutoHotkey.ORDER_MEMBER) || '[]';
  return [list + '.Length()', Blockly.AutoHotkey.ORDER_MEMBER];
};

Blockly.AutoHotkey['lists_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var list = Blockly.AutoHotkey.valueToCode(block, 'VALUE',
      Blockly.AutoHotkey.ORDER_MEMBER) || '[]';
  return ['!' + list + '.Length()', Blockly.AutoHotkey.ORDER_LOGICAL_NOT];
};

Blockly.AutoHotkey['lists_indexOf'] = function(block) {
  // Find an item in the list.
  var functionName = Blockly.AutoHotkey.provideFunction_(
      'IndexOf',
      [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ +
          '(array, value, first:=True)',
       '{',
       '\tfor k, v in array',
       '\t{',
       '\t\tif (v == value)',
       '\t\t{',
       '\t\t\tif first',
       '\t\t\t\treturn k',
       '\t\t\tfound := k',
       '\t\t}',
       '\t}',
       '\treturn found',
       '}']);
  var first = block.getFieldValue('END') == 'FIRST' ? '' : ', False';
  var item = Blockly.AutoHotkey.valueToCode(block, 'FIND',
      Blockly.AutoHotkey.ORDER_NONE) || '""';
  var list = Blockly.AutoHotkey.valueToCode(block, 'VALUE',
      Blockly.AutoHotkey.ORDER_MEMBER) || '[]';
  var code = functionName + '(' + list + ', ' + item + first + ')';
  if (!block.workspace.options.oneBasedIndex) {
    return [code + ' - 1', Blockly.AutoHotkey.ORDER_ADDITION];
  }
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['lists_getIndex'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var listOrder = (where == 'RANDOM') ? Blockly.AutoHotkey.ORDER_COMMA :
      Blockly.AutoHotkey.ORDER_MEMBER;
  var list = Blockly.AutoHotkey.valueToCode(block, 'VALUE', listOrder) || '[]';

  switch (where) {
    case ('FIRST'):
      if (mode == 'GET') {
        var code = list + '[1]';
        return [code, Blockly.AutoHotkey.ORDER_MEMBER];
      } else if (mode == 'GET_REMOVE') {
        var code = list + '.RemoveAt(1)';
        return [code, Blockly.AutoHotkey.ORDER_MEMBER];
      } else if (mode == 'REMOVE') {
        return list + '.RemoteAt(1)\n';
      }
      break;
    case ('LAST'):
      if (mode == 'GET') {
        var functionName = Blockly.AutoHotkey.provideFunction_(
            'Peek',
            [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(array)',
             '{',
             '\treturn array[array.length()]',
             '}']);
        var code = functionName + '(' + list + ')';
        return [code, Blockly.AutoHotkey.ORDER_MEMBER];
      } else if (mode == 'GET_REMOVE') {
        var code = list + '.Pop()';
        return [code, Blockly.AutoHotkey.ORDER_MEMBER];
      } else if (mode == 'REMOVE') {
        return list + '.Pop()\n';
      }
      break;
    case ('FROM_START'):
      var at = Blockly.AutoHotkey.getAdjusted(block, 'AT');
      if (mode == 'GET') {
        var code = list + '[' + at + ']';
        return [code, Blockly.AutoHotkey.ORDER_MEMBER];
      } else if (mode == 'GET_REMOVE') {
        var code = list + '.RemoveAt(' + at + ')';
        return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return list + '.RemoveAt(' + at + ')\n';
      }
      break;
    case ('FROM_END'):
      var at = Blockly.AutoHotkey.getAdjusted(block, 'AT', 1, true);
      if (mode == 'GET') {
        var functionName = Blockly.AutoHotkey.provideFunction_(
            'FromEnd',
            [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(array, n)',
             '{',
             '\treturn array[array.length()-n]',
             '}']);
        var code = functionName + '(' + list + ', ' + at + ')';
        return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
      } else if (mode == 'GET_REMOVE') {
        var functionName = Blockly.AutoHotkey.provideFunction_(
            'RemoveFromEnd',
            [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(array, n)',
             '{',
             '\treturn array.RemoveAt(array.Length() - n)',
             '}']);
        var code = functionName + '(' + list + ', ' + at + ')';
        return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        var functionName = Blockly.AutoHotkey.provideFunction_(
            'RemoveFromEnd',
            [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(array, n)',
             '{',
             '\treturn array.RemoveAt(array.Length() - n)',
             '}']);
        return functionName + '(' + list + ', ' + at + ')\n';
      }
      break;
    case ('RANDOM'):
      var functionName = Blockly.AutoHotkey.provideFunction_(
          'RandomItem',
          [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ +
              '(array, remove:=False)',
           '{',
           '\tRandom, i, array.MinIndex(), array.MaxIndex()',
           '\treturn remove ? array.RemoveAt(i) : array[i]',
           '}']);
      code = functionName + '(' + list + ', ' + (mode != 'GET') + ')';
      if (mode == 'GET' || mode == 'GET_REMOVE') {
        return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
      break;
  }
  throw Error('Unhandled combination (lists_getIndex).');
};

Blockly.AutoHotkey['lists_setIndex'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var list = Blockly.AutoHotkey.valueToCode(block, 'LIST',
      Blockly.AutoHotkey.ORDER_MEMBER) || '[]';
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var value = Blockly.AutoHotkey.valueToCode(block, 'TO',
      Blockly.AutoHotkey.ORDER_ASSIGNMENT) || '""';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  function cacheList() {
    if (list.match(/^\w+$/)) {
      return '';
    }
    var listVar = Blockly.AutoHotkey.variableDB_.getDistinctName(
        'tmpList', Blockly.VARIABLE_CATEGORY_NAME);
    var code = listVar + ' := ' + list + '\n';
    list = listVar;
    return code;
  }
  switch (where) {
    case ('FIRST'):
      if (mode == 'SET') {
        return list + '[1] := ' + value + '\n';
      } else if (mode == 'INSERT') {
        return list + '.InsertAt(1, ' + value + ')\n';
      }
      break;
    case ('LAST'):
      if (mode == 'SET') {
        var code = cacheList();
        code += list + '[' + list + '.Length()] := ' + value + '\n';
        return code;
      } else if (mode == 'INSERT') {
        return list + '.Push(' + value + ')\n';
      }
      break;
    case ('FROM_START'):
      var at = Blockly.AutoHotkey.getAdjusted(block, 'AT');
      if (mode == 'SET') {
        return list + '[' + at + '] := ' + value + '\n';
      } else if (mode == 'INSERT') {
        return list + '.InsertAt(' + at + ', ' + value + ')\n';
      }
      break;
    case ('FROM_END'):
      var at = Blockly.AutoHotkey.getAdjusted(block, 'AT', 1, false,
        Blockly.AutoHotkey.ORDER_SUBTRACTION);
      var code = cacheList();
      if (mode == 'SET') {
        code += list + '[' + list + '.Length() - ' + at + '] := ' + value +
          '\n';
        return code;
      } else if (mode == 'INSERT') {
        code += list + '.InsertAt(' + list + '.Length() - ' + at + ', ' +
          value + ')\n';
        return code;
      }
      break;
    case ('RANDOM'):
      var code = cacheList();
      var xVar = Blockly.AutoHotkey.variableDB_.getDistinctName(
          'Rand', Blockly.VARIABLE_CATEGORY_NAME);
      code += 'Random, ' + xVar + ', ' + list + '.MinIndex(), ' + list +
          '.MaxIndex()\n';
      if (mode == 'SET') {
        code += list + '[' + xVar + '] := ' + value + '\n';
        return code;
      } else if (mode == 'INSERT') {
        code += list + '.InsertAt(' + xVar + ', ' + value + ')\n';
        return code;
      }
      break;
  }
  throw Error('Unhandled combination (lists_setIndex).');
};

/**
 * Returns an expression calculating the index into a list.
 * @param {string} listName Name of the list, used to calculate length.
 * @param {string} where The method of indexing, selected by dropdown in Blockly
 * @param {string=} opt_at The optional offset when indexing from start/end.
 * @return {string|undefined} Index expression.
 * @private
 */
Blockly.AutoHotkey.lists.getIndex_ = function (listName, where, opt_at) {
  if (where == 'FIRST') {
    return '1';
  } else if (where == 'FROM_END') {
    return listName + '.Length() - ' + opt_at;
  } else if (where == 'LAST') {
    return listName + '.Length()';
  } else {
    return opt_at;
  }
};

Blockly.AutoHotkey['lists_getSublist'] = function (block) {
  // Get sublist.
  var list = Blockly.AutoHotkey.valueToCode(block, 'LIST',
      Blockly.AutoHotkey.ORDER_MEMBER) || '[]';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  if (where1 == 'FIRST' && where2 == 'LAST') {
    var code = list + '.Clone()';
    return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
  }
  // Define the slice helper function
  var functionName = Blockly.AutoHotkey.provideFunction_(
      'Slice',
      [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(array, start, end)',
       '{',
       '\tresult := []',
       '\tloop, % end - start + 1',
       '\t\tresult[A_Index] := array[start + A_Index - 1]',
       '\treturn result',
       '}']);
  if (list.match(/^\w+$/) ||
    (where1 != 'FROM_END' && where2 == 'FROM_START')) {
    // If the list is a variable or doesn't require a call for length, don't
    // generate a helper function.
    switch (where1) {
      case 'FROM_START':
        var at1 = Blockly.AutoHotkey.getAdjusted(block, 'AT1');
        break;
      case 'FROM_END':
        var at1 = Blockly.AutoHotkey.getAdjusted(block, 'AT1', 0, false,
            Blockly.AutoHotkey.ORDER_SUBTRACTION);
        at1 = list + '.Length() - ' + at1;
        break;
      case 'FIRST':
        var at1 = '0';
        break;
      default:
        throw Error('Unhandled option (lists_getSublist).');
    }
    switch (where2) {
      case 'FROM_START':
        var at2 = Blockly.AutoHotkey.getAdjusted(block, 'AT2', 0);
        break;
      case 'FROM_END':
        var at2 = Blockly.AutoHotkey.getAdjusted(block, 'AT2', 0, false,
            Blockly.AutoHotkey.ORDER_SUBTRACTION);
        at2 = list + '.Length() - ' + at2;
        break;
      case 'LAST':
        var at2 = list + '.Length()';
        break;
      default:
        throw Error('Unhandled option (lists_getSublist).');
    }
    code = 'Slice(' + list + ', ' + at1 + ', ' + at2 + ')';
  } else {
    var at1 = Blockly.AutoHotkey.getAdjusted(block, 'AT1');
    var at2 = Blockly.AutoHotkey.getAdjusted(block, 'AT2');
    var getIndex_ = Blockly.AutoHotkey.lists.getIndex_;
    var wherePascalCase = {'FIRST': 'First', 'LAST': 'Last',
        'FROM_START': 'FromStart', 'FROM_END': 'FromEnd'};
    var functionName = Blockly.AutoHotkey.provideFunction_(
        'SubArray' + wherePascalCase[where1] + 'To' + wherePascalCase[where2],
        [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ +
            '(array' +
            // The value for 'FROM_END' and'FROM_START' depends on `at` so
            // we add it as a parameter.
            ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', at1' : '') +
            ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', at2' : '') +
            ')',
          '{',
          '  start := ' + getIndex_('array', where1, 'at1'),
          '  end := ' + getIndex_('array', where2, 'at2') + ' + 1',
          '  return Slice(array, start, end)',
          '}']);
    var code = functionName + '(' + list +
        // The value for 'FROM_END' and 'FROM_START' depends on `at` so we
        // pass it.
        ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', ' + at1 : '') +
        ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', ' + at2 : '') +
        ')';
  }
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['lists_sort'] = function(block) {
  // Block for sorting a list.
  var list = Blockly.AutoHotkey.valueToCode(block, 'LIST',
      Blockly.AutoHotkey.ORDER_FUNCTION_CALL) || '[]';
  var reverse = block.getFieldValue('DIRECTION') === '-1';
  var functionName = Blockly.AutoHotkey.getSort();
  return [functionName + '(' + list + (reverse ? ', True' : '') + ')',
      Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  var input = Blockly.AutoHotkey.valueToCode(block, 'INPUT',
      Blockly.AutoHotkey.ORDER_MEMBER);
  var delimiter = Blockly.AutoHotkey.valueToCode(block, 'DELIM',
      Blockly.AutoHotkey.ORDER_NONE) || '""';
  var mode = block.getFieldValue('MODE');
  if (mode == 'SPLIT') {
    var code = 'StrSplit(' + (input || '""') + ', ' + delimiter + ')';
  } else if (mode == 'JOIN') {
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
    var code = functionName + '(' + (input || '[]') + ', ' + delimiter + ')';
  } else {
    throw Error('Unknown mode: ' + mode);
  }
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};

Blockly.AutoHotkey['lists_reverse'] = function(block) {
  // Block for reversing a list.
  var list = Blockly.AutoHotkey.valueToCode(block, 'LIST',
      Blockly.AutoHotkey.ORDER_FUNCTION_CALL) || '[]';
  // Define the reverse helper function
  var functionName = Blockly.AutoHotkey.provideFunction_(
      'Reverse',
      [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(array)',
       '{',
       '\tresult := []',
       '\tfor k, v in array',
       '\t\tresult.InsertAt(1, v)',
       '\treturn result',
       '}']);
  var code = functionName + '(' + list + ')';
  return [code, Blockly.AutoHotkey.ORDER_FUNCTION_CALL];
};
