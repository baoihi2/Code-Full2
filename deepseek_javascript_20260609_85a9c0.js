// ==UserScript==
// @name         Auto Click DragonBall - 5 Luồng Chạy Ngầm
// @namespace    http://tampermonkey.net/
// @version      39.0
// @description  Chạy 5 luồng auto click trong 1 tab, mỗi luồng userName riêng
// @author       AutoClicker
// @match        *://dragonballh5.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("%c🚀 KHỞI ĐỘNG 5 LUỒNG AUTO CLICK", "color: #ff9800; font-size: 16px; font-weight: bold");

    // ========== CẤU HÌNH CHUNG ==========
    const TOTAL_THREADS = 5;
    const CLICK_DELAY = 1000;
    const SPAM_CLICK_DELAY = 500;
    const DEFAULT_MAX_CLICKS = 4;
    const TRIGGER_1_MAX_CLICKS = 999;
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

    // ========== TẠO USERNAME NGẪU NHIÊN ==========
    function randomUserName(length = 10) {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // ========== LỚP QUẢN LÝ LUỒNG ==========
    class AutoClickThread {
        constructor(threadId, userName) {
            this.threadId = threadId;
            this.userName = userName;
            this.currentIndex = 0;
            this.isProcessing = false;
            this.isRunning = true;
            this.seenUrls = new Set();
            this.currentAction = "";
            this.currentInputTarget = null;
            this.spamInterval = null;
            this.isSpamActive = false;
            this.panel = null;
            this.isCollapsed = false;
            
            console.log(`%c🔧 Luồng ${threadId + 1} khởi tạo - User: ${userName}`, "color: #00ff9d");
        }
        
        // Cập nhật URL cho luồng (nếu cần)
        updateUrl() {
            const currentUrl = window.location.href;
            let baseUrl = currentUrl.split('?')[0];
            const newUrl = baseUrl + `?userName=${this.userName}&threadId=${this.threadId}`;
            
            // Chỉ cập nhật URL nếu khác
            if (window.location.href !== newUrl) {
                history.pushState({}, '', newUrl);
            }
        }
        
        // Click tại tọa độ
        clickAt(x, y, name) {
            const el = document.elementFromPoint(x, y);
            if (!el) {
                console.warn(`⚠️ [Luồng ${this.threadId + 1}] Không có element tại ${name}`);
                return false;
            }
            const randomX = x + (Math.random() - 0.5) * 4;
            const randomY = y + (Math.random() - 0.5) * 4;
            
            ['mousedown', 'mouseup', 'click'].forEach(type => {
                el.dispatchEvent(new MouseEvent(type, { view: window, bubbles: true, cancelable: true, clientX: randomX, clientY: randomY, button: 0 }));
            });
            console.log(`✓ [Luồng ${this.threadId + 1}] Click ${name}`);
            return true;
        }
        
        // Random tên 6 ký tự
        randomName() {
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)];
            return result;
        }
        
        // Đóng keyboard
        closeKeyboard() {
            if (this.currentInputTarget) {
                this.currentInputTarget.blur();
                this.currentInputTarget = null;
            }
            document.body.click();
        }
        
        // Nhập text
        async inputTextOnly(x, y, text, type = 'name') {
            console.log(`📝 [Luồng ${this.threadId + 1}] Nhập ${type}: "${text}"`);
            
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
                this.currentInputTarget = targetInput;
                await this.delay(300);
                
                targetInput.value = '';
                await this.delay(100);
                
                for (let i = 0; i < text.length; i++) {
                    targetInput.value += text[i];
                    targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                    await this.delay(50);
                }
                
                targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`✅ [Luồng ${this.threadId + 1}] Đã nhập "${text}"`);
            } else {
                const activeInput = document.activeElement;
                if (activeInput && (activeInput.tagName === 'INPUT' || activeInput.tagName === 'TEXTAREA')) {
                    activeInput.value = text;
                    activeInput.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    document.execCommand('insertText', false, text);
                }
            }
            
            await this.delay(500);
            return true;
        }
        
        delay(ms) {
            return new Promise(r => setTimeout(r, ms));
        }
        
        // Spam click
        startSpamClick(trigger) {
            if (this.spamInterval) clearInterval(this.spamInterval);
            this.isSpamActive = true;
            
            this.clickAt(trigger.x, trigger.y, `${trigger.name} (spam)`);
            
            this.spamInterval = setInterval(() => {
                if (!this.isRunning || !this.isSpamActive || this.isProcessing) return;
                
                const trigger2 = triggers[1];
                if (this.seenUrls.has(trigger2.fullUrl) || this.seenUrls.has(trigger2.url)) {
                    console.log(`%c🛑 [Luồng ${this.threadId + 1}] Dừng spam!`, "color: #ff9800");
                    this.stopSpamClick();
                    this.processTrigger(trigger2);
                    return;
                }
                this.clickAt(trigger.x, trigger.y, `${trigger.name} (spam)`);
            }, trigger.delay || SPAM_CLICK_DELAY);
        }
        
        stopSpamClick() {
            if (this.spamInterval) {
                clearInterval(this.spamInterval);
                this.spamInterval = null;
            }
            this.isSpamActive = false;
        }
        
        // Xử lý multi click
        async handleMultiClick(trigger) {
            const maxClicks = trigger.maxClicks || DEFAULT_MAX_CLICKS;
            const clickDelay = trigger.delay || CLICK_DELAY;
            for (let i = 1; i <= maxClicks; i++) {
                if (!this.isRunning) break;
                this.clickAt(trigger.x, trigger.y, `${trigger.name} (${i}/${maxClicks})`);
                if (i < maxClicks) await this.delay(clickDelay);
            }
        }
        
        // Xử lý trigger
        async processTrigger(trigger) {
            if (!this.isRunning || this.isProcessing) return;
            
            if (trigger.isSpam) {
                console.log(`%c🎯 [Luồng ${this.threadId + 1}] SPAM: ${trigger.name}`, "color: #ff9800");
                this.startSpamClick(trigger);
                return;
            }
            
            this.isProcessing = true;
            console.log(`%c🎯 [Luồng ${this.threadId + 1}] BẮT ĐẦU: ${trigger.name}`, "color: #00ff9d");
            
            if (trigger.needClick && trigger.x && trigger.y) {
                await this.handleMultiClick(trigger);
            }
            
            if (trigger.needInput) {
                if (trigger.inputType === 'name') {
                    const newName = this.randomName();
                    await this.inputTextOnly(trigger.x, trigger.y, newName, 'tên');
                } else if (trigger.inputType === 'code') {
                    await this.inputTextOnly(trigger.x, trigger.y, trigger.inputValue, 'code');
                }
                
                this.closeKeyboard();
                await this.delay(500);
                
                if (trigger.waitAfterInput) {
                    await this.delay(trigger.waitAfterInput);
                }
            }
            
            if (trigger.fullUrl) this.seenUrls.add(trigger.fullUrl);
            if (trigger.url && trigger.needUrl) this.seenUrls.add(trigger.url);
            
            this.currentIndex++;
            this.isProcessing = false;
            
            if (trigger.isFinal || trigger.id === 18) {
                console.log(`%c🎉 [Luồng ${this.threadId + 1}] HOÀN THÀNH! Tạo userName mới...`, "color: #ff9800");
                this.userName = randomUserName(10);
                this.currentIndex = 0;
                this.seenUrls.clear();
                this.updateUrl();
                return;
            }
            
            console.log(`%c✅ [Luồng ${this.threadId + 1}] XONG: ${trigger.name} -> Chuyển sang index ${this.currentIndex+1}`, "color: #ffd93d");
        }
        
        // Kiểm tra URL
        async checkNetwork() {
            if (!this.isRunning || this.isProcessing) return;
            if (this.currentIndex >= triggers.length) return;
            
            const current = triggers[this.currentIndex];
            if (!current) return;
            
            if (!current.needUrl) {
                this.processTrigger(current);
                return;
            }
            
            if (!current.url) {
                this.processTrigger(current);
                return;
            }
            
            if (this.seenUrls.has(current.fullUrl) || this.seenUrls.has(current.url)) return;
            
            const resources = performance.getEntriesByType('resource');
            const found = resources.some(r => {
                if (current.fullUrl && r.name === current.fullUrl) return true;
                if (current.url && r.name.includes(current.url)) return true;
                return false;
            });
            
            if (found) {
                console.log(`%c🎯 [Luồng ${this.threadId + 1}] PHÁT HIỆN URL: ${current.url}`, "color: #00ff9d");
                this.processTrigger(current);
            }
        }
        
        start() {
            this.updateUrl();
            setInterval(() => this.checkNetwork(), 500);
            
            // Bắt đầu với trigger 1 nếu đang ở index 0
            if (this.currentIndex === 0 && this.isRunning) {
                setTimeout(() => this.processTrigger(triggers[0]), 1000);
            }
        }
    }
    
    // ========== TẠO PANEL ĐIỀU KHIỂN CHUNG ==========
    let controlPanel = null;
    let threads = [];
    let masterRunning = true;
    let isMenuCollapsed = false;
    
    function createControlPanel() {
        if (controlPanel) controlPanel.remove();
        
        controlPanel = document.createElement('div');
        controlPanel.id = 'master-control';
        controlPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 1000000;
            background: rgba(0,0,0,0.9);
            backdrop-filter: blur(10px);
            padding: 10px 15px;
            border-radius: 12px;
            font-family: monospace;
            font-size: 11px;
            color: white;
            border: 1px solid #ff9800;
            pointer-events: auto;
            cursor: move;
            min-width: 220px;
            transition: all 0.3s ease;
        `;
        
        updatePanelDisplay();
        document.body.appendChild(controlPanel);
        
        // Kéo thả
        let drag = false, startX, startY;
        controlPanel.addEventListener('mousedown', (e) => {
            if (e.target.closest('button')) return;
            drag = true;
            startX = e.clientX - controlPanel.offsetLeft;
            startY = e.clientY - controlPanel.offsetTop;
            controlPanel.style.cursor = 'grabbing';
        });
        document.addEventListener('mousemove', (e) => {
            if (!drag) return;
            let left = e.clientX - startX;
            let top = e.clientY - startY;
            left = Math.max(0, Math.min(left, window.innerWidth - controlPanel.offsetWidth));
            top = Math.max(0, Math.min(top, window.innerHeight - controlPanel.offsetHeight));
            controlPanel.style.left = left + 'px';
            controlPanel.style.top = top + 'px';
            controlPanel.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => { drag = false; controlPanel.style.cursor = 'move'; });
    }
    
    function updatePanelDisplay() {
        if (!controlPanel) return;
        
        if (isMenuCollapsed) {
            controlPanel.style.width = '40px';
            controlPanel.style.height = '40px';
            controlPanel.style.padding = '0';
            controlPanel.style.borderRadius = '50%';
            controlPanel.innerHTML = `
                <div id="expand-btn" style="
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 20px;
                    color: #ff9800;
                ">🎮</div>
            `;
            const expandBtn = document.getElementById('expand-btn');
            if (expandBtn) {
                expandBtn.onclick = () => {
                    isMenuCollapsed = false;
                    updatePanelDisplay();
                };
            }
        } else {
            controlPanel.style.width = '240px';
            controlPanel.style.height = 'auto';
            controlPanel.style.padding = '10px 15px';
            controlPanel.style.borderRadius = '12px';
            controlPanel.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-weight: bold; color: #ff9800;">🎮 5 LUỒNG CLICK</div>
                    <button id="collapse-btn" style="
                        background: #555;
                        border: none;
                        color: white;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 12px;
                    ">−</button>
                </div>
                <div style="font-size: 10px; margin-bottom: 8px;">
                    ${threads.map((t, i) => `
                        <div style="margin: 3px 0; color: ${t.isRunning ? '#69f0ae' : '#ff6b6b'}">
                            🔹 Luồng ${i+1}: ${t.userName} - ${t.isRunning ? '● RUN' : '● STOP'}
                        </div>
                    `).join('')}
                </div>
                <div style="display: flex; gap: 8px; margin-top: 5px;">
                    <button id="master-play" style="background: ${masterRunning ? '#ff5722' : '#4CAF50'}; border: none; color: white; padding: 4px 10px; border-radius: 4px; cursor: pointer;">${masterRunning ? '⏸ DỪNG TẤT' : '▶ PLAY TẤT'}</button>
                    <button id="master-reset" style="background: #2196F3; border: none; color: white; padding: 4px 10px; border-radius: 4px; cursor: pointer;">🔄 RESET TẤT</button>
                </div>
            `;
            
            document.getElementById('collapse-btn').onclick = () => {
                isMenuCollapsed = true;
                updatePanelDisplay();
            };
            
            document.getElementById('master-play').onclick = () => {
                masterRunning = !masterRunning;
                threads.forEach(t => t.isRunning = masterRunning);
                updatePanelDisplay();
                console.log(masterRunning ? "▶ BẬT TẤT CẢ LUỒNG" : "⏸ DỪNG TẤT CẢ LUỒNG");
            };
            
            document.getElementById('master-reset').onclick = () => {
                threads.forEach(t => {
                    t.currentIndex = 0;
                    t.seenUrls.clear();
                    t.isProcessing = false;
                    t.stopSpamClick();
                });
                console.log("🔄 Đã reset tất cả luồng về con trỏ 1");
            };
        }
    }
    
    // ========== KHỞI TẠO ==========
    function init() {
        // Tạo 5 luồng với userName riêng
        for (let i = 0; i < TOTAL_THREADS; i++) {
            const userName = randomUserName(10);
            const thread = new AutoClickThread(i, userName);
            threads.push(thread);
        }
        
        // Tạo panel điều khiển
        createControlPanel();
        
        // Khởi động các luồng
        threads.forEach(thread => {
            setTimeout(() => thread.start(), thread.threadId * 500);
        });
        
        console.log(`%c✅ KHỞI ĐỘNG ${TOTAL_THREADS} LUỒNG THÀNH CÔNG!`, "color: #00ff9d; font-size: 14px");
        console.log(`📌 Mỗi luồng có userName riêng và chạy độc lập`);
        console.log(`📌 Bảng điều khiển ở góc trái dưới, có thể kéo thả`);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();