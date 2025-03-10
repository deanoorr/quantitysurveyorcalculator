// State management
let state = {
    currentProjectName: 'Untitled Project',
    savedProjects: [],
    description: '',
    inputMode: 'total', // Default is total
    materials: 0,
    labor: 0,
    totalCost: 0,
    overhead: 15,
    profit: 10,
    unit: 'm2',
    savedItems: [],
    selectedItems: [],
    expandedItems: [],
    selectedCombinedItem: null,
    currentlyEditing: null, // Track which item is being edited
    results: {
        subtotal: 0,
        overheadAmount: 0,
        profitAmount: 0,
        total: 0,
        ratePerUnit: 0
    }
};

// DOM Elements
const elements = {};

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get all DOM elements we need to interact with
    initializeElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load saved data from localStorage
    loadStateFromStorage();
    
    // Create notification container
    createNotificationContainer();
    
    // Update the UI
    updateUI();
});

// Get references to all DOM elements we need
function initializeElements() {
    // Project controls
    elements.projectName = document.getElementById('project-name');
    elements.saveProject = document.getElementById('save-project');
    elements.saveAsProject = document.getElementById('save-as-project');
    elements.loadProject = document.getElementById('load-project');
    elements.exportPdf = document.getElementById('export-pdf');
    
    // Input fields
    elements.description = document.getElementById('description');
    elements.detailedMode = document.getElementById('detailed-mode');
    elements.totalMode = document.getElementById('total-mode');
    elements.detailedInputs = document.getElementById('detailed-inputs');
    elements.totalInputs = document.getElementById('total-inputs');
    elements.materials = document.getElementById('materials');
    elements.labor = document.getElementById('labor');
    elements.totalCost = document.getElementById('total-cost');
    elements.overhead = document.getElementById('overhead');
    elements.profit = document.getElementById('profit');
    elements.unitType = document.getElementById('unit-type');
    elements.saveCalculation = document.getElementById('save-calculation');
    elements.clearForm = document.getElementById('clear-form');
    
    // Results elements
    elements.detailedResults = document.getElementById('detailed-results');
    elements.totalResults = document.getElementById('total-results');
    elements.materialsResult = document.getElementById('materials-result');
    elements.laborResult = document.getElementById('labor-result');
    elements.subtotalResult = document.getElementById('subtotal-result');
    elements.overheadPercent = document.getElementById('overhead-percent');
    elements.overheadResult = document.getElementById('overhead-result');
    elements.profitPercent = document.getElementById('profit-percent');
    elements.profitResult = document.getElementById('profit-result');
    elements.totalCostResult = document.getElementById('total-cost-result');
    elements.finalTotalResult = document.getElementById('final-total-result');
    elements.rateResult = document.getElementById('rate-result');
    elements.unitDisplay = document.getElementById('unit-display');
    elements.unitDisplay2 = document.getElementById('unit-display-2');
    
    // Saved items elements
    elements.savedItemsList = document.getElementById('saved-items-list');
    elements.selectionActions = document.getElementById('selection-actions');
    elements.combineSelected = document.getElementById('combine-selected');
    elements.clearSelection = document.getElementById('clear-selection');
    elements.selectedCount = document.getElementById('selected-count');
    
    // Modal elements
    elements.saveProjectModal = document.getElementById('save-project-modal');
    elements.newProjectName = document.getElementById('new-project-name');
    elements.cancelSaveProject = document.getElementById('cancel-save-project');
    elements.confirmSaveProject = document.getElementById('confirm-save-project');
    
    elements.loadProjectModal = document.getElementById('load-project-modal');
    elements.projectsList = document.getElementById('projects-list');
    elements.closeLoadProject = document.getElementById('close-load-project');
    
    elements.combineModal = document.getElementById('combine-modal');
    elements.combineDescription = document.getElementById('combine-description');
    elements.combineUnit = document.getElementById('combine-unit');
    elements.combiningCount = document.getElementById('combining-count');
    elements.combiningItemsList = document.getElementById('combining-items-list');
    elements.cancelCombine = document.getElementById('cancel-combine');
    elements.confirmCombine = document.getElementById('confirm-combine');
    
    elements.addToCombinedModal = document.getElementById('add-to-combined-modal');
    elements.targetCombinedName = document.getElementById('target-combined-name');
    elements.selectableItemsList = document.getElementById('selectable-items-list');
    elements.cancelAddCombined = document.getElementById('cancel-add-combined');
    elements.confirmAddCombined = document.getElementById('confirm-add-combined');
}

