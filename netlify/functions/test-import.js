
if (typeof import.meta === 'undefined') {
  global.import = { meta: { url: __filename } };
}

export const handler = async () => {
  try {
    const transformers = await import('@xenova/transformers');
    return {
      statusCode: 200,
      body: JSON.stringify({
        imported: !!transformers,
        keys: transformers ? Object.keys(transformers) : null,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message, stack: error.stack }),
    };
  }
};
