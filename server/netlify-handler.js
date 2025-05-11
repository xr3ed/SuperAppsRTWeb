// server/netlify-handler.js
exports.handler = async (event, context) => {
  console.log("netlify-handler.js: Basic handler invoked!");
  console.log("netlify-handler.js: Event path:", event.path); // Log path yang diterima

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Ultra-Simplified Netlify Function is ALIVE!" }),
  };
};

console.log("netlify-handler.js: Basic handler script executed and exported."); 