// Set up all event listeners
function setupEventListeners() {
    // Input mode switching
    elements.detailedMode.addEventListener('click', () => switchInputMode('detailed'));
    elements.totalMode.addEventListener('click', () => switchInputMode('total'));
    
    // Numeric input validation
    elements.materials.addEventListener('input', () => handleNumericInput(elements.materials, 'materials'));
    elements.labor.addEventListener('input', () => handleNumericInput(elements.labor, 'labor'));
    elements.totalCost.addEventListener('input', () => handleNumericInput(elements.totalCost, 'totalCost'));
    elements.overhead.addEventListener('input', () => handleNumericInput(elements.overhead, 'overhead'));
    elements.profit.addEventListener('input', () => handleNumericInput(elements.profit, 'profit'));
    
    // Text inputs
    elements.description.addEventListener('input', (e) => { state.description = e.target.value; });
    
    // Selects
    elements.unitType.addEventListener('change', (e) => {
        state.unit = e.target.value;
        updateResults();
    });
    
    // Buttons
    elements.saveProject.addEventListener('click', saveCurrentProject);
    elements.saveAsProject.addEventListener('click', () => showModal(elements.saveProjectModal));
    elements.loadProject.addEventListener('click', () => {
        populateProjectsList();
        showModal(elements.loadProjectModal);
    });
    elements.exportPdf.addEventListener('click', exportToPdf);
    elements.saveCalculation.addEventListener('click', saveCalculation);
    elements.clearForm.addEventListener('click', clearForm);
    elements.combineSelected.addEventListener('click', openCombineModal);
    elements.clearSelection.addEventListener('click', clearSelection);
    
    // Modal actions
    elements.cancelSaveProject.addEventListener('click', () => hideModal(elements.saveProjectModal));
    elements.confirmSaveProject.addEventListener('click', saveProjectAs);
    elements.closeLoadProject.addEventListener('click', () => hideModal(elements.loadProjectModal));
    elements.cancelCombine.addEventListener('click', () => hideModal(elements.combineModal));
    elements.confirmCombine.addEventListener('click', combineCalculations);
    elements.cancelAddCombined.addEventListener('click', () => hideModal(elements.addToCombinedModal));
    elements.confirmAddCombined.addEventListener('click', addToCombinedCalculation);
}

// Handle numeric input with validation
function handleNumericInput(element, stateKey) {
    const numValue = element.value.replace(/[^0-9.]/g, '');
    element.value = numValue;
    state[stateKey] = parseFloat(numValue) || 0;
    updateResults();
}

// Switch between detailed and total input modes
function switchInputMode(mode) {
    state.inputMode = mode;
    
    if (mode === 'detailed') {
        elements.detailedMode.classList.add('active');
        elements.totalMode.classList.remove('active');
        elements.detailedInputs.style.display = 'block';
        elements.totalInputs.style.display = 'none';
        elements.detailedResults.style.display = 'block';
        elements.totalResults.style.display = 'none';
    } else {
        elements.detailedMode.classList.remove('active');
        elements.totalMode.classList.add('active');
        elements.detailedInputs.style.display = 'none';
        elements.totalInputs.style.display = 'block';
        elements.detailedResults.style.display = 'none';
        elements.totalResults.style.display = 'block';
    }
    
    updateResults();
}

