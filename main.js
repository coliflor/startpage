async function loadLinks() {
    const response = await fetch('/api/links');
    const data = await response.json();
    const linksContainer = document.getElementById('links-container');
    linksContainer.innerHTML = '';

    data.categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('square-section', 'category-container');

        const categoryHeader = document.createElement('div');
        categoryHeader.classList.add('category-header');

        const categoryTitle = document.createElement('h2');
        categoryTitle.classList.add('category-title');
        categoryTitle.textContent = category.name;
        categoryHeader.appendChild(categoryTitle);

        categoryDiv.appendChild(categoryHeader);

        const linksGrid = document.createElement('div');
        linksGrid.classList.add('links-grid');
        category.links.forEach(link => {
            const linkItem = document.createElement('div');
            linkItem.classList.add('link-item');
            linkItem.dataset.category = category.name;
						linkItem.draggable = true;
            linkItem.innerHTML = `<a href="${link.url}">${link.name}</a>`;
            linksGrid.appendChild(linkItem);
        });
        categoryDiv.appendChild(linksGrid);

        linksContainer.appendChild(categoryDiv);
    });

    // Populate the category dropdown in the add link form
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '';
    data.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });

    // Initialize search (assuming this is already defined)
    initializeSearch();

    // Initialize drag and drop after links are loaded
    initializeDragAndDrop();
}

async function addLink() {
    const categorySelect = document.getElementById('category');
    const nameInput = document.getElementById('name');
    const urlInput = document.getElementById('url');
    const category = categorySelect.value;
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();

    if (category && name && url) {
        const response = await fetch('/api/links', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ category, name, url }),
        });

        if (response.ok) {
            nameInput.value = '';
            urlInput.value = '';
            loadLinks();
        } else {
            alert('Failed to add link.');
        }
    } else {
        alert('Please select a category and enter both name and URL.');
    }
}

async function addCategory() {
    const newCategoryInput = document.getElementById('new-category-name');
    const newCategoryName = newCategoryInput.value.trim();

    if (newCategoryName) {
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newCategoryName }),
        });

        if (response.ok) {
            newCategoryInput.value = '';
            loadLinks(); // Reload to update the category list
        } else {
            alert('Failed to add category.');
        }
    } else {
        alert('Please enter a category name.');
    }
}

// Load initial links when the page loads
loadLinks();

/*  search */
function handleLinkSearchInput(input, linkItemElements) {
		input.addEventListener("input", () => {
				const value = input.value.toLowerCase().trim();

				if (value === "") {
						resetLinkItemStyles(linkItemElements);
						return;
				}

				linkItemElements.forEach((linkItem) => {
						const anchorElement = linkItem.querySelector("a");
						if (anchorElement) {
								const text = anchorElement.textContent.toLowerCase();
								const isMatch = text.includes(value);

								linkItem.classList.toggle("highlight", isMatch);
								anchorElement.classList.toggle("highlight-link", isMatch);
						} else {
								linkItem.classList.remove("highlight");
						}
				});
		});

		input.addEventListener("blur", function () {
				if (input.value === "") {
						resetLinkItemStyles(linkItemElements);
				}
		});
}

function resetLinkItemStyles(elements) {
		elements.forEach((element) => {
				element.classList.remove("highlight");
				const anchor = element.querySelector("a");
				if (anchor) {
						anchor.classList.remove("highlight-link");
				}
		});
}

function initializeSearch() {
		const linkSearchInput = document.getElementById("link-search");
		const linkItems = document.querySelectorAll(".link-item");

		if (linkSearchInput && linkItems.length > 0) {
				handleLinkSearchInput(linkSearchInput, linkItems);
				resetLinkItemStyles(linkItems);
		} else {
				console.error("Search input or link items not found in the DOM during initializeSearch.");
		}
}

document.addEventListener("DOMContentLoaded", function() {
		// Find the search input early (it's likely static)
		const linkSearchInput = document.getElementById("link-search");
		if (!linkSearchInput) {
				console.error("Search input element with ID 'link-search' not found.");
				return;
		}

		// Call the function that loads the links
		loadLinks();
});

/* forms */
document.addEventListener('DOMContentLoaded', function() {
    const formsContainers = document.querySelectorAll('#forms-container');
    const toggleFormsButton = document.getElementById('toggle-forms-button');

    const initiallyHidden = formsContainers[0].classList.contains('hidden');
    toggleFormsButton.textContent = initiallyHidden ? 'Hide' : 'Show';

    toggleFormsButton.addEventListener('click', function() {
        formsContainers.forEach(container => {
            container.classList.toggle('hidden');
        });

        // Toggle the button text based on its *current* text
        if (toggleFormsButton.textContent === 'Show') {
            toggleFormsButton.textContent = 'Hide';
        } else {
            toggleFormsButton.textContent = 'Show';
        }
    });
});

