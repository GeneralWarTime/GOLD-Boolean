// Data storage
let categories = {
    primary: ['Titles', 'Domain', 'Industry'],
    secondary: ['Context', 'Certifications & Clearances']
};

// Saved searches storage
let savedSearches = [];

// Temporary keywords storage (user-specific, not for guests)
let tempKeywords = [];

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0Sw8STec1LHuFN9_fxN7ni506TrD51hs",
  authDomain: "boolean-gold.firebaseapp.com",
  projectId: "boolean-gold",
  storageBucket: "boolean-gold.firebasestorage.app",
  messagingSenderId: "137254251529",
  appId: "1:137254251529:web:ced755c0e98a7bb05a5cd8",
  measurementId: "G-XR8356J2YE"
};

// Initialize Firebase
console.log('Initializing Firebase...');
firebase.initializeApp(firebaseConfig);
console.log('Firebase initialized successfully');
const analytics = firebase.analytics();
const auth = firebase.auth();
const db = firebase.firestore();
console.log('Firebase services initialized');

// Auth state management
let currentUser = null;
let isAuthenticated = false;

let categoryData = {
    'Titles': {
        'Technical': {},
        'Functional': {}
    },
    'Domain': {
        'Agile & Scrum': {
            'Technology': {},
            'Framework': {},
            'Action': {}
        },
        'AI & Machine Learning': {
            'Technology': {},
            'Framework': {},
            'Action': {}
        },
        'Architecture': {
            'Technology': {},
            'Framework': {},
            'Action': {}
        },
        'Change & Transformation': {
            'Technology': {},
            'Framework': {},
            'Action': {}
        },
        'Cyber Security': {
            'Technology': {},
            'Framework': {},
            'Action': {}
        },
        'Data & Analytics': {
            'Technology': {},
            'Framework': {},
            'Action': {}
        },
        'DevOps & Platform Engineering': {
            'Technology': {},
            'Framework': {},
            'Action': {}
        },
        'Digital': {
            'Technology': {},
            'Framework': {},
            'Action': {}
        },
        'Financial Crime': {
            'Technology': {},
            'Framework': {},
            'Action': {}
        },
        'Infrastructure & Cloud': {
            'Technology': {},
            'Framework': {},
            'Action': {}
        },
        'Payments & Banking Tech': {
            'Technology': {},
            'Framework': {},
            'Action': {}
        },
        'Product & Design': {
            'Technology': {},
            'Framework': {},
            'Action': {}
        },
        'Project Services': {
            'Technology': {},
            'Framework': {},
            'Action': {}
        },
        'Risk & Compliance': {
            'Technology': {},
            'Framework': {},
            'Action': {}
        },
        'Software Engineering': {
            'Technology': {},
            'Framework': {},
            'Action': {}
        },
        'Testing & QA': {
            'Technology': {},
            'Framework': {},
            'Action': {}
        }
    },
    'Industry': {
        'Insurance': {},
        'Bank': {},
        'Superannuation': {},
        'Financial': {}
    },
    'Context': {},
    'Certifications & Clearances': {
        'Federal Government Clearances': {},
        'Technical Certifications': {},
        'Delivery Certifications': {},
        'Product & Design Certifications': {},
        'Financial Certifications': {}
    }
};

let currentSearch = [];
let trainingContent = [];
let recentlyUsedSearches = [];
let roles = [];
let currentRole = null;
let selectedCategory = null;
let currentSubcategory = null;
let currentSubSubcategory = null;

// Modal management for Industry boolean searches
let currentIndustrySubcategory = null;

// Modal management for Context boolean searches
let currentContextSubcategory = null;

// Modal management for Certifications & Clearances boolean searches
let currentCertificationsSubcategory = null;

// DOM elements - will be initialized after DOM loads
let navButtons;
let sections;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== GOLD BOOLEAN AUTH SYSTEM v15 ===');
    console.log('DOM loaded, authentication system ready...');
    
    // Check for data isolation on page load
    const lastUserId = sessionStorage.getItem('lastUserId');
    const currentUserId = sessionStorage.getItem('currentUserId');
    
    if (lastUserId && lastUserId !== currentUserId) {
        console.log('User changed since last session, clearing all data...');
        clearAllDataFromMemory();
        // Clear all localStorage data for security
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('pluginData_')) {
                localStorage.removeItem(key);
            }
        });
    }
    
    // Update last user ID
    if (currentUserId) {
        sessionStorage.setItem('lastUserId', currentUserId);
    }
});

// Navigation functionality
function setupNavigation() {
    console.log('Setting up navigation...');
    
    // Initialize DOM elements
    navButtons = document.querySelectorAll('.nav-btn');
    sections = document.querySelectorAll('.section');
    
    console.log('navButtons found:', navButtons.length);
    console.log('sections found:', sections.length);
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            console.log('Navigation clicked:', targetSection);
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                    console.log('Activated section:', targetSection);
                    
                    // Setup Builder section components when Builder is activated
                    if (targetSection === 'builder') {
                        console.log('Builder section activated, setting up components...');
                        setupTempKeywordPool();
                        setupSavedSearchesFilter();
                    }
                }
            });
        });
    });
    console.log('Navigation setup complete');
}

// Storage Section
function setupStorageSection() {
    // Event delegation for category clicks
    document.getElementById('categoryList').addEventListener('click', function(e) {
        if (e.target.classList.contains('category-item')) {
            const category = e.target.getAttribute('data-category');
            const subcategory = e.target.getAttribute('data-subcategory');
            selectCategory(category, subcategory);
        }
    });
}

function selectCategory(category, subcategory = null, subSubcategory = null) {
    selectedCategory = { category, subcategory, subSubcategory };
    currentSubcategory = subcategory;
    renderCategoryView();
}

function renderCategoryView() {
    const titleElement = document.getElementById('currentCategoryTitle');
    const contentElement = document.getElementById('categoryContent');
    if (!selectedCategory) {
        contentElement.innerHTML = '<p style="color: #7f8c8d; font-style: italic;">Click on a category to view and manage its items.</p>';
        return;
    }
    const { category, subcategory, subSubcategory } = selectedCategory;
    if (category === 'Titles') {
        if (subcategory) {
            titleElement.textContent = `Titles - ${subcategory}`;
            renderTitlesSubcategory(contentElement, subcategory);
        } else {
            titleElement.textContent = 'Titles - Select Type';
            // Only render the buttons, no <h4> heading
            renderTitlesSubcategorySelection(contentElement);
        }
    } else if (category === 'Domain') {
        console.log('Domain category selected:', { subcategory, subSubcategory });
        if (!subcategory) {
            titleElement.textContent = 'Domain - Select Type';
            renderDomainSubcategorySelection(contentElement);
        } else if (subcategory && !subSubcategory) {
            titleElement.textContent = `Domain - ${subcategory} - Select Type`;
            renderTechnologyFrameworkActionSelection(contentElement, subcategory);
        } else if (subcategory && subSubcategory) {
            console.log('Calling renderDomainSubcategoryItems with:', subcategory, subSubcategory);
            titleElement.textContent = `Domain - ${subcategory} - ${subSubcategory}`;
            renderDomainSubcategoryItems(contentElement, subcategory, subSubcategory);
        }
    } else if (category === 'Industry') {
        if (!subcategory) {
            titleElement.textContent = 'Industry - Select Type';
            renderIndustrySubcategorySelection(contentElement);
        } else {
            titleElement.textContent = `Industry - ${subcategory}`;
            renderIndustrySubcategoryItems(contentElement, subcategory);
        }
    } else if (category === 'Context') {
        if (!subcategory) {
            titleElement.textContent = 'Context - Select Type';
            renderContextSubcategorySelection(contentElement);
        } else {
            titleElement.textContent = `Context - ${subcategory}`;
            renderContextSubcategoryItems(contentElement, subcategory);
        }
    } else if (category === 'Certifications & Clearances') {
        if (!subcategory) {
            titleElement.textContent = 'Certifications & Clearances - Select Type';
            renderCertificationsSubcategorySelection(contentElement);
        } else {
            titleElement.textContent = `Certifications & Clearances - ${subcategory}`;
            renderCertificationsSubcategoryItems(contentElement, subcategory);
        }
    } else {
        titleElement.textContent = category;
        renderRegularCategory(contentElement, category);
    }
}

function renderTitlesSubcategorySelection(contentElement) {
    contentElement.innerHTML = `
        <div class="subcategory-selection">
            <div class="subcategory-buttons">
                <button class="subcategory-btn" onclick="selectCategory('Titles', 'Technical')">Technical</button>
                <button class="subcategory-btn" onclick="selectCategory('Titles', 'Functional')">Functional</button>
            </div>
        </div>
    `;
}

function renderTitlesSubcategory(contentElement, subcategory) {
    const titles = Object.keys(categoryData['Titles'][subcategory] || {});
    
    contentElement.innerHTML = `
        <div class="category-management">
            <button class="add-boolean-search-btn" onclick="openAddBooleanSearchModal('Titles', '${subcategory}')">
                ➕ Add Boolean Search
            </button>
            <div class="search-filter">
                <input type="text" id="titleSearch" placeholder="Search boolean terms..." onkeyup="filterTitles('${subcategory}')">
            </div>
            <div class="items-list" id="titlesList">
                ${renderTitlesList(titles, subcategory)}
            </div>
        </div>
    `;
}

function renderDomainSubcategorySelection(contentElement) {
    contentElement.innerHTML = `
        <div class="subcategory-selection">
            <div class="subcategory-buttons">
                <button class="subcategory-btn" onclick="selectCategory('Domain', 'Agile & Scrum')">Agile & Scrum</button>
                <button class="subcategory-btn" onclick="selectCategory('Domain', 'AI & Machine Learning')">AI & Machine Learning</button>
                <button class="subcategory-btn" onclick="selectCategory('Domain', 'Architecture')">Architecture</button>
                <button class="subcategory-btn" onclick="selectCategory('Domain', 'Change & Transformation')">Change & Transformation</button>
                <button class="subcategory-btn" onclick="selectCategory('Domain', 'Cyber Security')">Cyber Security</button>
                <button class="subcategory-btn" onclick="selectCategory('Domain', 'Data & Analytics')">Data & Analytics</button>
                <button class="subcategory-btn" onclick="selectCategory('Domain', 'DevOps & Platform Engineering')">DevOps & Platform Engineering</button>
                <button class="subcategory-btn" onclick="selectCategory('Domain', 'Digital')">Digital</button>
                <button class="subcategory-btn" onclick="selectCategory('Domain', 'Financial Crime')">Financial Crime</button>
                <button class="subcategory-btn" onclick="selectCategory('Domain', 'Infrastructure & Cloud')">Infrastructure & Cloud</button>
                <button class="subcategory-btn" onclick="selectCategory('Domain', 'Payments & Banking Tech')">Payments & Banking Tech</button>
                <button class="subcategory-btn" onclick="selectCategory('Domain', 'Product & Design')">Product & Design</button>
                <button class="subcategory-btn" onclick="selectCategory('Domain', 'Project Services')">Project Services</button>
                <button class="subcategory-btn" onclick="selectCategory('Domain', 'Risk & Compliance')">Risk & Compliance</button>
                <button class="subcategory-btn" onclick="selectCategory('Domain', 'Software Engineering')">Software Engineering</button>
                <button class="subcategory-btn" onclick="selectCategory('Domain', 'Testing & QA')">Testing & QA</button>
            </div>
        </div>
    `;
}

function renderTechnologyFrameworkActionSelection(contentElement, subcategory) {
    contentElement.innerHTML = `
        <div class="subcategory-selection">
            <h4>Select Type:</h4>
            <div class="subcategory-buttons">
                <button class="subcategory-btn" onclick="selectCategory('Domain', '${subcategory}', 'Technology')">Technology</button>
                <button class="subcategory-btn" onclick="selectCategory('Domain', '${subcategory}', 'Framework')">Framework</button>
                <button class="subcategory-btn" onclick="selectCategory('Domain', '${subcategory}', 'Action')">Action</button>
            </div>
        </div>
    `;
}

function renderDomainSubcategoryItems(contentElement, subcategory, subSubcategory) {
    console.log('Rendering Domain subcategory items:', subcategory, subSubcategory);
    console.log('Current categoryData:', categoryData);
    console.log('Content element:', contentElement);
    
    // Initialize the data structure if it doesn't exist
    if (!categoryData['Domain'][subcategory]) {
        categoryData['Domain'][subcategory] = {};
    }
    if (!categoryData['Domain'][subcategory][subSubcategory]) {
        categoryData['Domain'][subcategory][subSubcategory] = {};
    }
    
    const items = categoryData['Domain'][subcategory][subSubcategory] || {};
    console.log('Items for this subcategory:', items);
    
    const htmlContent = `
        <div class="category-management">
            <button class="add-boolean-search-btn" onclick="openAddBooleanSearchModal('Domain', '${subcategory}', '${subSubcategory}')">
                ➕ Add Boolean Search
            </button>
            <div class="search-filter">
                <input type="text" id="itemSearch" placeholder="Search boolean terms..." onkeyup="filterDomainItems('${subcategory}', '${subSubcategory}')">
            </div>
            <div class="items-list" id="itemsList">
                ${renderDomainItemsList(items, subcategory, subSubcategory)}
            </div>
        </div>
    `;
    
    console.log('Generated HTML:', htmlContent);
    contentElement.innerHTML = htmlContent;
    console.log('Content element after setting innerHTML:', contentElement.innerHTML);
}