// Update calculation results
function updateResults() {
    let subtotal, overheadAmount, profitAmount, total;
    
    if (state.inputMode === 'detailed') {
        subtotal = state.materials + state.labor;
        overheadAmount = subtotal * (state.overhead / 100);
        profitAmount = (subtotal + overheadAmount) * (state.profit / 100);
        total = subtotal + overheadAmount + profitAmount;
    } else {
        subtotal = 0;
        overheadAmount = 0;
        profitAmount = 0;
        total = state.totalCost;
    }
    
    state.results = {
        subtotal,
        overheadAmount,
        profitAmount,
        total,
        ratePerUnit: total
    };
    
    // Update display
    elements.materialsResult.textContent = formatCurrency(state.materials);
    elements.laborResult.textContent = formatCurrency(state.labor);
    elements.subtotalResult.textContent = formatCurrency(subtotal);
    elements.overheadPercent.textContent = state.overhead;
    elements.overheadResult.textContent = formatCurrency(overheadAmount);
    elements.profitPercent.textContent = state.profit;
    elements.profitResult.textContent = formatCurrency(profitAmount);
    elements.totalCostResult.textContent = formatCurrency(state.totalCost);
    elements.finalTotalResult.textContent = formatCurrency(total);
    elements.rateResult.textContent = formatCurrency(state.results.ratePerUnit);
    
    // Update unit display
    const unitDisplayText = getUnitDisplayText(state.unit);
    elements.unitDisplay.textContent = unitDisplayText;
    elements.unitDisplay2.textContent = unitDisplayText;
}

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-GB', { 
        style: 'currency', 
        currency: 'GBP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
    }).format(value);
}

// Get display text for unit
function getUnitDisplayText(unit) {
    switch(unit) {
        case 'm2': return 'm²';
        case 'm': return 'm';
        case 'item': return 'item';
        case 'nr': return 'Nr';
        default: return unit;
    }
}

// Save current calculation
function saveCalculation() {
    if (!state.description.trim()) {
        alert('Please enter a description before saving');
        return;
    }

    const itemData = {
        description: state.description,
        inputMode: state.inputMode,
        materials: state.inputMode === 'detailed' ? state.materials : 0,
        labor: state.inputMode === 'detailed' ? state.labor : 0,
        totalCost: state.inputMode === 'total' ? state.totalCost : 0,
        overhead: state.overhead,
        profit: state.profit,
        unit: state.unit,
        results: state.results
    };

    if (state.currentlyEditing) {
        // Update existing item
        const itemIndex = state.savedItems.findIndex(item => item.id === state.currentlyEditing);
        
        if (itemIndex >= 0) {
            // Preserve the existing ID, isCombined status, and childItems
            const existingItem = state.savedItems[itemIndex];
            state.savedItems[itemIndex] = {
                ...existingItem,
                ...itemData
            };
            
            showNotification('Item updated successfully');
        }
        
        // Reset editing state
        state.currentlyEditing = null;
        elements.saveCalculation.textContent = 'Save Calculation';
        
        // Remove the cancel button
        const cancelButton = document.getElementById('cancel-edit');
        if (cancelButton) {
            cancelButton.remove();
        }
    } else {
        // Create new item
        const newItem = {
            id: Date.now(),
            ...itemData,
            isCombined: false,
            childItems: []
        };
        
        state.savedItems.push(newItem);
        showNotification('Item saved successfully');
    }

    saveCurrentProject();
    renderSavedItems();
    clearForm();
}

// Clear the form and reset editing state
function clearForm() {
    state.description = '';
    state.materials = 0;
    state.labor = 0;
    state.totalCost = 0;
    
    elements.description.value = '';
    elements.materials.value = '';
    elements.labor.value = '';
    elements.totalCost.value = '';
    
    // Reset editing state if needed
    if (state.currentlyEditing) {
        state.currentlyEditing = null;
        elements.saveCalculation.textContent = 'Save Calculation';
        
        // Remove the cancel button if it exists
        const cancelButton = document.getElementById('cancel-edit');
        if (cancelButton) {
            cancelButton.remove();
        }
    }
    
    updateResults();
}

// Edit a saved calculation
function editCalculation(itemId) {
    const item = state.savedItems.find(item => item.id === itemId);
    
    if (item) {
        // Set editing state
        state.currentlyEditing = itemId;
        
        // Populate form with item data
        state.description = item.description;
        elements.description.value = item.description;
        
        // Set input mode
        switchInputMode(item.inputMode);
        
        if (item.inputMode === 'detailed') {
            state.materials = item.materials;
            state.labor = item.labor;
            elements.materials.value = item.materials;
            elements.labor.value = item.labor;
        } else {
            state.totalCost = item.totalCost;
            elements.totalCost.value = item.totalCost;
        }
        
        state.overhead = item.overhead;
        state.profit = item.profit;
        elements.overhead.value = item.overhead;
        elements.profit.value = item.profit;
        
        state.unit = item.unit;
        elements.unitType.value = item.unit;
        
        // Update button text
        elements.saveCalculation.textContent = 'Update Calculation';
        
        // Add a cancel button if it doesn't exist
        if (!document.getElementById('cancel-edit')) {
            const cancelButton = document.createElement('button');
            cancelButton.id = 'cancel-edit';
            cancelButton.className = 'btn btn-default';
            cancelButton.textContent = 'Cancel Edit';
            cancelButton.addEventListener('click', clearForm);
            
            // Insert before the clear form button
            elements.clearForm.parentNode.insertBefore(cancelButton, elements.clearForm);
        }
        
        // Scroll to the form
        elements.description.scrollIntoView({ behavior: 'smooth' });
        
        updateResults();
    }
}

