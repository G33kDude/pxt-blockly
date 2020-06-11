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
 * @fileoverview Helper functions for generating AutoHotkey for blocks.
 * @author fraser@google.com (Neil Fraser)
 * @author contact@philipt.net (Philip Taylor)
 */
'use strict';

goog.provide('Blockly.AutoHotkey');

goog.require('Blockly.Generator');
goog.require('Blockly.utils.global');
goog.require('Blockly.utils.string');


/**
 * AutoHotkey code generator.
 * @type {!Blockly.Generator}
 */
Blockly.AutoHotkey = new Blockly.Generator('AutoHotkey');
Blockly.AutoHotkey.INDENT = '\t';

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.AutoHotkey.addReservedWords(
    'ErrorLevel,True,False,Clipboard,ClipboardAll,A_Space,A_Tab,A_Args' +
    'A_WorkingDir,A_ScriptDir,A_ScriptName,A_ScriptFullPath,A_ScriptHwnd' +
    'A_LineNumber,A_LineFile,A_ThisFunc,A_ThisLabel,A_AhkVersion,A_AhkPath' +
    'A_IsUnicode,A_IsCompiled,A_ExitReason,A_YYYY,A_MM,A_DD,A_MMMM,A_MMM' +
    'A_DDDD,A_DDD,A_WDay,A_YDay,A_YWeek,A_Hour,A_Min,A_Sec,A_MSec,A_Now' +
    'A_NowUTC,A_TickCount,A_IsSuspended,A_IsPaused,A_IsCritical,A_BatchLines' +
    'A_ListLines,A_TitleMatchMode,A_TitleMatchModeSpeed,A_DetectHiddenWindows' +
    'A_DetectHiddenText,A_AutoTrim,A_StringCaseSense,A_FileEncoding' +
    'A_FormatInteger,A_FormatFloat,A_SendMode,A_SendLevel,A_StoreCapsLockMode' +
    'StoreCapslockMode,A_KeyDelay,A_KeyDuration,A_KeyDelayPlay' +
    'A_KeyDurationPlay,A_WinDelay,A_ControlDelay,A_MouseDelay' +
    'A_MouseDelayPlay,A_DefaultMouseSpeed,A_CoordModeToolTip,A_CoordModePixel' +
    'A_CoordModeMouse,A_CoordModeCaret,A_CoordModeMenu,A_RegView,A_IconHidden' +
    'A_IconTip,A_IconFile,A_IconNumber,A_TimeIdle,A_TimeIdlePhysical' +
    'A_TimeIdleKeyboard,A_TimeIdleMouse,A_DefaultGui,A_DefaultListView' +
    'A_DefaultTreeView,A_Gui,A_GuiControl,A_GuiWidth,A_GuiHeight,A_EventInfo' +
    'A_ThisMenuItem,A_ThisMenu,A_ThisMenuItemPos,A_ThisHotkey,A_PriorHotkey' +
    'A_PriorKey,A_TimeSinceThisHotkey,A_TimeSincePriorHotkey,A_EndChar' +
    'ComSpec,A_ComSpec,A_Temp,A_OSType,A_OSVersion,A_Is64bitOS,A_PtrSize' +
    'A_Language,A_ComputerName,A_UserName,A_WinDir,A_ProgramFiles' +
    'ProgramFiles,A_AppData,A_AppDataCommon,A_Desktop,A_DesktopCommon' +
    'A_StartMenu,A_StartMenuCommon,A_Programs,A_ProgramsCommon,A_Startup' +
    'A_StartupCommon,A_MyDocuments,A_IsAdmin,A_ScreenWidth,A_ScreenHeight' +
    'Screen,A_ScreenDPI,A_IPAddress1,A_IPAddress2,A_IPAddress3,A_IPAddress4' +
    'A_Cursor,A_CaretX,A_CaretY,A_LastError,A_Index,A_GuiControlEvent' +
    'A_GuiEvent,A_GuiX,A_GuiY,A_LoopField,A_LoopFileAttrib,A_LoopFileDir' +
    'A_LoopFileExt,A_LoopFileFullPath,A_LoopFileLongPath,A_LoopFileName' +
    'A_LoopFilePath,A_LoopFileShortName,A_LoopFileShortPath,A_LoopFileSize' +
    'A_LoopFileSizeKB,A_LoopFileSizeMB,A_LoopFileTimeAccessed' +
    'A_LoopFileTimeCreated,A_LoopFileTimeModified,A_LoopReadLine,A_LoopRegKey' +
    'A_LoopRegName,A_LoopRegSubKey,A_LoopRegTimeModified,A_LoopRegType,A_MDay' +
    'A_Mon,A_NumBatchLines,A_Year,each'
);

