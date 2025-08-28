// GOLD Boolean Builder - Clean Version
// Extracted from original script.js - Builder functionality only

// Essential data storage for Builder
let savedSearches = [];
let tempKeywords = [];
let roles = [];
let currentRole = null;
let recentlyUsedSearches = [];
let currentRoleFilters = {
    client: '',
    id: '',
    title: ''
};

// Local Authentication System
let currentUser = {
    uid: 'local-user-' + Date.now(),
    name: 'Local User',
    email: 'local@boolean.local',
    isGuest: false
};

let isAuthenticated = true; // Always authenticated in local mode

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== GOLD BOOLEAN BUILDER v1 ===');
    console.log('DOM loaded, Builder system ready...');
    
    // Setup Builder functionality
    setupBuilderSection();
    setupTempKeywordPool();
    setupSavedSearchesFilter();
});

// Boolean Builder Section
function setupBuilderSection() {
    console.log('Setting up Builder section...');
    
    // Setup role dashboard
    const addRoleBtn = document.getElementById('addNewRoleBtn');
    const backBtn = document.getElementById('backToDashboardBtn');
    const roleSearchInput = document.getElementById('roleSearch');
    const filterRolesBtn = document.getElementById('filterRolesBtn');
    const demoModeBtn = document.getElementById('demoModeBtn');
    
    if (addRoleBtn) addRoleBtn.addEventListener('click', addNewRole);
    if (backBtn) backBtn.addEventListener('click', backToDashboard);
    if (roleSearchInput) roleSearchInput.addEventListener('input', filterRoles);
    if (filterRolesBtn) filterRolesBtn.addEventListener('click', openRoleFilterModal);
    if (demoModeBtn) demoModeBtn.addEventListener('click', enterDemoMode);
    
    // Setup operator buttons
    const operatorButtons = document.querySelectorAll('.boolean-operator-btn');
    operatorButtons.forEach(button => {
        button.addEventListener('click', function() {
            insertAtCursor(this.getAttribute('data-value'));
        });
    });
    
    // Setup auto operator button
    setupAutoOperator();
    
    // Setup copy and clear buttons
    const copyBtn = document.getElementById('copyBooleanString');
    const clearBtn = document.getElementById('clearBooleanString');
    
    copyBtn.addEventListener('click', copyBooleanString);
    clearBtn.addEventListener('click', clearBooleanString);
    
    // Setup textarea validation
    const textarea = document.getElementById('booleanString');
    if (textarea) {
        textarea.addEventListener('input', validateBooleanSyntax);
        textarea.addEventListener('keyup', validateBooleanSyntax);
    }
    
    // Setup interaction mode toggle
    setupInteractionModeToggle();
    
    // Render roles dashboard
    renderRolesDashboard();
}

// Auto Operator functionality
function setupAutoOperator() {
    const autoAndBtn = document.getElementById('autoAndBtn');
    const autoOrBtn = document.getElementById('autoOrBtn');
    
    if (autoAndBtn && autoOrBtn) {
        // Load saved state
        const savedAutoOperator = localStorage.getItem('autoOperator') || 'AND';
        const wasActive = localStorage.getItem('autoOperatorActive') === 'true';
        
        // Set up both buttons
        setupAutoButton(autoAndBtn, 'AND', savedAutoOperator === 'AND' && wasActive);
        setupAutoButton(autoOrBtn, 'OR', savedAutoOperator === 'OR' && wasActive);
    }
}

function setupAutoButton(button, operator, isActive) {
    button.setAttribute('data-operator', operator);
    
    if (isActive) {
        button.classList.add('active');
    }
    
    button.addEventListener('click', function() {
        toggleAutoOperator(operator);
    });
    
    button.title = `Click to toggle Auto ${operator} mode`;
}

function toggleAutoOperator(operator) {
    const autoAndBtn = document.getElementById('autoAndBtn');
    const autoOrBtn = document.getElementById('autoOrBtn');
    
    // Check if the clicked button is already active
    const clickedButton = operator === 'AND' ? autoAndBtn : autoOrBtn;
    const otherButton = operator === 'AND' ? autoOrBtn : autoAndBtn;
    const isActive = clickedButton.classList.contains('active');
    
    if (isActive) {
        // Turn off auto mode
        clickedButton.classList.remove('active');
        localStorage.setItem('autoOperatorActive', 'false');
    } else {
        // Turn on auto mode and turn off the other button
        autoAndBtn.classList.remove('active');
        autoOrBtn.classList.remove('active');
        clickedButton.classList.add('active');
        localStorage.setItem('autoOperatorActive', 'true');
        localStorage.setItem('autoOperator', operator);
    }
}