// Delete a saved calculation
function deleteCalculation(itemId) {
    const item = state.savedItems.find(item => item.id === itemId);
    if (item && confirm(`Are you sure you want to delete "${item.description}"?`)) {
        // Check if the item is currently being edited
        if (state.currentlyEditing === itemId) {
            clearForm();
        }
        
        // Remove the item from the saved items
        state.savedItems = state.savedItems.filter(item => item.id !== itemId);
        
        // Update any combined items that might contain this item
        state.savedItems.forEach(item => {
            if (item.isCombined && item.childItems.includes(itemId)) {
                item.childItems = item.childItems.filter(id => id !== itemId);
            }
        });
        
        // Remove from selected items if needed
        state.selectedItems = state.selectedItems.filter(id => id !== itemId);
        
        // Update UI
        saveCurrentProject();
        renderSavedItems();
        updateSelectionUI();
    }
}

// Toggle selection of an item
function toggleItemSelection(itemId) {
    const index = state.selectedItems.indexOf(itemId);
    
    if (index === -1) {
        // Add to selection
        state.selectedItems.push(itemId);
    } else {
        // Remove from selection
        state.selectedItems.splice(index, 1);
    }
    
    updateSelectionUI();
}

// Update UI based on selection state
function updateSelectionUI() {
    const count = state.selectedItems.length;
    
    if (count > 0) {
        elements.selectionActions.style.display = 'block';
        elements.selectedCount.textContent = count;
    } else {
        elements.selectionActions.style.display = 'none';
    }
    
    // Update checkboxes
    const checkboxes = document.querySelectorAll('.saved-item-checkbox');
    checkboxes.forEach(checkbox => {
        const itemId = parseInt(checkbox.dataset.itemId);
        checkbox.checked = state.selectedItems.includes(itemId);
    });
}

// Clear all selections
function clearSelection() {
    state.selectedItems = [];
    updateSelectionUI();
}

// Toggle expansion of a combined item
function toggleItemExpansion(itemId) {
    const index = state.expandedItems.indexOf(itemId);
    
    if (index === -1) {
        // Expand item
        state.expandedItems.push(itemId);
    } else {
        // Collapse item
        state.expandedItems.splice(index, 1);
    }
    
    renderSavedItems();
}

// Open the combine modal
function openCombineModal() {
    if (state.selectedItems.length < 2) {
        showNotification('Please select at least 2 items to combine', 'error');
        return;
    }
    
    elements.combiningCount.textContent = state.selectedItems.length;
    
    // Populate the list of items being combined
    elements.combiningItemsList.innerHTML = '';
    
    state.selectedItems.forEach(itemId => {
        const item = state.savedItems.find(item => item.id === itemId);
        
        if (item) {
            const li = document.createElement('li');
            li.textContent = item.description;
            elements.combiningItemsList.appendChild(li);
        }
    });
    
    showModal(elements.combineModal);
}