function renderDomainItemsList(items, subcategory, subSubcategory) {
    if (Object.keys(items).length === 0) {
        return '<p style="color: #7f8c8d; font-style: italic;">No boolean searches added yet.</p>';
    }
    
    return Object.keys(items).map((title, index) => {
        const booleanTerms = items[title] || [];
        const termsDisplay = booleanTerms.length > 0 
            ? booleanTerms.map(term => `<span class="boolean-term-chip">"${term}"</span>`).join(' ')
            : '<span style="color: #7f8c8d; font-style: italic;">No terms</span>';
        
        return `
            <div class="item-row">
                <div class="item-content">
                    <div class="item-title">${title}</div>
                    <div class="item-terms">${termsDisplay}</div>
                </div>
                <div class="item-actions">
                    <button class="boolean-options-btn" onclick="openDomainDetailsModal('${subcategory}', '${subSubcategory}', '${title}')">Boolean Options</button>
                    <button class="edit-btn" onclick="editDomainTitle('${subcategory}', '${subSubcategory}', '${title}')">Edit</button>
                    <button class="delete-btn" onclick="deleteDomainTitle('${subcategory}', '${subSubcategory}', '${title}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function addDomainItem(subcategory, subSubcategory) {
    const input = document.getElementById('newItem');
    const item = input.value.trim();
    
    if (item) {
        // Initialize the data structure if it doesn't exist
        if (!categoryData['Domain'][subcategory]) {
            categoryData['Domain'][subcategory] = {};
        }
        if (!categoryData['Domain'][subcategory][subSubcategory]) {
            categoryData['Domain'][subcategory][subSubcategory] = [];
        }
        
        categoryData['Domain'][subcategory][subSubcategory].push(item);
        input.value = '';
        saveData();
        renderCategoryView();
    }
}

function editDomainItem(subcategory, subSubcategory, index) {
    const currentItem = categoryData['Domain'][subcategory][subSubcategory][index];
    const newItem = prompt('Edit item:', currentItem);
    
    if (newItem && newItem.trim()) {
        categoryData['Domain'][subcategory][subSubcategory][index] = newItem.trim();
        saveData();
        renderCategoryView();
    }
}

function deleteDomainItem(subcategory, subSubcategory, index) {
    showCustomConfirm('Delete Item', 'Are you sure you want to delete this item?', (confirmed) => {
        if (confirmed) {
            categoryData['Domain'][subcategory][subSubcategory].splice(index, 1);
            saveData();
            renderCategoryView();
        }
    });
}

function filterDomainItems(subcategory, subSubcategory) {
    const searchTerm = document.getElementById('itemSearch').value.toLowerCase();
    const items = categoryData['Domain'][subcategory][subSubcategory] || {};
    
    const filteredItems = Object.keys(items).filter(title => {
        // Search in title
        if (title.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search in boolean terms
        const booleanTerms = items[title] || [];
        return booleanTerms.some(term => term.toLowerCase().includes(searchTerm));
    });
    
    const filteredItemsObj = {};
    filteredItems.forEach(title => {
        filteredItemsObj[title] = items[title];
    });
    
    const listElement = document.getElementById('itemsList');
    listElement.innerHTML = renderDomainItemsList(filteredItemsObj, subcategory, subSubcategory);
}

// Domain Modal Functions
function openAddDomainModal(subcategory, subSubcategory) {
    currentSubcategory = subcategory;
    currentSubSubcategory = subSubcategory;
    document.getElementById('addTitleModal').style.display = 'block';
    document.getElementById('titleName').value = '';
    document.getElementById('booleanOptionsList').innerHTML = `
        <div class="boolean-option">
            <input type="text" placeholder="Boolean option" class="boolean-input" onkeypress="handleBooleanInputKeypress(event)">
            <button type="button" class="remove-option-btn" onclick="removeBooleanOption(this)">Remove</button>
        </div>
    `;
}

function openDomainDetailsModal(subcategory, subSubcategory, titleName) {
    const booleanOptions = categoryData['Domain'][subcategory][subSubcategory][titleName] || [];
    
    document.getElementById('titleDetailsHeader').textContent = 'Boolean Search Details';
    document.getElementById('selectedTitleName').textContent = titleName;
    document.getElementById('selectedTitleName').setAttribute('data-original-title', titleName);
    document.getElementById('selectedTitleName').setAttribute('data-subcategory', subcategory);
    document.getElementById('selectedTitleName').setAttribute('data-sub-subcategory', subSubcategory);
    
    // Initialize the current boolean terms for this modal
    currentBooleanTerms = [...booleanOptions];
    currentModalCategory = 'Domain';
    currentModalSubcategory = subcategory;
    currentModalSubSubcategory = subSubcategory;
    currentModalTitleName = titleName;
    
    // Render the existing terms
    renderBooleanOptionsTermsList();
    
    document.getElementById('booleanOptionsInput').value = '';
    document.getElementById('titleDetailsModal').style.display = 'block';
    
    // Add input event listener to enable/disable the Add button
    const input = document.getElementById('booleanOptionsInput');
    const addButton = document.getElementById('addBooleanOptionsBtn');
    
    // Use oninput to avoid multiple event listeners
    input.oninput = function() {
        addButton.disabled = !this.value.trim();
    };
    
    // Initially disable the button
    addButton.disabled = true;
    
    // Add click event to make title editable
    const titleElement = document.getElementById('selectedTitleName');
    titleElement.onclick = function() {
        makeDomainTitleEditable(this);
    };
}

function editDomainTitle(subcategory, subSubcategory, titleName) {
    const newTitleName = prompt('Edit boolean search name:', titleName);
    if (newTitleName && newTitleName.trim() && newTitleName !== titleName) {
        const booleanOptions = categoryData['Domain'][subcategory][subSubcategory][titleName];
        delete categoryData['Domain'][subcategory][subSubcategory][titleName];
        categoryData['Domain'][subcategory][subSubcategory][newTitleName.trim()] = booleanOptions;
        saveData();
        renderCategoryView();
    }
}

async function deleteDomainTitle(subcategory, subSubcategory, titleName) {
    const confirmed = await customConfirm('Delete Boolean Search', 'Are you sure you want to delete this boolean search?');
    if (confirmed) {
        delete categoryData['Domain'][subcategory][subSubcategory][titleName];
        saveData();
        renderCategoryView();
    }
}

// Boolean Search Modal Functions
let currentBooleanTerms = [];
let currentModalCategory = null;
let currentModalSubcategory = null;
let currentModalSubSubcategory = null;
let currentModalTitleName = null;

function openAddBooleanSearchModal(category, subcategory, subSubcategory = null) {
    currentModalCategory = category;
    currentModalSubcategory = subcategory;
    currentModalSubSubcategory = subSubcategory;
    currentBooleanTerms = [];
    
    document.getElementById('addBooleanSearchModal').style.display = 'block';
    document.getElementById('booleanSearchTitle').value = '';
    document.getElementById('booleanSearchInput').value = '';
    document.getElementById('booleanTermsList').innerHTML = '';
}

function closeAddBooleanSearchModal() {
    document.getElementById('addBooleanSearchModal').style.display = 'none';
    currentBooleanTerms = [];
    currentModalCategory = null;
    currentModalSubcategory = null;
    currentModalSubSubcategory = null;
}

function handleBooleanSearchInputKeypress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const input = document.getElementById('booleanSearchInput');
        const term = input.value.trim();
        
        if (term) {
            addBooleanTerm(term);
            input.value = '';
        }
    }
}

function handleBooleanOptionsInputKeypress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const input = document.getElementById('booleanOptionsInput');
        const term = input.value.trim();
        
        if (term) {
            addBooleanOptionsTerm(term);
            input.value = '';
        }
    }
}

function handleAddBooleanOptionsClick() {
    const input = document.getElementById('booleanOptionsInput');
    const term = input.value.trim();
    
    if (term) {
        addBooleanOptionsTerm(term);
        input.value = '';
    }
}

function addBooleanTerm(term) {
    // Store the term without quotes - quotes will be added when inserted into search string
    let cleanTerm = term;
    // Remove quotes if they exist
    if (term.startsWith('"') && term.endsWith('"')) {
        cleanTerm = term.slice(1, -1);
    }
    
    if (cleanTerm && !currentBooleanTerms.includes(cleanTerm)) {
        currentBooleanTerms.push(cleanTerm);
        renderBooleanTermsList();
    }
}

function addBooleanOptionsTerm(term) {
    // Store the term without quotes - quotes will be added when inserted into search string
    let cleanTerm = term;
    // Remove quotes if they exist
    if (term.startsWith('"') && term.endsWith('"')) {
        cleanTerm = term.slice(1, -1);
    }
    
    if (cleanTerm && !currentBooleanTerms.includes(cleanTerm)) {
        currentBooleanTerms.push(cleanTerm);
        renderBooleanOptionsTermsList();
        
        // Update the data structure
        if (currentModalCategory === 'Domain') {
            if (!categoryData['Domain'][currentModalSubcategory][currentModalSubSubcategory][currentModalTitleName]) {
                categoryData['Domain'][currentModalSubcategory][currentModalSubSubcategory][currentModalTitleName] = [];
            }
            categoryData['Domain'][currentModalSubcategory][currentModalSubSubcategory][currentModalTitleName] = [...currentBooleanTerms];
            saveData();
        } else if (currentModalCategory === 'Industry') {
            if (!categoryData['Industry'][currentModalSubcategory][currentModalTitleName]) {
                categoryData['Industry'][currentModalSubcategory][currentModalTitleName] = [];
            }
            categoryData['Industry'][currentModalSubcategory][currentModalTitleName] = [...currentBooleanTerms];
            saveData();
        } else if (currentModalCategory === 'Context') {
            if (!categoryData['Context'][currentModalSubcategory][currentModalTitleName]) {
                categoryData['Context'][currentModalSubcategory][currentModalTitleName] = [];
            }
            categoryData['Context'][currentModalSubcategory][currentModalTitleName] = [...currentBooleanTerms];
            saveData();
        } else if (currentModalCategory === 'Certifications & Clearances') {
            if (!categoryData['Certifications & Clearances'][currentModalSubcategory][currentModalTitleName]) {
                categoryData['Certifications & Clearances'][currentModalSubcategory][currentModalTitleName] = [];
            }
            categoryData['Certifications & Clearances'][currentModalSubcategory][currentModalTitleName] = [...currentBooleanTerms];
            saveData();
        } else if (currentModalCategory === 'Titles') {
            if (!categoryData['Titles'][currentModalSubcategory][currentModalTitleName]) {
                categoryData['Titles'][currentModalSubcategory][currentModalTitleName] = [];
            }
            categoryData['Titles'][currentModalSubcategory][currentModalTitleName] = [...currentBooleanTerms];
            saveData();
        }
    }
}

function removeBooleanTerm(term) {
    currentBooleanTerms = currentBooleanTerms.filter(t => t !== term);
    renderBooleanTermsList();
}

function removeBooleanOptionsTerm(term) {
    currentBooleanTerms = currentBooleanTerms.filter(t => t !== term);
    renderBooleanOptionsTermsList();
    
    // Update the data structure
    if (currentModalCategory === 'Domain') {
        if (!categoryData['Domain'][currentModalSubcategory][currentModalSubSubcategory][currentModalTitleName]) {
            categoryData['Domain'][currentModalSubcategory][currentModalSubSubcategory][currentModalTitleName] = [];
        }
        categoryData['Domain'][currentModalSubcategory][currentModalSubSubcategory][currentModalTitleName] = [...currentBooleanTerms];
        saveData();
    } else if (currentModalCategory === 'Industry') {
        if (!categoryData['Industry'][currentModalSubcategory][currentModalTitleName]) {
            categoryData['Industry'][currentModalSubcategory][currentModalTitleName] = [];
        }
        categoryData['Industry'][currentModalSubcategory][currentModalTitleName] = [...currentBooleanTerms];
        saveData();
    } else if (currentModalCategory === 'Context') {
        if (!categoryData['Context'][currentModalSubcategory][currentModalTitleName]) {
            categoryData['Context'][currentModalSubcategory][currentModalTitleName] = [];
        }
        categoryData['Context'][currentModalSubcategory][currentModalTitleName] = [...currentBooleanTerms];
        saveData();
    } else if (currentModalCategory === 'Certifications & Clearances') {
        if (!categoryData['Certifications & Clearances'][currentModalSubcategory][currentModalTitleName]) {
            categoryData['Certifications & Clearances'][currentModalSubcategory][currentModalTitleName] = [];
        }
        categoryData['Certifications & Clearances'][currentModalSubcategory][currentModalTitleName] = [...currentBooleanTerms];
        saveData();
    } else if (currentModalCategory === 'Titles') {
        if (!categoryData['Titles'][currentModalSubcategory][currentModalTitleName]) {
            categoryData['Titles'][currentModalSubcategory][currentModalTitleName] = [];
        }
        categoryData['Titles'][currentModalSubcategory][currentModalTitleName] = [...currentBooleanTerms];
        saveData();
    }
}

function renderBooleanTermsList() {
    const container = document.getElementById('booleanTermsList');
    container.innerHTML = currentBooleanTerms.map(term => `
        <div class="boolean-term-chip">
            ${term}
            <button class="remove-term" onclick="removeBooleanTerm('${term}')">&times;</button>
        </div>
    `).join('');
}

function renderBooleanOptionsTermsList() {
    const container = document.getElementById('booleanOptionsTermsList');
    
    if (!container) {
        console.error('booleanOptionsTermsList container not found!');
        return;
    }
    
    container.innerHTML = currentBooleanTerms.map(term => `
        <div class="boolean-term-chip">
            ${term}
            <button class="remove-term" onclick="removeBooleanOptionsTerm('${term}')">&times;</button>
        </div>
    `).join('');
}

async function saveBooleanSearch() {
    const title = document.getElementById('booleanSearchTitle').value.trim();
    
    if (!title) {
        await customAlert('Missing Title', 'Please enter a title for the boolean search.');
        return;
    }
    
    if (currentBooleanTerms.length === 0) {
        await customAlert('Missing Terms', 'Please add at least one boolean search term.');
        return;
    }
    
    // Initialize the data structure based on category
    if (currentModalCategory === 'Domain') {
        if (!categoryData['Domain'][currentModalSubcategory]) {
            categoryData['Domain'][currentModalSubcategory] = {};
        }
        if (!categoryData['Domain'][currentModalSubcategory][currentModalSubSubcategory]) {
            categoryData['Domain'][currentModalSubcategory][currentModalSubSubcategory] = {};
        }
        categoryData['Domain'][currentModalSubcategory][currentModalSubSubcategory][title] = currentBooleanTerms;
    } else if (currentModalCategory === 'Titles') {
        if (!categoryData['Titles'][currentModalSubcategory]) {
            categoryData['Titles'][currentModalSubcategory] = {};
        }
        categoryData['Titles'][currentModalSubcategory][title] = currentBooleanTerms;
    } else if (currentModalCategory === 'Industry') {
        if (!categoryData['Industry'][currentModalSubcategory]) {
            categoryData['Industry'][currentModalSubcategory] = {};
        }
        categoryData['Industry'][currentModalSubcategory][title] = currentBooleanTerms;
    } else if (currentModalCategory === 'Context') {
        if (!categoryData['Context'][currentModalSubcategory]) {
            categoryData['Context'][currentModalSubcategory] = {};
        }
        categoryData['Context'][currentModalSubcategory][title] = currentBooleanTerms;
    } else if (currentModalCategory === 'Certifications & Clearances') {
        if (!categoryData['Certifications & Clearances'][currentModalSubcategory]) {
            categoryData['Certifications & Clearances'][currentModalSubcategory] = {};
        }
        categoryData['Certifications & Clearances'][currentModalSubcategory][title] = currentBooleanTerms;
    }
    
    saveData();
    closeAddBooleanSearchModal();
    renderCategoryView();
}

async function removeBooleanOptionFromDomain(subcategory, subSubcategory, titleName, option) {
    const confirmed = await customConfirm('Delete Boolean Option', 'Are you sure you want to delete this boolean option?');
    if (confirmed) {
        const booleanOptions = categoryData['Domain'][subcategory][subSubcategory][titleName] || [];
        const updatedOptions = booleanOptions.filter(opt => opt !== option);
        categoryData['Domain'][subcategory][subSubcategory][titleName] = updatedOptions;
        saveData();
        openDomainDetailsModal(subcategory, subSubcategory, titleName);
    }
}

async function addBooleanOptionToDomain(subcategory, subSubcategory, titleName, newOption) {
    if (!categoryData['Domain'][subcategory][subSubcategory][titleName]) {
        categoryData['Domain'][subcategory][subSubcategory][titleName] = [];
    }
    
    // Check if option already exists
    const existingOptions = categoryData['Domain'][subcategory][subSubcategory][titleName];
    if (!existingOptions.includes(newOption)) {
        existingOptions.push(newOption);
        saveData();
        openDomainDetailsModal(subcategory, subSubcategory, titleName);
    } else {
        await customAlert('Duplicate Option', 'This boolean option already exists.');
    }
}

function makeDomainTitleEditable(titleElement) {
    const currentTitle = titleElement.textContent;
    const originalTitle = titleElement.getAttribute('data-original-title');
    const subcategory = titleElement.getAttribute('data-subcategory');
    const subSubcategory = titleElement.getAttribute('data-sub-subcategory');
    
    titleElement.classList.add('editing');
    titleElement.innerHTML = `<input type="text" value="${currentTitle}" onblur="saveDomainTitleEdit(this, '${subcategory}', '${subSubcategory}', '${originalTitle}')" onkeypress="handleDomainTitleEditKeypress(event, this, '${subcategory}', '${subSubcategory}', '${originalTitle}')">`;
    
    const input = titleElement.querySelector('input');
    input.focus();
    input.select();
}

function saveDomainTitleEdit(inputElement, subcategory, subSubcategory, originalTitle) {
    const newTitle = inputElement.value.trim();
    const titleElement = inputElement.parentElement;
    
    if (newTitle && newTitle !== originalTitle) {
        // Update the title in the data structure
        const booleanOptions = categoryData['Domain'][subcategory][subSubcategory][originalTitle];
        delete categoryData['Domain'][subcategory][subSubcategory][originalTitle];
        categoryData['Domain'][subcategory][subSubcategory][newTitle] = booleanOptions;
        
        // Update the display
        titleElement.textContent = newTitle;
        titleElement.setAttribute('data-original-title', newTitle);
        
        saveData();
    } else {
        // Revert to original title
        titleElement.textContent = originalTitle;
    }
    
    titleElement.classList.remove('editing');
}

function handleDomainTitleEditKeypress(event, inputElement, subcategory, subSubcategory, originalTitle) {
    if (event.key === 'Enter') {
        inputElement.blur();
    } else if (event.key === 'Escape') {
        const titleElement = inputElement.parentElement;
        titleElement.textContent = originalTitle;
        titleElement.classList.remove('editing');
    }
}





// Industry Functions
function renderIndustrySubcategorySelection(contentElement) {
    contentElement.innerHTML = `
        <div class="subcategory-selection">
            <div class="subcategory-buttons">
                <button class="subcategory-btn" onclick="selectCategory('Industry', 'Insurance')">Insurance</button>
                <button class="subcategory-btn" onclick="selectCategory('Industry', 'Bank')">Bank</button>
                <button class="subcategory-btn" onclick="selectCategory('Industry', 'Superannuation')">Superannuation</button>
                <button class="subcategory-btn" onclick="selectCategory('Industry', 'Financial')">Financial</button>
            </div>
        </div>
    `;
}

function renderIndustrySubcategoryItems(contentElement, subcategory) {
    // Initialize the data structure if it doesn't exist
    if (!categoryData['Industry'][subcategory]) {
        categoryData['Industry'][subcategory] = {};
    }
    
    const items = categoryData['Industry'][subcategory] || {};
    
    contentElement.innerHTML = `
        <div class="category-management">
            <button class="add-boolean-search-btn" onclick="openAddBooleanSearchModal('Industry', '${subcategory}')">
                ➕ Add Boolean Search
            </button>
            <div class="search-filter">
                <input type="text" id="itemSearch" placeholder="Search boolean terms..." onkeyup="filterIndustryItems('${subcategory}')">
            </div>
            <div class="items-list" id="itemsList">
                ${renderIndustryItemsList(items, subcategory)}
            </div>
        </div>
    `;
}

function renderIndustryItemsList(items, subcategory) {
    if (Object.keys(items).length === 0) {
        return '<p style="color: #7f8c8d; font-style: italic;">No boolean searches added yet.</p>';
    }
    
    return Object.keys(items).map((title, index) => {
        const booleanTerms = items[title] || [];
        const termsDisplay = booleanTerms.length > 0 
            ? booleanTerms.map(term => `<span class="boolean-term-chip">"${term}"</span>`).join(' ')
            : '<span style="color: #7f8c8d; font-style: italic;">No terms</span>';
        
        return `
            <div class="item-row">
                <div class="item-content">
                    <div class="item-title">${title}</div>
                    <div class="item-terms">${termsDisplay}</div>
                </div>
                <div class="item-actions">
                    <button class="boolean-options-btn" onclick="openIndustryDetailsModal('${subcategory}', '${title}')">Boolean Options</button>
                    <button class="edit-btn" onclick="editIndustryTitle('${subcategory}', '${title}')">Edit</button>
                    <button class="delete-btn" onclick="deleteIndustryTitle('${subcategory}', '${title}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function addIndustryItem(subcategory) {
    const input = document.getElementById('newItem');
    const item = input.value.trim();
    
    if (item) {
        // Initialize the data structure if it doesn't exist
        if (!categoryData['Industry'][subcategory]) {
            categoryData['Industry'][subcategory] = {};
        }
        categoryData['Industry'][subcategory][item] = []; // Initialize with empty array for boolean options
        input.value = '';
        saveData();
        renderCategoryView();
    }
}

function editIndustryItem(subcategory, titleName) {
    const newTitleName = prompt('Edit boolean search name:', titleName);
    if (newTitleName && newTitleName.trim() && newTitleName !== titleName) {
        const booleanOptions = categoryData['Industry'][subcategory][titleName];
        delete categoryData['Industry'][subcategory][titleName];
        categoryData['Industry'][subcategory][newTitleName.trim()] = booleanOptions;
        saveData();
        renderCategoryView();
    }
}

async function deleteIndustryItem(subcategory, titleName) {
    const confirmed = await customConfirm('Delete Boolean Search', 'Are you sure you want to delete this boolean search?');
    if (confirmed) {
        delete categoryData['Industry'][subcategory][titleName];
        saveData();
        renderCategoryView();
    }
}

function filterIndustryItems(subcategory) {
    const searchTerm = document.getElementById('itemSearch').value.toLowerCase();
    const items = categoryData['Industry'][subcategory] || {};
    
    const filteredItems = Object.keys(items).filter(title => {
        // Search in title
        if (title.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search in boolean terms
        const booleanTerms = items[title] || [];
        return booleanTerms.some(term => term.toLowerCase().includes(searchTerm));
    });
    
    const filteredItemsObj = {};
    filteredItems.forEach(title => {
        filteredItemsObj[title] = items[title];
    });
    
    const listElement = document.getElementById('itemsList');
    listElement.innerHTML = renderIndustryItemsList(filteredItemsObj, subcategory);
}

// Context Functions
function renderContextSubcategorySelection(contentElement) {
    contentElement.innerHTML = `
        <div class="subcategory-selection">
            <div class="subcategory-buttons">
                <button class="subcategory-btn" onclick="selectCategory('Context', 'Methodology')">Methodology</button>
                <button class="subcategory-btn" onclick="selectCategory('Context', 'Status & Intent')">Status & Intent</button>
            </div>
        </div>
    `;
}

function renderContextSubcategoryItems(contentElement, subcategory) {
    // Initialize the data structure if it doesn't exist
    if (!categoryData['Context'][subcategory]) {
        categoryData['Context'][subcategory] = {};
    }
    
    const items = categoryData['Context'][subcategory] || {};
    
    contentElement.innerHTML = `
        <div class="category-management">
            <button class="add-boolean-search-btn" onclick="openAddBooleanSearchModal('Context', '${subcategory}')">
                ➕ Add Boolean Search
            </button>
            <div class="search-filter">
                <input type="text" id="itemSearch" placeholder="Search boolean terms..." onkeyup="filterContextItems('${subcategory}')">
            </div>
            <div class="items-list" id="itemsList">
                ${renderContextItemsList(items, subcategory)}
            </div>
        </div>
    `;
}

function renderContextItemsList(items, subcategory) {
    if (Object.keys(items).length === 0) {
        return '<p style="color: #7f8c8d; font-style: italic;">No boolean searches added yet.</p>';
    }
    
    return Object.keys(items).map((title, index) => {
        const booleanTerms = items[title] || [];
        const termsDisplay = booleanTerms.length > 0 
            ? booleanTerms.map(term => `<span class="boolean-term-chip">"${term}"</span>`).join(' ')
            : '<span style="color: #7f8c8d; font-style: italic;">No terms</span>';
        
        return `
            <div class="item-row">
                <div class="item-content">
                    <div class="item-title">${title}</div>
                    <div class="item-terms">${termsDisplay}</div>
                </div>
                <div class="item-actions">
                    <button class="boolean-options-btn" onclick="openContextDetailsModal('${subcategory}', '${title}')">Boolean Options</button>
                    <button class="edit-btn" onclick="editContextTitle('${subcategory}', '${title}')">Edit</button>
                    <button class="delete-btn" onclick="deleteContextTitle('${subcategory}', '${title}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function filterContextItems(subcategory) {
    const searchTerm = document.getElementById('itemSearch').value.toLowerCase();
    const items = categoryData['Context'][subcategory] || {};
    
    const filteredItems = Object.keys(items).filter(title => {
        // Search in title
        if (title.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search in boolean terms
        const booleanTerms = items[title] || [];
        return booleanTerms.some(term => term.toLowerCase().includes(searchTerm));
    });
    
    const filteredItemsObj = {};
    filteredItems.forEach(title => {
        filteredItemsObj[title] = items[title];
    });
    
    const listElement = document.getElementById('itemsList');
    listElement.innerHTML = renderContextItemsList(filteredItemsObj, subcategory);
}

// Certifications & Clearances Functions
function renderCertificationsSubcategorySelection(contentElement) {
    contentElement.innerHTML = `
        <div class="subcategory-selection">
            <div class="subcategory-buttons">
                <button class="subcategory-btn" onclick="selectCategory('Certifications & Clearances', 'Federal Government Clearances')">Federal Government Clearances</button>
                <button class="subcategory-btn" onclick="selectCategory('Certifications & Clearances', 'Technical Certifications')">Technical Certifications</button>
                <button class="subcategory-btn" onclick="selectCategory('Certifications & Clearances', 'Delivery Certifications')">Delivery Certifications</button>
                <button class="subcategory-btn" onclick="selectCategory('Certifications & Clearances', 'Product & Design Certifications')">Product & Design Certifications</button>
                <button class="subcategory-btn" onclick="selectCategory('Certifications & Clearances', 'Financial Certifications')">Financial Certifications</button>
            </div>
        </div>
    `;
}

function renderCertificationsSubcategoryItems(contentElement, subcategory) {
    // Initialize the data structure if it doesn't exist
    if (!categoryData['Certifications & Clearances'][subcategory]) {
        categoryData['Certifications & Clearances'][subcategory] = {};
    }
    
    const items = categoryData['Certifications & Clearances'][subcategory] || {};
    
    contentElement.innerHTML = `
        <div class="category-management">
            <button class="add-boolean-search-btn" onclick="openAddBooleanSearchModal('Certifications & Clearances', '${subcategory}')">
                ➕ Add Boolean Search
            </button>
            <div class="search-filter">
                <input type="text" id="itemSearch" placeholder="Search boolean terms..." onkeyup="filterCertificationsItems('${subcategory}')">
            </div>
            <div class="items-list" id="itemsList">
                ${renderCertificationsItemsList(items, subcategory)}
            </div>
        </div>
    `;
}

function renderCertificationsItemsList(items, subcategory) {
    if (Object.keys(items).length === 0) {
        return '<p style="color: #7f8c8d; font-style: italic;">No boolean searches added yet.</p>';
    }
    
    return Object.keys(items).map((title, index) => {
        const booleanTerms = items[title] || [];
        const termsDisplay = booleanTerms.length > 0 
            ? booleanTerms.map(term => `<span class="boolean-term-chip">"${term}"</span>`).join(' ')
            : '<span style="color: #7f8c8d; font-style: italic;">No terms</span>';
        
        return `
            <div class="item-row">
                <div class="item-content">
                    <div class="item-title">${title}</div>
                    <div class="item-terms">${termsDisplay}</div>
                </div>
                <div class="item-actions">
                    <button class="boolean-options-btn" onclick="openCertificationsDetailsModal('${subcategory}', '${title}')">Boolean Options</button>
                    <button class="edit-btn" onclick="editCertificationsTitle('${subcategory}', '${title}')">Edit</button>
                    <button class="delete-btn" onclick="deleteCertificationsTitle('${subcategory}', '${title}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function filterCertificationsItems(subcategory) {
    const searchTerm = document.getElementById('itemSearch').value.toLowerCase();
    const items = categoryData['Certifications & Clearances'][subcategory] || {};
    
    const filteredItems = Object.keys(items).filter(title => {
        // Search in title
        if (title.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search in boolean terms
        const booleanTerms = items[title] || [];
        return booleanTerms.some(term => term.toLowerCase().includes(searchTerm));
    });
    
    const filteredItemsObj = {};
    filteredItems.forEach(title => {
        filteredItemsObj[title] = items[title];
    });
    
    const listElement = document.getElementById('itemsList');
    listElement.innerHTML = renderCertificationsItemsList(filteredItemsObj, subcategory);
}

function renderRegularCategory(contentElement, category) {
    const items = categoryData[category] || [];
    
    contentElement.innerHTML = `
        <div class="category-management">
            <div class="add-item-controls">
                <input type="text" id="newItem" placeholder="New ${category.toLowerCase()} item">
                <button onclick="addItem('${category}')">Add Item</button>
            </div>
            <div class="search-filter">
                <input type="text" id="itemSearch" placeholder="Search items..." onkeyup="filterItems('${category}')">
            </div>
            <div class="items-list" id="itemsList">
                ${renderItemsList(items)}
            </div>
        </div>
    `;
}

function renderTitlesList(titles, subcategory) {
    if (titles.length === 0) {
        return '<p style="color: #7f8c8d; font-style: italic;">No boolean searches added yet.</p>';
    }
    
    return titles.map((title, index) => {
        const booleanTerms = categoryData['Titles'][subcategory][title] || [];
        const termsDisplay = booleanTerms.length > 0 
            ? booleanTerms.map(term => `<span class="boolean-term-chip">"${term}"</span>`).join(' ')
            : '<span style="color: #7f8c8d; font-style: italic;">No terms</span>';
        
        return `
            <div class="item-row">
                <div class="item-content">
                    <div class="item-title">${title}</div>
                    <div class="item-terms">${termsDisplay}</div>
                </div>
                <div class="item-actions">
                    <button class="boolean-options-btn" onclick="openTitleDetailsModal('${subcategory}', '${title}')">Boolean Options</button>
                    <button class="edit-btn" onclick="editTitle('${subcategory}', '${title}')">Edit</button>
                    <button class="delete-btn" onclick="deleteTitle('${subcategory}', '${title}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderItemsList(items) {
    if (items.length === 0) {
        return '<p style="color: #7f8c8d; font-style: italic;">No items added yet.</p>';
    }
    
    return items.map((item, index) => `
        <div class="item-row" data-index="${index}">
            <span class="item-text">${item}</span>
            <div class="item-actions">
                <button class="edit-btn" onclick="editItem('${selectedCategory.category}', ${index})">Edit</button>
                <button class="delete-btn" onclick="deleteItem('${selectedCategory.category}', ${index})">Delete</button>
            </div>
        </div>
    `).join('');
}



// Modal Functions
function openAddIndustryModal(subcategory) {
    currentIndustrySubcategory = subcategory;
    currentSubSubcategory = null; // Ensure not in Domain context
    document.getElementById('addTitleModal').style.display = 'block';
    document.getElementById('titleName').value = '';
    document.getElementById('booleanOptionsList').innerHTML = `
        <div class="boolean-option">
            <input type="text" placeholder="Boolean option" class="boolean-input" onkeypress="handleBooleanInputKeypress(event)">
            <button type="button" class="remove-option-btn" onclick="removeBooleanOption(this)">Remove</button>
        </div>
    `;
}




function openAddTitleModal(subcategory) {
    currentSubcategory = subcategory;
    document.getElementById('addTitleModal').style.display = 'block';
    document.getElementById('titleName').value = '';
    

}

function closeModal() {
    document.getElementById('addTitleModal').style.display = 'none';
}

async function saveTitle() {
    const titleName = document.getElementById('titleName').value.trim();
    
    if (titleName) {
        if (currentSubSubcategory) {
            // Save to Domain
            if (!categoryData['Domain'][currentSubcategory]) {
                categoryData['Domain'][currentSubcategory] = {};
            }
            if (!categoryData['Domain'][currentSubcategory][currentSubSubcategory]) {
                categoryData['Domain'][currentSubcategory][currentSubSubcategory] = {};
            }
            categoryData['Domain'][currentSubcategory][currentSubSubcategory][titleName] = [];
        } else if (currentIndustrySubcategory) {
            // Save to Industry
            if (!categoryData['Industry'][currentIndustrySubcategory]) {
                categoryData['Industry'][currentIndustrySubcategory] = {};
            }
            categoryData['Industry'][currentIndustrySubcategory][titleName] = [];
        } else {
            // Save to Titles
            categoryData['Titles'][currentSubcategory][titleName] = [];
        }
        saveData();
        closeModal();
        renderCategoryView();
        renderAll();
        currentIndustrySubcategory = null; // Reset after save
    } else {
        await customAlert('Missing Title', 'Please enter a title name.');
    }
}

function openTitleDetailsModal(subcategory, titleName) {
    const booleanOptions = categoryData['Titles'][subcategory][titleName] || [];
    
    document.getElementById('titleDetailsHeader').textContent = 'Boolean Search Details';
    document.getElementById('selectedTitleName').textContent = titleName;
    document.getElementById('selectedTitleName').setAttribute('data-original-title', titleName);
    document.getElementById('selectedTitleName').setAttribute('data-subcategory', subcategory);
    
    // Initialize the current boolean terms for this modal
    currentBooleanTerms = [...booleanOptions];
    currentModalCategory = 'Titles';
    currentModalSubcategory = subcategory;
    currentModalSubSubcategory = null;
    currentModalTitleName = titleName;
    
    // Render the existing terms
    renderBooleanOptionsTermsList();
    
    document.getElementById('booleanOptionsInput').value = '';
    document.getElementById('titleDetailsModal').style.display = 'block';
    
    // Add input event listener to enable/disable the Add button
    const input = document.getElementById('booleanOptionsInput');
    const addButton = document.getElementById('addBooleanOptionsBtn');
    
    // Use oninput to avoid multiple event listeners
    input.oninput = function() {
        addButton.disabled = !this.value.trim();
    };
    
    // Initially disable the button
    addButton.disabled = true;
    
    // Add click event to make title editable
    const titleElement = document.getElementById('selectedTitleName');
    titleElement.onclick = function() {
        makeTitleEditable(this);
    };
}

function closeTitleDetailsModal() {
    document.getElementById('titleDetailsModal').style.display = 'none';
    
    // Re-render the main category view to show updated Boolean terms
    if (selectedCategory) {
        renderCategoryView();
    }
}



function makeTitleEditable(titleElement) {
    const currentTitle = titleElement.textContent;
    const originalTitle = titleElement.getAttribute('data-original-title');
    const subcategory = titleElement.getAttribute('data-subcategory');
    
    titleElement.classList.add('editing');
    titleElement.innerHTML = `<input type="text" value="${currentTitle}" onblur="saveTitleEdit(this, '${subcategory}', '${originalTitle}')" onkeypress="handleTitleEditKeypress(event, this, '${subcategory}', '${originalTitle}')">`;
    
    const input = titleElement.querySelector('input');
    input.focus();
    input.select();
}

function saveTitleEdit(inputElement, subcategory, originalTitle) {
    const newTitle = inputElement.value.trim();
    const titleElement = inputElement.parentElement;
    
    if (newTitle && newTitle !== originalTitle) {
        // Update the title in the data structure
        const booleanOptions = categoryData['Titles'][subcategory][originalTitle];
        delete categoryData['Titles'][subcategory][originalTitle];
        categoryData['Titles'][subcategory][newTitle] = booleanOptions;
        
        // Update the display
        titleElement.textContent = newTitle;
        titleElement.setAttribute('data-original-title', newTitle);
        
        // Update all references in the boolean options
        const booleanOptionItems = document.querySelectorAll('.boolean-option-item .delete-btn');
        booleanOptionItems.forEach(btn => {
            const onclick = btn.getAttribute('onclick');
            if (onclick) {
                btn.setAttribute('onclick', onclick.replace(originalTitle, newTitle));
            }
        });
        
        saveData();
    } else {
        // Revert to original title
        titleElement.textContent = originalTitle;
    }
    
    titleElement.classList.remove('editing');
}

function handleTitleEditKeypress(event, inputElement, subcategory, originalTitle) {
    if (event.key === 'Enter') {
        inputElement.blur();
    } else if (event.key === 'Escape') {
        const titleElement = inputElement.parentElement;
        titleElement.textContent = originalTitle;
        titleElement.classList.remove('editing');
    }
}

// Industry Modal Functions
function openIndustryDetailsModal(subcategory, titleName) {
    const booleanOptions = categoryData['Industry'][subcategory][titleName] || [];
    
    document.getElementById('titleDetailsHeader').textContent = 'Boolean Search Details';
    document.getElementById('selectedTitleName').textContent = titleName;
    document.getElementById('selectedTitleName').setAttribute('data-original-title', titleName);
    document.getElementById('selectedTitleName').setAttribute('data-subcategory', subcategory);
    document.getElementById('selectedTitleName').removeAttribute('data-sub-subcategory');
    
    // Initialize the current boolean terms for this modal
    currentBooleanTerms = [...booleanOptions];
    currentModalCategory = 'Industry';
    currentModalSubcategory = subcategory;
    currentModalSubSubcategory = null;
    currentModalTitleName = titleName;
    
    // Render the existing terms
    renderBooleanOptionsTermsList();
    
    document.getElementById('booleanOptionsInput').value = '';
    document.getElementById('titleDetailsModal').style.display = 'block';
    
    // Add input event listener to enable/disable the Add button
    const input = document.getElementById('booleanOptionsInput');
    const addButton = document.getElementById('addBooleanOptionsBtn');
    
    // Use oninput to avoid multiple event listeners
    input.oninput = function() {
        addButton.disabled = !this.value.trim();
    };
    
    // Initially disable the button
    addButton.disabled = true;
    
    // Add click event to make title editable
    const titleElement = document.getElementById('selectedTitleName');
    titleElement.onclick = function() {
        makeIndustryTitleEditable(this);
    };
}

function editIndustryTitle(subcategory, titleName) {
    const newTitleName = prompt('Edit boolean search name:', titleName);
    if (newTitleName && newTitleName.trim() && newTitleName !== titleName) {
        const booleanOptions = categoryData['Industry'][subcategory][titleName];
        delete categoryData['Industry'][subcategory][titleName];
        categoryData['Industry'][subcategory][newTitleName.trim()] = booleanOptions;
        saveData();
        renderCategoryView();
    }
}

function deleteIndustryTitle(subcategory, titleName) {
    if (confirm('Are you sure you want to delete this boolean search?')) {
        delete categoryData['Industry'][subcategory][titleName];
        saveData();
        renderCategoryView();
    }
}



// Context Modal Functions
function openAddContextModal(subcategory) {
    currentContextSubcategory = subcategory;
    currentSubSubcategory = null; // Ensure not in Domain context
    document.getElementById('addTitleModal').style.display = 'block';
    document.getElementById('titleName').value = '';
    document.getElementById('booleanOptionsList').innerHTML = `
        <div class="boolean-option">
            <input type="text" placeholder="Boolean option" class="boolean-input" onkeypress="handleBooleanInputKeypress(event)">
            <button type="button" class="remove-option-btn" onclick="removeBooleanOption(this)">Remove</button>
        </div>
    `;
}

function openContextDetailsModal(subcategory, titleName) {
    const booleanOptions = categoryData['Context'][subcategory][titleName] || [];
    
    document.getElementById('titleDetailsHeader').textContent = 'Boolean Search Details';
    document.getElementById('selectedTitleName').textContent = titleName;
    document.getElementById('selectedTitleName').setAttribute('data-original-title', titleName);
    document.getElementById('selectedTitleName').setAttribute('data-subcategory', subcategory);
    
    // Initialize the current boolean terms for this modal
    currentBooleanTerms = [...booleanOptions];
    currentModalCategory = 'Context';
    currentModalSubcategory = subcategory;
    currentModalSubSubcategory = null;
    currentModalTitleName = titleName;
    
    // Render the existing terms
    renderBooleanOptionsTermsList();
    
    document.getElementById('booleanOptionsInput').value = '';
    document.getElementById('titleDetailsModal').style.display = 'block';
    
    // Add input event listener to enable/disable the Add button
    const input = document.getElementById('booleanOptionsInput');
    const addButton = document.getElementById('addBooleanOptionsBtn');
    
    // Use oninput to avoid multiple event listeners
    input.oninput = function() {
        addButton.disabled = !this.value.trim();
    };
    
    // Initially disable the button
    addButton.disabled = true;
    
    // Add click event to make title editable
    const titleElement = document.getElementById('selectedTitleName');
    titleElement.onclick = function() {
        makeContextTitleEditable(this);
    };
}

function editContextTitle(subcategory, titleName) {
    const newTitleName = prompt('Edit context name:', titleName);
    if (newTitleName && newTitleName.trim() && newTitleName !== titleName) {
        const booleanOptions = categoryData['Context'][subcategory][titleName];
        delete categoryData['Context'][subcategory][titleName];
        categoryData['Context'][subcategory][newTitleName.trim()] = booleanOptions;
        saveData();
        renderCategoryView();
    }
}

async function deleteContextTitle(subcategory, titleName) {
    const confirmed = await customConfirm('Delete Context', 'Are you sure you want to delete this context?');
    if (confirmed) {
        delete categoryData['Context'][subcategory][titleName];
        saveData();
        renderCategoryView();
    }
}



// Certifications & Clearances Modal Functions
function openAddCertificationsModal(subcategory) {
    currentCertificationsSubcategory = subcategory;
    currentSubSubcategory = null; // Ensure not in Domain context
    document.getElementById('addTitleModal').style.display = 'block';
    document.getElementById('titleName').value = '';
    document.getElementById('booleanOptionsList').innerHTML = `
        <div class="boolean-option">
            <input type="text" placeholder="Boolean option" class="boolean-input" onkeypress="handleBooleanInputKeypress(event)">
            <button type="button" class="remove-option-btn" onclick="removeBooleanOption(this)">Remove</button>
        </div>
    `;
}

function openCertificationsDetailsModal(subcategory, titleName) {
    const booleanOptions = categoryData['Certifications & Clearances'][subcategory][titleName] || [];
    
    document.getElementById('titleDetailsHeader').textContent = 'Boolean Search Details';
    document.getElementById('selectedTitleName').textContent = titleName;
    document.getElementById('selectedTitleName').setAttribute('data-original-title', titleName);
    document.getElementById('selectedTitleName').setAttribute('data-subcategory', subcategory);
    
    // Initialize the current boolean terms for this modal
    currentBooleanTerms = [...booleanOptions];
    currentModalCategory = 'Certifications & Clearances';
    currentModalSubcategory = subcategory;
    currentModalSubSubcategory = null;
    currentModalTitleName = titleName;
    
    // Render the existing terms
    renderBooleanOptionsTermsList();
    
    document.getElementById('booleanOptionsInput').value = '';
    document.getElementById('titleDetailsModal').style.display = 'block';
    
    // Add input event listener to enable/disable the Add button
    const input = document.getElementById('booleanOptionsInput');
    const addButton = document.getElementById('addBooleanOptionsBtn');
    
    // Use oninput to avoid multiple event listeners
    input.oninput = function() {
        addButton.disabled = !this.value.trim();
    };
    
    // Initially disable the button
    addButton.disabled = true;
    
    // Add click event to make title editable
    const titleElement = document.getElementById('selectedTitleName');
    titleElement.onclick = function() {
        makeCertificationsTitleEditable(this);
    };
}

function editCertificationsTitle(subcategory, titleName) {
    const newTitleName = prompt('Edit certification name:', titleName);
    if (newTitleName && newTitleName.trim() && newTitleName !== titleName) {
        const booleanOptions = categoryData['Certifications & Clearances'][subcategory][titleName];
        delete categoryData['Certifications & Clearances'][subcategory][titleName];
        categoryData['Certifications & Clearances'][subcategory][newTitleName.trim()] = booleanOptions;
        saveData();
        renderCategoryView();
    }
}

async function deleteCertificationsTitle(subcategory, titleName) {
    const confirmed = await customConfirm('Delete Certification', 'Are you sure you want to delete this certification?');
    if (confirmed) {
        delete categoryData['Certifications & Clearances'][subcategory][titleName];
        saveData();
        renderCategoryView();
    }
}



// Debug function to check current data
function debugCurrentData() {
    console.log('Current categoryData:', categoryData);
    console.log('Current Titles data:', categoryData['Titles']);
    console.log('Technical titles:', categoryData['Titles']['Technical']);
    console.log('Functional titles:', categoryData['Titles']['Functional']);
}

// Test function to add a sample boolean search
function testAddBooleanSearch() {
    console.log('Testing add boolean search...');
    
    // Simulate adding a boolean search
    const testTitle = 'Test Boolean Search';
    const testOptions = ['option1', 'option2', 'option3'];
    
    // Add to Technical titles
    categoryData['Titles']['Technical'][testTitle] = testOptions;
    
    console.log('Added test data:', categoryData['Titles']['Technical']);
    
    // Save the data
    saveData();
    
    // Re-render the view
    renderCategoryView();
    
    console.log('Test complete. Check if the item appears in the list.');
}

// Add functions
function addItem(category) {
    const input = document.getElementById('newItem');
    const item = input.value.trim();
    
    if (item) {
        // Add to regular category
        categoryData[category].push(item);
        input.value = '';
        saveData();
        renderCategoryView();
    }
}



// Edit functions
function editTitle(subcategory, titleName) {
    const newTitleName = prompt('Edit title name:', titleName);
    if (newTitleName && newTitleName.trim() && newTitleName !== titleName) {
        const booleanOptions = categoryData['Titles'][subcategory][titleName];
        delete categoryData['Titles'][subcategory][titleName];
        categoryData['Titles'][subcategory][newTitleName.trim()] = booleanOptions;
        saveData();
        renderCategoryView();
    }
}

function editItem(category, index) {
    const currentItem = categoryData[category][index];
    
    const newItem = prompt('Edit item:', currentItem);
    if (newItem && newItem.trim()) {
        categoryData[category][index] = newItem.trim();
        saveData();
        renderCategoryView();
    }
}



// Delete functions
async function deleteTitle(subcategory, titleName) {
    const confirmed = await customConfirm('Delete Title', 'Are you sure you want to delete this title?');
    if (confirmed) {
        delete categoryData['Titles'][subcategory][titleName];
        saveData();
        renderCategoryView();
    }
}

async function deleteItem(category, index) {
    const confirmed = await customConfirm('Delete Item', 'Are you sure you want to delete this item?');
    if (confirmed) {
        categoryData[category].splice(index, 1);
        saveData();
        renderCategoryView();
    }
}



// Filter functions
function filterTitles(subcategory) {
    const searchTerm = document.getElementById('titleSearch').value.toLowerCase();
    const items = categoryData['Titles'][subcategory] || {};
    
    const filteredItems = Object.keys(items).filter(title => {
        // Search in title
        if (title.toLowerCase().includes(searchTerm)) {
            return true;
        }
        
        // Search in boolean terms
        const booleanTerms = items[title] || [];
        return booleanTerms.some(term => term.toLowerCase().includes(searchTerm));
    });
    
    const filteredItemsObj = {};
    filteredItems.forEach(title => {
        filteredItemsObj[title] = items[title];
    });
    
    const listElement = document.getElementById('titlesList');
    listElement.innerHTML = renderTitlesList(Object.keys(filteredItemsObj), subcategory);
}

function filterItems(category) {
    const searchTerm = document.getElementById('itemSearch').value.toLowerCase();
    const items = categoryData[category] || [];
    
    const filteredItems = items.filter(item => 
        item.toLowerCase().includes(searchTerm)
    );
    
    const listElement = document.getElementById('itemsList');
    listElement.innerHTML = renderItemsList(filteredItems);
}



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

// Load saved interaction mode on page load
function loadInteractionMode() {
    const savedMode = localStorage.getItem('interactionMode') || 'click';
    switchToMode(savedMode);
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

function renderKeywordSelector() {
    const container = document.querySelector('.keyword-categories');
    if (!container) {
        console.error('Keyword categories container not found');
        return;
    }
    
    container.innerHTML = '';
    console.log('Rendering keyword selector...');
    
    // Get all categories from the directory
    const categories = [
        { name: 'Titles', key: 'titles' },
        { name: 'Domain', key: 'domain' },
        { name: 'Industry', key: 'industry' },
        { name: 'Context', key: 'context' },
        { name: 'Certifications & Clearances', key: 'certifications' }
    ];
    
    categories.forEach(category => {
        const categorySection = document.createElement('div');
        categorySection.className = 'keyword-category-section';
        
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'keyword-category-header';
        categoryHeader.innerHTML = `
            <h4>${category.name}</h4>
            <div class="category-actions">
                <button class="select-all-category-btn" onclick="selectAllCategorySearches('${category.key}')">Select All Category</button>
                <span class="expand-icon">▼</span>
            </div>
        `;
        
        const categoryContent = document.createElement('div');
        categoryContent.className = 'keyword-category-content';
        
        // Add click handler to expand/collapse
        categoryHeader.addEventListener('click', () => {
            categoryContent.classList.toggle('expanded');
            const icon = categoryHeader.querySelector('.expand-icon');
            icon.textContent = categoryContent.classList.contains('expanded') ? '▲' : '▼';
        });
        
        // Render subcategories and boolean searches
        renderCategoryBooleanSearches(categoryContent, category.key);
        
        categorySection.appendChild(categoryHeader);
        categorySection.appendChild(categoryContent);
        container.appendChild(categorySection);
    });
    
    console.log('Keyword selector rendering complete');
}

function renderCategoryBooleanSearches(container, categoryKey) {
    // Get the current data from localStorage for the current user
    const userId = currentUser ? currentUser.uid : 'guest';
    const storageKey = `pluginData_${userId}`;
    const savedData = localStorage.getItem(storageKey);
    
    if (!savedData) {
        console.log('No data found in localStorage for user:', userId);
        // Show default subcategories even if no data exists
        renderDefaultSubcategories(container, categoryKey);
        return;
    }
    
    const data = JSON.parse(savedData);
    console.log('Loaded data for user:', userId, data);
    
    const categoryData = data.categoryData;
    
    // Map lowercase keys to capitalized category names
    const categoryMapping = {
        'titles': 'Titles',
        'domain': 'Domain',
        'industry': 'Industry',
        'context': 'Context',
        'certifications': 'Certifications & Clearances'
    };
    
    const actualCategoryKey = categoryMapping[categoryKey];
    console.log(`Mapping ${categoryKey} to ${actualCategoryKey}`);
    
    if (!categoryData || !categoryData[actualCategoryKey]) {
        console.log(`No data found for category: ${categoryKey} (mapped to ${actualCategoryKey})`);
        // Show default subcategories even if no data exists
        renderDefaultSubcategories(container, categoryKey);
        return;
    }
    
    console.log(`Rendering ${categoryKey} with data:`, categoryData[actualCategoryKey]);
    
    Object.keys(categoryData[actualCategoryKey]).forEach(subcategory => {
        console.log(`Processing subcategory: ${subcategory}`);
        
        const subcategoryDiv = document.createElement('div');
        subcategoryDiv.className = 'keyword-subcategory';
        
        const subcategoryHeader = document.createElement('div');
        subcategoryHeader.className = 'keyword-subcategory-header';
        subcategoryHeader.innerHTML = `
            <h5>${subcategory}</h5>
            <button class="select-all-btn" onclick="selectAllBooleanSearches('${categoryKey}', '${subcategory}')">Select All</button>
        `;
        
        const booleanSearchList = document.createElement('div');
        booleanSearchList.className = 'keyword-list';
        
        // Get boolean searches from this subcategory
        const booleanSearches = getBooleanSearchesFromSubcategory(categoryKey, subcategory);
        console.log(`Found ${booleanSearches.length} boolean searches for ${subcategory}:`, booleanSearches);
        
        if (booleanSearches.length === 0) {
            const noSearchesMsg = document.createElement('div');
            noSearchesMsg.style.padding = '10px';
            noSearchesMsg.style.color = '#7f8c8d';
            noSearchesMsg.style.fontStyle = 'italic';
            noSearchesMsg.textContent = 'No boolean searches found in this subcategory.';
            booleanSearchList.appendChild(noSearchesMsg);
        } else {
            // Group searches by subSubcategory for Domain category
            if (categoryKey === 'domain') {
                const groupedSearches = {};
                booleanSearches.forEach(search => {
                    const subSubcategory = search.subSubcategory;
                    if (!groupedSearches[subSubcategory]) {
                        groupedSearches[subSubcategory] = [];
                    }
                    groupedSearches[subSubcategory].push(search);
                });
                
                Object.keys(groupedSearches).forEach(subSubcategory => {
                    const subSubcategoryDiv = document.createElement('div');
                    subSubcategoryDiv.className = 'keyword-sub-subcategory';
                    subSubcategoryDiv.style.marginLeft = '20px';
                    subSubcategoryDiv.style.marginTop = '8px';
                    subSubcategoryDiv.style.padding = '8px';
                    subSubcategoryDiv.style.border = '1px solid #e5e7eb';
                    subSubcategoryDiv.style.borderRadius = '4px';
                    subSubcategoryDiv.style.backgroundColor = '#f9fafb';
                    
                    const subSubcategoryHeader = document.createElement('div');
                    subSubcategoryHeader.style.display = 'flex';
                    subSubcategoryHeader.style.justifyContent = 'space-between';
                    subSubcategoryHeader.style.alignItems = 'center';
                    subSubcategoryHeader.style.marginBottom = '4px';
                    
                    subSubcategoryHeader.innerHTML = `
                        <h6 style="margin: 0; font-size: 0.9rem; font-weight: 600; color: var(--text);">${subSubcategory}</h6>
                        <button class="select-all-btn" style="font-size: 0.8rem; padding: 2px 8px;" onclick="selectAllBooleanSearches('${categoryKey}', '${subcategory}', '${subSubcategory}')">Select All</button>
                    `;
                    
                    const subSubcategoryContent = document.createElement('div');
                    groupedSearches[subSubcategory].forEach(search => {
                        const searchItem = document.createElement('div');
                        searchItem.className = 'keyword-checkbox-item';
                        searchItem.style.marginBottom = '4px';
                        
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.id = `search-${categoryKey}-${subcategory}-${subSubcategory}-${search.title}`;
                        checkbox.value = search.title;
                        checkbox.dataset.category = categoryKey;
                        checkbox.dataset.subcategory = subcategory;
                        checkbox.dataset.subSubcategory = subSubcategory;
                        checkbox.dataset.searchData = JSON.stringify(search);
                        
                        // Check if this search is already selected
                        if (currentRole && currentRole.selectedBooleanSearches) {
                            const searchId = JSON.stringify(search);
                            const isAlreadySelected = currentRole.selectedBooleanSearches.some(selectedSearch => 
                                JSON.stringify(selectedSearch) === searchId
                            );
                            if (isAlreadySelected) {
                                checkbox.checked = true;
                            }
                        }
                        
                        const label = document.createElement('label');
                        label.htmlFor = `search-${categoryKey}-${subcategory}-${subSubcategory}-${search.title}`;
                        label.textContent = search.title;
                        label.style.fontSize = '0.85rem';
                        
                        searchItem.appendChild(checkbox);
                        searchItem.appendChild(label);
                        subSubcategoryContent.appendChild(searchItem);
                    });
                    
                    subSubcategoryDiv.appendChild(subSubcategoryHeader);
                    subSubcategoryDiv.appendChild(subSubcategoryContent);
                    booleanSearchList.appendChild(subSubcategoryDiv);
                });
            } else {
                // For other categories, show searches directly
                booleanSearches.forEach(search => {
                    const searchItem = document.createElement('div');
                    searchItem.className = 'keyword-checkbox-item';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `search-${categoryKey}-${subcategory}-${search.title}`;
                    checkbox.value = search.title;
                    checkbox.dataset.category = categoryKey;
                    checkbox.dataset.subcategory = subcategory;
                    checkbox.dataset.searchData = JSON.stringify(search);
                    
                    // Check if this search is already selected
                    if (currentRole && currentRole.selectedBooleanSearches) {
                        const searchId = JSON.stringify(search);
                        const isAlreadySelected = currentRole.selectedBooleanSearches.some(selectedSearch => 
                            JSON.stringify(selectedSearch) === searchId
                        );
                        if (isAlreadySelected) {
                            checkbox.checked = true;
                        }
                    }
                    
                    const label = document.createElement('label');
                    label.htmlFor = `search-${categoryKey}-${subcategory}-${search.title}`;
                    label.textContent = search.title;
                    
                    searchItem.appendChild(checkbox);
                    searchItem.appendChild(label);
                    booleanSearchList.appendChild(searchItem);
                });
            }
        }
        
        subcategoryDiv.appendChild(subcategoryHeader);
        subcategoryDiv.appendChild(booleanSearchList);
        container.appendChild(subcategoryDiv);
    });
}

function renderDefaultSubcategories(container, categoryKey) {
    const defaultSubcategories = {
        'titles': ['Technical', 'Functional'],
        'domain': ['Agile & Scrum', 'AI & Machine Learning', 'Architecture', 'Change & Transformation', 'Cyber Security', 'Data & Analytics', 'DevOps & Platform Engineering', 'Digital', 'Financial Crime', 'Infrastructure & Cloud', 'Payments & Banking Tech', 'Product & Design', 'Project Services', 'Risk & Compliance', 'Software Engineering', 'Testing & QA'],
        'industry': ['Insurance', 'Bank', 'Superannuation', 'Financial'],
        'context': ['Context'],
        'certifications': ['Certifications & Clearances']
    };
    
    const subcategories = defaultSubcategories[categoryKey] || [];
    
    subcategories.forEach(subcategory => {
        const subcategoryDiv = document.createElement('div');
        subcategoryDiv.className = 'keyword-subcategory';
        
        const subcategoryHeader = document.createElement('div');
        subcategoryHeader.className = 'keyword-subcategory-header';
        subcategoryHeader.innerHTML = `
            <h5>${subcategory}</h5>
            <button class="select-all-btn" onclick="selectAllBooleanSearches('${categoryKey}', '${subcategory}')">Select All</button>
        `;
        
        const booleanSearchList = document.createElement('div');
        booleanSearchList.className = 'keyword-list';
        
        // For Domain category, show the three subcategories (Technology, Framework, Action)
        if (categoryKey === 'domain') {
            const subSubcategories = ['Technology', 'Framework', 'Action'];
            subSubcategories.forEach(subSubcategory => {
                const subSubcategoryDiv = document.createElement('div');
                subSubcategoryDiv.className = 'keyword-sub-subcategory';
                subSubcategoryDiv.style.marginLeft = '20px';
                subSubcategoryDiv.style.marginTop = '8px';
                subSubcategoryDiv.style.padding = '8px';
                subSubcategoryDiv.style.border = '1px solid #e5e7eb';
                subSubcategoryDiv.style.borderRadius = '4px';
                subSubcategoryDiv.style.backgroundColor = '#f9fafb';
                
                const subSubcategoryHeader = document.createElement('div');
                subSubcategoryHeader.style.display = 'flex';
                subSubcategoryHeader.style.justifyContent = 'space-between';
                subSubcategoryHeader.style.alignItems = 'center';
                subSubcategoryHeader.style.marginBottom = '4px';
                
                subSubcategoryHeader.innerHTML = `
                    <h6 style="margin: 0; font-size: 0.9rem; font-weight: 600; color: var(--text);">${subSubcategory}</h6>
                    <button class="select-all-btn" style="font-size: 0.8rem; padding: 2px 8px;" onclick="selectAllBooleanSearches('${categoryKey}', '${subcategory}', '${subSubcategory}')">Select All</button>
                `;
                
                const subSubcategoryContent = document.createElement('div');
                subSubcategoryContent.style.color = '#7f8c8d';
                subSubcategoryContent.style.fontStyle = 'italic';
                subSubcategoryContent.style.fontSize = '0.85rem';
                subSubcategoryContent.textContent = 'No boolean searches found in this subcategory.';
                
                subSubcategoryDiv.appendChild(subSubcategoryHeader);
                subSubcategoryDiv.appendChild(subSubcategoryContent);
                booleanSearchList.appendChild(subSubcategoryDiv);
            });
        } else {
            // Add a message for empty subcategories
            const noSearchesMsg = document.createElement('div');
            noSearchesMsg.style.padding = '10px';
            noSearchesMsg.style.color = '#7f8c8d';
            noSearchesMsg.style.fontStyle = 'italic';
            noSearchesMsg.textContent = 'No boolean searches found in this subcategory.';
            booleanSearchList.appendChild(noSearchesMsg);
        }
        
        subcategoryDiv.appendChild(subcategoryHeader);
        subcategoryDiv.appendChild(booleanSearchList);
        container.appendChild(subcategoryDiv);
    });
}

function getBooleanSearchesFromSubcategory(categoryKey, subcategory) {
    // Get the current data from localStorage for the current user
    const userId = currentUser ? currentUser.uid : 'guest';
    const storageKey = `pluginData_${userId}`;
    const savedData = localStorage.getItem(storageKey);
    console.log('getBooleanSearchesFromSubcategory called with:', categoryKey, subcategory);
    console.log('savedData exists for user:', userId, !!savedData);
    
    if (!savedData) {
        console.log('No saved data found for user:', userId);
        return [];
    }
    
    const data = JSON.parse(savedData);
    console.log('Parsed data for user:', userId, data);
    
    const categoryData = data.categoryData;
    console.log('categoryData:', categoryData);
    
    // Map lowercase keys to capitalized category names
    const categoryMapping = {
        'titles': 'Titles',
        'domain': 'Domain',
        'industry': 'Industry',
        'context': 'Context',
        'certifications': 'Certifications & Clearances'
    };
    
    const actualCategoryKey = categoryMapping[categoryKey];
    console.log(`Mapping ${categoryKey} to ${actualCategoryKey}`);
    
    if (!categoryData || !categoryData[actualCategoryKey] || !categoryData[actualCategoryKey][subcategory]) {
        console.log('Missing data structure:', {
            hasCategoryData: !!categoryData,
            hasCategoryKey: !!(categoryData && categoryData[actualCategoryKey]),
            hasSubcategory: !!(categoryData && categoryData[actualCategoryKey] && categoryData[actualCategoryKey][subcategory])
        });
        return [];
    }
    
    const booleanSearches = [];
    
    // Handle different data structures based on category
    if (categoryKey === 'domain') {
        // Domain has three-level structure: Domain -> Subcategory -> Technology/Framework/Action
        Object.keys(categoryData[actualCategoryKey][subcategory]).forEach(subSubcategory => {
            const subSubcategoryData = categoryData[actualCategoryKey][subcategory][subSubcategory];
            Object.keys(subSubcategoryData).forEach(title => {
                const booleanTerms = subSubcategoryData[title];
                if (booleanTerms && booleanTerms.length > 0) {
                    booleanSearches.push({
                        title: title,
                        booleanOptions: booleanTerms,
                        category: categoryKey,
                        subcategory: subcategory,
                        subSubcategory: subSubcategory
                    });
                }
            });
        });
    } else {
        // Other categories have two-level structure: Category -> Subcategory
        Object.keys(categoryData[actualCategoryKey][subcategory]).forEach(title => {
            const booleanTerms = categoryData[actualCategoryKey][subcategory][title];
            if (booleanTerms && booleanTerms.length > 0) {
                booleanSearches.push({
                    title: title,
                    booleanOptions: booleanTerms,
                    category: categoryKey,
                    subcategory: subcategory
                });
            }
        });
    }
    
    console.log('Found boolean searches:', booleanSearches);
    return booleanSearches;
}

function selectAllBooleanSearches(categoryKey, subcategory, subSubcategory = null) {
    let selector;
    if (subSubcategory) {
        selector = `input[data-category="${categoryKey}"][data-subcategory="${subcategory}"][data-sub-subcategory="${subSubcategory}"]`;
    } else {
        selector = `input[data-category="${categoryKey}"][data-subcategory="${subcategory}"]`;
    }
    
    const checkboxes = document.querySelectorAll(selector);
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked;
    });
}

function selectAllCategorySearches(categoryKey) {
    const checkboxes = document.querySelectorAll(`input[data-category="${categoryKey}"]`);
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked;
    });
}

function saveSelectedKeywords() {
    // Get ALL checkboxes (both checked and unchecked)
    const allCheckboxes = document.querySelectorAll('.keyword-checkbox-item input[type="checkbox"]');
    const selectedSearches = [];
    
    allCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const searchData = JSON.parse(checkbox.dataset.searchData);
            selectedSearches.push(searchData);
        }
    });
    
    if (currentRole) {
        currentRole.selectedBooleanSearches = selectedSearches;
        saveData();
    }
    
    closeKeywordSelectorModal();
    
    // Go to boolean builder
    document.getElementById('roleDashboard').style.display = 'none';
    document.getElementById('booleanBuilder').style.display = 'block';
            document.getElementById('currentRoleTitle').textContent = `${currentRole.name}`;
    
    // Load role-specific data
    document.getElementById('booleanString').value = currentRole.booleanString || '';
            recentlyUsedSearches = currentRole.recentlyUsedSearches || [];
        savedSearches = currentRole.savedSearches || [];
    
    // Render role-specific content
    renderKeywordsFromDirectory();
    renderRecentlyUsedSearches();
    renderSelectedBooleanSearches();
}

function renderSelectedBooleanSearches() {
    const container = document.getElementById('selectedKeywordsContainer');
    if (!container) {
        console.log('selectedKeywordsContainer not found in renderSelectedBooleanSearches');
        return;
    }
    
    // Add selected boolean searches section at the top
    const selectedSection = document.createElement('div');
    selectedSection.className = 'keyword-category';
    
    // Create header with title and add button
    const headerHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h4 style="margin: 0;">Selected Keywords</h4>
            <button class="add-more-searches-btn" onclick="openKeywordSelector()" style="
                background: var(--primary);
                color: white;
                border: none;
                border-radius: var(--radius-sm);
                padding: 6px 12px;
                font-size: 0.85rem;
                font-weight: 500;
                cursor: pointer;
                transition: background 0.2s;
            ">Add More Searches</button>
        </div>
    `;
    
    // Create content based on whether there are existing searches
    let contentHtml = '';
    if (!currentRole || !currentRole.selectedBooleanSearches || currentRole.selectedBooleanSearches.length === 0) {
        contentHtml = `
            <div style="text-align: center; color: #7f8c8d; font-style: italic; padding: 20px;">
                <p>No selected searches yet.</p>
                <p>Click "Add More Searches" to get started!</p>
            </div>
        `;
    } else {
        contentHtml = `
            <div class="keyword-list">
                ${currentRole.selectedBooleanSearches.map(search => `
                    <div class="boolean-search-group">
                        <div class="search-title">${search.title}</div>
                        <div class="search-options">
                            ${search.booleanOptions.map(option => {
                                // Remove quotes for display and get the raw term
                                let displayOption = option;
                                let rawTerm = option;
                                
                                // If the option has quotes, remove them for display and use raw term for insertion
                                if (option.startsWith('"') && option.endsWith('"')) {
                                    displayOption = option.slice(1, -1);
                                    rawTerm = displayOption; // Use the unquoted version for insertion
                                }
                                
                                return `<button class="keyword-btn" onclick="insertAtCursor('${rawTerm.replace(/'/g, "\\'")}')">${displayOption}</button>`;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    selectedSection.innerHTML = headerHtml + contentHtml;
    
    // Insert at the beginning of the container
    container.insertBefore(selectedSection, container.firstChild);
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
        currentRole.lastModified = new Date().toISOString();
        saveData();
    }
    
    // Switch back to dashboard
    document.getElementById('roleDashboard').style.display = 'block';
    document.getElementById('booleanBuilder').style.display = 'none';
    
    // Reset current role
    currentRole = null;
    recentlyUsedSearches = [];
    
    // Re-render dashboard
    renderRolesDashboard();
}

function renameRole(roleId) {
    const role = roles.find(r => r.id === roleId);
    if (role) {
        const newName = prompt('Enter new name for this role:', role.name);
        if (newName && newName.trim() && newName !== role.name) {
            role.name = newName.trim();
            role.lastModified = new Date().toISOString();
            saveData();
            renderRolesDashboard();
        }
    }
}

async function deleteRole(roleId) {
    const role = roles.find(r => r.id === roleId);
    if (role) {
        const confirmed = await customConfirm('Delete Role', `Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`);
        if (confirmed) {
            roles = roles.filter(r => r.id !== roleId);
            saveData();
            renderRolesDashboard();
        }
    }
}

// Demo Mode functionality
function enterDemoMode() {
    // Hide the role dashboard
    const roleDashboard = document.getElementById('roleDashboard');
    const booleanBuilder = document.getElementById('booleanBuilder');
    
    if (roleDashboard && booleanBuilder) {
        roleDashboard.style.display = 'none';
        booleanBuilder.style.display = 'block';
        
        // Set demo mode title
        const currentRoleTitle = document.getElementById('currentRoleTitle');
        if (currentRoleTitle) {
            currentRoleTitle.textContent = 'Demo Mode - Boolean Keyword Builder';
        }
        
        // Clear any existing boolean string
        const booleanString = document.getElementById('booleanString');
        if (booleanString) {
            booleanString.value = '';
            validateBooleanSyntax();
        }
        
        // Render keywords from directory for demo
        renderKeywordsFromDirectory();
        
        // Render recently used searches
        renderRecentlyUsedSearches();
        renderSavedSearches();
    }
}

// Insert text at cursor position in the boolean string textarea
function insertAtCursor(text) {
    const textarea = document.getElementById('booleanString');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    
    // Check if auto operator should be inserted
    const autoAndBtn = document.getElementById('autoAndBtn');
    const autoOrBtn = document.getElementById('autoOrBtn');
    
    console.log('=== AUTO OPERATOR DEBUG ===');
    console.log('Auto buttons found:', { autoAndBtn: !!autoAndBtn, autoOrBtn: !!autoOrBtn });
    console.log('Auto AND active:', autoAndBtn?.classList.contains('active'));
    console.log('Auto OR active:', autoOrBtn?.classList.contains('active'));
    
    const activeButton = autoAndBtn?.classList.contains('active') ? autoAndBtn : 
                        autoOrBtn?.classList.contains('active') ? autoOrBtn : null;
    const shouldAutoInsert = activeButton && activeButton.classList.contains('active');
    
    console.log('Active button:', activeButton);
    console.log('Should auto insert:', shouldAutoInsert);
    console.log('Current textarea value:', value);
    console.log('Text to insert:', text);
    
    let textToInsert = text;
    const operators = ['(', ')', '"', ' AND ', ' OR ', ' NOT ', ' '];
    if (!operators.includes(text) && !text.startsWith('"') && !text.endsWith('"')) {
        textToInsert = `"${text}"`;
    }
    
    // Auto-insert operator if enabled and there's existing content
    if (shouldAutoInsert && value.trim() !== '' && !operators.includes(text)) {
        const currentOperator = activeButton.getAttribute('data-operator');
        const operatorToInsert = ` ${currentOperator} `;
        
        console.log('Current operator:', currentOperator);
        console.log('Operator to insert:', operatorToInsert);
        
        // Function to check if there's a valid keyword or quoted phrase before cursor
        function hasValidKeywordBeforeCursor() {
            const textBeforeCursor = value.substring(0, start).trim();
            if (textBeforeCursor.length === 0) return false;
            
            // Check if the text before cursor ends with a valid keyword or quoted phrase
            // Valid patterns: word, "quoted phrase", or word followed by space
            const validEndings = [
                /[a-zA-Z0-9]+$/,           // Ends with alphanumeric word
                /"[^"]*"$/,                // Ends with quoted phrase
                /[a-zA-Z0-9]+\s+$/         // Ends with word followed by space
            ];
            
            return validEndings.some(pattern => pattern.test(textBeforeCursor));
        }
        
        // Check if the cursor is at the end or if we need to add operator
        const cursorAtEnd = start === value.length;
        const lastChar = value.charAt(start - 1);
        const hasValidKeyword = hasValidKeywordBeforeCursor();
        
        console.log('Cursor at end:', cursorAtEnd);
        console.log('Last char:', lastChar);
        console.log('Has valid keyword before cursor:', hasValidKeyword);
        
        // Only add operator if there's a valid keyword before the cursor
        if (hasValidKeyword) {
            if (cursorAtEnd) {
                textToInsert = operatorToInsert + textToInsert;
                console.log('Adding operator at end');
            } else if (lastChar !== ' ' && lastChar !== '(' && lastChar !== '"') {
                textToInsert = operatorToInsert + textToInsert;
                console.log('Adding operator in middle');
            }
        } else {
            console.log('No valid keyword before cursor - skipping operator');
        }
    }
    
    console.log('Final text to insert:', textToInsert);
    console.log('=== END DEBUG ===');
    
    textarea.value = value.substring(0, start) + textToInsert + value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
    textarea.focus();
    
    // Validate syntax after insertion
    validateBooleanSyntax();
}

// Remove duplicate insertAtCursor function - this is the duplicate
// function insertAtCursor(text) {
//     const textarea = document.getElementById('booleanString');
//     const start = textarea.selectionStart;
//     const end = textarea.selectionEnd;
//     const value = textarea.value;
//     
//     // Check if auto operator should be inserted
//     const autoAndBtn = document.getElementById('autoAndBtn');
//     const autoOrBtn = document.getElementById('autoOrBtn');
//     const activeButton = autoAndBtn.classList.contains('active') ? autoAndBtn : 
//                         autoOrBtn.classList.contains('active') ? autoOrBtn : null;
//     const shouldAutoInsert = activeButton && activeButton.classList.contains('active');
//     
//     let textToInsert = text;
//     const operators = ['(', ')', '"', ' AND ', ' OR ', ' NOT ', ' '];
//     if (!operators.includes(text) && !text.startsWith('"') && !text.endsWith('"')) {
//         textToInsert = `"${text}"`;
//     }
//     
//     // Auto-insert operator if enabled and there's existing content
//     if (shouldAutoInsert && value.trim() !== '' && !operators.includes(text)) {
//         const currentOperator = activeButton.getAttribute('data-operator');
//         const operatorToInsert = ` ${currentOperator} `;
//         
//         // Check if the cursor is at the end or if we need to add operator
//         const cursorAtEnd = start === value.length;
//         const lastChar = value.charAt(start - 1);
//         const needsOperator = lastChar !== ' ' && lastChar !== '(' && lastChar !== '"';
//         
//         if (cursorAtEnd && needsOperator) {
//             textToInsert = operatorToInsert + textToInsert;
//         } else if (!cursorAtEnd && needsOperator) {
//             textToInsert = operatorToInsert + textToInsert;
//         }
//     }
//     
//     textarea.value = value.substring(0, start) + textToInsert + value.substring(end);
//     textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
//     textarea.focus();
//     
//     // Validate syntax after insertion
//     validateBooleanSyntax();
// }

// Boolean syntax validation
function validateBooleanSyntax() {
    const textarea = document.getElementById('booleanString');
    const searchString = textarea.value;
    const validationResult = analyzeBooleanSyntax(searchString);
    
    const originalErrorCount = validationResult.errors.length;
    console.log('Before deduplication:', originalErrorCount, 'errors');
    
    // Deduplicate errors before displaying
    validationResult.errors = deduplicateErrors(validationResult.errors);
    validationResult.warnings = deduplicateErrors(validationResult.warnings);
    
    console.log('After deduplication:', validationResult.errors.length, 'errors');
    
    // Check for error threshold modals using original count (including duplicates)
    console.log('Checking error threshold modals. Original error count:', originalErrorCount);
    if (originalErrorCount > 0) {
        console.log('Calling showErrorThresholdModal with original error count:', originalErrorCount);
        showErrorThresholdModal(originalErrorCount);
    }
    
    // Update validation display
    updateSyntaxValidationDisplay(validationResult);
    
    return validationResult.isValid;
}

// Function to deduplicate errors and warnings by grouping identical messages
function deduplicateErrors(errors) {
    console.log('Deduplicating errors:', errors.length, 'errors');
    const errorGroups = {};
    
    errors.forEach(error => {
        // Create a unique key based on error type and a normalized message
        // For dynamic messages, we'll group by type and base message pattern
        let normalizedMessage = error.message;
        
        // Handle dynamic content in error messages
        if (error.type === 'unmatched_open') {
            // Group all unmatched opening parenthesis errors together
            normalizedMessage = `❌ Unmatched opening parenthesis`;
        } else if (error.type === 'unmatched_close') {
            // Group all unmatched closing parenthesis errors together
            normalizedMessage = `❌ Unmatched closing parenthesis`;
        } else if (error.type === 'operator_in_quotes') {
            // Extract the operator name for grouping
            const operatorMatch = error.message.match(/Boolean operator "([^"]+)" found inside quotes/);
            if (operatorMatch) {
                normalizedMessage = `⚠️ Boolean operator "OPERATOR" found inside quotes: QUOTED_PHRASE`;
            }
        } else if (error.type === 'unquoted_phrase') {
            // Group all unquoted phrase warnings together
            normalizedMessage = `⚠️ Unquoted multi-word phrase: "PHRASE"`;
        } else if (error.type === 'whitespace_in_quotes') {
            // Group all whitespace in quotes warnings together
            normalizedMessage = `⚠️ Unnecessary whitespace in quoted phrase: QUOTED_PHRASE`;
        } else if (error.type === 'lowercase_operators') {
            // Group all lowercase operator warnings together
            normalizedMessage = `⚠️ Lowercase boolean operator: "OPERATOR"`;
        } else if (error.type === 'consecutive_operators_enhanced') {
            // Group consecutive operators by the pattern
            normalizedMessage = `❌ Consecutive operators: OPERATOR_PATTERN`;
        } else if (error.type === 'improper_quote_separation') {
            // Group quote separation errors
            normalizedMessage = `❌ Quoted phrase not separated from unquoted keyword: PHRASE_PATTERN`;
        } else if (error.type === 'consecutive_quotes') {
            // Group consecutive quotes errors
            normalizedMessage = `❌ Consecutive quoted phrases without separator: QUOTE_PATTERN`;
        } else if (error.type === 'invalid_empty_group') {
            // Group invalid empty group errors
            normalizedMessage = `❌ Invalid group structure: GROUP_PATTERN`;
        } else if (error.type === 'empty_parentheses') {
            // Group empty parentheses errors
            normalizedMessage = `❌ Empty parentheses found`;
        } else if (error.type === 'empty_quotes') {
            // Group empty quotes errors
            normalizedMessage = `❌ Empty quotation marks found`;
        } else if (error.type === 'unmatched_quotes') {
            // Group unmatched quotes errors
            normalizedMessage = `❌ Unmatched quotes found`;
        } else if (error.type === 'operator_at_start') {
            // Group operator at start errors
            normalizedMessage = `❌ Boolean operator at the beginning of search`;
        } else if (error.type === 'operator_at_end') {
            // Group operator at end errors
            normalizedMessage = `❌ Boolean operator at the end of search`;
        } else if (error.type === 'dangling_operator_start') {
            // Group dangling operator start errors
            normalizedMessage = `❌ Dangling operator - no valid keyword before`;
        } else if (error.type === 'dangling_operator_end') {
            // Group dangling operator end errors
            normalizedMessage = `❌ Dangling operator - no valid keyword after`;
        } else if (error.type === 'consecutive_operators') {
            // Group consecutive operators errors
            normalizedMessage = `❌ Consecutive boolean operators`;
        } else if (error.type === 'missing_spaces') {
            // Group missing spaces warnings
            normalizedMessage = `⚠️ Missing spaces around boolean operators`;
        } else if (error.type === 'long_search') {
            // Group long search warnings
            normalizedMessage = `⚠️ Search string is very long`;
        }
        
        const key = `${error.type}:${normalizedMessage}`;
        
        if (!errorGroups[key]) {
            errorGroups[key] = {
                ...error,
                count: 1,
                positions: error.position !== undefined ? [error.position] : []
            };
        } else {
            errorGroups[key].count++;
            if (error.position !== undefined) {
                errorGroups[key].positions.push(error.position);
            }
        }
    });
    
    // Convert grouped errors back to array with count display
    const result = Object.values(errorGroups).map(groupedError => {
        const deduplicatedError = { ...groupedError };
        
        // Update message to include count if more than 1
        if (groupedError.count > 1) {
            // Remove the count from the message if it already has one
            const baseMessage = groupedError.message.replace(/\s*\(x\d+\)$/, '');
            deduplicatedError.message = `${baseMessage} (x${groupedError.count})`;
        }
        
        // Keep the first position for highlighting (most relevant)
        if (deduplicatedError.positions && deduplicatedError.positions.length > 0) {
            deduplicatedError.position = deduplicatedError.positions[0];
        }
        
        // Remove the count and positions properties to maintain original structure
        delete deduplicatedError.count;
        delete deduplicatedError.positions;
        
        return deduplicatedError;
    });
    
    console.log('Deduplication result:', result.length, 'errors after deduplication');
    return result;
}

function analyzeBooleanSyntax(searchString) {
    const result = {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
        fixes: []
    };
    
    // 1. ✅ Smart Error Detection - Enhanced Parentheses Checking
    const parenthesesStack = [];
    const parenthesesPositions = [];
    
    for (let i = 0; i < searchString.length; i++) {
        const char = searchString[i];
        
        if (char === '(') {
            parenthesesStack.push({ char: '(', position: i });
            parenthesesPositions.push({ type: 'open', position: i });
        } else if (char === ')') {
            if (parenthesesStack.length === 0) {
                result.errors.push({
                    type: 'unmatched_close',
                    position: i,
                    message: '❌ Unmatched closing parenthesis',
                    suggestion: 'Remove this closing parenthesis or add an opening parenthesis',

                });
                result.isValid = false;
            } else {
                parenthesesStack.pop();
            }
            parenthesesPositions.push({ type: 'close', position: i });
        }
    }
    
    // Check for unmatched opening parentheses
    while (parenthesesStack.length > 0) {
        const unmatched = parenthesesStack.pop();
        result.errors.push({
            type: 'unmatched_open',
            position: unmatched.position,
            message: '❌ Unmatched opening parenthesis',
            suggestion: 'Add a closing parenthesis or remove this opening parenthesis',
            
        });
        result.isValid = false;
    }
    
    // 2. ✅ Enhanced Dangling Operators Detection
    const operatorPattern = /\s+(AND|OR|NOT)\s+/gi;
    let match;
    let lastOperatorEnd = -1;
    
    while ((match = operatorPattern.exec(searchString)) !== null) {
        const operatorStart = match.index;
        const operatorEnd = match.index + match[0].length;
        
        // Check for consecutive operators
        if (lastOperatorEnd !== -1 && match.index === lastOperatorEnd) {
            result.errors.push({
                type: 'consecutive_operators',
                position: match.index,
                message: '❌ Consecutive boolean operators',
                suggestion: 'Remove one of the consecutive operators',
            });
            result.isValid = false;
        }
        
        // Enhanced check for dangling operators
        const beforeOperator = searchString.substring(0, operatorStart).trim();
        const afterOperator = searchString.substring(operatorEnd).trim();
        
        // Check if there's valid content before the operator
        const hasValidBefore = checkValidContentBefore(beforeOperator);
        const hasValidAfter = checkValidContentAfter(afterOperator);
        
        if (!hasValidBefore) {
            result.errors.push({
                type: 'dangling_operator_start',
                position: operatorStart,
                message: '❌ Dangling operator - no valid keyword before',
                suggestion: 'Remove the operator or add a keyword before it'
            });
            result.isValid = false;
        }
        
        if (!hasValidAfter && afterOperator.length > 0) {
            result.errors.push({
                type: 'dangling_operator_end',
                position: operatorEnd,
                message: '❌ Dangling operator - no valid keyword after',
                suggestion: 'Remove the operator or add a keyword after it'
            });
            result.isValid = false;
        }
        
        lastOperatorEnd = operatorEnd;
    }
    
    // Helper functions for enhanced operator validation
    function checkValidContentBefore(text) {
        if (!text) return false;
        
        // Check for quoted terms at the end
        if (/"$/.test(text)) {
            return true;
        }
        
        // Check for alphanumeric terms at the end
        if (/[a-zA-Z0-9]+$/.test(text)) {
            return true;
        }
        
        // Check for closing parenthesis at the end (valid expression)
        if (/\)$/.test(text)) {
            return true;
        }
        
        // Check for valid expression ending with closing parenthesis
        // This handles cases like ("GOLD" OR "Boolean")
        const trimmed = text.trim();
        if (trimmed.endsWith(')')) {
            // Count parentheses to ensure it's a balanced expression
            let openCount = 0;
            let closeCount = 0;
            for (let i = 0; i < trimmed.length; i++) {
                if (trimmed[i] === '(') openCount++;
                if (trimmed[i] === ')') closeCount++;
            }
            // If we have more closing than opening, it's a valid expression
            if (closeCount > openCount) {
                return true;
            }
        }
        
        return false;
    }
    
    function checkValidContentAfter(text) {
        if (!text) return false;
        
        // Check for quoted terms at the start
        if (/^"/.test(text)) {
            return true;
        }
        
        // Check for alphanumeric terms at the start
        if (/^[a-zA-Z0-9]+/.test(text)) {
            return true;
        }
        
        // Check for opening parenthesis at the start (valid expression)
        if (/^\(/.test(text)) {
            return true;
        }
        
        return false;
    }
    
    // 3. ✅ Empty Groups Detection
    const emptyParentheses = searchString.match(/\(\s*\)/g);
    if (emptyParentheses) {
        result.errors.push({
            type: 'empty_parentheses',
            message: '❌ Empty parentheses found',
            suggestion: 'Remove empty parentheses or add content inside them'
        });
        result.isValid = false;
    }
    
    // 4. ✅ Empty Quotation Marks Detection
    const emptyQuotes = searchString.match(/""/g);
    if (emptyQuotes) {
        result.errors.push({
            type: 'empty_quotes',
            message: '❌ Empty quotation marks found',
            suggestion: 'Remove empty quotes or add content inside them'
        });
        result.isValid = false;
    }
    
    // 5. ✅ Unquoted Multi-Word Phrases Detection (Fixed)
    // Only flag actual multi-word phrases, not keyword OR keyword patterns
    const unquotedPhrases = searchString.match(/\b[A-Za-z]+\s+[A-Za-z]+(?=\s+(?:AND|OR|NOT)|$)/g);
    if (unquotedPhrases) {
        unquotedPhrases.forEach(phrase => {
            // Skip if the phrase contains a boolean operator
            if (/\b(AND|OR|NOT)\b/i.test(phrase)) {
                return;
            }
            
            // Skip if it's a valid keyword OR keyword pattern
            const words = phrase.split(/\s+/);
            if (words.length === 2 && /^(AND|OR|NOT)$/i.test(words[1])) {
                return;
            }
            
            result.warnings.push({
                type: 'unquoted_phrase',
                message: `⚠️ Unquoted multi-word phrase: "${phrase}"`,
                suggestion: 'Consider wrapping in quotes for exact matching'
            });
        });
    }
    
    // 6. ✅ Enhanced Quote Validation
    const quoteCount = (searchString.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
        result.errors.push({
            type: 'unmatched_quotes',
            message: '❌ Unmatched quotes found',
            suggestion: 'Check for missing opening or closing quotes'
        });
        result.isValid = false;
    }
    
    // 7. ✅ Operators at Start/End Detection
    const trimmedString = searchString.trim();
    if (trimmedString.match(/^(AND|OR|NOT)\s+/i)) {
        result.errors.push({
            type: 'operator_at_start',
            position: 0,
            message: '❌ Boolean operator at the beginning of search',
            suggestion: 'Remove the operator or add a keyword before it'
        });
        result.isValid = false;
    }
    
    if (trimmedString.match(/\s+(AND|OR|NOT)$/i)) {
        const match = trimmedString.match(/\s+(AND|OR|NOT)$/i);
        result.errors.push({
            type: 'operator_at_end',
            position: searchString.length - match[0].length,
            message: '❌ Boolean operator at the end of search',
            suggestion: 'Remove the operator or add a keyword after it',

        });
        result.isValid = false;
    }
    
    // 8. ✅ Missing Spaces Warning
    const missingSpaces = searchString.match(/\w+(AND|OR|NOT)\w+|\w+(AND|OR|NOT)\s+|\s+(AND|OR|NOT)\w+/gi);
    if (missingSpaces) {
        result.warnings.push({
            type: 'missing_spaces',
            message: '⚠️ Missing spaces around boolean operators',
            suggestion: 'Add spaces around operators for better readability',

        });
    }
    
    // 9. ✅ Long Search Warning
    if (searchString.length > 1000) {
        result.warnings.push({
            type: 'long_search',
            message: '⚠️ Search string is very long',
            suggestion: 'Consider breaking this into multiple searches'
        });
    }
    
    // 10. ✅ Whitespace in Quoted Phrases Warning
    const quotedPhrases = searchString.match(/"[^"]*"/g);
    if (quotedPhrases) {
        quotedPhrases.forEach(phrase => {
            const content = phrase.slice(1, -1); // Remove quotes
            if (content.startsWith(' ') || content.endsWith(' ')) {
                result.warnings.push({
                    type: 'whitespace_in_quotes',
                    message: `⚠️ Unnecessary whitespace in quoted phrase: ${phrase}`,
                    suggestion: 'This phrase has unnecessary whitespace inside the quotes — it may return no results.',

                });
            }
        });
    }
    
    // 11. ✅ Lowercase Boolean Operators Warning (Fixed)
    // Only flag actual lowercase operators, not uppercase ones
    const lowercaseOperators = searchString.match(/\s+(and|or|not)\s+/gi);
    if (lowercaseOperators) {
        lowercaseOperators.forEach(operator => {
            const trimmedOperator = operator.trim();
            // Only flag if it's actually lowercase (not mixed case)
            if (trimmedOperator === trimmedOperator.toLowerCase()) {
                const upperOperator = trimmedOperator.toUpperCase();
                result.warnings.push({
                    type: 'lowercase_operators',
                    message: `⚠️ Lowercase boolean operator: "${trimmedOperator}"`,
                    suggestion: 'Convert to uppercase for consistency',

                });
            }
        });
    }
    
    // 12. ✅ Enhanced Empty Groups Detection (including cases like (AND "Java"))
    const emptyGroups = searchString.match(/\(\s*(AND|OR|NOT)\s+[^)]*\)/g);
    if (emptyGroups) {
        emptyGroups.forEach(group => {
            result.errors.push({
                type: 'invalid_empty_group',
                message: `❌ Invalid group structure: ${group}`,
                suggestion: 'Remove the group or fix the structure',

            });
            result.isValid = false;
        });
    }
    
    // 13. ✅ Enhanced Consecutive Operators Detection
    const consecutiveOperators = searchString.match(/\s+(AND|OR|NOT)\s+(AND|OR|NOT)\s+/gi);
    if (consecutiveOperators) {
        consecutiveOperators.forEach(match => {
            result.errors.push({
                type: 'consecutive_operators_enhanced',
                message: `❌ Consecutive operators: ${match.trim()}`,
                suggestion: 'Remove one of the consecutive operators',

            });
            result.isValid = false;
        });
    }
    

    
    // 15. ✅ Proper Quote Separation Detection (Completely Rewritten)
    // Use proper tokenization to avoid false positives on valid expressions
    
    // Helper function to properly tokenize Boolean expressions
    function tokenizeBooleanExpression(str) {
        const tokens = [];
        let current = '';
        let inQuotes = false;
        let i = 0;
        
        while (i < str.length) {
            const char = str[i];
            
            if (char === '"') {
                if (inQuotes) {
                    // End of quoted phrase
                    current += char;
                    tokens.push({ type: 'quoted', value: current, start: i - current.length + 1, end: i });
                    current = '';
                    inQuotes = false;
                } else {
                    // Start of quoted phrase
                    if (current.trim()) {
                        tokens.push({ type: 'unquoted', value: current.trim(), start: i - current.length, end: i - 1 });
                        current = '';
                    }
                    current = char;
                    inQuotes = true;
                }
            } else if (inQuotes) {
                current += char;
            } else if (/\s/.test(char)) {
                // Whitespace - potential separator
                if (current.trim()) {
                    tokens.push({ type: 'unquoted', value: current.trim(), start: i - current.length, end: i - 1 });
                    current = '';
                }
            } else {
                current += char;
            }
            i++;
        }
        
        // Handle any remaining content
        if (current.trim()) {
            tokens.push({ type: 'unquoted', value: current.trim(), start: i - current.length, end: i - 1 });
        }
        
        return tokens;
    }
    
    // Tokenize the search string
    const tokens = tokenizeBooleanExpression(searchString);
    
    // Pattern 1: Check for fused quoted + unquoted keywords (IMPROVED)
    for (let i = 0; i < tokens.length - 1; i++) {
        const current = tokens[i];
        const next = tokens[i + 1];
        
        if (current.type === 'quoted' && next.type === 'unquoted') {
            // Check if there's a valid separator between them
            const betweenText = searchString.substring(current.end + 1, next.start);
            const hasValidSeparator = /\s+(AND|OR|NOT)\s+/.test(betweenText) || 
                                    /\s+/.test(betweenText) ||
                                    /^\(/.test(betweenText) ||
                                    /^\)/.test(betweenText) ||
                                    /^(AND|OR|NOT)/.test(next.value) ||
                                    /^\)$/.test(next.value) ||
                                    /^\($/.test(next.value);
            
            // Additional check: if the next token is just a parenthesis, it's valid
            if (next.value === ')' || next.value === '(') {
                continue; // Skip this check - parentheses are valid after quotes
            }
            
            if (!hasValidSeparator) {
                result.errors.push({
                    type: 'improper_quote_separation',
                    position: current.end + 1,
                    message: `❌ Quoted phrase not separated from unquoted keyword: "${current.value}${next.value}"`,
                    suggestion: 'Add a space or operator between quoted and unquoted terms'
                });
                result.isValid = false;
            }
        }
    }
    
    // Pattern 2: Check for consecutive quoted phrases without separator
    for (let i = 0; i < tokens.length - 1; i++) {
        const current = tokens[i];
        const next = tokens[i + 1];
        
        if (current.type === 'quoted' && next.type === 'quoted') {
            // Check if there's a valid separator between them
            const betweenText = searchString.substring(current.end + 1, next.start);
            const hasValidSeparator = /\s+(AND|OR|NOT)\s+/.test(betweenText) || 
                                    /\s+/.test(betweenText) ||
                                    /^\(/.test(betweenText);
            
            if (!hasValidSeparator) {
                result.errors.push({
                    type: 'consecutive_quotes',
                    position: current.end + 1,
                    message: `❌ Consecutive quoted phrases without separator: ${current.value}${next.value}`,
                    suggestion: 'Add an operator between quoted phrases'
                });
                result.isValid = false;
            }
        }
    }
    
    // Pattern 3: Check for operators inside quotes (only if truly inside a single quote)
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        if (token.type === 'quoted') {
            // Check if the quoted content contains a boolean operator
            const content = token.value.slice(1, -1); // Remove quotes
            const operatorMatch = content.match(/\b(AND|OR|NOT)\b/i);
            
            if (operatorMatch) {
                // Check if this is part of a valid pattern like "phrase" OR "phrase"
                const beforeToken = i > 0 ? tokens[i - 1] : null;
                const afterToken = i < tokens.length - 1 ? tokens[i + 1] : null;
                
                const isValidPattern = (beforeToken && beforeToken.type === 'quoted') ||
                                    (afterToken && afterToken.type === 'quoted');
                
                if (!isValidPattern) {
                    result.warnings.push({
                        type: 'operator_in_quotes',
                        position: token.start,
                        message: `⚠️ Boolean operator "${operatorMatch[1]}" found inside quotes: ${token.value}`,
                        suggestion: 'Extract the operator or ensure it\'s part of an intentional phrase'
                    });
                }
            }
        }
    }
    
    return result;
}

function updateSyntaxValidationDisplay(validationResult) {
    const textarea = document.getElementById('booleanString');
    const validationContainer = document.getElementById('syntaxValidationContainer');
    
    if (!validationContainer) {
        // Create validation container if it doesn't exist
        const container = document.createElement('div');
        container.id = 'syntaxValidationContainer';
        container.className = 'syntax-validation';
        textarea.parentNode.insertBefore(container, textarea.nextSibling);
    }
    
    const container = document.getElementById('syntaxValidationContainer');
    
    // 4. ✅ Real-Time Syntax Validation - Color-coded styling
    textarea.classList.remove('syntax-error', 'syntax-warning', 'syntax-valid');
    
    if (validationResult.isValid && validationResult.errors.length === 0 && validationResult.warnings.length === 0) {
        // 🟢 Green = valid
        textarea.classList.add('syntax-valid');
        container.innerHTML = `
            <div class="validation-success">
                <div class="validation-header">
                    <span class="validation-icon">✅</span>
                    <span class="validation-title">Search syntax is valid</span>
                </div>
            </div>
        `;
    } else if (validationResult.errors.length > 0) {
        // 🔴 Red = error
        textarea.classList.add('syntax-error');
        let html = `
            <div class="validation-errors">
                <div class="validation-header">
                    <span class="validation-icon">❌</span>
                    <span class="validation-title">${validationResult.errors.length} Syntax Error${validationResult.errors.length > 1 ? 's' : ''} Found:</span>
                </div>
                <div class="validation-list">
        `;
        
        validationResult.errors.forEach((error, index) => {
            html += `
                <div class="validation-item error" onclick="highlightError(${error.position || 0})">
                    <div class="validation-item-content">
                        <div class="validation-message">${error.message}</div>
                        <div class="validation-suggestion">${error.suggestion}</div>
                    </div>
                </div>
            `;
        });
        
        html += '</div></div>';
        
        // Add warnings if any
        if (validationResult.warnings.length > 0) {
            html += `
                <div class="validation-warnings">
                    <div class="validation-header">
                        <span class="validation-icon">⚠️</span>
                        <span class="validation-title">${validationResult.warnings.length} Warning${validationResult.warnings.length > 1 ? 's' : ''}:</span>
                    </div>
                    <div class="validation-list">
            `;
            
            validationResult.warnings.forEach((warning, index) => {
                html += `
                    <div class="validation-item warning">
                        <div class="validation-item-content">
                            <div class="validation-message">${warning.message}</div>
                            <div class="validation-suggestion">${warning.suggestion}</div>
                        </div>
                    </div>
                `;
            });
            
            html += '</div></div>';
        }
        
        container.innerHTML = html;
    } else if (validationResult.warnings.length > 0) {
        // 🟡 Yellow = warning
        textarea.classList.add('syntax-warning');
        let html = `
            <div class="validation-warnings">
                <div class="validation-header">
                    <span class="validation-icon">⚠️</span>
                    <span class="validation-title">${validationResult.warnings.length} Warning${validationResult.warnings.length > 1 ? 's' : ''}:</span>
                </div>
                <div class="validation-list">
        `;
        
        validationResult.warnings.forEach((warning, index) => {
            html += `
                <div class="validation-item warning">
                    <div class="validation-item-content">
                        <div class="validation-message">${warning.message}</div>
                        <div class="validation-suggestion">${warning.suggestion}</div>
                    </div>
                </div>
            `;
        });
        
        html += '</div></div>';
        container.innerHTML = html;
    }
}



function highlightError(position) {
    const textarea = document.getElementById('booleanString');
    textarea.focus();
    textarea.setSelectionRange(position, position + 1);
}

// Copy the boolean string to clipboard
async function copyBooleanString() {
    const textarea = document.getElementById('booleanString');
    const searchString = textarea.value.trim();
    
    if (searchString) {
        // Add to recently used searches
        addToRecentlyUsed(searchString);
        
        // Save to current role
        if (currentRole) {
            currentRole.booleanString = searchString;
            currentRole.lastModified = new Date().toISOString();
            saveData();
        }
        
        // Copy to clipboard
        textarea.select();
    document.execCommand('copy');
        
        // Show feedback
        const copyBtn = document.getElementById('copyBooleanString');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        copyBtn.style.backgroundColor = '#27ae60';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = '#27ae60';
        }, 2000);
    } else {
        await customAlert('Empty Search String', 'Please enter a search string before copying.');
    }
}

// Clear the boolean string
async function clearBooleanString() {
    const confirmed = await customConfirm('Clear Search String', 'Are you sure you want to clear the boolean string?');
    if (confirmed) {
        document.getElementById('booleanString').value = '';
    }
}

// Add search to recently used
function addToRecentlyUsed(searchString) {
    // Remove if already exists (to move to top)
    recentlyUsedSearches = recentlyUsedSearches.filter(item => item.search !== searchString);
    
    // Add to beginning of array
    recentlyUsedSearches.unshift({
        search: searchString,
        date: new Date().toISOString()
    });
    
    // Keep only the last 10 searches
    if (recentlyUsedSearches.length > 10) {
        recentlyUsedSearches = recentlyUsedSearches.slice(0, 10);
    }
    
    // Save to current role if in role context
    if (currentRole) {
        currentRole.recentlyUsedSearches = recentlyUsedSearches;
        currentRole.savedSearches = savedSearches;
        currentRole.lastModified = new Date().toISOString();
    }
    
    saveData();
    renderRecentlyUsedSearches();
}

// Render recently used searches
function renderRecentlyUsedSearches() {
    const container = document.getElementById('recentlyUsedContainer');
    container.innerHTML = '';
    
    if (recentlyUsedSearches.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d; font-style: italic; text-align: center;">No recently used searches. Copy a search to see it here.</p>';
        return;
    }
    
    recentlyUsedSearches.forEach((item, index) => {
        const searchDiv = document.createElement('div');
        searchDiv.className = 'recent-search-item';
        
        const searchText = document.createElement('div');
        searchText.className = 'recent-search-text';
        searchText.textContent = item.search;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'recent-search-actions';
        
        // Star button for saving/unsaving
        const starBtn = document.createElement('button');
        starBtn.className = 'recent-search-btn star-search-btn';
        const isSaved = savedSearches.some(saved => saved.search === item.search);
        starBtn.innerHTML = isSaved ? '★' : '☆';
        starBtn.title = isSaved ? 'Remove from saved searches' : 'Add to saved searches';
        starBtn.onclick = () => toggleSavedSearch(item.search);
        
        const useBtn = document.createElement('button');
        useBtn.className = 'recent-search-btn use-search-btn';
        useBtn.textContent = 'Use';
        useBtn.onclick = () => useRecentSearch(item.search);
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'recent-search-btn copy-search-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = () => copyRecentSearch(item.search);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'recent-search-btn delete-search-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteRecentSearch(index);
        
        actionsDiv.appendChild(starBtn);
        actionsDiv.appendChild(useBtn);
        actionsDiv.appendChild(copyBtn);
        actionsDiv.appendChild(deleteBtn);
        
        searchDiv.appendChild(searchText);
        searchDiv.appendChild(actionsDiv);
        
        container.appendChild(searchDiv);
    });
}

// Use a recent search
function useRecentSearch(searchString) {
    document.getElementById('booleanString').value = searchString;
    document.getElementById('booleanString').focus();
}

// Copy a recent search to clipboard
function copyRecentSearch(searchString) {
    // Create a temporary textarea to copy the text
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = searchString;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextarea);
    
    // Show feedback
    const copyBtn = event.target;
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✅ Copied!';
    copyBtn.style.backgroundColor = '#27ae60';
    
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.backgroundColor = '#f39c12';
    }, 2000);
}

// Delete a recent search
async function deleteRecentSearch(index) {
    const confirmed = await customConfirm('Delete Recent Search', 'Are you sure you want to delete this search from recently used?');
    if (confirmed) {
        recentlyUsedSearches.splice(index, 1);
        saveData();
        renderRecentlyUsedSearches();
    }
}

// Toggle saved search
function toggleSavedSearch(searchString) {
    const existingIndex = savedSearches.findIndex(saved => saved.search === searchString);
    
    if (existingIndex !== -1) {
        // Remove from saved searches
        savedSearches.splice(existingIndex, 1);
        console.log('Removed from saved searches:', searchString);
    } else {
        // Add to saved searches
        savedSearches.unshift({
            search: searchString,
            timestamp: Date.now()
        });
        console.log('Added to saved searches:', searchString);
    }
    
    console.log('Current saved searches count:', savedSearches.length);
    
    saveData();
    renderRecentlyUsedSearches();
    renderSavedSearches();
}

// Render saved searches
function renderSavedSearches() {
    const container = document.getElementById('savedSearchesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (savedSearches.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d; font-style: italic; text-align: center;">No saved searches. Click the star (☆) next to any search to save it.</p>';
        return;
    }
    
    savedSearches.forEach((item, index) => {
        const searchDiv = document.createElement('div');
        searchDiv.className = 'saved-search-item';
        
        const searchText = document.createElement('div');
        searchText.className = 'saved-search-text';
        searchText.textContent = item.search;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'saved-search-actions';
        
        const starBtn = document.createElement('button');
        starBtn.className = 'saved-search-btn star-search-btn';
        starBtn.innerHTML = '★';
        starBtn.title = 'Remove from saved searches';
        starBtn.onclick = () => toggleSavedSearch(item.search);
        
        const useBtn = document.createElement('button');
        useBtn.className = 'saved-search-btn use-search-btn';
        useBtn.textContent = 'Use';
        useBtn.onclick = () => useSavedSearch(item.search);
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'saved-search-btn copy-search-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = () => copySavedSearch(item.search);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'saved-search-btn remove-search-btn';
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => removeSavedSearch(index);
        
        actionsDiv.appendChild(starBtn);
        actionsDiv.appendChild(useBtn);
        actionsDiv.appendChild(copyBtn);
        actionsDiv.appendChild(removeBtn);
        
        searchDiv.appendChild(searchText);
        searchDiv.appendChild(actionsDiv);
        
        container.appendChild(searchDiv);
    });
}

// Use a saved search
function useSavedSearch(searchString) {
    document.getElementById('booleanString').value = searchString;
    document.getElementById('booleanString').focus();
}

// Copy a saved search to clipboard
function copySavedSearch(searchString) {
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = searchString;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextarea);
    
    // Show feedback
    const copyBtn = event.target;
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✅ Copied!';
    copyBtn.style.backgroundColor = '#27ae60';
    
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.backgroundColor = '#f39c12';
    }, 2000);
}

