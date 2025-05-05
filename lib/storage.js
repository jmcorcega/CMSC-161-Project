/*
 * Storage Library for storing and retrieving persistent data
 * (C) 2025 John Vincent Corcega <jmcorcega@up.edu.ph>
 * 
 * Looking for help with this code?
 * Email me at up@tenseventyseven.xyz
 */

export default class StorageService {
    constructor() {
        if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
            console.error('WebStorage API is not supported in this environment.');
            throw new Error('WebStorage API is not supported in this environment.');
        }

        this.storage = window.localStorage;
        this.json = JSON;
        this.config = {};

        this.loadConfig();
    }

    // Function to Base64 encode a string
    base64Encode(str) {
        return btoa(this.json.stringify(str));
    }

    // Function to Base64 decode a string
    base64Decode(str) {
        return this.json.parse(atob(str));
    }

    // Gets a localStorage item, which is base64 encoded
    getItem(key) {
        const base64Key = this.base64Encode(key);
        const item = this.storage.getItem(base64Key);
        if (item) {
            return this.base64Decode(item);
        }
        return null;
    }

    // Saves a localStorage item, which is base64 encoded
    setItem(key, value) {
        const base64Key = this.base64Encode(key);
        const base64Value = this.base64Encode(value);
        this.storage.setItem(base64Key, base64Value);
    }

    // Removes a localStorage item
    removeItem(key) {
        const base64Key = this.base64Encode(key);
        this.storage.removeItem(base64Key);
    }

    // Clears all localStorage items
    clearStorage() {
        this.storage.clear();
    }

    // Function to check if a key exists in localStorage
    keyExists(key) {
        const base64Key = this.base64Encode(key);
        return this.storage.getItem(base64Key) !== null;
    }

    // Function to get all keys in localStorage
    getAllKeys() {
        const keys = [];
        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i);
            if (key) {
                keys.push(this.base64Decode(key));
            }
        }
        return keys;
    }

    // Load the config object from localStorage
    loadConfig() {
        const savedConfig = this.getItem('config');
        if (savedConfig) {
            this.config = savedConfig;
        } else {
            this.config = {};
        }
    }

    // Set a key-value pair in the config object
    setConfig(key, value) {
        this.config[key] = value;
        this.setItem('config', this.config);
    }

    // Remove a key from the config object
    removeConfig(key) {
        if (key in this.config) {
            delete this.config[key];
            this.setItem('config', this.config);
        }
    }

    // Get a value from the config object
    getConfig(key) {
        if (key in this.config) {
            return this.config[key];
        }
        return null;
    }
}