// Combine selected calculations
function combineCalculations() {
    const description = elements.combineDescription.value.trim();
    const unit = elements.combineUnit.value;
    
    if (!description) {
        showNotification('Please enter a description for the combined item', 'error');
        return;
    }
    
    // Calculate the total cost
    let totalCost = 0;
    
    state.selectedItems.forEach(itemId => {
        const item = state.savedItems.find(item => item.id === itemId);
        
        if (item) {
            totalCost += item.results.total;
        }
    });
    
    // Create the combined item
    const combinedItem = {
        id: Date.now(),
        description,
        inputMode: 'total',
        materials: 0,
        labor: 0,
        totalCost,
        overhead: state.overhead,
        profit: state.profit,
        unit,
        isCombined: true,
        childItems: [...state.selectedItems],
        results: {
            subtotal: 0,
            overheadAmount: 0,
            profitAmount: 0,
            total: totalCost,
            ratePerUnit: totalCost
        }
    };
    
    // Add to saved items
    state.savedItems.push(combinedItem);
    
    // Clear selection
    clearSelection();
    
    // Update UI
    saveCurrentProject();
    renderSavedItems();
    
    // Close modal
    hideModal(elements.combineModal);
    
    // Reset form
    elements.combineDescription.value = '';
}

// Open the add to combined modal
function openAddToCombinedModal(combinedItemId) {
    state.selectedCombinedItem = combinedItemId;
    
    const combinedItem = state.savedItems.find(item => item.id === combinedItemId);
    
    if (combinedItem) {
        elements.targetCombinedName.textContent = combinedItem.description;
        
        // Populate selectable items list (exclude items already in the combined item)
        elements.selectableItemsList.innerHTML = '';
        
        const selectableItems = state.savedItems.filter(item => 
            !item.isCombined && !combinedItem.childItems.includes(item.id));
        
        if (selectableItems.length === 0) {
            const noItems = document.createElement('div');
            noItems.className = 'no-items';
            noItems.textContent = 'No items available to add';
            elements.selectableItemsList.appendChild(noItems);
        } else {
            selectableItems.forEach(item => {
                const itemElem = document.createElement('div');
                itemElem.className = 'selectable-item';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.dataset.itemId = item.id;
                
                const info = document.createElement('div');
                info.className = 'selectable-item-info';
                
                const title = document.createElement('div');
                title.className = 'selectable-item-title';
                title.textContent = item.description;
                
                const price = document.createElement('div');
                price.className = 'selectable-item-price';
                price.textContent = formatCurrency(item.results.total);
                
                info.appendChild(title);
                info.appendChild(price);
                
                itemElem.appendChild(checkbox);
                itemElem.appendChild(info);
                
                elements.selectableItemsList.appendChild(itemElem);
            });
        }
        
        showModal(elements.addToCombinedModal);
    }
}

// Add selected items to a combined calculation
function addToCombinedCalculation() {
    const combinedItem = state.savedItems.find(item => item.id === state.selectedCombinedItem);
    
    if (combinedItem) {
        // Get all checked items
        const checkboxes = elements.selectableItemsList.querySelectorAll('input[type="checkbox"]:checked');
        
        if (checkboxes.length === 0) {
            showNotification('Please select at least one item to add', 'error');
            return;
        }
        
        let totalToAdd = 0;
        
        checkboxes.forEach(checkbox => {
            const itemId = parseInt(checkbox.dataset.itemId);
            const item = state.savedItems.find(item => item.id === itemId);
            
            if (item && !combinedItem.childItems.includes(itemId)) {
                // Add to child items
                combinedItem.childItems.push(itemId);
                
                // Add to total cost
                totalToAdd += item.results.total;
            }
        });
        
        // Update combined item's total cost
        combinedItem.totalCost += totalToAdd;
        combinedItem.results.total += totalToAdd;
        combinedItem.results.ratePerUnit += totalToAdd;
        
        // Update UI
        saveCurrentProject();
        renderSavedItems();
        
        // Close modal
        hideModal(elements.addToCombinedModal);
        
        // Reset state
        state.selectedCombinedItem = null;
    }
}

