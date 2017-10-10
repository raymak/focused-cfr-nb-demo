  /* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/Console.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
const log = console.log; // Temporary

XPCOMUtils.defineLazyModuleGetter(this, "RecentWindow","resource:///modules/RecentWindow.jsm");

this.EXPORTED_SYMBOLS = ["Doorhanger"];

// Due to bug 1051238 frame scripts are cached forever, so we can't update them
// as a restartless add-on. The Math.random() is the work around for this.
const FRAME_SCRIPT = (
  `resource://focused-cfr-shield-study-content/doorhanger/doorhanger.js?${Math.random()}`
);

function getMostRecentBrowserWindow() {
  return RecentWindow.getMostRecentBrowserWindow({
    private: false,
    allowPopups: false,
  });
}

class Doorhanger {
  constructor(){

  }

  present(){
    log('presenting doorhanger');
    this.show(getMostRecentBrowserWindow());
  }

  show(win) {
    let panel = win.document.getElementById("focused-cfr-doorhanger-panel");
    let burgerButton = win.document.getElementById("PanelUI-menu-button");

    if (panel === null) { // create the panel
      panel = win.document.createElement("panel");
      panel.setAttribute("id", "focused-cfr-doorhanger-panel");
      panel.setAttribute("class", "no-padding-panel");
      panel.setAttribute("type", "arrow");
      panel.setAttribute("noautofocus", true);
      panel.setAttribute("level", "parent");
      panel.setAttribute("style", "height: 100px; width: 200px");

      const embeddedBrowser = win.document.createElement("browser");
      embeddedBrowser.setAttribute("id", "focused-cfr-doorhanger");
      embeddedBrowser.setAttribute("src", "resource://focused-cfr-shield-study-content/doorhanger/doorhanger.html");
      embeddedBrowser.setAttribute("type", "content");
      embeddedBrowser.setAttribute("disableglobalhistory", "true");
      embeddedBrowser.setAttribute("flex", "1");

      panel.appendChild(embeddedBrowser);
      win.document.getElementById("mainPopupSet").appendChild(panel);

      // seems that messageManager only available when browser is attached
      embeddedBrowser.messageManager.loadFrameScript(FRAME_SCRIPT, false);
      embeddedBrowser.messageManager.addMessageListener('log', {
        receiveMessage: function(message) {
          log(message.data);    
        }
      }, true);

    }
    panel.openPopup(burgerButton, "", 0, 0, false, false);
  }
}