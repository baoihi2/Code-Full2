// ==UserScript==
// @name         Auto Click DragonBall - Hoàn Chỉnh
// @namespace    http://tampermonkey.net/
// @version      31.0
// @description  Tự động click - Con trỏ 1 spam click đến khi URL con trỏ 2 xuất hiện
// @author       AutoClicker
// @match        *://dragonballh5.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("%c🔧 Script khởi động...", "color: #00ff9d; font-size: 14px");

    // ========== CẤU HÌNH ==========
    const CLICK_DELAY = 1000;  // 1 giây mỗi click
    const SPAM_CLICK_DELAY = 500; // 0.5 giây mỗi lần spam click của con trỏ 1
    const DEFAULT_MAX_CLICKS = 4;
    const TRIGGER_1_MAX_CLICKS = 999; // Spam click không giới hạn
    const TRIGGER_7_MAX_CLICKS = 3;
    const TRIGGER_10_MAX_CLICKS = 5;
    const TRIGGER_3_MAX_CLICKS = 1;
    const TRIGGER_8_MAX_CLICKS = 3;
    const TRIGGER_9_MAX_CLICKS = 1;
    const TRIGGER_15_MAX_CLICKS = 3;
    const TRIGGER_16_MAX_CLICKS = 3;
    const TRIGGER_17_MAX_CLICKS = 3;
    const TRIGGER_18_MAX_CLICKS = 2;
    
    const triggers = [
        { id: 1, name: "Vào Game", url: null, x: 108, y: 397, needClick: true, maxClicks: TRIGGER_1_MAX_CLICKS, delay: SPAM_CLICK_DELAY, needUrl: false, isSpam: true },
        { id: 2, name: "Đặt tên", url: "bg_xuanren.jpg", fullUrl: "http://dragonballh5.com/@New/login/create/bg_xuanren.jpg", x: 195, y: 408, needInput: true, inputType: "name", needClick: true, maxClicks: DEFAULT_MAX_CLICKS, waitAfterInput: 2000, delay: CLICK_DELAY, needUrl: true },
        { id: 3, name: "Xác nhận tên", url: "btn_xacnhan.png", fullUrl: "http://dragonballh5.com/@New/login/create/btn_xacnhan.png", x: 187, y: 452, needClick: true, maxClicks: TRIGGER_3_MAX_CLICKS, delay: CLICK_DELAY, needUrl: true },
        { id: 4, name: "Xác định rule", url: null, x: 174, y: 335, needClick: true, maxClicks: DEFAULT_MAX_CLICKS, delay: CLICK_DELAY, needUrl: false },
        { id: 5, name: "Bỏ qua", url: "New_character1.png", fullUrl: "http://dragonballh5.com/common/New_character1.png", x: 81, y: 54, needClick: true, maxClicks: DEFAULT_MAX_CLICKS, delay: CLICK_DELAY, needUrl: true },
        { id: 6, name: "Avatar", url: "head3022.png", fullUrl: "http://dragonballh5.com/icon/head3022.png", x: 55, y: 21, needClick: true, maxClicks: DEFAULT_MAX_CLICKS, delay: CLICK_DELAY, needUrl: true },
        { id: 7, name: "Vào Giftcode", url: "hero_camp_101.png", fullUrl: "http://dragonballh5.com/common/hero_camp_101.png", x: 183, y: 478, needClick: true, maxClicks: TRIGGER_7_MAX_CLICKS, delay: CLICK_DELAY, needUrl: true },
        { id: 8, name: "Nhập code", url: "person.png", fullUrl: "http://dragonballh5.com/atlas/img/person.png", x: 211, y: 246, needInput: true, inputType: "code", inputValue: "HOTROREBORN", needClick: true, maxClicks: TRIGGER_8_MAX_CLICKS, waitAfterInput: 2000, delay: CLICK_DELAY, needUrl: true },
        { id: 9, name: "Xác nhận code", url: null, x: 158, y: 300, needClick: true, maxClicks: TRIGGER_9_MAX_CLICKS, delay: CLICK_DELAY, needUrl: false },
        { id: 10, name: "Chuyển Tab", url: null, x: 298, y: 20, needClick: true, maxClicks: TRIGGER_10_MAX_CLICKS, delay: CLICK_DELAY, needUrl: false },
        { id: 11, name: "Vào Guild", url: null, x: 263, y: 492, needClick: true, maxClicks: DEFAULT_MAX_CLICKS, delay: CLICK_DELAY, needUrl: false },
        { id: 12, name: "Gia nhập Guild", url: null, x: 245, y: 77, needClick: true, maxClicks: DEFAULT_MAX_CLICKS, delay: CLICK_DELAY, needUrl: false },
        { id: 13, name: "Vào cống hiến", url: null, x: 204, y: 271, needClick: true, maxClicks: DEFAULT_MAX_CLICKS, delay: CLICK_DELAY, needUrl: false },
        { id: 14, name: "Cống hiến", url: null, x: 264, y: 372, needClick: true, maxClicks: DEFAULT_MAX_CLICKS, delay: CLICK_DELAY, needUrl: false },
        { id: 15, name: "Thoát cống hiến", url: null, x: 263, y: 492, needClick: true, maxClicks: TRIGGER_15_MAX_CLICKS, delay: CLICK_DELAY, needUrl: false },
        { id: 16, name: "Vào Thành Viên", url: null, x: 292, y: 173, needClick: true, maxClicks: TRIGGER_16_MAX_CLICKS, delay: CLICK_DELAY, needUrl: false },
        { id: 17, name: "Thoát Guild", url: null, x: 266, y: 406, needClick: true, maxClicks: TRIGGER_17_MAX_CLICKS, delay: CLICK_DELAY, needUrl: false },
        { id: 18, name: "Xác nhận thoát Guild", url: null, x: 252, y: 300, needClick: true, maxClicks: TRIGGER_18_MAX_CLICKS, isFinal: true, delay: CLICK_DELAY, needUrl: false }
    ];

    let currentIndex = 0;
    let isProcessing = false;
    let isRunning = true;
    let seenUrls = new Set();
    let panel = null;
    let isCollapsed = false;
    let currentAction = "";
    let currentInputTarget = null;
    let pageReady = false;
    let spamInterval = null;
    let isSpamActive = false;

    // ========== KIỂM TRA TRANG ĐÃ LOAD XONG ==========
    function waitForPageLoad() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                pageReady = true;
                resolve();
            } else {
                window.addEventListener('load', () => {
                    pageReady = true;
                    resolve();
                });
            }
        });
    }
    
    // ========== TẠO USERNAME NGẪU NHIÊN ==========
    function randomUserName(length = 10) {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    // ========== CHUYỂN HƯỚNG VỚI USERNAME MỚI ==========
    function redirectWithNewUser() {
        const newUser = randomUserName(10);
        const currentUrl = window.location.href;
        let newUrl;
        
        if (currentUrl.includes('userName=')) {
            newUrl = currentUrl.replace(/userName=[^&]*/, `userName=${newUser}`);
        } else if (currentUrl.includes('?')) {
            newUrl = currentUrl + `&userName=${newUser}`;
        } else {
            newUrl = currentUrl + `?userName=${newUser}`;
        }
        
        console.log(`%c🔄 Tạo tài khoản mới: ${newUser}`, "color: #ff9800");
        console.log(`🔗 Chuyển hướng đến: ${newUrl}`);
        
        currentIndex = 0;
        seenUrls.clear();
        saveState();
        
        window.location.href = newUrl;
    }
    
    // ========== TẠO MENU ==========
    function createPanel() {
        if (panel) panel.remove();
        
        panel = document.createElement('div');
        panel.id = 'auto-panel';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.9);
            border-radius: 8px;
            padding: 8px;
            z-index: 999999;
            color: white;
            font-family: monospace;
            font-size: 10px;
            cursor: move;
            border: 1px solid #00ff9d;
            transition: all 0.2s ease;
        `;
        
        document.body.appendChild(panel);
        
        // Kéo thả
        let drag = false, startX, startY;
        panel.addEventListener('mousedown', (e) => {
            if (e.target.closest('button')) return;
            drag = true;
            startX = e.clientX - panel.offsetLeft;
            startY = e.clientY - panel.offsetTop;
            panel.style.cursor = 'grabbing';
        });
        document.addEventListener('mousemove', (e) => {
            if (!drag) return;
            let left = e.clientX - startX;
            let top = e.clientY - startY;
            left = Math.max(0, Math.min(left, window.innerWidth - panel.offsetWidth));
            top = Math.max(0, Math.min(top, window.innerHeight - panel.offsetHeight));
            panel.style.left = left + 'px';
            panel.style.top = top + 'px';
            panel.style.right = 'auto';
        });
        document.addEventListener('mouseup', () => { drag = false; panel.style.cursor = 'move'; });
        
        updatePanelDisplay();
        
        const savedLeft = localStorage.getItem('autoPanelLeft');
        const savedTop = localStorage.getItem('autoPanelTop');
        if (savedLeft && savedTop && savedLeft !== 'auto' && savedTop !== 'auto') {
            panel.style.left = savedLeft;
            panel.style.top = savedTop;
            panel.style.right = 'auto';
        }
    }
    
    function updatePanelDisplay() {
        if (!panel) return;
        
        if (isCollapsed) {
            panel.style.width = '40px';
            panel.style.height = '40px';
            panel.style.padding = '0';
            panel.style.borderRadius = '50%';
            panel.style.overflow = 'hidden';
            panel.innerHTML = `
                <div id="expand-btn" style="
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 20px;
                    color: white;
                    background: rgba(0,0,0,0.9);
                ">🎮</div>
            `;
            const expandBtn = document.getElementById('expand-btn');
            if (expandBtn) {
                expandBtn.onclick = () => {
                    isCollapsed = false;
                    updatePanelDisplay();
                    saveCollapseState();
                    updateUI();
                };
            }
        } else {
            panel.style.width = '180px';
            panel.style.height = 'auto';
            panel.style.padding = '8px';
            panel.style.borderRadius = '8px';
            panel.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <button id="play-pause" style="background: #4CAF50; border: none; color: white; padding: 3px 10px; border-radius: 4px; cursor: pointer; font-size: 10px;">▶ PLAY</button>
                    <button id="reset-btn" style="background: #555; border: none; color: white; padding: 3px 10px; border-radius: 4px; cursor: pointer; font-size: 10px;">Reset</button>
                    <button id="collapse-btn" style="background: #888; border: none; color: white; width: 24px; border-radius: 4px; cursor: pointer; font-size: 12px;">−</button>
                </div>
                <div id="status" style="color: #0f0; font-size: 9px; margin-bottom: 3px;">● RUN</div>
                <div id="trigger-info" style="background: #222; padding: 4px; border-radius: 4px; margin-bottom: 3px;">${currentIndex+1}/${triggers.length}</div>
                <div id="action-info" style="background: #222; padding: 4px; border-radius: 4px; word-break: break-all; color: #ffd93d;">${currentAction}</div>
            `;
            
            document.getElementById('play-pause').onclick = () => {
                isRunning = !isRunning;
                const btn = document.getElementById('play-pause');
                const statusSpan = document.getElementById('status');
                if (isRunning) {
                    btn.textContent = '⏸ STOP';
                    btn.style.background = '#ff5722';
                    statusSpan.innerHTML = '● RUN';
                    statusSpan.style.color = '#0f0';
                } else {
                    btn.textContent = '▶ PLAY';
                    btn.style.background = '#4CAF50';
                    statusSpan.innerHTML = '● STOP';
                    statusSpan.style.color = '#f00';
                }
            };
            
            document.getElementById('reset-btn').onclick = () => {
                if (spamInterval) {
                    clearInterval(spamInterval);
                    spamInterval = null;
                    isSpamActive = false;
                }
                currentIndex = 0;
                seenUrls.clear();
                isProcessing = false;
                const triggerSpan = document.getElementById('trigger-info');
                const actionSpan = document.getElementById('action-info');
                if (triggerSpan) triggerSpan.innerHTML = `${currentIndex+1}/${triggers.length}`;
                currentAction = `⏳ Chờ: ${triggers[0].name}`;
                if (actionSpan) actionSpan.innerHTML = currentAction;
                saveState();
                console.log("🔄 Đã reset về con trỏ 1");
            };
            
            document.getElementById('collapse-btn').onclick = () => {
                isCollapsed = true;
                updatePanelDisplay();
                saveCollapseState();
            };
        }
    }
    
    function saveCollapseState() {
        localStorage.setItem('autoCollapsed', JSON.stringify(isCollapsed));
        if (panel) {
            localStorage.setItem('autoPanelLeft', panel.style.left);
            localStorage.setItem('autoPanelTop', panel.style.top);
        }
    }
    
    function loadCollapseState() {
        const savedCollapsed = localStorage.getItem('autoCollapsed');
        if (savedCollapsed !== null) {
            isCollapsed = JSON.parse(savedCollapsed);
        }
    }
    
    function updateUI() {
        if (!isCollapsed) {
            const triggerSpan = document.getElementById('trigger-info');
            const actionSpan = document.getElementById('action-info');
            if (triggerSpan) triggerSpan.innerHTML = `${currentIndex+1}/${triggers.length}`;
            if (actionSpan) actionSpan.innerHTML = currentAction;
        }
    }
    
    // ========== CƠ CHẾ CLICK ==========
    function clickAt(x, y, name) {
        const el = document.elementFromPoint(x, y);
        if (!el) {
            console.warn(`⚠️ Không có element tại ${name} (${x},${y})`);
            return false;
        }
        const randomX = x + (Math.random() - 0.5) * 4;
        const randomY = y + (Math.random() - 0.5) * 4;
        
        ['mousedown', 'mouseup', 'click'].forEach(type => {
            el.dispatchEvent(new MouseEvent(type, { view: window, bubbles: true, cancelable: true, clientX: randomX, clientY: randomY, button: 0 }));
        });
        console.log(`✓ Click ${name}`);
        return true;
    }
    
    function randomName() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }
    
    function closeKeyboard() {
        if (currentInputTarget) {
            currentInputTarget.blur();
            currentInputTarget = null;
        }
        document.body.click();
        console.log(`⌨️ Đã đóng keyboard`);
    }
    
    async function inputTextOnly(x, y, text, type = 'name') {
        console.log(`📝 Chuẩn bị nhập ${type}: "${text}" tại (${x},${y})`);
        
        let targetInput = null;
        const inputs = document.querySelectorAll('input, textarea');
        for (let input of inputs) {
            const rect = input.getBoundingClientRect();
            if (rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom) {
                targetInput = input;
                break;
            }
        }
        
        if (targetInput) {
            targetInput.focus();
            currentInputTarget = targetInput;
            await delay(300);
            
            targetInput.value = '';
            await delay(100);
            
            for (let i = 0; i < text.length; i++) {
                targetInput.value += text[i];
                targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                await delay(50);
            }
            
            targetInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`✅ Đã nhập "${text}" vào input field tại (${x},${y})`);
        } else {
            console.error(`❌ Không tìm thấy input tại (${x},${y})`);
            const activeInput = document.activeElement;
            if (activeInput && (activeInput.tagName === 'INPUT' || activeInput.tagName === 'TEXTAREA')) {
                activeInput.value = text;
                activeInput.dispatchEvent(new Event('input', { bubbles: true }));
                console.log(`✅ Đã nhập vào input đang focus: "${text}"`);
            } else {
                document.execCommand('insertText', false, text);
                console.log(`✅ Đã nhập bằng execCommand: "${text}"`);
            }
        }
        
        await delay(500);
        return true;
    }
    
    function delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }
    
    // ========== SPAM CLICK CHO CON TRỎ 1 ==========
    function startSpamClick(trigger) {
        if (spamInterval) {
            clearInterval(spamInterval);
        }
        isSpamActive = true;
        
        clickAt(trigger.x, trigger.y, `${trigger.name} (spam)`);
        
        spamInterval = setInterval(() => {
            if (!isRunning || !isSpamActive || isProcessing) {
                return;
            }
            const trigger2 = triggers[1];
            if (seenUrls.has(trigger2.fullUrl) || seenUrls.has(trigger2.url)) {
                console.log(`%c🛑 Phát hiện URL của ${trigger2.name}, dừng spam click!`, "color: #ff9800");
                stopSpamClick();
                processTrigger(trigger2);
                return;
            }
            clickAt(trigger.x, trigger.y, `${trigger.name} (spam)`);
        }, trigger.delay || SPAM_CLICK_DELAY);
    }
    
    function stopSpamClick() {
        if (spamInterval) {
            clearInterval(spamInterval);
            spamInterval = null;
        }
        isSpamActive = false;
        console.log("🛑 Đã dừng spam click");
    }
    
    // ========== XỬ LÝ CLICK THƯỜNG ==========
    async function handleMultiClick(trigger) {
        const maxClicks = trigger.maxClicks || DEFAULT_MAX_CLICKS;
        const clickDelay = trigger.delay || CLICK_DELAY;
        for (let i = 1; i <= maxClicks; i++) {
            if (!isRunning) break;
            currentAction = `🔴 ${trigger.name} (${i}/${maxClicks})`;
            updateUI();
            clickAt(trigger.x, trigger.y, `${trigger.name} (${i}/${maxClicks})`);
            if (i < maxClicks) await delay(clickDelay);
        }
    }
    
    // ========== XỬ LÝ TRIGGER ==========
    async function processTrigger(trigger) {
        if (!isRunning || isProcessing) return;
        
        if (trigger.isSpam) {
            console.log(`%c🎯 BẮT ĐẦU SPAM: ${trigger.name}`, "color: #ff9800; font-weight: bold");
            startSpamClick(trigger);
            return;
        }
        
        isProcessing = true;
        console.log(`%c🎯 BẮT ĐẦU: ${trigger.name} (index ${currentIndex})`, "color: #00ff9d; font-weight: bold");
        
        if (trigger.needClick && trigger.x && trigger.y) {
            await handleMultiClick(trigger);
        }
        
        if (trigger.needInput) {
            if (trigger.inputType === 'name') {
                const newName = randomName();
                currentAction = `⌨️ Đặt tên: ${newName}`;
                updateUI();
                await inputTextOnly(trigger.x, trigger.y, newName, 'tên');
            } else if (trigger.inputType === 'code') {
                currentAction = `⌨️ Nhập code: ${trigger.inputValue}`;
                updateUI();
                await inputTextOnly(trigger.x, trigger.y, trigger.inputValue, 'code');
            }
            
            closeKeyboard();
            await delay(500);
            
            if (trigger.waitAfterInput) {
                currentAction = `⏰ Đợi ${trigger.waitAfterInput/1000}s`;
                updateUI();
                await delay(trigger.waitAfterInput);
            }
        }
        
        if (trigger.fullUrl) seenUrls.add(trigger.fullUrl);
        if (trigger.url && trigger.needUrl) seenUrls.add(trigger.url);
        
        currentIndex++;
        saveState();
        isProcessing = false;
        
        currentAction = `✅ Xong: ${trigger.name}`;
        updateUI();
        await delay(1000);
        
        if (trigger.isFinal || trigger.id === 18) {
            console.log(`%c🎉 HOÀN THÀNH TOÀN BỘ! Tạo tài khoản mới...`, "color: #ff9800; font-size: 14px");
            redirectWithNewUser();
            return;
        }
        
        if (currentIndex < triggers.length) {
            currentAction = `⏳ Chờ: ${triggers[currentIndex].name}`;
            updateUI();
        } else {
            currentAction = `🎉 Hoàn thành!`;
            updateUI();
        }
        
        console.log(`%c✅ XONG: ${trigger.name} -> Chuyển sang index ${currentIndex} (${triggers[currentIndex]?.name})`, "color: #ffd93d");
    }
    
    // ========== KIỂM TRA URL ==========
    async function checkNetworkAndWait() {
        if (!pageReady) {
            await waitForPageLoad();
        }
        
        if (!isRunning) return;
        
        if (isSpamActive) {
            const trigger2 = triggers[1];
            if (trigger2 && trigger2.fullUrl) {
                const resources = performance.getEntriesByType('resource');
                const found = resources.some(r => {
                    if (trigger2.fullUrl && r.name === trigger2.fullUrl) return true;
                    if (trigger2.url && r.name.includes(trigger2.url)) return true;
                    if (trigger2.url && r.name.endsWith(trigger2.url)) return true;
                    return false;
                });
                
                if (found && !seenUrls.has(trigger2.fullUrl)) {
                    console.log(`%c🎯 PHÁT HIỆN URL: ${trigger2.url}`, "color: #00ff9d; font-weight: bold");
                    seenUrls.add(trigger2.fullUrl);
                    stopSpamClick();
                    currentIndex = 1;
                    saveState();
                    processTrigger(trigger2);
                }
            }
            return;
        }
        
        if (isProcessing) return;
        if (currentIndex >= triggers.length) return;
        
        const current = triggers[currentIndex];
        if (!current) return;
        
        if (!current.needUrl) {
            console.log(`%c🎯 KHÔNG CẦN URL: ${current.name} -> Click ngay!`, "color: #ff9800");
            processTrigger(current);
            return;
        }
        
        if (!current.url) {
            console.log(`%c🎯 KHÔNG CÓ URL: ${current.name} -> Click ngay!`, "color: #ff9800");
            processTrigger(current);
            return;
        }
        
        if (seenUrls.has(current.fullUrl) || seenUrls.has(current.url)) return;
        
        const resources = performance.getEntriesByType('resource');
        const found = resources.some(r => {
            if (current.fullUrl && r.name === current.fullUrl) return true;
            if (current.url && r.name.includes(current.url)) return true;
            if (current.url && r.name.endsWith(current.url)) return true;
            return false;
        });
        
        if (found) {
            console.log(`%c🎯 PHÁT HIỆN URL: ${current.url}`, "color: #00ff9d; font-weight: bold");
            processTrigger(current);
        }
    }
    
    function saveState() {
        localStorage.setItem('autoIndex', currentIndex);
        localStorage.setItem('autoSeen', JSON.stringify([...seenUrls]));
        saveCollapseState();
    }
    
    function loadState() {
        const savedIndex = localStorage.getItem('autoIndex');
        if (savedIndex) {
            currentIndex = parseInt(savedIndex);
            if (currentIndex >= triggers.length) currentIndex = 0;
        }
        const savedSeen = localStorage.getItem('autoSeen');
        if (savedSeen) seenUrls = new Set(JSON.parse(savedSeen));
        
        loadCollapseState();
        
        console.log(`📂 Load state: index=${currentIndex} (${triggers[currentIndex]?.name}), collapsed=${isCollapsed}`);
    }
    
    async function init() {
        await waitForPageLoad();
        loadState();
        createPanel();
        
        if (currentIndex < triggers.length) {
            currentAction = `⏳ Chờ: ${triggers[currentIndex].name}`;
        } else {
            currentAction = `🎉 Hoàn thành!`;
        }
        updateUI();
        
        if (currentIndex === 0 && isRunning) {
            processTrigger(triggers[0]);
        }
        
        setInterval(checkNetworkAndWait, 500);
        
        try {
            const observer = new PerformanceObserver(() => checkNetworkAndWait());
            observer.observe({ entryTypes: ['resource'] });
            console.log("✅ PerformanceObserver đã kích hoạt");
        } catch(e) {}
        
        console.log(`%c✅ Script khởi động!`, "color: #00ff9d; font-size: 14px");
        console.log(`📌 Trạng thái: ${isRunning ? 'RUN' : 'STOP'}`);
        console.log(`📌 Đang chờ index ${currentIndex}: ${triggers[currentIndex]?.name || 'Hoàn thành'}`);
        console.log(`📌 Con trỏ 1: SPAM CLICK (0.5s/lần) đến khi URL con trỏ 2 xuất hiện`);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();