// Render all saved items
function renderSavedItems() {
    elements.savedItemsList.innerHTML = '';
    
    if (state.savedItems.length === 0) {
        const noItems = document.createElement('div');
        noItems.className = 'no-items';
        noItems.textContent = 'No saved calculations yet. Save your first calculation above.';
        elements.savedItemsList.appendChild(noItems);
        return;
    }
    
    state.savedItems.forEach(item => {
        const itemElem = document.createElement('div');
        itemElem.className = 'saved-item';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'saved-item-header';
        
        // Left side info
        const info = document.createElement('div');
        info.className = 'saved-item-info';
        
        // Checkbox for selection
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'saved-item-checkbox';
        checkbox.dataset.itemId = item.id;
        checkbox.checked = state.selectedItems.includes(item.id);
        checkbox.addEventListener('change', () => toggleItemSelection(item.id));
        
        // Title
        const title = document.createElement('div');
        title.className = 'saved-item-title';
        
        const titleText = document.createElement('span');
        titleText.textContent = item.description;
        title.appendChild(titleText);
        
        // Add combined badge if applicable
        if (item.isCombined) {
            const badge = document.createElement('span');
            badge.className = 'combined-badge';
            badge.textContent = 'Combined';
            title.appendChild(badge);
            
            // Add item count info
            const itemCountBadge = document.createElement('span');
            itemCountBadge.className = 'item-count-badge';
            itemCountBadge.textContent = `${item.childItems.length} items`;
            title.appendChild(itemCountBadge);
        }
        
        info.appendChild(checkbox);
        info.appendChild(title);
        
        // Item details
        const details = document.createElement('div');
        details.className = 'saved-item-details';
        details.innerHTML = `
            Rate: ${formatCurrency(item.results.ratePerUnit)} per ${getUnitDisplayText(item.unit)} | 
            Input mode: ${item.inputMode === 'detailed' ? 'Detailed' : 'Total Cost'}
        `;
        info.appendChild(details);
        
        // Actions
        const actions = document.createElement('div');
        actions.className = 'saved-item-actions';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-primary';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editCalculation(item.id));
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-default';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteCalculation(item.id));
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        
        // Add to combined button (for combined items)
        if (item.isCombined) {
            const addBtn = document.createElement('button');
            addBtn.className = 'btn btn-default';
            addBtn.textContent = 'Add Items';
            addBtn.addEventListener('click', () => openAddToCombinedModal(item.id));
            actions.appendChild(addBtn);
            
            // Add toggle dropdown button
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'btn btn-default dropdown-toggle';
            toggleBtn.innerHTML = '<span class="dropdown-icon">&#9660;</span> Details';
            toggleBtn.addEventListener('click', () => toggleItemExpansion(item.id));
            actions.appendChild(toggleBtn);
        }
        
        header.appendChild(info);
        header.appendChild(actions);
        
        itemElem.appendChild(header);
        
        // Add child items as a dropdown if this is a combined item
        if (item.isCombined && item.childItems.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'children-dropdown';
            childrenContainer.style.display = state.expandedItems.includes(item.id) ? 'block' : 'none';
            
            const childrenTable = document.createElement('table');
            childrenTable.className = 'children-table';
            
            // Add table header
            const tableHeader = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            const descHeader = document.createElement('th');
            descHeader.textContent = 'Description';
            headerRow.appendChild(descHeader);
            
            const unitHeader = document.createElement('th');
            unitHeader.textContent = 'Unit';
            headerRow.appendChild(unitHeader);
            
            const costHeader = document.createElement('th');
            costHeader.textContent = 'Cost';
            headerRow.appendChild(costHeader);
            
            tableHeader.appendChild(headerRow);
            childrenTable.appendChild(tableHeader);
            
            // Add table body
            const tableBody = document.createElement('tbody');
            
            item.childItems.forEach(childId => {
                const childItem = state.savedItems.find(i => i.id === childId);
                
                if (childItem) {
                    const row = document.createElement('tr');
                    
                    const descCell = document.createElement('td');
                    descCell.textContent = childItem.description;
                    row.appendChild(descCell);
                    
                    const unitCell = document.createElement('td');
                    unitCell.textContent = getUnitDisplayText(childItem.unit);
                    row.appendChild(unitCell);
                    
                    const costCell = document.createElement('td');
                    costCell.textContent = formatCurrency(childItem.results.total);
                    row.appendChild(costCell);
                    
                    tableBody.appendChild(row);
                }
            });
            
            childrenTable.appendChild(tableBody);
            childrenContainer.appendChild(childrenTable);
            itemElem.appendChild(childrenContainer);
        }
        
        elements.savedItemsList.appendChild(itemElem);
    });
    
    updateSelectionUI();
}

// Show a modal
function showModal(modal) {
    modal.classList.add('show');
}

// Hide a modal
function hideModal(modal) {
    modal.classList.remove('show');
}

