async function loadLinks() {
    const response = await fetch('/api/links');
    const data = await response.json();
    const linksContainer = document.getElementById('links-container');
    linksContainer.innerHTML = '';

    data.categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('square-section', 'category-container');
				categoryDiv.draggable = true;

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

    // Initialize search
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
    const searchContainer = document.getElementById('search-container');
    const autocompleteList = document.createElement('ul');

    if (!searchContainer) {
        console.error("Search container element with ID 'search-container' not found.");
        return;
    }

    autocompleteList.id = 'command-autocomplete';
    autocompleteList.classList.add('command-autocomplete-list');
    autocompleteList.style.position = 'absolute';
    autocompleteList.style.zIndex = '1001';
    autocompleteList.style.display = 'none'; // Initially hidden
    searchContainer.style.position = 'relative'; // Ensure search container is positioned for absolute child
    searchContainer.appendChild(autocompleteList);

    // Position the autocomplete list relative to the search input
    function updateAutocompletePosition() {
        if (searchInput && autocompleteList && searchContainer) {
            const inputRect = searchInput.getBoundingClientRect();
            const containerRect = searchContainer.getBoundingClientRect();

            autocompleteList.style.top = `${inputRect.bottom - containerRect.top + window.scrollY}px`;
            autocompleteList.style.left = `${inputRect.left - containerRect.left + window.scrollX}px`;
            autocompleteList.style.width = `${inputRect.width}px`; // Match input width
        }
    }

    // Update position on initial load and window resize
    updateAutocompletePosition();
    window.addEventListener('resize', updateAutocompletePosition);

    const availableCommands = [
        ':link-delete ',
        ':category-delete '
        // Add more commands here as you implement them
    ];

    if (searchInput) {
        // Keybind to select the search bar (Escape)
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                searchInput.focus();
            }
        });

        // Keybind to delete the content of the search bar (Alt + Backspace)
        document.addEventListener('keydown', function(event) {
            if (event.altKey && event.key === 'Backspace') {
                event.preventDefault();
                searchInput.value = '';
            }
        });

        // Command mode functionality and autocomplete
        searchInput.addEventListener('input', function() {
            const inputValue = searchInput.value.trim();
            autocompleteList.innerHTML = ''; // Clear previous suggestions
            autocompleteList.style.display = 'none';

            if (inputValue.startsWith(':')) {
                const currentInput = inputValue.toLowerCase();
                const suggestions = availableCommands.filter(command =>
                    command.toLowerCase().startsWith(currentInput) && command.toLowerCase() !== currentInput
                );

                if (suggestions.length > 0) {
                    suggestions.forEach(suggestion => {
                        const listItem = document.createElement('li');
                        listItem.textContent = suggestion;
                        listItem.classList.add('command-autocomplete-item'); // Add a CSS class for items

                        listItem.addEventListener('click', function() {
                            searchInput.value = suggestion;
                            autocompleteList.style.display = 'none';
                            searchInput.focus();
                        });

                        autocompleteList.appendChild(listItem);
                    });
                    autocompleteList.style.display = 'block';
                    updateAutocompletePosition(); // Update position if content changes
                }
            }
        });

        searchInput.addEventListener('keydown', function(event) {
            if (searchInput.value.startsWith(':') && event.key === 'Enter') {
                event.preventDefault();
                const command = searchInput.value.trim();
                handleCommand(command);
                searchInput.value = '';
                autocompleteList.style.display = 'none'; // Hide suggestions on command execution
            } else if (event.key === 'Escape') {
                autocompleteList.style.display = 'none'; // Hide suggestions on Escape
            }
        });

        // Handle clicks outside the autocomplete to close it
        document.addEventListener('click', function(event) {
            if (autocompleteList.style.display === 'block' && !event.target.closest('#search-container')) {
                autocompleteList.style.display = 'none';
            }
        });
    } else {
        console.error("Search input element with ID 'link-search' not found.");
    }

    async function handleCommand(command) {
        if (command.startsWith(':link-delete ')) {
            const linkNameToDelete = command.substring(':link-delete '.length).trim();
            if (linkNameToDelete) {
                const confirmed = confirm(`Are you sure you want to delete the link "${linkNameToDelete}"?`);
                if (confirmed) {
                    const linksContainer = document.getElementById('links-container');
                    linksContainer.querySelectorAll('.links-grid').forEach(async (grid) => {
                        const categoryName = grid.previousElementSibling?.querySelector('.category-title')?.textContent;
                        const initialLinkCount = grid.querySelectorAll('.link-item').length;
                        const updatedLinks = Array.from(grid.querySelectorAll('.link-item'))
                            .filter(item => item.querySelector('a')?.textContent !== linkNameToDelete)
                            .map(item => item.querySelector('a')?.textContent);

                        if (updatedLinks.length < initialLinkCount && categoryName) {
                            const response = await fetch('/api/reorder-links', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ category: categoryName, order: updatedLinks }),
                            });

                            if (response.ok) {
                                const result = await response.json();
                                console.log(result.message);
                                loadLinks(); // Ensure loadLinks is defined elsewhere
                            } else {
                                const errorResult = await response.json();
                                console.error('Error deleting link:', errorResult.error || response.statusText);
                                // Optionally provide user feedback
                            }
                        }
                    });
                }
            } else {
                alert('Please specify the name of the link to delete.');
            }
        } else if (command.startsWith(':category-delete ')) {
            const categoryNameToDelete = command.substring(':category-delete '.length).trim();
            if (categoryNameToDelete) {
                const confirmed = confirm(`Are you sure you want to delete the category "${categoryNameToDelete}" and all its links?`);
                if (confirmed) {
                    const linksContainer = document.getElementById('links-container');
                    const initialCategoryCount = linksContainer.children.length;
                    const updatedCategories = Array.from(linksContainer.children)
                        .filter(categoryDiv => categoryDiv.querySelector('.category-title')?.textContent !== categoryNameToDelete)
                        .map(categoryDiv => categoryDiv.querySelector('.category-title')?.textContent)
                        .filter(Boolean); // Filter out null if title is not found

                    if (updatedCategories.length < initialCategoryCount) {
                        const response = await fetch('/api/reorder-categories', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                },
                            body: JSON.stringify({ order: updatedCategories }),
                        });

                        if (response.ok) {
                            const result = await response.json();
                            console.log(result.message);
                            loadLinks(); // Reload to update UI
                        } else {
                            const errorResult = await response.json();
                            console.error('Error deleting category:', errorResult.error || response.statusText);
                            // Optionally provide user feedback
                        }
                    } else {
                        alert(`Category "${categoryNameToDelete}" not found.`);
                    }
                }
            } else {
                alert('Please specify the name of the category to delete.');
            }
        } else {
            // Default search functionality (if any)
            console.log('Performing search for:', searchInput.value);
            // You would implement your regular search logic here
        }
    }

    // Assume loadLinks and other initialization functions are defined elsewhere.
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

				event.stopPropagation();

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

