/*
 * Key Listener library for detecting key events
 * (C) 2025 John Vincent Corcega <jmcorcega@up.edu.ph>
 * 
 * Looking for help with this code?
 * Email me at up@tenseventyseven.xyz
 */

const callbacks = {};

export function registerKeyListener(id, key, action, callback) {
    if (typeof id !== 'string' || typeof key !== 'string' || typeof action !== 'string') {
        throw new Error('Invalid arguments: id, key, and action must be strings');
    }

    if (typeof callback !== 'function') {
        throw new Error('Invalid argument: callback must be a function');
    }

    if (!callbacks[id]) {
        callbacks[id] = {};
    }

    // If the key is a letter, convert it to lowercase
    if (key.length === 1 && key.match(/[a-zA-Z]/)) {
        key = key.toLowerCase();
    }

    if (!callbacks[id][key]) {
        callbacks[id][key] = {};
    }
    if (!callbacks[id][key][action]) {
        callbacks[id][key][action] = [];
    }

    callbacks[id][key][action].push(callback);
}

export function unregisterKeyListener(id) {
    if (typeof id !== 'string') {
        throw new Error('Invalid argument: id must be a string');
    }

    if (callbacks[id]) {
        delete callbacks[id];
    }
}

function onKeyEvent(event) {
    let key = event.key;
    const action = event.type;

    // If letter key, convert to lowercase
    if (key.length === 1 && key.match(/[a-zA-Z]/)) {
        key = key.toLowerCase();
    }

    for (const id in callbacks) {
        if (callbacks[id][key] && callbacks[id][key][action]) {
            for (const callback of callbacks[id][key][action]) {
                callback(event);
            }
        }
    }
}

// Add event listeners for keydown, keyup events after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('keydown', onKeyEvent);
    window.addEventListener('keyup', onKeyEvent);
});