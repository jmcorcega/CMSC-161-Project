import { loadPage, setPageTitle } from "../lib/page_helper.js";

export default class Screen {
    constructor(template) {
        if (new.target === Screen) {
            throw new Error("Cannot instantiate abstract class Screen directly.");
        }

        this.template = template;
        this.title = "Snake 3D";
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

    onAfterShow() {
        // This method can be overridden by subclasses if needed
    }

    onLoading() {
        // This method can be overridden by subclasses if needed
    }

    loadScreen() {
        showLoadingScreen();
        setTimeout(() => {
            loadPage(this.template, () => {
                this.onShow();
            });
        }, 1000);
    
        setPageTitle(this.title);
        this.onLoading();
        
        let progress = 0;
        const interval = setInterval(() => { // Use an arrow function here
            progress += 10;
            setLoadingProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                closeLoadingScreen();
                setTimeout(() => this.onAfterShow(), 1000);
            }
        }, 200);
    }
}