function insertAtCursor(text) {
    const textarea = document.getElementById('booleanString');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    
    // Check if auto operator should be inserted
    const autoAndBtn = document.getElementById('autoAndBtn');
    const autoOrBtn = document.getElementById('autoOrBtn');
    const activeButton = autoAndBtn.classList.contains('active') ? autoAndBtn : 
                        autoOrBtn.classList.contains('active') ? autoOrBtn : null;
    const shouldAutoInsert = activeButton && activeButton.classList.contains('active');
    
    let textToInsert = text;
    const operators = ['(', ')', '"', ' AND ', ' OR ', ' NOT ', ' '];
    if (!operators.includes(text) && !text.startsWith('"') && !text.endsWith('"')) {
        textToInsert = `"${text}"`;
    }
    
    // Auto-insert operator if enabled and there's existing content
    if (shouldAutoInsert && value.trim() !== '' && !operators.includes(text)) {
        const currentOperator = activeButton.getAttribute('data-operator');
        const operatorToInsert = ` ${currentOperator} `;
        
        // Check if the cursor is at the end or if we need to add operator
        const cursorAtEnd = start === value.length;
        const lastChar = value.charAt(start - 1);
        const needsOperator = lastChar !== ' ' && lastChar !== '(' && lastChar !== '"';
        
        if (cursorAtEnd && needsOperator) {
            textToInsert = operatorToInsert + textToInsert;
        } else if (!cursorAtEnd && needsOperator) {
            textToInsert = operatorToInsert + textToInsert;
        }
    }
    
    textarea.value = value.substring(0, start) + textToInsert + value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
    textarea.focus();
    
    // Validate syntax after insertion
    validateBooleanSyntax();
}

// Interaction Mode Management
function setupInteractionModeToggle() {
    const clickModeBtn = document.getElementById('clickModeBtn');
    const dragModeBtn = document.getElementById('dragModeBtn');
    
    if (clickModeBtn && dragModeBtn) {
        clickModeBtn.addEventListener('click', () => switchToMode('click'));
        dragModeBtn.addEventListener('click', () => switchToMode('drag'));
    }
}

function switchToMode(mode) {
    const clickModeBtn = document.getElementById('clickModeBtn');
    const dragModeBtn = document.getElementById('dragModeBtn');
    const booleanBuilder = document.getElementById('booleanBuilder');
    
    // Update button states
    clickModeBtn.classList.toggle('active', mode === 'click');
    dragModeBtn.classList.toggle('active', mode === 'drag');
    
    // Update builder class
    booleanBuilder.classList.toggle('drag-mode', mode === 'drag');
    
    // Setup drag & drop if needed
    if (mode === 'drag') {
        setupDragAndDrop();
    } else {
        removeDragAndDrop();
    }
    
    // Save user preference
    localStorage.setItem('interactionMode', mode);
}

function setupDragAndDrop() {
    const draggableElements = document.querySelectorAll('.boolean-operator-btn, .keyword-btn, .recent-search-text');
    const dropZone = document.getElementById('booleanString');
    
    // Create drag indicator
    let dragIndicator = document.getElementById('dragIndicator');
    if (!dragIndicator) {
        dragIndicator = document.createElement('div');
        dragIndicator.id = 'dragIndicator';
        dragIndicator.className = 'drag-indicator';
        document.body.appendChild(dragIndicator);
    }
    
    draggableElements.forEach(element => {
        element.setAttribute('draggable', 'true');
        
        element.addEventListener('dragstart', (e) => {
            const text = element.getAttribute('data-value') || element.textContent.trim();
            e.dataTransfer.setData('text/plain', text);
            e.dataTransfer.effectAllowed = 'copy';
            
            // Show drag indicator
            dragIndicator.textContent = `Dragging: ${text}`;
            dragIndicator.classList.add('visible');
        });
        
        element.addEventListener('dragend', () => {
            dragIndicator.classList.remove('visible');
        });
    });
    
    // Setup drop zone
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            const text = e.dataTransfer.getData('text/plain');
            if (text) {
                insertAtCursor(text);
            }
        });
    }
    
    // Update drag indicator position
    document.addEventListener('dragover', (e) => {
        if (dragIndicator.classList.contains('visible')) {
            dragIndicator.style.left = (e.clientX + 10) + 'px';
            dragIndicator.style.top = (e.clientY + 10) + 'px';
        }
    });
}