// Remove a saved search
async function removeSavedSearch(index) {
    const confirmed = await customConfirm('Remove Saved Search', 'Are you sure you want to remove this search from saved searches?');
    if (confirmed) {
        savedSearches.splice(index, 1);
        saveData();
        renderSavedSearches();
        renderRecentlyUsedSearches(); // Update star icons in recently used
    }
}

// Filter saved searches
function filterSavedSearches() {
    const filterInput = document.getElementById('savedSearchesFilter');
    const filterValue = filterInput.value.toLowerCase();
    
    const container = document.getElementById('savedSearchesContainer');
    const searchItems = container.querySelectorAll('.saved-search-item');
    
    searchItems.forEach(item => {
        const searchText = item.querySelector('.saved-search-text').textContent.toLowerCase();
        if (searchText.includes(filterValue)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Setup saved searches filter
function setupSavedSearchesFilter() {
    const filterInput = document.getElementById('savedSearchesFilter');
    if (filterInput) {
        filterInput.addEventListener('input', filterSavedSearches);
    }
}

// Render keywords from directory
function renderKeywordsFromDirectory() {
    const container = document.getElementById('selectedKeywordsContainer');
    if (!container) {
        console.log('selectedKeywordsContainer not found');
        return;
    }
    container.innerHTML = '';
    
    // Only render Selected Boolean Searches - hide all other categories
    // The Selected Boolean Searches are rendered separately in renderSelectedBooleanSearches()
    // This function now does nothing to keep the interface clean
}

// Render a keyword category
function renderKeywordCategory(container, categoryName, displayName, getKeywordsFunction) {
    const keywords = getKeywordsFunction();
    
    if (keywords.length > 0) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'keyword-category';
        
        const title = document.createElement('h4');
        title.textContent = displayName;
        categoryDiv.appendChild(title);
        
        const keywordList = document.createElement('div');
        keywordList.className = 'keyword-list';
        
        // Remove duplicates and sort
        const uniqueKeywords = [...new Set(keywords)].sort();
        
        uniqueKeywords.forEach(keyword => {
            const keywordBtn = document.createElement('button');
            keywordBtn.className = 'keyword-btn';
            keywordBtn.textContent = keyword;
            keywordBtn.addEventListener('click', function() {
                // Check if keyword already has quotes
                if (keyword.startsWith('"') && keyword.endsWith('"')) {
                    insertAtCursor(keyword);
                } else {
                    insertAtCursor(`"${keyword}"`);
                }
            });
            keywordList.appendChild(keywordBtn);
        });
        
        categoryDiv.appendChild(keywordList);
        container.appendChild(categoryDiv);
    }
}

// Trainer Section
function setupTrainerSection() {
    console.log('Setting up Trainer section...');
    const saveTrainingBtn = document.getElementById('saveTraining');
    if (saveTrainingBtn) {
        saveTrainingBtn.addEventListener('click', saveTraining);
        console.log('Trainer section setup complete');
    } else {
        console.warn('saveTraining button not found');
    }
}

function saveTraining() {
    const titleInput = document.getElementById('trainingTitle');
    const contentInput = document.getElementById('trainingContent');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (title && content) {
        trainingContent.push({
            title: title,
            content: content,
            date: new Date().toLocaleDateString()
        });
        
        titleInput.value = '';
        contentInput.value = '';
        saveData();
        renderTrainingList();
    }
}

// Rendering functions
function renderAll() {
    renderCategoryList();
    renderCategorySelects();
    renderRolesDashboard();
    renderKeywordsFromDirectory();
    renderRecentlyUsedSearches();
    renderTrainingList();
}

function renderCategoryList() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '';
    
    // Render Primary Categories
    const primarySection = document.createElement('div');
    primarySection.innerHTML = '<h4 style="color: #2c3e50; margin: 10px 0 5px 0; font-weight: bold;">Primary Categories</h4>';
    categoryList.appendChild(primarySection);
    
    categories.primary.forEach(category => {
        const div = document.createElement('div');
        div.className = 'category-item';
        div.setAttribute('data-category', category);
        div.innerHTML = `<span>${category}</span>`;
        categoryList.appendChild(div);
    });
    
    // Render Secondary Categories
    const secondarySection = document.createElement('div');
    secondarySection.innerHTML = '<h4 style="color: #2c3e50; margin: 15px 0 5px 0; font-weight: bold;">Secondary Categories</h4>';
    categoryList.appendChild(secondarySection);
    
    categories.secondary.forEach(category => {
        const div = document.createElement('div');
        div.className = 'category-item';
        div.setAttribute('data-category', category);
        div.innerHTML = `<span>${category}</span>`;
        categoryList.appendChild(div);
    });
}

function getCategoryItemCount(category) {
    if (category === 'Titles') {
        const technicalCount = Object.keys(categoryData['Titles']['Technical'] || {}).length;
        const functionalCount = Object.keys(categoryData['Titles']['Functional'] || {}).length;
        return technicalCount + functionalCount;
    } else if (category === 'Domain') {
        let totalCount = 0;
        Object.keys(categoryData['Domain'] || {}).forEach(subcategory => {
            Object.keys(categoryData['Domain'][subcategory] || {}).forEach(subSubcategory => {
                totalCount += Object.keys(categoryData['Domain'][subcategory][subSubcategory] || {}).length;
            });
        });
        return totalCount;
    } else if (category === 'Industry') {
        let totalCount = 0;
        Object.keys(categoryData['Industry'] || {}).forEach(subcategory => {
            totalCount += Object.keys(categoryData['Industry'][subcategory] || {}).length;
        });
        return totalCount;
    } else if (category === 'Context') {
        let totalCount = 0;
        Object.keys(categoryData['Context'] || {}).forEach(subcategory => {
            totalCount += Object.keys(categoryData['Context'][subcategory] || {}).length;
        });
        return totalCount;
    } else if (category === 'Certifications & Clearances') {
        let totalCount = 0;
        Object.keys(categoryData['Certifications & Clearances'] || {}).forEach(subcategory => {
            totalCount += Object.keys(categoryData['Certifications & Clearances'][subcategory] || {}).length;
        });
        return totalCount;
    }
    return categoryData[category] ? categoryData[category].length : 0;
}

function renderCategorySelects() {
    const select = document.getElementById('builderCategory');
    
    // Check if the element exists before trying to access its properties
    if (!select) {
        console.log('builderCategory element not found, skipping renderCategorySelects');
        return;
    }
    
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">Select category</option>';
    
    // Add Primary Categories
    if (categories.primary.length > 0) {
        const primaryOptgroup = document.createElement('optgroup');
        primaryOptgroup.label = 'Primary Categories';
        categories.primary.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            primaryOptgroup.appendChild(option);
        });
        select.appendChild(primaryOptgroup);
    }
    
    // Add Secondary Categories
    if (categories.secondary.length > 0) {
        const secondaryOptgroup = document.createElement('optgroup');
        secondaryOptgroup.label = 'Secondary Categories';
        categories.secondary.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            secondaryOptgroup.appendChild(option);
        });
        select.appendChild(secondaryOptgroup);
    }
    
    select.value = currentValue;
}

