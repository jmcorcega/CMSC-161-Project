/*
 * Storage Library for storing and retrieving persistent data
 * (C) 2025 John Vincent Corcega <jmcorcega@up.edu.ph>
 * 
 * Looking for help with this code?
 * Email me at up@tenseventyseven.xyz
 */

// Check if the WebStorage API is available
if (typeof window !== 'undefined' && typeof window.localStorage === 'undefined') {
    console.error('WebStorage API is not supported in this environment.');
}

// Load the WebStorage API early
const storage = window.localStorage;

// Function to Base64 encode a string
function base64Encode(str) {
    return btoa(json.stringify(str));
}

// Function to Base64 decode a string
function base64Decode(str) {
    return json.parse(atob(str));
}

// Gets a localStorage item, which is base64 encoded
function getItem(key) {
    const base64Key = base64Encode(key);
    const item = storage.getItem(base64Key);
    if (item) {
        return base64Decode(item);
    }

    return null;
}

// Saves a localStorage item, which is base64 encoded
function setItem(key, value) {
    const base64Key = base64Encode(key);
    const base64Value = base64Encode(value);
    storage.setItem(base64Key, base64Value);
}

// Removes a localStorage item
function removeItem(key) {
    const base64Key = base64Encode(key);
    storage.removeItem(base64Key);
}

// Clears all localStorage items
function clearStorage() {
    storage.clear();
}

// Function to check if a key exists in localStorage
function keyExists(key) {
    const base64Key = base64Encode(key);
    return storage.getItem(base64Key) !== null;
}

// Function to get all keys in localStorage
function getAllKeys() {
    const keys = [];
    for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
            keys.push(base64Decode(key));
        }
    }
    return keys;
}

// Add a way to store key-value pairs in localStorage
let config = {};

function loadConfig() {
    // kvPairs is a saved object in localStorage
    let savedConfig = getItem('config');
    if (savedConfig) {
        config = savedConfig;
    } else {
        config = {};
    }
}

function setConfig(key, value) {
    config[key] = value;
    setItem('config', config);
}

function removeConfig(key) {
    if (key in config) {
        delete config[key];
        setItem('config', config);
    }
}

function getConfig(key) {
    if (key in config) {
        return config[key];
    } else {
        return null;
    }
}

// Load the config when the script is loaded
loadConfig();