// Save current project
function saveCurrentProject() {
    if (state.currentProjectName === 'Untitled Project') {
        // If this is an unsaved project, prompt for a name
        showModal(elements.saveProjectModal);
        return;
    }
    
    // Find existing project or create a new one
    const existingIndex = state.savedProjects.findIndex(p => p.name === state.currentProjectName);
    
    if (existingIndex !== -1) {
        // Update existing project
        state.savedProjects[existingIndex] = {
            name: state.currentProjectName,
            lastSaved: new Date().toISOString(),
            items: state.savedItems
        };
    } else {
        // Create new project
        state.savedProjects.push({
            name: state.currentProjectName,
            lastSaved: new Date().toISOString(),
            items: state.savedItems
        });
    }
    
    // Save to localStorage
    saveStateToStorage();
    
    showNotification(`Project "${state.currentProjectName}" saved successfully`);
}

// Save project with a new name
function saveProjectAs() {
    const newName = elements.newProjectName.value.trim();
    
    if (!newName) {
        showNotification('Please enter a project name', 'error');
        return;
    }
    
    // Check if a project with this name already exists
    const existingIndex = state.savedProjects.findIndex(p => p.name === newName);
    
    if (existingIndex !== -1 && !confirm(`A project named "${newName}" already exists. Do you want to overwrite it?`)) {
        return;
    }
    
    // Update the current project name
    state.currentProjectName = newName;
    elements.projectName.textContent = newName;
    
    // Save the project
    saveCurrentProject();
    
    // Hide the modal
    hideModal(elements.saveProjectModal);
    
    // Clear the input
    elements.newProjectName.value = '';
}

// Populate the projects list
function populateProjectsList() {
    elements.projectsList.innerHTML = '';
    
    if (state.savedProjects.length === 0) {
        const noProjects = document.createElement('div');
        noProjects.className = 'no-projects';
        noProjects.textContent = 'No saved projects found';
        elements.projectsList.appendChild(noProjects);
        return;
    }
    
    // Sort projects by last saved date (newest first)
    const sortedProjects = [...state.savedProjects].sort((a, b) => 
        new Date(b.lastSaved) - new Date(a.lastSaved));
    
    sortedProjects.forEach(project => {
        const projectElem = document.createElement('div');
        projectElem.className = 'projects-list-item';
        
        const info = document.createElement('div');
        info.className = 'project-list-info';
        
        const name = document.createElement('h4');
        name.textContent = project.name;
        
        const meta = document.createElement('div');
        meta.className = 'project-list-meta';
        
        const lastSaved = new Date(project.lastSaved);
        const formattedDate = lastSaved.toLocaleDateString() + ' ' + lastSaved.toLocaleTimeString();
        meta.textContent = `Last saved: ${formattedDate} | Items: ${project.items.length}`;
        
        info.appendChild(name);
        info.appendChild(meta);
        
        const actions = document.createElement('div');
        
        const loadBtn = document.createElement('button');
        loadBtn.className = 'btn btn-primary';
        loadBtn.textContent = 'Load';
        loadBtn.addEventListener('click', () => loadProject(project.name));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-default';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteProject(project.name));
        
        actions.appendChild(loadBtn);
        actions.appendChild(deleteBtn);
        
        projectElem.appendChild(info);
        projectElem.appendChild(actions);
        
        elements.projectsList.appendChild(projectElem);
    });
}

// Load a project
function loadProject(projectName) {
    const project = state.savedProjects.find(p => p.name === projectName);
    
    if (project) {
        if (state.savedItems.length > 0 && 
            !confirm(`Loading another project will replace your current work. Are you sure?`)) {
            return;
        }
        
        // Update state
        state.currentProjectName = project.name;
        state.savedItems = [...project.items];
        
        // Update UI
        elements.projectName.textContent = project.name;
        renderSavedItems();
        
        // Hide the modal
        hideModal(elements.loadProjectModal);
        
        showNotification(`Project "${project.name}" loaded successfully`);
    }
}

