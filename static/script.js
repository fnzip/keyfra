document.addEventListener('DOMContentLoaded', function () {
    // Selectors
    const objectButtons = document.querySelectorAll('.object-btn');
    const boxOptions = document.getElementById('box-options');
    const imageOptions = document.getElementById('image-options');
    const textOptions = document.getElementById('text-options');
    const imageUpload = document.getElementById('image-upload');
    const dropZone = document.querySelector('.drop-zone');
    const textInput = document.getElementById('text-input');
    const canvas = document.querySelector('.canvas');
    const generateBtn = document.querySelector('.generate-btn');
    const cssOutput = document.getElementById('css-output');
    const exportBtn = document.querySelector('.export-btn');
    const durationInput = document.getElementById('duration');
    const durationUnit = document.getElementById('duration-unit');
    const timingFunction = document.getElementById('timing-function');

    // Animation data storage
    let currentAnimation = null;
    let currentElement = null;

    // Object type selection
    objectButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            objectButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            // Show corresponding options
            const objectType = this.getAttribute('data-type');
            if (objectType !== 'text') {
                textInput.value = '';
            }
            showObjectOptions(objectType);

            // Create the element on the canvas
            createCanvasElement(objectType);
        });
    });

    // Show options based on selected object type
    function showObjectOptions(type) {
        // Hide all options first
        boxOptions.style.display = 'none';
        imageOptions.style.display = 'none';
        textOptions.style.display = 'none';

        // Show options for selected type
        if (type === 'box') {
            boxOptions.style.display = 'block';
        } else if (type === 'image') {
            imageOptions.style.display = 'block';
        } else if (type === 'text') {
            textOptions.style.display = 'block';
        }
    }

    // Create element on canvas based on type
    function createCanvasElement(type, data = null) {
        // Clear previous element
        clearCanvas();

        if (type === 'box') {
            currentElement = createBoxElement();
        } else if (type === 'image' && data) {
            currentElement = createImageElement(data);
        } else if (type === 'text') {
            currentElement = createTextElement(data || 'Sample Text');
        }

        // Apply animation if one is active
        if (currentAnimation) {
            applyCurrentAnimation();
        }
    }

    // Clear canvas
    function clearCanvas() {
        while (canvas.firstChild) {
            canvas.removeChild(canvas.firstChild);
        }
    }

    // Create box element
    function createBoxElement() {
        const box = document.createElement('div');
        box.className = 'box';
        canvas.appendChild(box);
        return box;
    }

    // Create image element
    function createImageElement(src) {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'image-element';
        img.alt = 'Uploaded image';
        canvas.appendChild(img);
        return img;
    }

    // Create text element
    function createTextElement(text) {
        const textElement = document.createElement('div');
        textElement.className = 'text-element';
        textElement.textContent = text;
        canvas.appendChild(textElement);
        return textElement;
    }

    // Handle image upload via file input
    imageUpload.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                createCanvasElement('image', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle image drag and drop
    dropZone.addEventListener('click', function () {
        imageUpload.click();
    });

    dropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = '#4a6cf7';
    });

    dropZone.addEventListener('dragleave', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = '#ccc';
    });

    dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = '#ccc';

        const file = e.dataTransfer.files[0];
        if (file && file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                createCanvasElement('image', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle text input
    textInput.addEventListener('input', function () {
        const text = this.value.trim() || 'Sample Text';
        createCanvasElement('text', text);
    });

    // Add error message container after generation button
    const generateBtnContainer = generateBtn.parentElement;
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.style.color = '#ff3636';
    errorContainer.style.padding = '10px 0';
    errorContainer.style.textAlign = 'center';
    errorContainer.style.display = 'none';
    generateBtnContainer.appendChild(errorContainer);

    // API client implementation
    const apiClient = {
        generateFromPrompt: function (prompt) {
            return fetch('/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: prompt
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                });
        }
    };

    // Apply animation to element
    function applyAnimation(element, animationData, options = {}) {
        if (!element || !animationData) return;

        // Create animation name
        const animName = animationData.name;

        // Remove any existing animation styles
        const existingStyle = document.getElementById(`style-${animName}`);
        if (existingStyle) {
            existingStyle.remove();
        }

        // Create style element
        const style = document.createElement('style');
        style.id = `style-${animName}`;

        // Get animation options
        const duration = options.duration || `${durationInput.value}${durationUnit.value}`;
        const timing = options.timing || timingFunction.value;

        // Create keyframes
        style.textContent = `
            @keyframes ${animName} {
                ${animationData.keyframes}
            }
        `;

        // Add style to document head
        document.head.appendChild(style);

        // Apply animation to element
        element.style.animation = `${animName} ${duration} ${timing} 0s infinite normal forwards`;
        const generatedCss = `/* Keyframe Animation */
@keyframes ${animName} {
    ${animationData.keyframes}
}

/* Element Animation */
.element {
    animation: ${animName} ${duration} ${timing} 0s infinite normal forwards;
}`;

        cssOutput.value = css_beautify(generatedCss, {
            "indent_size": "4",
            "indent_char": " ",
            "max_preserve_newlines": "-1",
            "preserve_newlines": false,
            "keep_array_indentation": false,
            "break_chained_methods": false,
            "indent_scripts": "separate",
            "brace_style": "collapse",
            "space_before_conditional": true,
            "unescape_strings": false,
            "jslint_happy": false,
            "end_with_newline": false,
            "wrap_line_length": "0",
            "indent_inner_html": false,
            "comma_first": false,
            "e4x": false,
            "indent_empty_lines": false
        });
    }

    // Show error message in the error container
    function showError(message) {
        errorContainer.innerHTML = `<strong>Error:</strong> ${message}<br><small>Please try again or check your connection.</small>`;
        errorContainer.style.display = 'block';

        // Hide error message after 5 seconds
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    }

    // Apply the current animation to the current element
    function applyCurrentAnimation() {
        if (currentElement && currentAnimation) {
            const options = {
                duration: `${durationInput.value}${durationUnit.value}`,
                timing: timingFunction.value
            };
            applyAnimation(currentElement, currentAnimation, options);
        }
    }

    // Update animation when options change
    durationInput.addEventListener('change', applyCurrentAnimation);
    durationUnit.addEventListener('change', applyCurrentAnimation);
    timingFunction.addEventListener('change', applyCurrentAnimation);

    // Generate animation from prompt
    generateBtn.addEventListener('click', function () {
        const prompt = document.querySelector('.prompt-input').value;

        if (!prompt.trim()) {
            alert("Please enter a prompt first");
            return;
        }

        // Hide any previous error
        errorContainer.style.display = 'none';

        // Show loading state
        generateBtn.textContent = "Generating...";
        generateBtn.disabled = true;

        // Clear previous CSS output
        cssOutput.value = '';

        // Call API to generate animation
        apiClient.generateFromPrompt(prompt)
            .then(animationData => {
                currentAnimation = animationData;

                // Apply the animation to current element
                if (currentElement) {
                    applyCurrentAnimation();
                } else {
                    // Create a default box if no element exists
                    objectButtons[0].click(); // Click the box button
                }

                // Reset button
                generateBtn.textContent = "Generate Animation";
                generateBtn.disabled = false;
            })
            .catch(error => {
                console.error("Error generating animation:", error);
                showError("Failed to generate animation from prompt");
                generateBtn.textContent = "Generate Animation";
                generateBtn.disabled = false;
            });
    });

    // Copy styles to clipboard
    exportBtn.addEventListener('click', function () {
        if (cssOutput.value) {
            // Copy to clipboard
            cssOutput.select();
            document.execCommand('copy');

            // Provide user feedback
            const originalText = exportBtn.textContent;
            exportBtn.textContent = "Copied!";

            // Reset button text after 2 seconds
            setTimeout(() => {
                exportBtn.textContent = originalText;
            }, 2000);
        } else {
            alert("No animation to copy. Generate an animation first!");
        }
    });

    // Initialize with default box
    createBoxElement();

    // Update export button text to "Copy Styles"
    exportBtn.textContent = "Copy Styles";
});