function renderSearchBuilder() {
    const searchBuilder = document.getElementById('searchBuilder');
    searchBuilder.innerHTML = '';
    
    if (currentSearch.length === 0) {
        searchBuilder.innerHTML = '<p style="color: #666; font-style: italic;">No search terms added yet.</p>';
        return;
    }
    
    currentSearch.forEach((searchGroup, index) => {
        const div = document.createElement('div');
        div.style.marginBottom = '10px';
        div.style.padding = '10px';
        div.style.backgroundColor = '#f8f9fa';
        div.style.borderRadius = '4px';
        div.innerHTML = `
            <strong>${searchGroup.category}:</strong> ${searchGroup.keywords.join(' OR ')}
            <button class="delete-btn" onclick="removeFromSearch(${index})" style="float: right;">Remove</button>
        `;
        searchBuilder.appendChild(div);
    });
}

function renderTrainingList() {
    const trainingList = document.getElementById('trainingList');
    trainingList.innerHTML = '';
    
    trainingContent.forEach((training, index) => {
        const div = document.createElement('div');
        div.className = 'training-item';
        div.innerHTML = `
            <h4>${training.title}</h4>
            <p><small>${training.date}</small></p>
            <p>${training.content}</p>
            <button class="delete-btn" onclick="deleteTraining(${index})">Delete</button>
        `;
        trainingList.appendChild(div);
    });
}