// Delete a project
function deleteProject(projectName) {
    if (!confirm(`Are you sure you want to delete the project "${projectName}"?`)) {
        return;
    }
    
    // Remove from saved projects
    state.savedProjects = state.savedProjects.filter(p => p.name !== projectName);
    
    // If this is the current project, reset to untitled
    if (state.currentProjectName === projectName) {
        state.currentProjectName = 'Untitled Project';
        state.savedItems = [];
        elements.projectName.textContent = 'Untitled Project';
        renderSavedItems();
    }
    
    // Save to localStorage
    saveStateToStorage();
    
    // Update the projects list
    populateProjectsList();
    
    showNotification(`Project "${projectName}" deleted successfully`);
}

// Update the UI based on the current state
function updateUI() {
    elements.projectName.textContent = state.currentProjectName;
    renderSavedItems();
    switchInputMode(state.inputMode);
    
    // Update select value
    elements.unitType.value = state.unit;
}

// Save state to localStorage
function saveStateToStorage() {
    localStorage.setItem('rateCalculator', JSON.stringify({
        savedProjects: state.savedProjects
    }));
}

// Load state from localStorage
function loadStateFromStorage() {
    const savedData = localStorage.getItem('rateCalculator');
    
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        if (parsedData.savedProjects) {
            state.savedProjects = parsedData.savedProjects;
        }
    }
}

// Export the current project to PDF
function exportToPdf() {
    if (state.savedItems.length === 0) {
        showNotification('No items to export. Please add some calculations first.', 'error');
        return;
    }
    
    // Create a new jsPDF instance
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Rate Calculator - ${state.currentProjectName}`, 14, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Table configuration
    const startY = 40;
    let currentY = startY;
    const lineHeight = 7;
    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const col1Width = 20;
    const col2Width = 100;
    const col3Width = 30;
    const col4Width = 30;
    
    // Draw table header
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    
    doc.text('ID', margin, currentY);
    doc.text('Description', margin + col1Width, currentY);
    doc.text('Unit', margin + col1Width + col2Width, currentY);
    doc.text('Rate', margin + col1Width + col2Width + col3Width, currentY);
    
    currentY += lineHeight;
    
    // Draw a line
    doc.line(margin, currentY - 2, pageWidth - margin, currentY - 2);
    
    // Reset font
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    // Draw table rows
    state.savedItems.forEach((item, index) => {
        // Check if we need a new page
        if (currentY > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            currentY = startY;
        }
        
        // Item number
        doc.text(`${index + 1}`, margin, currentY);
        
        // Description (with word wrapping)
        const descriptionLines = doc.splitTextToSize(item.description, col2Width);
        doc.text(descriptionLines, margin + col1Width, currentY);
        
        // Unit
        doc.text(getUnitDisplayText(item.unit), margin + col1Width + col2Width, currentY);
        
        // Rate
        doc.text(formatCurrency(item.results.ratePerUnit), margin + col1Width + col2Width + col3Width, currentY);
        
        // Update Y position for the next row (account for multiline descriptions)
        currentY += Math.max(descriptionLines.length * 5, lineHeight);
        
        // Draw a line for combined items
        if (item.isCombined) {
            // Draw child items
            item.childItems.forEach(childId => {
                const childItem = state.savedItems.find(i => i.id === childId);
                
                if (childItem) {
                    // Check if we need a new page
                    if (currentY > doc.internal.pageSize.getHeight() - 20) {
                        doc.addPage();
                        currentY = startY;
                    }
                    
                    // Indent and mark as child
                    doc.text(`  └ `, margin, currentY);
                    
                    // Description
                    const childDescLines = doc.splitTextToSize(childItem.description, col2Width - 10);
                    doc.text(childDescLines, margin + col1Width + 10, currentY);
                    
                    // Unit
                    doc.text(getUnitDisplayText(childItem.unit), margin + col1Width + col2Width, currentY);
                    
                    // Cost
                    doc.text(formatCurrency(childItem.results.total), margin + col1Width + col2Width + col3Width, currentY);
                    
                    // Update Y position
                    currentY += Math.max(childDescLines.length * 5, lineHeight);
                }
            });
        }
        
        // Add a separation line
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, currentY - 2, pageWidth - margin, currentY - 2);
        doc.setDrawColor(0, 0, 0);
    });
    
    // Add total
    currentY += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Total Items:', margin, currentY);
    doc.text(`${state.savedItems.length}`, margin + 60, currentY);
    
    // Save the PDF
    doc.save(`${state.currentProjectName.replace(/\s+/g, '_')}.pdf`);
}
