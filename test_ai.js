async function test() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/ai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: 'What is Bashcare Hub?' }),
        });
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Test failed:', error);
    }
}

test();