function updateSearchString() {
    const searchString = document.getElementById('searchString');
    let result = '';
    
    if (currentSearch.length > 0) {
        const searchGroups = currentSearch.map(group => 
            `(${group.keywords.join(' OR ')})`
        );
        result = searchGroups.join(' AND ');
    }
    
    searchString.value = result;
}

function removeFromSearch(index) {
    currentSearch.splice(index, 1);
    renderSearchBuilder();
    updateSearchString();
}

function deleteTraining(index) {
    trainingContent.splice(index, 1);
    saveData();
    renderTrainingList();
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
        categories: categories,
        categoryData: categoryData,
        trainingContent: trainingContent,
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
        showCustomAlert('Save Warning', 'Warning: Could not save data to localStorage. Your data may not be preserved.');
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
        categories: categories,
        categoryData: categoryData,
        trainingContent: trainingContent,
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
    showCustomAlert('Export Success', `Backup exported successfully for ${userDisplay}!`);
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
                    if (importedData.categoryData && importedData.categories) {
                        categories = importedData.categories;
                        categoryData = importedData.categoryData;
                        trainingContent = importedData.trainingContent || [];
                        
                        // Import tempKeywords for logged-in users only
                        if (currentUser && !currentUser.isAnonymous && importedData.tempKeywords) {
                            tempKeywords = importedData.tempKeywords;
                        }
                        
                        saveData();
                        renderAll();
                        showCustomAlert('Import Success', 'Data imported successfully!');
                    } else {
                        showCustomAlert('Invalid Format', 'Invalid backup file format.');
                    }
                } catch (error) {
                    console.error('Error importing data:', error);
                    showCustomAlert('Import Error', 'Error importing backup file. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

function clearAllData() {
    const userId = currentUser ? currentUser.uid : 'guest';
    const userDisplay = currentUser ? currentUser.email : 'Guest User';
    
    showCustomConfirm('Clear All Data', `Are you sure you want to clear ALL data for ${userDisplay}? This action cannot be undone.`, (confirmed1) => {
        if (confirmed1) {
            showCustomConfirm('Final Confirmation', 'This will delete all your boolean searches, training content, and settings. Are you absolutely sure?', (confirmed2) => {
                if (confirmed2) {
                    const storageKey = `pluginData_${userId}`;
                    localStorage.removeItem(storageKey);
                    initializeDefaultData();
                    renderAll();
                    showCustomAlert('Data Cleared', `All data for ${userDisplay} has been cleared.`);
                }
            });
        }
    });
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

// Simple synchronous versions for immediate use
function showCustomConfirm(title, message, callback) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('customConfirmModal').style.display = 'block';
    
    const yesBtn = document.getElementById('confirmYes');
    const noBtn = document.getElementById('confirmNo');
    
    const handleYes = () => {
        cleanup();
        callback(true);
    };
    
    const handleNo = () => {
        cleanup();
        callback(false);
    };
    
    const cleanup = () => {
        yesBtn.removeEventListener('click', handleYes);
        noBtn.removeEventListener('click', handleNo);
        document.getElementById('customConfirmModal').style.display = 'none';
    };
    
    yesBtn.addEventListener('click', handleYes);
    noBtn.addEventListener('click', handleNo);
}

function showCustomAlert(title, message) {
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    document.getElementById('customAlertModal').style.display = 'block';
    
    const okBtn = document.getElementById('alertOk');
    
    const handleOk = () => {
        okBtn.removeEventListener('click', handleOk);
        document.getElementById('customAlertModal').style.display = 'none';
    };
    
    okBtn.addEventListener('click', handleOk);
}

function closeCustomConfirmModal() {
    document.getElementById('customConfirmModal').style.display = 'none';
}

function closeCustomAlertModal() {
    document.getElementById('customAlertModal').style.display = 'none';
}

function forceReload() {
    console.log('Force reloading data...');
    loadData();
    renderAll();
    console.log('Reload complete. Current categoryData:', categoryData);
}

function loadData(user = currentUser) {
    // For guest users, always start with fresh data
    if (!user || user.isAnonymous) {
        console.log('Guest user - loading fresh data');
        initializeDefaultData();
        return;
    }
    
    // Get current user ID for user-specific storage
    const userId = user.uid;
    const storageKey = `pluginData_${userId}`;
    
    console.log(`Loading data for user: ${userId}`);
    console.log(`Storage key: ${storageKey}`);
    
    const savedData = localStorage.getItem(storageKey);
    console.log('Found saved data:', savedData ? 'YES' : 'NO');
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            console.log('Parsed data keys:', Object.keys(data));
            
            // Validate that the data belongs to the current user
            if (data.userId && data.userId !== userId) {
                console.warn('Data user ID mismatch, clearing data for security');
                clearAllDataFromMemory();
                return;
            }
            
            categories = data.categories || {
                primary: ['Titles', 'Domain', 'Industry'],
                secondary: ['Context', 'Certifications & Clearances']
            };
            
            // Load saved data but ensure proper structure
            categoryData = data.categoryData || {};
            
            // Ensure all required structures exist
            if (!categoryData['Titles']) categoryData['Titles'] = {};
            if (!categoryData['Titles']['Technical']) categoryData['Titles']['Technical'] = {};
            if (!categoryData['Titles']['Functional']) categoryData['Titles']['Functional'] = {};
            
            if (!categoryData['Domain']) categoryData['Domain'] = {};
            if (!categoryData['Industry']) categoryData['Industry'] = {};
            if (!categoryData['Context']) categoryData['Context'] = {};
            if (!categoryData['Certifications & Clearances']) categoryData['Certifications & Clearances'] = {};
            
            // Ensure all Domain subcategories exist and migrate old data structure
            const domainSubcategories = [
                'Agile & Scrum', 'AI & Machine Learning', 'Architecture', 'Change & Transformation',
                'Cyber Security', 'Data & Analytics', 'DevOps & Platform Engineering', 'Digital',
                'Financial Crime', 'Infrastructure & Cloud', 'Payments & Banking Tech', 'Product & Design',
                'Project Services', 'Risk & Compliance', 'Software Engineering', 'Testing & QA'
            ];
            domainSubcategories.forEach(sub => {
                if (!categoryData['Domain'][sub]) categoryData['Domain'][sub] = {};
                
                // Migrate old array structure to object structure
                if (Array.isArray(categoryData['Domain'][sub])) {
                    console.log('Migrating old array structure for Domain subcategory:', sub);
                    const oldArray = categoryData['Domain'][sub];
                    categoryData['Domain'][sub] = {};
                    
                    // Convert array items to object structure
                    oldArray.forEach((item, index) => {
                        if (typeof item === 'string') {
                            categoryData['Domain'][sub][`Item ${index + 1}`] = [item];
                        } else if (typeof item === 'object' && item !== null) {
                            // If it's already an object, keep it
                            Object.keys(item).forEach(key => {
                                categoryData['Domain'][sub][key] = item[key];
                            });
                        }
                    });
                }
                
                // Ensure sub-subcategories exist as objects
                const subSubcategories = ['Technology', 'Framework', 'Action'];
                subSubcategories.forEach(subSub => {
                    if (!categoryData['Domain'][sub][subSub]) {
                        categoryData['Domain'][sub][subSub] = {};
                    } else if (Array.isArray(categoryData['Domain'][sub][subSub])) {
                        // Migrate sub-subcategory from array to object
                        console.log('Migrating sub-subcategory array to object:', sub, subSub);
                        const oldArray = categoryData['Domain'][sub][subSub];
                        categoryData['Domain'][sub][subSub] = {};
                        
                        oldArray.forEach((item, index) => {
                            if (typeof item === 'string') {
                                categoryData['Domain'][sub][subSub][`Item ${index + 1}`] = [item];
                            } else if (typeof item === 'object' && item !== null) {
                                Object.keys(item).forEach(key => {
                                    categoryData['Domain'][sub][subSub][key] = item[key];
                                });
                            }
                        });
                    }
                });
            });
            
            // Ensure all Industry subcategories exist
            const industrySubcategories = ['Insurance', 'Bank', 'Superannuation', 'Financial'];
            industrySubcategories.forEach(sub => {
                if (!categoryData['Industry'][sub]) categoryData['Industry'][sub] = {};
            });
            
            // Ensure all Certifications subcategories exist
            const certSubcategories = [
                'Federal Government Clearances', 'Technical Certifications', 'Delivery Certifications',
                'Product & Design Certifications', 'Financial Certifications'
            ];
            certSubcategories.forEach(sub => {
                if (!categoryData['Certifications & Clearances'][sub]) categoryData['Certifications & Clearances'][sub] = {};
            });
            
            trainingContent = data.trainingContent || [];
            recentlyUsedSearches = data.recentlyUsedSearches || [];
            savedSearches = data.savedSearches || [];
            roles = data.roles || [];
            
            // Load tempKeywords for authenticated users
            tempKeywords = data.tempKeywords || [];
            
            console.log('Data loaded successfully:', categoryData);
            console.log('Saved searches loaded:', savedSearches.length, 'items');
            console.log('Temp keywords loaded:', tempKeywords.length, 'items');
        } catch (error) {
            console.error('Error loading data:', error);
            // If there's an error, initialize with default data
            initializeDefaultData();
        }
    } else {
        // Initialize with default data if no saved data exists
        initializeDefaultData();
    }
}

