// ==UserScript==
// @name         Auto Click DragonBall - 5 Tabs (1 Hiện, 4 Ẩn)
// @namespace    http://tampermonkey.net/
// @version      34.0
// @description  Chạy 5 tab cùng lúc, 4 tab ẩn vẫn click, mỗi tab userName riêng
// @author       AutoClicker
// @match        *://dragonballh5.com/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @grant        window.close
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function() {
    'use strict';

    console.log("%c🚀 KHỞI ĐỘNG CHẾ ĐỘ 5 TAB", "color: #ff9800; font-size: 16px; font-weight: bold");

    // ========== CẤU HÌNH ==========
    const TOTAL_TABS = 5;
    const SCRIPT_URL = 'https://raw.githubusercontent.com/baoihi2/Code-Full2/refs/heads/main/2';
    
    // Tạo userName ngẫu nhiên cho từng tab
    function randomUserName(length = 10) {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    // Lưu danh sách tab
    let hiddenWindows = [];
    let isMenuCollapsed = false;
    let controlPanel = null;
    let isHiddenTabFlag = false;
    
    // ========== KIỂM TRA XEM CÓ PHẢI TAB ẨN KHÔNG ==========
    function isHiddenTab() {
        // Chỉ dựa vào URL parameter để xác định
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('mode') === 'hidden';
    }
    
    function getTabId() {
        const urlParams = new URLSearchParams(window.location.search);
        const tabId = urlParams.get('tabId');
        return tabId ? parseInt(tabId) : 0;
    }
    
    // ========== TẠO TAB ẨN ==========
    function createHiddenTab(userName, tabIndex) {
        const currentUrl = window.location.href;
        let baseUrl = currentUrl.split('?')[0];
        // Tạo URL với mode=hidden để đánh dấu tab ẩn
        const newUrl = baseUrl + `?userName=${userName}&tabId=${tabIndex}&mode=hidden`;
        
        console.log(`%c📑 Tạo tab ẩn ${tabIndex + 1}: ${userName}`, "color: #00ff9d");
        
        // Mở tab mới với kích thước siêu nhỏ
        const features = [
            'width=1',
            'height=1',
            'left=-1000',
            'top=-1000',
            'menubar=no',
            'toolbar=no',
            'location=no',
            'status=no',
            'resizable=no',
            'scrollbars=no'
        ].join(',');
        
        const newWindow = window.open(newUrl, `hidden_tab_${tabIndex}`, features);
        
        if (newWindow) {
            hiddenWindows.push(newWindow);
            console.log(`✅ Tab ẩn ${tabIndex + 1} đã được tạo`);
        } else {
            console.error(`❌ Không thể tạo tab ẩn ${tabIndex + 1} - vui lòng cho phép popup`);
        }
        
        return newWindow;
    }
    
    // ========== TẢI VÀ CHẠY SCRIPT CHÍNH ==========
    function loadAndRunMainScript() {
        const tabId = getTabId();
        console.log(`📥 Đang tải script chính cho tab ${tabId}...`);
        
        // Kiểm tra xem script đã được tải chưa
        if (document.getElementById('main-script-loaded')) {
            console.log(`✅ Script đã được tải trước đó cho tab ${tabId}`);
            return;
        }
        
        GM_xmlhttpRequest({
            method: 'GET',
            url: SCRIPT_URL,
            onload: function(response) {
                if (response.status === 200) {
                    console.log(`✅ Đã tải script chính cho tab ${tabId}`);
                    
                    // Đánh dấu đã tải
                    const marker = document.createElement('div');
                    marker.id = 'main-script-loaded';
                    marker.style.display = 'none';
                    document.body.appendChild(marker);
                    
                    // Thêm script vào trang
                    const script = document.createElement('script');
                    script.textContent = response.responseText;
                    document.documentElement.appendChild(script);
                    
                    console.log(`🚀 Script đã khởi chạy trên tab ${tabId}`);
                } else {
                    console.error(`❌ Lỗi tải script cho tab ${tabId}: ${response.status}`);
                }
            },
            onerror: function(err) {
                console.error(`❌ Không thể kết nối GitHub cho tab ${tabId}:`, err);
            }
        });
    }
    
    // ========== ÁP DỤNG STYLE CHO TAB ẨN ==========
    function applyHiddenTabStyle() {
        if (isHiddenTab()) {
            // Chỉ ẩn giao diện nhưng vẫn giữ kích thước để click hoạt động
            const style = document.createElement('style');
            style.textContent = `
                html, body {
                    opacity: 0 !important;
                    visibility: visible !important;
                    min-width: 100px !important;
                    min-height: 100px !important;
                }
                /* Ẩn mọi thứ nhưng vẫn giữ layout */
                * {
                    visibility: hidden !important;
                }
                /* Đảm bảo canvas và element vẫn nhận sự kiện click */
                canvas, button, input, [onclick], [role="button"] {
                    visibility: visible !important;
                    opacity: 0.01 !important;
                }
            `;
            document.head.appendChild(style);
            console.log(`🎭 Tab ẩn ${getTabId() + 1} đã được ẩn giao diện`);
        }
    }
    
    // ========== TẠO PANEL ĐIỀU KHIỂN CHO TAB CHÍNH ==========
    function createControlPanel() {
        if (controlPanel) controlPanel.remove();
        
        controlPanel = document.createElement('div');
        controlPanel.id = 'multi-tab-control';
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
            min-width: 200px;
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
            controlPanel.style.overflow = 'hidden';
            controlPanel.innerHTML = `
                <div id="expand-menu-btn" style="
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 20px;
                    color: #ff9800;
                    background: rgba(0,0,0,0.9);
                ">🎮</div>
            `;
            const expandBtn = document.getElementById('expand-menu-btn');
            if (expandBtn) {
                expandBtn.onclick = () => {
                    isMenuCollapsed = false;
                    updatePanelDisplay();
                    updateTabStatus();
                };
            }
        } else {
            controlPanel.style.width = '220px';
            controlPanel.style.height = 'auto';
            controlPanel.style.padding = '10px 15px';
            controlPanel.style.borderRadius = '12px';
            controlPanel.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-weight: bold; color: #ff9800;">🎮 5 TABS MODE</div>
                    <button id="collapse-menu-btn" style="
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
                <div id="tab-status" style="font-size: 10px; margin-bottom: 8px;">Đang khởi tạo...</div>
                <div style="display: flex; gap: 8px; margin-top: 5px;">
                    <button id="restart-tabs" style="background: #2196F3; border: none; color: white; padding: 4px 10px; border-radius: 4px; cursor: pointer;">🔄 Khởi động lại</button>
                    <button id="close-tabs" style="background: #d32f2f; border: none; color: white; padding: 4px 10px; border-radius: 4px; cursor: pointer;">✖ Đóng tab ẩn</button>
                </div>
            `;
            
            const collapseBtn = document.getElementById('collapse-menu-btn');
            if (collapseBtn) {
                collapseBtn.onclick = () => {
                    isMenuCollapsed = true;
                    updatePanelDisplay();
                };
            }
            
            const restartBtn = document.getElementById('restart-tabs');
            if (restartBtn) {
                restartBtn.onclick = () => {
                    if (confirm('Khởi động lại tất cả các tab? Các tab ẩn sẽ được đóng và mở lại.')) {
                        restartAllTabs();
                    }
                };
            }
            
            const closeBtn = document.getElementById('close-tabs');
            if (closeBtn) {
                closeBtn.onclick = () => {
                    if (confirm('Đóng tất cả các tab ẩn?')) {
                        closeAllHiddenTabs();
                    }
                };
            }
            
            updateTabStatus();
        }
    }
    
    function updateTabStatus() {
        const statusDiv = document.getElementById('tab-status');
        if (statusDiv && !isMenuCollapsed) {
            const hiddenCount = hiddenWindows.filter(w => w && !w.closed).length;
            statusDiv.innerHTML = `
                📊 Trạng thái:<br>
                🖥️ Tab chính: đang chạy<br>
                📑 Tab ẩn: ${hiddenCount}/${TOTAL_TABS - 1} đang hoạt động
            `;
        }
        
        setTimeout(updateTabStatus, 5000);
    }
    
    function closeAllHiddenTabs() {
        for (let i = 0; i < hiddenWindows.length; i++) {
            if (hiddenWindows[i] && !hiddenWindows[i].closed) {
                hiddenWindows[i].close();
            }
        }
        hiddenWindows = [];
        console.log("✅ Đã đóng tất cả tab ẩn");
        updateTabStatus();
    }
    
    function restartAllTabs() {
        closeAllHiddenTabs();
        
        setTimeout(() => {
            createAllHiddenTabs();
        }, 1000);
        
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
    
    function createAllHiddenTabs() {
        for (let i = 1; i < TOTAL_TABS; i++) {
            const userName = randomUserName(10);
            setTimeout(() => {
                createHiddenTab(userName, i);
            }, i * 500);
        }
        console.log(`📑 Đã tạo ${TOTAL_TABS - 1} tab ẩn`);
    }
    
    // ========== KHỞI TẠO ==========
    function init() {
        const tabId = getTabId();
        const isHidden = isHiddenTab();
        
        if (isHidden) {
            // Tab ẩn: áp dụng style ẩn và chạy script
            console.log(`%c📑 TAB ẨN ${tabId + 1} ĐANG CHẠY`, "color: #00ff9d; font-size: 12px");
            applyHiddenTabStyle();
            loadAndRunMainScript();
        } else {
            // Tab chính: hiển thị bình thường
            console.log(`%c🖥️ TAB CHÍNH ĐANG CHẠY`, "color: #ff9800; font-size: 12px");
            
            // Tạo panel điều khiển
            createControlPanel();
            
            // Tạo các tab ẩn
            setTimeout(() => {
                createAllHiddenTabs();
            }, 1000);
            
            // Chạy script chính cho tab hiện tại
            loadAndRunMainScript();
        }
    }
    
    // Chạy khi trang load xong
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();