        // Simple copy to clipboard function for bank details
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(function() {
                alert('Copied to clipboard: ' + text);
            });
        }

        // Make bank details copyable
        document.addEventListener('DOMContentLoaded', function() {
            const bankItems = document.querySelectorAll('.bank-item');
            bankItems.forEach(item => {
                item.style.cursor = 'pointer';
                item.addEventListener('click', function() {
                    const text = this.textContent.replace(this.querySelector('strong').textContent, '').trim();
                    copyToClipboard(text);
                });
            });
        });