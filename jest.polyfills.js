const { TextEncoder, TextDecoder } = require("util");
const { TransformStream } = require("stream/web");

Object.assign(global, { TextDecoder, TextEncoder, TransformStream });