/**
 * Order of operation ENUMs.
 * https://developer.mozilla.org/en/JavaScript/Reference/Operators/Operator_Precedence
 */
Blockly.AutoHotkey.ORDER_ATOMIC = 0;           // 0 "" ...
Blockly.AutoHotkey.ORDER_NEW = 1.1;            // new
Blockly.AutoHotkey.ORDER_MEMBER = 1.2;         // . []
Blockly.AutoHotkey.ORDER_FUNCTION_CALL = 2;    // ()
Blockly.AutoHotkey.ORDER_INCREMENT = 3;        // ++
Blockly.AutoHotkey.ORDER_DECREMENT = 3;        // --
Blockly.AutoHotkey.ORDER_BITWISE_NOT = 4.1;    // ~
Blockly.AutoHotkey.ORDER_UNARY_PLUS = 4.2;     // +
Blockly.AutoHotkey.ORDER_UNARY_NEGATION = 4.3; // -
Blockly.AutoHotkey.ORDER_LOGICAL_NOT = 4.4;    // !
Blockly.AutoHotkey.ORDER_TYPEOF = 4.5;         // typeof
Blockly.AutoHotkey.ORDER_VOID = 4.6;           // void
Blockly.AutoHotkey.ORDER_DELETE = 4.7;         // delete
Blockly.AutoHotkey.ORDER_AWAIT = 4.8;          // await
Blockly.AutoHotkey.ORDER_EXPONENTIATION = 5.0; // **
Blockly.AutoHotkey.ORDER_MULTIPLICATION = 5.1; // *
Blockly.AutoHotkey.ORDER_DIVISION = 5.2;       // /
Blockly.AutoHotkey.ORDER_MODULUS = 5.3;        // %
Blockly.AutoHotkey.ORDER_SUBTRACTION = 6.1;    // -
Blockly.AutoHotkey.ORDER_ADDITION = 6.2;       // +
Blockly.AutoHotkey.ORDER_BITWISE_SHIFT = 7;    // << >> >>>
Blockly.AutoHotkey.ORDER_RELATIONAL = 8;       // < <= > >=
Blockly.AutoHotkey.ORDER_IN = 8;               // in
Blockly.AutoHotkey.ORDER_INSTANCEOF = 8;       // instanceof
Blockly.AutoHotkey.ORDER_CONCATENATION = 8.5;  // .
Blockly.AutoHotkey.ORDER_EQUALITY = 9;         // == != === !==
Blockly.AutoHotkey.ORDER_BITWISE_AND = 10;     // &
Blockly.AutoHotkey.ORDER_BITWISE_XOR = 11;     // ^
Blockly.AutoHotkey.ORDER_BITWISE_OR = 12;      // |
Blockly.AutoHotkey.ORDER_LOGICAL_AND = 13;     // &&
Blockly.AutoHotkey.ORDER_LOGICAL_OR = 14;      // ||
Blockly.AutoHotkey.ORDER_CONDITIONAL = 15;     // ?:
Blockly.AutoHotkey.ORDER_ASSIGNMENT = 16;      // = += -= **= *= /= %= <<= >>= ...
Blockly.AutoHotkey.ORDER_YIELD = 17;           // yield
Blockly.AutoHotkey.ORDER_COMMA = 18;           // ,
Blockly.AutoHotkey.ORDER_NONE = 99;            // (...)

/**
 * List of outer-inner pairings that do NOT require parentheses.
 * @type {!Array.<!Array.<number>>}
 */
