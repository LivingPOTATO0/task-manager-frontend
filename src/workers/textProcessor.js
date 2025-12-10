// Text Processor Web Worker
// Simulates CPU-heavy text processing with progress reporting

self.onmessage = (event) => {
    const { text } = event.data;

    if (!text) {
        self.postMessage({ type: 'error', message: 'No text provided' });
        return;
    }

    try {
        // Step 1: Reverse text (simulate work with progress)
        self.postMessage({ type: 'progress', value: 25, step: 'Reversing text...' });
        let step1Result = '';
        for (let i = text.length - 1; i >= 0; i--) {
            step1Result += text[i];
        }

        // Step 2: Uppercase conversion
        self.postMessage({ type: 'progress', value: 50, step: 'Converting to uppercase...' });
        const step2Result = step1Result.toUpperCase();

        // Step 3: Frequency analysis (simulate intensive work)
        self.postMessage({ type: 'progress', value: 75, step: 'Analyzing character frequency...' });
        const frequency = {};
        for (let i = 0; i < step2Result.length; i++) {
            const char = step2Result[i];
            if (char !== ' ') {
                frequency[char] = (frequency[char] || 0) + 1;
            }
        }

        // Step 4: Sort by frequency
        self.postMessage({ type: 'progress', value: 90, step: 'Sorting results...' });
        const sorted = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([char, count]) => `${char}: ${count}`)
            .join(', ');

        // Completion
        self.postMessage({ type: 'progress', value: 100, step: 'Complete!' });

        const result = {
            original: text,
            reversed: step1Result,
            uppercase: step2Result,
            characterCount: text.length,
            topCharacters: sorted,
            processedAt: new Date().toISOString(),
        };

        self.postMessage({ type: 'done', result });
    } catch (error) {
        self.postMessage({ type: 'error', message: error.message });
    }
};
