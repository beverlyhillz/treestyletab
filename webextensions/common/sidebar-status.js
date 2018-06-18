/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
'use strict';

import {
  log as internalLogger,
  configs
} from './common.js';
import * as Constants from './constants.js';
import * as TSTAPI from './tst-api.js';

// eslint-disable-next-line no-unused-vars
function log(...args) {
  if (configs.logFor['common/sidebar-status'])
    internalLogger(...args);
}

let gOpenState;
const gFocusState = new Map();

export function isOpen(windowId) {
  return gOpenState && gOpenState.has(windowId)
}

export function isWatchingOpenState() {
  return !!gOpenState;
}

export function hasFocus(windowId) {
  return gFocusState.has(windowId)
}

browser.runtime.onMessage.addListener((message, _aSender) => {
  if (!message ||
      typeof message.type != 'string')
    return;

  switch (message.type) {
    case Constants.kNOTIFY_SIDEBAR_FOCUS:
      gFocusState.set(message.windowId, true);
      break;

    case Constants.kNOTIFY_SIDEBAR_BLUR:
      gFocusState.delete(message.windowId);
      break;
  }
});

export function startWatchOpenState() {
  if (isWatchingOpenState())
    return;
  gOpenState = new Map();
  const matcher = new RegExp(`^${Constants.kCOMMAND_REQUEST_CONNECT_PREFIX}`);
  browser.runtime.onConnect.addListener(port => {
    if (!matcher.test(port.name))
      return;
    const windowId = parseInt(port.name.replace(matcher, ''));
    gOpenState.set(windowId, true);
    TSTAPI.sendMessage({
      type:   TSTAPI.kNOTIFY_SIDEBAR_SHOW,
      window: windowId
    });
    port.onDisconnect.addListener(_aMessage => {
      gOpenState.delete(windowId);
      gFocusState.delete(windowId);
      TSTAPI.sendMessage({
        type:   TSTAPI.kNOTIFY_SIDEBAR_HIDE,
        window: windowId
      });
    });
  });
}