/* drag and drop for category */
document.addEventListener('DOMContentLoaded', function() {
    const linksContainer = document.getElementById('links-container');
    let draggedCategory = null;

    function handleCategoryDragStart(event) {
        draggedCategory = event.target.closest('.category-container');
        if (!draggedCategory) return;

        draggedCategory.classList.add('dragging-category');
        event.dataTransfer.setData('text/plain', null); // Required for Firefox
    }

    function handleCategoryDragOver(event) {
        event.preventDefault(); // Allow drop

        if (!draggedCategory) return;

        const dropTargetCategory = event.target.closest('.category-container');

        if (dropTargetCategory && draggedCategory !== dropTargetCategory) {
            const draggedIndex = Array.from(linksContainer.children).indexOf(draggedCategory);
            const dropIndex = Array.from(linksContainer.children).indexOf(dropTargetCategory);

            if (draggedIndex < dropIndex) {
                dropTargetCategory.after(draggedCategory);
            } else {
                dropTargetCategory.before(draggedCategory);
            }
        }
    }

    function handleCategoryDragEnd(event) {
        if (!draggedCategory) return;
        draggedCategory.classList.remove('dragging-category');
        draggedCategory = null;

        // Optionally send the new category order to the server
        const newCategoryOrder = Array.from(linksContainer.children).map(container => {
            const titleElement = container.querySelector('.category-title');
            return titleElement ? titleElement.textContent : null; // Or a more reliable identifier
        }).filter(Boolean);
        sendNewCategoryOrderToServer(newCategoryOrder);
    }

    linksContainer.addEventListener('dragstart', handleCategoryDragStart);
    linksContainer.addEventListener('dragover', handleCategoryDragOver);
    linksContainer.addEventListener('dragend', handleCategoryDragEnd);
});

function sendNewCategoryOrderToServer(order) {
    fetch('/api/reorder-categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: order }),
    })
				.then(response => {
						if (!response.ok) {
								console.error('Failed to send category order to server:', response.status);
						} else {
								console.log('Category order updated on server.');
								// Optionally reload links to ensure consistency
						}
				})
				.catch(error => {
						console.error('Error sending category order to server:', error);
				});
}