function removeDragAndDrop() {
    const draggableElements = document.querySelectorAll('.boolean-operator-btn, .keyword-btn, .recent-search-text');
    const dropZone = document.getElementById('booleanString');
    
    draggableElements.forEach(element => {
        element.removeAttribute('draggable');
        element.removeEventListener('dragstart', null);
        element.removeEventListener('dragend', null);
    });
    
    if (dropZone) {
        dropZone.removeEventListener('dragover', null);
        dropZone.removeEventListener('dragleave', null);
        dropZone.removeEventListener('drop', null);
        dropZone.classList.remove('drag-over');
    }
    
    // Remove drag indicator
    const dragIndicator = document.getElementById('dragIndicator');
    if (dragIndicator) {
        dragIndicator.remove();
    }
}

// Role Management Functions
function addNewRole() {
    // Clear previous values
    document.getElementById('newRoleTitle').value = '';
    document.getElementById('newRoleId').value = '';
    document.getElementById('newRoleClient').value = '';
    
    // Show the modal
    document.getElementById('newRoleModal').style.display = 'block';
}

function closeNewRoleModal() {
    document.getElementById('newRoleModal').style.display = 'none';
}

async function createNewRole() {
    const title = document.getElementById('newRoleTitle').value.trim();
    const roleId = document.getElementById('newRoleId').value.trim();
    const client = document.getElementById('newRoleClient').value;
    
    if (!title) {
        await customAlert('Missing Role Title', 'Please enter a role title.');
        return;
    }
    
    // Create role name from title and ID if provided
    let roleName = title;
    if (roleId) {
        roleName = `${title} - ${roleId}`;
    }
    
    const newRole = {
        id: Date.now().toString(),
        name: roleName,
        title: title,
        roleId: roleId,
        client: client,
        booleanString: '',
        recentlyUsedSearches: [],
        selectedKeywords: [],
        createdAt: new Date().toISOString()
    };
    
    roles.push(newRole);
    saveData();
    renderRolesDashboard();
    closeNewRoleModal();
}

async function createNewRoleAndGoToBuilder() {
    const title = document.getElementById('newRoleTitle').value.trim();
    const roleId = document.getElementById('newRoleId').value.trim();
    const client = document.getElementById('newRoleClient').value;
    
    if (!title) {
        await customAlert('Missing Role Title', 'Please enter a role title.');
        return;
    }
    
    // Create role name from title and ID if provided
    let roleName = title;
    if (roleId) {
        roleName = `${title} - ${roleId}`;
    }
    
    const newRole = {
        id: Date.now().toString(),
        name: roleName,
        title: title,
        roleId: roleId,
        client: client,
        booleanString: '',
        recentlyUsedSearches: [],
        selectedKeywords: [],
        createdAt: new Date().toISOString()
    };
    
    roles.push(newRole);
    saveData();
    
    // Set as current role and open keyword selector
    currentRole = newRole;
    closeNewRoleModal();
    openKeywordSelector();
}

function openKeywordSelector() {
    document.getElementById('keywordSelectorModal').style.display = 'block';
    renderKeywordSelector();
}

function closeKeywordSelectorModal() {
    document.getElementById('keywordSelectorModal').style.display = 'none';
}