/* Search bar keybinds */
document.addEventListener('DOMContentLoaded', function() {
		const searchInput = document.getElementById('link-search');

		if (searchInput) {
				// Keybind to select the search bar (e.g., Escape)
				document.addEventListener('keydown', function(event) {
						if (event.key === 'Escape') {
								event.preventDefault(); // Prevent default browser behavior
								searchInput.focus();
						}
				});

				// Keybind to delete the content of the search bar (e.g., Alt + Backspace)
				document.addEventListener('keydown', function(event) {
						if (event.altKey && event.key === 'Backspace') {
								event.preventDefault(); // Prevent default browser behavior
								searchInput.value = '';
						}
				});
		} else {
				console.error("Search input element with ID 'link-search' not found.");
		}
});

/* calcuator */
const calculator = document.querySelector('.calculator');
const keys = calculator.querySelector('.calculator__keys');
const display = calculator.querySelector('.calculator__output');

let firstValue = null;
let operator = null;
let waitingForSecondValue = false;

function updateDisplay(value) {
    display.textContent = value;
}

keys.addEventListener('click', function(e) {
    const target = e.target;
    const value = target.textContent;

    if (!target.matches('button')) {
        return;
    }

    if (target.classList.contains('calculator__key--operator')) {
        handleOperator(value);
        return;
    }

    if (target.classList.contains('calculator__key--enter')) {
        performCalculation();
        return;
    }

    if (target.textContent === 'AC') { // Correctly identify the AC button
        resetCalculator();
        return;
    }

    inputDigit(value);
});

function inputDigit(digit) {
    if (waitingForSecondValue === true) {
        display.textContent = digit;
        waitingForSecondValue = false;
    } else {
        display.textContent = display.textContent === '0' ? digit : display.textContent + digit;
    }
}

function handleOperator(nextOperator) {
    const currentValue = parseFloat(display.textContent);

    if (operator && waitingForSecondValue) {
        operator = nextOperator;
        return;
    }

    if (firstValue === null) {
        firstValue = currentValue;
    } else if (operator) {
        const result = calculate(firstValue, currentValue, operator);
        display.textContent = String(result);
        firstValue = result;
    }

    waitingForSecondValue = true;
    operator = nextOperator;
}

function calculate(first, second, operator) {
    if (operator === '+') {
        return first + second;
    } else if (operator === '-') {
        return first - second;
    } else if (operator === '×') {
        return first * second;
    } else if (operator === '÷') {
        return first / second;
    }
    return second;
}

function performCalculation() {
    if (firstValue === null || operator === null || waitingForSecondValue) {
        return;
    }

    const secondValue = parseFloat(display.textContent);
    const result = calculate(firstValue, secondValue, operator);
    display.textContent = String(result);
    firstValue = result;
    operator = null;
    waitingForSecondValue = false;
}

function resetCalculator() {
    display.textContent = '0';
    firstValue = null;
    operator = null;
    waitingForSecondValue = false;
}

/* Drag and drop */
function initializeDragAndDrop() {
    const linksGrids = document.querySelectorAll('.links-grid');
    let draggedItem = null;

    function handleDragStart(event) {
        draggedItem = event.target.closest('.link-item');
        if (!draggedItem) return;

        draggedItem.classList.add('dragging');
        event.dataTransfer.setData('text/plain', null); // Required for Firefox
    }

    function handleDragOver(event) {
        event.preventDefault(); // Allow drop
        if (!draggedItem) return;

        const dropTarget = event.target.closest('.link-item');
        const currentLinksGrid = draggedItem.closest('.links-grid');
        const dropTargetLinksGrid = dropTarget ? dropTarget.closest('.links-grid') : null;

        if (dropTarget && currentLinksGrid === dropTargetLinksGrid && draggedItem !== dropTarget) {
            const draggedIndex = Array.from(currentLinksGrid.children).indexOf(draggedItem);
            const dropIndex = Array.from(currentLinksGrid.children).indexOf(dropTarget);

            if (draggedIndex < dropIndex) {
                dropTarget.after(draggedItem);
            } else {
                dropTarget.before(draggedItem);
            }
        }
    }

		function handleDragEnd(event) {
				if (!draggedItem) return;
				draggedItem.classList.remove('dragging');

				const currentLinksGrid = draggedItem.closest('.links-grid');
				const categoryName = draggedItem.dataset.category;
				if (currentLinksGrid && categoryName) {
						const linkItemsInCategory = currentLinksGrid.querySelectorAll(`[data-category="${categoryName}"]`);
						const newOrder = Array.from(linkItemsInCategory).map(item => {
								return item.querySelector('a').textContent; // Send the link name
						});

						sendNewOrderToServer(categoryName, newOrder);
				}

				draggedItem = null;
		}

		function sendNewOrderToServer(category, order) {
				fetch('/api/reorder-links', {
						method: 'POST',
						headers: {
								'Content-Type': 'application/json',
						},
						body: JSON.stringify({ category: category, order: order }),
				})
						.then(response => {
								if (!response.ok) {
										console.error('Failed to send link order to server:', response.status);
								} else {
										console.log('Link order updated on server.');
										// Optionally reload links to ensure consistency
								}
						})
						.catch(error => {
								console.error('Error sending link order to server:', error);
						});
		}

    linksGrids.forEach(grid => {
        grid.addEventListener('dragstart', handleDragStart);
        grid.addEventListener('dragover', handleDragOver);
        grid.addEventListener('dragend', handleDragEnd);
    });
}