function initializeDefaultData() {
    categories = {
        primary: ['Titles', 'Domain', 'Industry'],
        secondary: ['Context', 'Certifications & Clearances']
    };
    categoryData = {
            'Titles': { 'Technical': {}, 'Functional': {} },
            'Domain': {
                'Agile & Scrum': {},
                'AI & Machine Learning': {},
                'Architecture': {},
                'Change & Transformation': {},
                'Cyber Security': {},
                'Data & Analytics': {},
                'DevOps & Platform Engineering': {},
                'Digital': {},
                'Financial Crime': {},
                'Infrastructure & Cloud': {},
                'Payments & Banking Tech': {},
                'Product & Design': {},
                'Project Services': {},
                'Risk & Compliance': {},
                'Software Engineering': {},
                'Testing & QA': {}
            },
            'Industry': {
                'Insurance': {},
                'Bank': {},
                'Superannuation': {},
                'Financial': {}
            },
        'Context': {},
        'Certifications & Clearances': {
            'Federal Government Clearances': {},
            'Technical Certifications': {},
            'Delivery Certifications': {},
            'Product & Design Certifications': {},
            'Financial Certifications': {}
        }
    };
    trainingContent = [];
    tempKeywords = []; // Reset temp keywords for all users
}

// Role Filter Functionality
let currentRoleFilters = {
    client: '',
    id: '',
    title: ''
};

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



