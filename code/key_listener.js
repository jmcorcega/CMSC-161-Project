/*
 * Key Listener library for detecting key events
 * (C) 2025 John Vincent Corcega <jmcorcega@up.edu.ph>
 * 
 * Looking for help with this code?
 * Email me at up@tenseventyseven.xyz
 */

let callbacks = {}

function register_key_listener(id, key, action, callback) {
    if (typeof id !== 'string' || typeof key !== 'string' || typeof action !== 'string') {
        throw new Error('Invalid arguments: id, key, and action must be strings');
    }

    if (typeof callback !== 'function') {
        throw new Error('Invalid argument: callback must be a function');
    }

    if (!callbacks[id]) {
        callbacks[id] = {};
    } else {
        throw new Error(`Observer with id ${id} already exists`);
    }

    if (!callbacks[id][key]) {
        callbacks[id][key] = {};
    }
    if (!callbacks[id][key][action]) {
        callbacks[id][key][action] = [];
    }

    callbacks[id][key][action].push(callback);
}

function unregister_key_listener(id) {
    if (typeof id !== 'string') {
        throw new Error('Invalid argument: id must be a string');
    }

    if (callbacks[id]) {
        delete callbacks[id];
    } else {
        throw new Error(`Observer with id ${id} does not exist`);
    }
}

function __on_key_event(event) {
    const key = event.key;
    const action = event.type;

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
    window.addEventListener('keydown', __on_key_event);
    window.addEventListener('keyup', __on_key_event);
});
