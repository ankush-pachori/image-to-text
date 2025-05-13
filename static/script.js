document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const imagePreview = document.getElementById('imagePreview');
    const extractBtn = document.getElementById('extractBtn');
    const searchBtn = document.getElementById('searchBtn');
    const copyBtn = document.getElementById('copyBtn');
    const extractedText = document.getElementById('extractedText');
    const loader = document.getElementById('loader');

    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            showNotification('Please upload an image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            dropZone.style.display = 'none';
            extractBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    extractBtn.addEventListener('click', async () => {
        const img = imagePreview.querySelector('img');
        if (!img) return;

        try {
            showLoader(true);
            const response = await fetch('/extract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: img.src })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            extractedText.value = data.text;
            searchBtn.disabled = false;
            copyBtn.disabled = false;
            showNotification('Text extracted successfully!', 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            showLoader(false);
        }
    });

    searchBtn.addEventListener('click', () => {
        const text = extractedText.value.trim();
        if (text) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(text)}`, '_blank');
        }
    });

    copyBtn.addEventListener('click', () => {
        extractedText.select();
        document.execCommand('copy');
        showNotification('Text copied to clipboard!', 'success');
    });

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    function showLoader(show) {
        loader.style.display = show ? 'flex' : 'none';
        extractBtn.disabled = show;
    }
});