function renderRolesDashboard(searchTerm = '') {
    const container = document.getElementById('rolesContainer');
    container.innerHTML = '';
    
    // First apply search term filter
    let filteredRoles = searchTerm 
        ? roles.filter(role => 
            role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (role.booleanString && role.booleanString.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : roles;
    
    // Then apply additional filter criteria (client, ID, title)
    filteredRoles = filterRolesByCriteria(filteredRoles);
    
    if (roles.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #7f8c8d; font-style: italic; grid-column: 1 / -1;">
                <p>No roles created yet.</p>
                <p>Click "Add New Role" to get started!</p>
            </div>
        `;
        return;
    }
    
    if (filteredRoles.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #7f8c8d; font-style: italic; grid-column: 1 / -1;">
                <p>No roles found matching "${searchTerm}".</p>
                <p>Try a different search term.</p>
            </div>
        `;
        return;
    }
    
    filteredRoles.forEach(role => {
        const roleCard = document.createElement('div');
        roleCard.className = 'role-card';
        
        const lastModified = role.lastModified ? new Date(role.lastModified).toLocaleDateString() : 'Never';
        const searchCount = role.recentlyUsedSearches ? role.recentlyUsedSearches.length : 0;
        
        // Highlight search term in role name if it matches
        let displayName = role.name;
        if (searchTerm && role.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            displayName = role.name.replace(regex, '<mark>$1</mark>');
        }
        
        roleCard.innerHTML = `
            <div class="role-title">${displayName}</div>
            <div class="role-info">
                Last modified: ${lastModified}<br>
                Recent searches: ${searchCount}
            </div>
            <div class="role-actions">
                <button class="role-action-btn open-role-btn" onclick="openRole('${role.id}')">Open</button>
                <button class="role-action-btn rename-role-btn" onclick="renameRole('${role.id}')">Rename</button>
                <button class="role-action-btn delete-role-btn" onclick="deleteRole('${role.id}')">Delete</button>
            </div>
        `;
        
        container.appendChild(roleCard);
    });
}

function filterRoles() {
    const searchTerm = document.getElementById('roleSearch').value.trim();
    renderRolesDashboard(searchTerm);
}

function openRole(roleId) {
    const role = roles.find(r => r.id === roleId);
    if (role) {
        currentRole = role;
        
        // Switch to boolean builder view
        document.getElementById('roleDashboard').style.display = 'none';
        document.getElementById('booleanBuilder').style.display = 'block';
        
        // Update title
        document.getElementById('currentRoleTitle').textContent = `${role.name}`;
        
        // Load role-specific data
        document.getElementById('booleanString').value = role.booleanString || '';
        recentlyUsedSearches = role.recentlyUsedSearches || [];
        savedSearches = role.savedSearches || [];
        
        // Render role-specific content
        renderKeywordsFromDirectory();
        renderRecentlyUsedSearches();
        renderSelectedBooleanSearches();
    }
}

function backToDashboard() {
    // Save current role data
    if (currentRole) {
        currentRole.booleanString = document.getElementById('booleanString').value;
        currentRole.recentlyUsedSearches = recentlyUsedSearches;
        currentRole.savedSearches = savedSearches;
        saveData();
    }
    
    // Switch back to dashboard view
    document.getElementById('booleanBuilder').style.display = 'none';
    document.getElementById('roleDashboard').style.display = 'block';
    
    // Clear current role
    currentRole = null;
    
    // Clear boolean string
    document.getElementById('booleanString').value = '';
    
    // Re-render dashboard
    renderRolesDashboard();
}

// Temp Keyword Pool functionality
function setupTempKeywordPool() {
    console.log('Setting up temp keyword pool...');
    const addBtn = document.getElementById('addTempKeywordBtn');
    const input = document.getElementById('tempKeywordInput');
    const clearBtn = document.getElementById('clearTempKeywordsBtn');
    const addAllBtn = document.getElementById('addTempToBooleanBtn');
    const tempKeywordsList = document.getElementById('tempKeywordsList');

    console.log('Found elements:', { addBtn, input, clearBtn, addAllBtn, tempKeywordsList });

    // Check if all required elements exist
    if (!addBtn || !input || !clearBtn || !addAllBtn || !tempKeywordsList) {
        console.log('Some elements not found, retrying in 100ms...');
        setTimeout(setupTempKeywordPool, 100);
        return;
    }

    // Remove existing event listeners to prevent duplicates
    const newAddBtn = addBtn.cloneNode(true);
    const newInput = input.cloneNode(true);
    const newClearBtn = clearBtn.cloneNode(true);
    const newAddAllBtn = addAllBtn.cloneNode(true);
    const newTempKeywordsList = tempKeywordsList.cloneNode(true);
    
    addBtn.parentNode.replaceChild(newAddBtn, addBtn);
    input.parentNode.replaceChild(newInput, input);
    clearBtn.parentNode.replaceChild(newClearBtn, clearBtn);
    addAllBtn.parentNode.replaceChild(newAddAllBtn, addAllBtn);
    tempKeywordsList.parentNode.replaceChild(newTempKeywordsList, tempKeywordsList);

    // Add keyword button event
    console.log('Adding click event to add button');
    newAddBtn.addEventListener('click', addTempKeyword);

    // Enter key in input field
    console.log('Adding keypress event to input');
    newInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            console.log('Enter key pressed');
            addTempKeyword();
        }
    });

    // Clear all button
    console.log('Adding click event to clear button');
    newClearBtn.addEventListener('click', clearTempKeywords);

    // Add all to boolean button
    console.log('Adding click event to add all button');
    newAddAllBtn.addEventListener('click', function() {
        console.log('Add all button clicked!');
        addTempToBoolean();
    });

    // Event delegation for temp keywords list
    console.log('Adding click event to temp keywords list');
    newTempKeywordsList.addEventListener('click', function(e) {
        const target = e.target;
        
        // Handle keyword click (add to boolean search)
        if (target.classList.contains('temp-keyword-text')) {
            const keyword = target.textContent;
            console.log('Temp keyword clicked:', keyword);
            // Use insertAtCursor like the keyword selector does
            insertAtCursor(keyword);
        }
        
        // Handle remove button click
        if (target.classList.contains('remove-temp-keyword-btn')) {
            const keywordItem = target.closest('.temp-keyword-item');
            if (keywordItem) {
                const keyword = keywordItem.querySelector('.temp-keyword-text').textContent;
                removeTempKeyword(keyword);
            }
        }
    });

    renderTempKeywords();
}

