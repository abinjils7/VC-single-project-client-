
try {
    const form = new FormData();
    form.append('authorId', '65d4c8f8e4b0a1b2c3d4e5f6');
    form.append('postId', 'test-' + Date.now());
    form.append('content', 'Test content from script');

    const response = await fetch('http://localhost:5000/post/newpost', {
        method: 'POST',
        body: form,
    });

    const text = await response.text();
    console.log('Response:', response.status, text);
} catch (error) {
    console.error('Error:', error.message);
}
