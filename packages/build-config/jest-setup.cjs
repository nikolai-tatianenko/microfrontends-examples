const { TextDecoder, TextEncoder } = require("node:util");

// jsdom omits these; React Router 7 needs them at import time.
globalThis.TextEncoder ??= TextEncoder;
globalThis.TextDecoder ??= TextDecoder;

// Unit tests must not touch the network. Apollo's HttpLink needs a fetch to exist, so install one that fails loudly.
globalThis.fetch ??= () =>
  Promise.reject(
    new Error(
      "Unexpected network call in a test. Mock the Apollo client or use MockedProvider.",
    ),
  );

require("@testing-library/jest-dom");
// Project convention: interactive elements carry data-test-id (not data-testid).
require("@testing-library/dom").configure({ testIdAttribute: "data-test-id" });
