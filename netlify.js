// This file helps Netlify serve the Next.js application correctly
exports.handler = async function(event, context) {
  // Get the requested path
  const path = event.path;
  
  // Handle Next.js static assets
  if (path.startsWith('/_next/')) {
    return {
      statusCode: 200,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    };
  }
  
  // For all other paths, let Next.js handle it
  return {
    statusCode: 200,
    body: '',
    headers: {
      'Content-Type': 'text/html'
    }
  };
}; 