Blockly.AutoHotkey.ORDER_OVERRIDES = [
  // (foo()).bar -> foo().bar
  // (foo())[0] -> foo()[0]
  [Blockly.AutoHotkey.ORDER_FUNCTION_CALL, Blockly.AutoHotkey.ORDER_MEMBER],
  // (foo())() -> foo()()
  [Blockly.AutoHotkey.ORDER_FUNCTION_CALL, Blockly.AutoHotkey.ORDER_FUNCTION_CALL],
  // (foo.bar).baz -> foo.bar.baz
  // (foo.bar)[0] -> foo.bar[0]
  // (foo[0]).bar -> foo[0].bar
  // (foo[0])[1] -> foo[0][1]
  [Blockly.AutoHotkey.ORDER_MEMBER, Blockly.AutoHotkey.ORDER_MEMBER],
  // (foo.bar)() -> foo.bar()
  // (foo[0])() -> foo[0]()
  [Blockly.AutoHotkey.ORDER_MEMBER, Blockly.AutoHotkey.ORDER_FUNCTION_CALL],

  // !(!foo) -> !!foo
  [Blockly.AutoHotkey.ORDER_LOGICAL_NOT, Blockly.AutoHotkey.ORDER_LOGICAL_NOT],
  // a * (b * c) -> a * b * c
  [Blockly.AutoHotkey.ORDER_MULTIPLICATION, Blockly.AutoHotkey.ORDER_MULTIPLICATION],
  // a + (b + c) -> a + b + c
  [Blockly.AutoHotkey.ORDER_ADDITION, Blockly.AutoHotkey.ORDER_ADDITION],
  // a && (b && c) -> a && b && c
  [Blockly.AutoHotkey.ORDER_LOGICAL_AND, Blockly.AutoHotkey.ORDER_LOGICAL_AND],
  // a || (b || c) -> a || b || c
  [Blockly.AutoHotkey.ORDER_LOGICAL_OR, Blockly.AutoHotkey.ORDER_LOGICAL_OR]
];

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.AutoHotkey.init = function(workspace) {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.AutoHotkey.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.AutoHotkey.functionNames_ = Object.create(null);

  if (!Blockly.AutoHotkey.variableDB_) {
    Blockly.AutoHotkey.variableDB_ =
        new Blockly.Names(Blockly.AutoHotkey.RESERVED_WORDS_);
  } else {
    Blockly.AutoHotkey.variableDB_.reset();
  }

  Blockly.AutoHotkey.variableDB_.setVariableMap(workspace.getVariableMap());

  var defvars = [];
  // Add developer variables (not created or named by the user).
  var devVarList = Blockly.Variables.allDeveloperVariables(workspace);
  for (var i = 0; i < devVarList.length; i++) {
    defvars.push(Blockly.AutoHotkey.variableDB_.getName(devVarList[i],
        Blockly.Names.DEVELOPER_VARIABLE_TYPE));
  }

  // Add user variables, but only ones that are being used.
  var variables = Blockly.Variables.allUsedVarModels(workspace);
  for (var i = 0; i < variables.length; i++) {
    defvars.push(Blockly.AutoHotkey.variableDB_.getName(variables[i].getId(),
        Blockly.VARIABLE_CATEGORY_NAME));
  }

  // Declare all of the variables.
  // if (defvars.length) {
  //   // Not necessary
  //   Blockly.AutoHotkey.definitions_['variables'] = '';
  //   for (var i = 0; i < defvars.length; i++) {
  //     Blockly.AutoHotkey.definitions_['variables'] += defvars[i] + ' := ""';
  //   }
  // }
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.AutoHotkey.finish = function(code) {
  // Convert the definitions dictionary into a list.
  var definitions = [];
  var hotkey_definitions = [];
  for (var name in Blockly.AutoHotkey.definitions_) {
    if (name[0] == ':') {
      hotkey_definitions.push(Blockly.AutoHotkey.definitions_[name]);
    } else {
      definitions.push(Blockly.AutoHotkey.definitions_[name]);
    }
  }
  // Clean up temporary data.
  delete Blockly.AutoHotkey.definitions_;
  delete Blockly.AutoHotkey.functionNames_;
  Blockly.AutoHotkey.variableDB_.reset();
  return code + 'return\n' +
      (hotkey_definitions.length ? '\n\n; --- Hotkeys ---\n\n' +
          hotkey_definitions.join('\n\n') + '\n' : '') +
      (definitions.length ? '\n\n; --- Functions ---\n\n' +
          definitions.join('\n\n') + '\n': '');
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.AutoHotkey.scrubNakedValue = function(line) {
  return '; ' + line + '\n';
};

/**
 * Encode a string as a properly escaped AutoHotkey string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} AutoHotkey string.
 * @private
 */
Blockly.AutoHotkey.quote_ = function(string) {
  string = string.replace(/`/g, '``')
                 .replace(/"/g, '""');
  return '"' + string + '"';
};

/**
 * Encode a string as a properly escaped multiline AutoHotkey string, complete
 * with quotes.
 * @param {string} string Text to encode.
 * @return {string} AutoHotkey string.
 * @private
 */
Blockly.AutoHotkey.multiline_quote_ = function(string) {
  // // Can't use goog.string.quote since Google's style guide recommends
  // // JS string literals use single quotes.
  // var lines = string.split(/\n/g).map(Blockly.AutoHotkey.quote_);
  // return lines.join(' + \'\\n\' +\n');
  return 'There\'s something wrong here! Please contact the site owner.\n';
};

/**
 * Common tasks for generating AutoHotkey from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The AutoHotkey code created for this block.
 * @param {boolean=} opt_thisOnly True to generate code for only this statement.
 * @return {string} AutoHotkey code with comments and subsequent blocks added.
 * @private
 */
Blockly.AutoHotkey.scrub_ = function(block, code, opt_thisOnly) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      comment = Blockly.utils.string.wrap(comment,
          Blockly.AutoHotkey.COMMENT_WRAP - 3);
      commentCode += Blockly.AutoHotkey.prefixLines(comment + '\n', '; ');
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          comment = Blockly.AutoHotkey.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.AutoHotkey.prefixLines(comment, '; ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = opt_thisOnly ? '' : Blockly.AutoHotkey.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

/**
 * Gets a property and adjusts the value while taking into account indexing.
 * @param {!Blockly.Block} block The block.
 * @param {string} atId The property ID of the element to get.
 * @param {number=} opt_delta Value to add.
 * @param {boolean=} opt_negate Whether to negate the value.
 * @param {number=} opt_order The highest order acting on this value.
 * @return {string|number}
 */
Blockly.AutoHotkey.getAdjusted = function(block, atId, opt_delta, opt_negate,
    opt_order) {
  var delta = opt_delta || 0;
  var order = opt_order || Blockly.AutoHotkey.ORDER_NONE;
  if (!block.workspace.options.oneBasedIndex) {
    delta++;
  }
  var defaultAtIndex = block.workspace.options.oneBasedIndex ? '1' : '0';
  if (delta > 0) {
    var at = Blockly.AutoHotkey.valueToCode(block, atId,
        Blockly.AutoHotkey.ORDER_ADDITION) || defaultAtIndex;
  } else if (delta < 0) {
    var at = Blockly.AutoHotkey.valueToCode(block, atId,
        Blockly.AutoHotkey.ORDER_SUBTRACTION) || defaultAtIndex;
  } else if (opt_negate) {
    var at = Blockly.AutoHotkey.valueToCode(block, atId,
        Blockly.AutoHotkey.ORDER_UNARY_NEGATION) || defaultAtIndex;
  } else {
    var at = Blockly.AutoHotkey.valueToCode(block, atId, order) ||
        defaultAtIndex;
  }

  if (Blockly.isNumber(at)) {
    // If the index is a naked number, adjust it right now.
    at = Number(at) + delta;
    if (opt_negate) {
      at = -at;
    }
  } else {
    // If the index is dynamic, adjust it in code.
    if (delta > 0) {
      at = at + ' + ' + delta;
      var innerOrder = Blockly.AutoHotkey.ORDER_ADDITION;
    } else if (delta < 0) {
      at = at + ' - ' + -delta;
      var innerOrder = Blockly.AutoHotkey.ORDER_SUBTRACTION;
    }
    if (opt_negate) {
      if (delta) {
        at = '-(' + at + ')';
      } else {
        at = '-' + at;
      }
      var innerOrder = Blockly.AutoHotkey.ORDER_UNARY_NEGATION;
    }
    innerOrder = Math.floor(innerOrder);
    order = Math.floor(order);
    if (innerOrder && order >= innerOrder) {
      at = '(' + at + ')';
    }
  }
  return at;
};

Blockly.AutoHotkey.getSort = function() {
  return Blockly.AutoHotkey.provideFunction_(
      'Sort',
      [Blockly.AutoHotkey.FUNCTION_NAME_PLACEHOLDER_ + '(a, lo:="", hi:="")',
       '{',
       '\tif (lo == "" || hi == "")',
       '\t\treturn a, Sort(a := ObjClone(a), a.MinIndex(), a.MaxIndex())',
       '\tif (lo >= hi)',
       '\t\treturn',
       '\tRandom, r, lo, hi',
       '\tp := a[r], a[r] := a[hi], a[hi] := p, i := j := lo',
       '\twhile (j < hi)',
       '\t\t(a[j] < p ? (t := a[j], a[j] := a[i], a[i] := t, ++i) : 0), ++j',
       '\tt := a[hi], a[hi] := a[i], a[i] := t',
       '\tSort(a, lo, i - 1), Sort(a, i + 1, hi)',
       '}']);
}