// Temporary keyword pool functionality

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
            renderTempKeywords();
            
            // Save data for logged-in users only
            if (currentUser && !currentUser.isAnonymous) {
                saveData();
            }
            
            // Provide visual feedback
            input.style.borderColor = '#28a745';
            setTimeout(() => {
                input.style.borderColor = '';
            }, 500);
        } else {
            console.log('Keyword already exists in tempKeywords');
            // Provide visual feedback for duplicate
            input.style.borderColor = '#ffc107';
            setTimeout(() => {
                input.style.borderColor = '';
            }, 500);
        }
        
        input.value = '';
    } else {
        console.log('No keyword entered');
        // Provide visual feedback for empty input
        input.style.borderColor = '#dc3545';
        setTimeout(() => {
            input.style.borderColor = '';
        }, 500);
    }
}

function removeTempKeyword(keyword) {
    const index = tempKeywords.indexOf(keyword);
    if (index > -1) {
        tempKeywords.splice(index, 1);
        renderTempKeywords();
        
        // Save data for logged-in users only
        if (currentUser && !currentUser.isAnonymous) {
            saveData();
        }
    }
}

function clearTempKeywords() {
    tempKeywords = [];
    renderTempKeywords();
    
    // Save data for logged-in users only
    if (currentUser && !currentUser.isAnonymous) {
        saveData();
    }
}

