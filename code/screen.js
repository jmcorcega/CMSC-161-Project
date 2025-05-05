import { loadPage } from "../lib/page_helper.js";

export default class Screen {
    constructor(template) {
        if (new.target === Screen) {
            throw new Error("Cannot instantiate abstract class Screen directly.");
        }

        this.template = template;
    }

    onHeaderLoad(fn) {
        const backBtn = document.getElementById('header-btn-back');
        if (backBtn != null && fn != null) {
            backBtn.addEventListener('click', fn);
        }
    }

    // Abstract method to be implemented by subclasses
    onShow() {
        throw new Error("onShow() must be implemented in the derived class.");
    }

    loadScreen() {
        showLoadingScreen();
        setTimeout(() => {
            loadPage(this.template, () => {
                this.onShow();
            });
        }, 1000);
    
        var progress = 0;
        var interval = setInterval(function () {
            progress += 10;
            setLoadingProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                closeLoadingScreen();
            }
        }, 100);
    }
}