function addTempKeyword() {
    console.log('addTempKeyword called');
    const input = document.getElementById('tempKeywordInput');
    if (!input) {
        console.log('Input field not found in addTempKeyword');
        return;
    }

    const keyword = input.value.trim();
    console.log('Input value:', keyword);
    if (keyword) {
        // Add quotes if not already present
        const quotedKeyword = keyword.startsWith('"') && keyword.endsWith('"') ? keyword : `"${keyword}"`;
        console.log('Quoted keyword:', quotedKeyword);
        
        if (!tempKeywords.includes(quotedKeyword)) {
            console.log('Adding keyword to tempKeywords array');
            tempKeywords.push(quotedKeyword);
            console.log('Current tempKeywords:', tempKeywords);
            
            // Clear input
            input.value = '';
            
            // Re-render the list
            renderTempKeywords();
            
            // Save to localStorage
            saveData();
        } else {
            console.log('Keyword already exists');
        }
    }
}

function removeTempKeyword(keyword) {
    console.log('removeTempKeyword called with:', keyword);
    const index = tempKeywords.indexOf(keyword);
    if (index > -1) {
        tempKeywords.splice(index, 1);
        console.log('Keyword removed, current tempKeywords:', tempKeywords);
        renderTempKeywords();
        saveData();
    }
}

function clearTempKeywords() {
    console.log('clearTempKeywords called');
    tempKeywords = [];
    renderTempKeywords();
    saveData();
}

function addTempToBoolean() {
    console.log('addTempToBoolean called');
    if (tempKeywords.length === 0) {
        console.log('No temp keywords to add');
        return;
    }
    
    const textarea = document.getElementById('booleanString');
    const currentValue = textarea.value;
    
    // Add all temp keywords to the boolean string
    const keywordsToAdd = tempKeywords.join(' OR ');
    
    if (currentValue.trim() === '') {
        textarea.value = keywordsToAdd;
    } else {
        textarea.value = currentValue + ' OR ' + keywordsToAdd;
    }
    
    console.log('Added temp keywords to boolean string');
    validateBooleanSyntax();
}

function renderTempKeywords() {
    console.log('renderTempKeywords called');
    const container = document.getElementById('tempKeywordsList');
    if (!container) {
        console.log('tempKeywordsList container not found');
        return;
    }
    
    container.innerHTML = '';
    
    if (tempKeywords.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d; font-style: italic;">No temporary keywords added yet.</p>';
        return;
    }
    
    tempKeywords.forEach(keyword => {
        const keywordItem = document.createElement('div');
        keywordItem.className = 'temp-keyword-item';
        
        const keywordText = document.createElement('span');
        keywordText.className = 'temp-keyword-text';
        keywordText.textContent = keyword;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-temp-keyword-btn';
        removeBtn.textContent = '×';
        removeBtn.title = 'Remove keyword';
        
        keywordItem.appendChild(keywordText);
        keywordItem.appendChild(removeBtn);
        container.appendChild(keywordItem);
    });
}

