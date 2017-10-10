  /* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/Console.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
const log = console.log; // Temporary

XPCOMUtils.defineLazyModuleGetter(this, "RecentWindow","resource:///modules/RecentWindow.jsm");


this.EXPORTED_SYMBOLS = ["NotificationBar"];

// Due to bug 1051238 frame scripts are cached forever, so we can't update them
// as a restartless add-on. The Math.random() is the work around for this.
const FRAME_SCRIPT = (
  `resource://focused-cfr-shield-study-content/notificationbar/notificationBar.js?${Math.random()}`
);

function getMostRecentBrowserWindow() {
  return RecentWindow.getMostRecentBrowserWindow({
    private: false,
    allowPopups: false,
  });
}


class NotificationBar {
  constructor(){
        
  }

  present(){
    log('presenting doorhanger');
    this.show(getMostRecentBrowserWindow());
  }

  show(win){
    let box = win.document.getElementById("focused-cfr-notificationbar-box");

    if (box === null) { // create the panel
      box = win.document.createElement("hbox");
      box.setAttribute("id", "focused-cfr-notificationbar-box");
      box.setAttribute("style", "height: 72px;");

      const embeddedBrowser = win.document.createElement("browser");
      embeddedBrowser.setAttribute("id", "focused-cfr-notificationbar");
      embeddedBrowser.setAttribute("src", "resource://focused-cfr-shield-study-content/notificationbar/notificationBar.html");
      embeddedBrowser.setAttribute("type", "content");
      embeddedBrowser.setAttribute("disableglobalhistory", "true");
      embeddedBrowser.setAttribute("flex", "1");

      box.appendChild(embeddedBrowser);
      let content = win.document.getElementById("appcontent");
      content.insertBefore(box, content.childNodes[0]);

      // seems that messageManager only available when browser is attached
      embeddedBrowser.messageManager.loadFrameScript(FRAME_SCRIPT, false);
      embeddedBrowser.messageManager.addMessageListener('FocusedCFR::log', {
        receiveMessage: function(message) {
          log(message.data);    
        }
      }, true);
      embeddedBrowser.messageManager.sendAsyncMessage('FocusedCFR::load');
    }  
  }
}