function addTempKeywordToBoolean(keyword) {
    const booleanInput = document.getElementById('booleanString');
    if (!booleanInput) {
        console.log('booleanString not found');
        return;
    }

    const currentValue = booleanInput.value;
    const newValue = currentValue ? `${currentValue} AND ${keyword}` : keyword;
    booleanInput.value = newValue;
    
    // Trigger input event to update any listeners
    booleanInput.dispatchEvent(new Event('input'));
}

function addTempToBoolean() {
    console.log('addTempToBoolean called');
    console.log('tempKeywords:', tempKeywords);
    
    if (tempKeywords.length === 0) {
        console.log('No temp keywords to add');
        return;
    }

    const booleanInput = document.getElementById('booleanString');
    if (!booleanInput) {
        console.log('booleanString not found');
        return;
    }

    // Check which Auto mode is currently active
    const autoAndBtn = document.getElementById('autoAndBtn');
    const autoOrBtn = document.getElementById('autoOrBtn');
    const isAutoAndActive = autoAndBtn && autoAndBtn.classList.contains('active');
    const isAutoOrActive = autoOrBtn && autoOrBtn.classList.contains('active');
    
    // Determine the operator to use for joining keywords
    let joinOperator = ' AND '; // Default to AND
    if (isAutoOrActive) {
        joinOperator = ' OR ';
        console.log('Auto OR mode detected, using OR to join keywords');
    } else if (isAutoAndActive) {
        joinOperator = ' AND ';
        console.log('Auto AND mode detected, using AND to join keywords');
    } else {
        console.log('No Auto mode active, defaulting to AND');
    }

    const currentValue = booleanInput.value;
    console.log('Current boolean input value:', currentValue);
    
    const keywordsString = tempKeywords.join(joinOperator);
    console.log('Keywords string with operator:', keywordsString);
    
    const newValue = currentValue ? `${currentValue} AND (${keywordsString})` : `(${keywordsString})`;
    console.log('New value:', newValue);
    
    booleanInput.value = newValue;
    
    // Trigger input event to update any listeners
    booleanInput.dispatchEvent(new Event('input'));
    console.log('Updated boolean input value:', booleanInput.value);
}

function renderTempKeywords() {
    const tempKeywordsList = document.getElementById('tempKeywordsList');
    if (!tempKeywordsList) {
        console.log('tempKeywordsList element not found in renderTempKeywords');
        return;
    }

    console.log('Rendering temp keywords:', tempKeywords);
    tempKeywordsList.innerHTML = '';
    
    if (tempKeywords.length === 0) {
        // Show a placeholder message when no keywords
        let placeholderMessage = 'No temporary keywords added yet.';
        
        // Add note for guest users that keywords won't be saved
        if (!currentUser || currentUser.isAnonymous) {
            placeholderMessage += ' (Keywords will not be saved for guest users)';
        }
        
        tempKeywordsList.innerHTML = `<p style="color: #7f8c8d; font-style: italic; margin: 0; padding: 8px;">${placeholderMessage}</p>`;
        return;
    }
    
    tempKeywords.forEach(keyword => {
        const keywordItem = document.createElement('div');
        keywordItem.className = 'temp-keyword-item';
        keywordItem.innerHTML = `
            <span class="temp-keyword-text" style="cursor: pointer;">${keyword}</span>
            <button class="remove-temp-keyword-btn" title="Remove">×</button>
        `;
        tempKeywordsList.appendChild(keywordItem);
    });
    
    console.log('Rendered', tempKeywords.length, 'temp keywords');
}

// Error threshold modal system
let errorThresholdModalsShown = {
    5: false,
    10: false,
    15: false,
    20: false
};

function showErrorThresholdModal(errorCount) {
    console.log('showErrorThresholdModal called with errorCount:', errorCount);
    console.log('Current errorThresholdModalsShown state:', errorThresholdModalsShown);
    
    let modalTitle = '';
    let modalMessage = '';
    let shouldShow = false;
    
    // Determine which threshold was reached
    if (errorCount >= 20 && !errorThresholdModalsShown[20]) {
        modalTitle = "Stop. Just Stop.";
        modalMessage = "You've hit 20+ errors. We've alerted your manager. Your keyboard is under investigation. And frankly, the Boolean string has filed for emotional distress. Please — for everyone's sake — start over.";
        errorThresholdModalsShown[20] = true;
        shouldShow = true;
        console.log('Triggering 20+ error modal');
    } else if (errorCount >= 15 && !errorThresholdModalsShown[15]) {
        modalTitle = "This Is Getting Impressive (In the Wrong Way)";
        modalMessage = "15 errors is no small feat. At this point, it's less a Boolean string and more a cry for help. Take your time. Rome wasn't built in a day, and neither is functional logic, apparently.";
        errorThresholdModalsShown[15] = true;
        shouldShow = true;
        console.log('Triggering 15+ error modal');
    } else if (errorCount >= 10 && !errorThresholdModalsShown[10]) {
        modalTitle = "We All Start Somewhere";
        modalMessage = "10 errors and counting! While ambition is admirable, accuracy is occasionally helpful too. You may want to double-check whether you're actually writing a search or accidentally recreating abstract art.";
        errorThresholdModalsShown[10] = true;
        shouldShow = true;
        console.log('Triggering 10+ error modal');
    } else if (errorCount >= 5 && !errorThresholdModalsShown[5]) {
        modalTitle = "Might Be Time for a Quick Breather";
        modalMessage = "It looks like you've made a few syntax errors. Not catastrophic… yet. Perhaps a coffee break is in order before we continue this Boolean journey?";
        errorThresholdModalsShown[5] = true;
        shouldShow = true;
        console.log('Triggering 5+ error modal');
    }
    
    console.log('shouldShow:', shouldShow);
    if (shouldShow) {
        // Create and show the modal
        console.log('Creating modal with title:', modalTitle);
        showErrorThresholdModalUI(modalTitle, modalMessage);
    }
}

function showErrorThresholdModalUI(title, message) {
    // Create modal HTML
    const modalHTML = `
        <div id="errorThresholdModal" class="modal">
            <div class="modal-content error-threshold-modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <span class="close" onclick="closeErrorThresholdModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                    <div class="modal-options">
                        <label>
                            <input type="checkbox" id="dontShowAgainCheckbox"> Don't show again for this search
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="closeErrorThresholdModal()" class="ok-btn">OK</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = document.getElementById('errorThresholdModal');
    modal.style.display = 'block';
    
    // Add event listener for Enter key
    document.addEventListener('keydown', handleErrorThresholdModalKeydown);
}

function closeErrorThresholdModal() {
    const modal = document.getElementById('errorThresholdModal');
    if (modal) {
        // Check if "Don't show again" is checked
        const dontShowAgain = document.getElementById('dontShowAgainCheckbox');
        if (dontShowAgain && dontShowAgain.checked) {
            // Disable all future modals for this session
            Object.keys(errorThresholdModalsShown).forEach(key => {
                errorThresholdModalsShown[key] = true;
            });
        }
        
        modal.remove();
        document.removeEventListener('keydown', handleErrorThresholdModalKeydown);
    }
}

function handleErrorThresholdModalKeydown(event) {
    if (event.key === 'Enter' || event.key === 'Escape') {
        closeErrorThresholdModal();
    }
}

// Reset error threshold modals when starting a new search
function resetErrorThresholdModals() {
    errorThresholdModalsShown = {
        5: false,
        10: false,
        15: false,
        20: false
    };
}

// Keyboard shortcuts for Auto AND/OR modes
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Only handle arrow keys
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            // Prevent default behavior for arrow keys
            event.preventDefault();
            
            const autoAndBtn = document.getElementById('autoAndBtn');
            const autoOrBtn = document.getElementById('autoOrBtn');
            
            if (event.key === 'ArrowUp') {
                // Up Arrow (↑) - Activate Auto AND
                if (autoAndBtn) {
                    autoAndBtn.click();
                    console.log('Keyboard shortcut: Auto AND activated');
                }
            } else if (event.key === 'ArrowDown') {
                // Down Arrow (↓) - Activate Auto OR
                if (autoOrBtn) {
                    autoOrBtn.click();
                    console.log('Keyboard shortcut: Auto OR activated');
                }
            }
        }
    });
}

// Authentication Gateway Functions
// Email auth removed - Google or Guest only

async function signInWithGoogle() {
    const googleBtn = document.querySelector('.google-auth-btn');
    
    try {
        // Show loading state
        if (googleBtn) {
            googleBtn.innerHTML = '<span class="auth-icon">⏳</span><span class="auth-text">Signing in...</span>';
            googleBtn.disabled = true;
        }
        
        console.log('Starting Google sign-in...');
        
        // Check if Firebase is properly initialized
        if (!firebase.auth) {
            throw new Error('Firebase Auth not available');
        }
        
        console.log('Creating Google provider...');
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        console.log('Google provider created with scopes:', provider.scopes);
        
        // Use signInWithPopup for better user experience
        console.log('Attempting signInWithPopup...');
        const result = await firebase.auth().signInWithPopup(provider);
        console.log('Google sign-in successful:', result.user.email);
        
    } catch (error) {
        console.error('Google sign-in error:', error);
        showCustomAlert('Error', 'Google sign-in failed: ' + error.message);
    } finally {
        // Reset button state
        if (googleBtn) {
            googleBtn.innerHTML = '<span class="auth-icon">🔍</span><span class="auth-text">Sign in with Google</span>';
            googleBtn.disabled = false;
        }
    }
}

async function signInAsGuest() {
    console.log('Starting guest sign-in...');
    
    // Set guest session flag
    sessionStorage.setItem('guestSessionStarted', 'true');
    
    // Sign in as anonymous user
    await firebase.auth().signInAnonymously();
    console.log('Guest sign-in successful');
}

// Email auth functions removed - Google or Guest only

async function logout() {
    try {
        // Save current data before logout (if user is authenticated)
        if (currentUser && !currentUser.isAnonymous) {
            console.log('Saving data before logout...');
            await saveData();
            console.log('Data saved successfully before logout');
        }
        
        await firebase.auth().signOut();
        // Clear guest session flag on logout
        sessionStorage.removeItem('guestSessionStarted');
        
        // Clear current user data from memory
        currentUser = null;
        
        // Clear all data from memory to prevent data leakage
        clearAllDataFromMemory();
        
        console.log('Logout successful - all data cleared from memory');
        
        // Show auth gateway
        showAuthGateway();
        
    } catch (error) {
        console.error('Logout error:', error);
        showCustomAlert('Error', 'Failed to logout: ' + error.message);
    }
}

function showAuthGateway() {
    document.getElementById('authGateway').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    isAuthenticated = false;
}

function showApp() {
    document.getElementById('authGateway').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    isAuthenticated = true;
    console.log('App is now visible and authenticated');
}

function updateAuthUI(user) {
    console.log('updateAuthUI called with user:', user);
    
    if (user) {
        // User is authenticated
        currentUser = user;
        showApp();
        
        // Update user info display
        const userInfo = document.getElementById('userInfo');
        const userEmail = document.getElementById('userEmail');
        
        console.log('Found elements:', { userInfo: !!userInfo, userEmail: !!userEmail });
        
        if (userInfo && userEmail) {
            // Show user info
            userInfo.style.display = 'flex';
            
            // Display user information
            if (user.isAnonymous) {
                userEmail.textContent = '👤 Guest User';
                console.log('Set user display to: Guest User');
            } else if (user.email) {
                // Extract username (everything before @ symbol)
                const username = user.email.split('@')[0];
                userEmail.textContent = `📧 ${username}`;
                console.log('Set user display to:', username);
            } else {
                userEmail.textContent = '👤 Authenticated User';
                console.log('Set user display to: Authenticated User');
            }
        } else {
            console.error('Missing elements for user info display');
        }
    } else {
        // User is not authenticated
        currentUser = null;
        showAuthGateway();
        
        // Hide user info
        const userInfo = document.getElementById('userInfo');
        
        if (userInfo) {
            userInfo.style.display = 'none';
        }
    }
}

// Listen for auth state changes
firebase.auth().onAuthStateChanged(function(user) {
    console.log('Auth state changed:', user ? 'User authenticated' : 'No user');
    
    // Check if user has changed
    const previousUserId = sessionStorage.getItem('currentUserId');
    const currentUserId = user ? user.uid : null;
    
    // Clear data when switching between different user types
    if (previousUserId && previousUserId !== currentUserId) {
        console.log('User changed from', previousUserId, 'to', currentUserId);
        // Clear all data from memory when user changes
        clearAllDataFromMemory();
    }
    
    if (user && user.isAnonymous) {
        // Check if this is a page refresh for a guest user
        const isPageRefresh = !sessionStorage.getItem('guestSessionStarted');
        
        if (isPageRefresh) {
            // Guest user refreshed the page - log them out
            console.log('Guest user refreshed page - logging out');
            firebase.auth().signOut();
            return;
        }
        
        // For guest users, ensure we start with fresh data
        console.log('Guest user detected, ensuring fresh data...');
        clearAllDataFromMemory();
        
        // Clear only guest-related localStorage data to prevent data leakage
        console.log('Clearing guest-related localStorage data...');
        const guestStorageKey = `pluginData_${user.uid}`;
        localStorage.removeItem(guestStorageKey);
        console.log('Removed guest localStorage key:', guestStorageKey);
        
        // Force a complete reset for guest users
        console.log('Forcing complete reset for guest user...');
        initializeDefaultData();
    }
    
    // Update session storage with current user ID
    if (user) {
        sessionStorage.setItem('currentUserId', user.uid);
    } else {
        sessionStorage.removeItem('currentUserId');
    }
    
    // Update UI first
    updateAuthUI(user);
    
    // If user is authenticated, set up the app
    if (user) {
        try {
            console.log('Setting up app components...');
            
            // Only load data for non-guest users
            if (!user.isAnonymous) {
                loadData(user);
            } else {
                console.log('Guest user - skipping loadData()');
            }
            
            setupNavigation();
            setupStorageSection();
            setupBuilderSection();
            setupTrainerSection();
            setupKeyboardShortcuts();
            renderAll();
            
            // Setup temp keyword pool if Builder section is active
            const builderSection = document.getElementById('builder');
            if (builderSection && builderSection.classList.contains('active')) {
                console.log('Builder section is active, setting up temp keyword pool...');
                setupTempKeywordPool();
            }
            
            console.log('App setup complete');
        } catch (error) {
            console.error('Error setting up app:', error);
            // Even if there's an error, ensure basic navigation works
            try {
                setupNavigation();
            } catch (navError) {
                console.error('Navigation setup failed:', navError);
            }
        }
    }
});

// Function to clear all data from memory
function clearAllDataFromMemory() {
    console.log('Clearing all data from memory...');
    categories = {
        primary: ['Titles', 'Domain', 'Industry'],
        secondary: ['Context', 'Certifications & Clearances']
    };
    categoryData = {};
    trainingContent = [];
    recentlyUsedSearches = [];
    savedSearches = [];
    roles = [];
    tempKeywords = [];
    
    // Clear any cached data in session storage
    sessionStorage.removeItem('cachedData');
    console.log('Memory cleared successfully');
}