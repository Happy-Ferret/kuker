import readFromPath from '../helpers/readFromPath';

const listeners = [];
const bridge = {
  on: function (callback) {
    listeners.push(callback);
  }
};
const notify = function (message) {
  listeners.forEach(f => f(message));
};
const getActiveTabId = function (callback) {
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs || tabs.length === 0) {
        callback(); return;
      }
      callback(tabs[0].id);
    });
  } catch (error) {
    console.log(error);
    callback();
  }
};
const sendMessageToCurrentTag = function (data, callback) {
  getActiveTabId(function (id) {
    chrome.tabs.sendMessage(id, data, callback);
  });
};
const activeTabConsoleLog = function (...data) {
  sendMessageToCurrentTag({ type: 'console.log', data });
};
const wire = () => {
  if (!chrome || !chrome.runtime || !chrome.runtime.onMessage) return;

  // receiving events
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // console.log(chrome.devtools.inspectedWindow.tabId, readFromPath(sender, 'tab.id'));
    if (chrome.devtools.inspectedWindow.tabId === readFromPath(sender, 'tab.id')) {
      notify(message);
      sendResponse('received');
    } else {
      console.log('Different sender', message);
      sendResponse('nope different sender');
    }
  });
};

wire();

export default bridge;
