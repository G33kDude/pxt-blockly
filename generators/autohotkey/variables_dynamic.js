/**
 * @license
 * Copyright 2018 Google LLC
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
 * @fileoverview Generating AutoHotkey for dynamic variable blocks.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.AutoHotkey.variablesDynamic');

goog.require('Blockly.AutoHotkey');
goog.require('Blockly.AutoHotkey.variables');


// AutoHotkey is dynamically typed.
Blockly.AutoHotkey['variables_get_dynamic'] =
    Blockly.AutoHotkey['variables_get'];
Blockly.AutoHotkey['variables_set_dynamic'] =
    Blockly.AutoHotkey['variables_set'];