// Setup saved searches filter
function setupSavedSearchesFilter() {
    const filterInput = document.getElementById('savedSearchesFilter');
    if (filterInput) {
        filterInput.addEventListener('input', filterSavedSearches);
    }
}

// Custom confirmation and alert functions
function customConfirm(title, message) {
    return new Promise((resolve) => {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('customConfirmModal').style.display = 'block';
        
        const yesBtn = document.getElementById('confirmYes');
        const noBtn = document.getElementById('confirmNo');
        
        const handleYes = () => {
            cleanup();
            resolve(true);
        };
        
        const handleNo = () => {
            cleanup();
            resolve(false);
        };
        
        const cleanup = () => {
            yesBtn.removeEventListener('click', handleYes);
            noBtn.removeEventListener('click', handleNo);
            document.getElementById('customConfirmModal').style.display = 'none';
        };
        
        yesBtn.addEventListener('click', handleYes);
        noBtn.addEventListener('click', handleNo);
    });
}

function customAlert(title, message) {
    return new Promise((resolve) => {
        document.getElementById('alertTitle').textContent = title;
        document.getElementById('alertMessage').textContent = message;
        document.getElementById('customAlertModal').style.display = 'block';
        
        const okBtn = document.getElementById('alertOk');
        
        const handleOk = () => {
            cleanup();
            resolve();
        };
        
        const cleanup = () => {
            okBtn.removeEventListener('click', handleOk);
            document.getElementById('customAlertModal').style.display = 'none';
        };
        
        okBtn.addEventListener('click', handleOk);
    });
}

// Role Filter Modal Functions
function openRoleFilterModal() {
    document.getElementById('roleFilterModal').style.display = 'block';
    // Load current filter values
    document.getElementById('filterClient').value = currentRoleFilters.client;
    document.getElementById('filterID').value = currentRoleFilters.id;
    document.getElementById('filterTitle').value = currentRoleFilters.title;
}

function closeRoleFilterModal() {
    document.getElementById('roleFilterModal').style.display = 'none';
}

function clearRoleFilters() {
    currentRoleFilters = {
        client: '',
        id: '',
        title: ''
    };
    document.getElementById('filterClient').value = '';
    document.getElementById('filterID').value = '';
    document.getElementById('filterTitle').value = '';
    renderRolesDashboard();
}

function applyRoleFilters() {
    currentRoleFilters = {
        client: document.getElementById('filterClient').value.toLowerCase(),
        id: document.getElementById('filterID').value.toLowerCase(),
        title: document.getElementById('filterTitle').value.toLowerCase()
    };
    closeRoleFilterModal();
    renderRolesDashboard();
}

function filterRolesByCriteria(roles) {
    if (!currentRoleFilters.client && !currentRoleFilters.id && !currentRoleFilters.title) {
        return roles;
    }

    return roles.filter(role => {
        const matchesClient = !currentRoleFilters.client || 
            (role.client && role.client.toLowerCase().includes(currentRoleFilters.client));
        const matchesID = !currentRoleFilters.id || 
            (role.id && role.id.toLowerCase().includes(currentRoleFilters.id));
        const matchesTitle = !currentRoleFilters.title || 
            (role.title && role.title.toLowerCase().includes(currentRoleFilters.title));
        
        return matchesClient && matchesID && matchesTitle;
    });
}

// Data persistence
function saveData() {
    // Only save data for authenticated users, not guests
    if (!currentUser || currentUser.isAnonymous) {
        console.log('Guest user - data not saved');
        return Promise.resolve();
    }
    
    // Get current user ID for user-specific storage
    const userId = currentUser.uid;
    const storageKey = `pluginData_${userId}`;
    
    const data = {
        trainingContent: [],
        recentlyUsedSearches: recentlyUsedSearches,
        savedSearches: savedSearches,
        roles: roles,
        tempKeywords: tempKeywords,
        lastSaved: new Date().toISOString(),
        userId: userId
    };
    
    try {
        localStorage.setItem(storageKey, JSON.stringify(data));
        console.log(`Data saved successfully for user ${userId} at:`, new Date().toLocaleString());
        console.log('Saved searches count:', savedSearches.length);
        console.log('Temp keywords count:', tempKeywords.length);
        updateDataStatus();
        return Promise.resolve();
    } catch (error) {
        console.error('Error saving data:', error);
        return Promise.reject(error);
    }
}

function updateDataStatus() {
    const statusElement = document.getElementById('dataStatus');
    if (statusElement) {
        statusElement.textContent = '✓ Saved';
        statusElement.style.backgroundColor = '#27ae60';
    }
}

// Backup and restore functions
function exportData() {
    const userId = currentUser ? currentUser.uid : 'guest';
    const userDisplay = currentUser ? currentUser.email : 'Guest User';
    
    const data = {
        trainingContent: [],
        recentlyUsedSearches: recentlyUsedSearches,
        savedSearches: savedSearches,
        roles: roles,
        exportedAt: new Date().toISOString(),
        exportedBy: userDisplay,
        userId: userId
    };
    
    // Only include tempKeywords for logged-in users, not guests
    if (currentUser && !currentUser.isAnonymous) {
        data.tempKeywords = tempKeywords;
    }
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `gold-boolean-backup-${userDisplay.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    customAlert('Export Success', `Backup exported successfully for ${userDisplay}!`);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    // Validate the imported data structure
                    if (importedData.roles) {
                        roles = importedData.roles || [];
                        savedSearches = importedData.savedSearches || [];
                        recentlyUsedSearches = importedData.recentlyUsedSearches || [];
                        tempKeywords = importedData.tempKeywords || [];
                        
                        // Save the imported data
                        saveData();
                        
                        // Re-render the dashboard
                        renderRolesDashboard();
                        
                        customAlert('Import Success', 'Data imported successfully!');
                    } else {
                        customAlert('Import Error', 'Invalid backup file format.');
                    }
                } catch (error) {
                    console.error('Error importing data:', error);
                    customAlert('Import Error', 'Error reading backup file.');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

// Utility functions
function clearAllDataFromMemory() {
    roles = [];
    savedSearches = [];
    recentlyUsedSearches = [];
    tempKeywords = [];
    currentRole = null;
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone!')) {
        clearAllDataFromMemory();
        
        // Clear localStorage
        const userId = currentUser ? currentUser.uid : 'guest';
        const storageKey = `pluginData_${userId}`;
        localStorage.removeItem(storageKey);
        
        // Re-render dashboard
        renderRolesDashboard();
        
        alert('All data cleared successfully!');
    }
}

// Placeholder functions for missing dependencies
function validateBooleanSyntax() {
    // Placeholder - implement validation logic
}

function copyBooleanString() {
    const textarea = document.getElementById('booleanString');
    textarea.select();
    document.execCommand('copy');
    alert('Boolean string copied to clipboard!');
}

function clearBooleanString() {
    document.getElementById('booleanString').value = '';
}

function enterDemoMode() {
    alert('Demo mode coming soon!');
}

function renameRole(roleId) {
    const role = roles.find(r => r.id === roleId);
    if (role) {
        const newName = prompt('Enter new name for role:', role.name);
        if (newName && newName.trim()) {
            role.name = newName.trim();
            saveData();
            renderRolesDashboard();
        }
    }
}

function deleteRole(roleId) {
    const role = roles.find(r => r.id === roleId);
    if (role) {
        if (confirm(`Are you sure you want to delete "${role.name}"?`)) {
            const index = roles.findIndex(r => r.id === roleId);
            roles.splice(index, 1);
            saveData();
            renderRolesDashboard();
        }
    }
}

function renderKeywordsFromDirectory() {
    // Placeholder - implement keyword rendering
}

function renderRecentlyUsedSearches() {
    // Placeholder - implement recent searches rendering
}

function renderSelectedBooleanSearches() {
    // Placeholder - implement selected searches rendering
}

function renderKeywordSelector() {
    // Placeholder - implement keyword selector rendering
}

function filterSavedSearches() {
    // Placeholder - implement saved searches filtering
}
