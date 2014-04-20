// @name: MessagePack.js
// @require: Valid.js, ByteArray.js, UTF8.js
// @cutoff: @assert @node

(function(global) {
"use strict";

// --- variable --------------------------------------------
//{@assert
var Valid = global["Valid"] || require("uupaa.valid.js");
//}@assert

var ByteArray = global["ByteArray"] || require("uupaa.bytearray.js");
var UTF8      = global["UTF8"]      || require("uupaa.utf8.js");

var _inNode = "process" in global;

var _idx       = 0; // unpack offset
var _MAX_DEPTH = 512;

// --- define ----------------------------------------------
// --- interface -------------------------------------------
function MessagePack() { // @help: MessagePack
}

MessagePack["repository"] = "https://github.com/uupaa/MessagePack.js";

MessagePack["pack"]   = MessagePack_pack;   // MessagePack.pack(source:Any, bufferSize:Integer = 16384):Uint8Array
MessagePack["unpack"] = MessagePack_unpack; // MessagePack.unpack(source:Uint8Array):Any

// --- implement -------------------------------------------
function MessagePack_pack(source,       // @arg Any:
                          bufferSize) { // @arg Integer(= 16384): buffer size
                                        // @ret Uint8Array:
                                        // @desc: MessagePack.pack
    bufferSize = bufferSize || 1024 * 16; // 16384

    var view = null;
    var offset = 0;

    while (1) {
        view = new Uint8Array(bufferSize);
        try {
            offset = _rawEncode(view, 0, bufferSize, source, 0);
            if (offset > bufferSize) {
                throw new RangeError("INDEX_IS_OUT_OF_RANGE");
            }
            break;
        } catch (err) {
            if (err instanceof RangeError) {
                bufferSize *= 2; // buffer size auto expansion -> retry
            } else {
                throw err;
            }
        }
    }
    return view.subarray(0, offset);
}

function _rawEncode(view, offset, bufferSize, source, depth) {
    if (++depth >= _MAX_DEPTH) {
        throw new TypeError("CYCLIC_REFERENCE_ERROR");
    }
    if (offset > bufferSize) {
        throw new RangeError("INDEX_IS_OUT_OF_RANGE");
    }
    if (source === null || source === undefined) {
        view[offset++] = 0xc0;
        return offset;
    }
    if (Array.isArray(source)) {
        return _rawPackArray(view, offset, bufferSize, source, depth);
    }
    switch (typeof source) {
    case "boolean": view[offset++] = source ? 0xc2 : 0xc3; return offset;
    case "number":  return _rawPackNumber(view, offset, bufferSize, source);
    case "string":  return _rawPackString(view, offset, bufferSize, source);
    case "object":  return _rawPackObject(view, offset, bufferSize, source, depth);
    }
    return offset;
}

function _rawPackArray(view, offset, bufferSize, source, depth) {
    var i = 0, iz = source.length;

    if (iz < 16) {                      // fix array
        view[offset++] = 0x90 + iz;
    } else if (iz < 0x10000) {          // array 16
        view.set([0xdc, iz >>  8, iz], offset);
        offset += 3;
    } else if (iz < 0x100000000) {      // array 32
        view.set([0xdd, iz >> 24, iz >> 16, iz >>  8, iz], offset);
        offset += 5;
    }
    for (; i < iz; ++i) {
        offset = _rawEncode(view, offset, bufferSize, source[i], depth);
    }
    return offset;
}

function _rawPackObject(view, offset, bufferSize, source, depth) {
    var keys = Object.keys(source), key, i = 0, iz = keys.length;

    if (iz < 16) {                      // fix map
        view[offset++] = 0x80 + iz;
    } else if (iz < 0x10000) {          // map 16
        view.set([0xde, iz >>  8, iz], offset);
        offset += 3;
    } else if (iz < 0x100000000) {      // map 32
        view.set([0xdf, iz >> 24, iz >> 16, iz >>  8, iz], offset);
        offset += 5;
    }
    for (; i < iz; ++i) { // uupaa-looper
        key = keys[i];
        offset = _rawPackString(view, offset, bufferSize, key);
        offset = _rawEncode(view, offset, bufferSize, source[key], depth);
    }
    return offset;
}

function _rawPackNumber(view, offset, bufferSize, source) {
    var high = 0;
    var low  = 0;
    var sign = 0;
    var exp  = 0;
    var frac = 0;

    if (source !== source) { // quiet NaN
        view.set([0xcb, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff], offset);
        offset += 9;
    } else if (source === Infinity) { // positive infinity
        view.set([0xcb, 0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], offset);
        offset += 9;
    } else if (Math.floor(source) === source) { // int or uint
        if (source < 0) { // --- negative ---
            if (source >= -32) {                // fixnum -> [111xxxxx]
                view[offset++] = 0xe0 + source + 32;
            } else if (source > -0x80) {        // int 8  -> [0xd0, value]
                view[offset++] = 0xd0;
                view[offset++] = source + 0x100;
            } else if (source > -0x8000) {      // int 16 -> [0xd1, value x 2]
                source += 0x10000;
                view.set([0xd1, source >>  8, source], offset);
                offset += 3;
            } else if (source > -0x80000000) {  // int 32 -> [0xd2, value x 4]
                source += 0x100000000;
                view.set([0xd2, source >> 24, source >> 16, source >>  8, source], offset);
                offset += 5;
            } else {                            // int 64 -> [0xd3, value x 8]
                high = Math.floor(source / 0x100000000);
                low  = source & 0xffffffff;
                view.set([0xd3, high >> 24, high >> 16, high >>  8, high,
                                low  >> 24, low  >> 16, low  >>  8, low], offset);
                offset += 9;
            }
        } else { // --- positive ---
            if (source < 0x80) {                // fixnum  -> [value]
                view[offset++] = source;
            } else  if (source < 0x100) {       // uint 8  -> [0xcc, value]
                view[offset++] = 0xcc;
                view[offset++] = source;
            } else if (source < 0x10000) {      // uint 16 -> [0xcd, value x 2]
                view.set([0xcd, source >>  8, source], offset);
                offset += 3;
            } else if (source < 0x100000000) {  // uint 32 -> [0xce, value x 4]
                view.set([0xce, source >> 24, source >> 16, source >>  8, source], offset);
                offset += 5;
            } else {                            // uint 64 -> [0xcf, value x 8]
                high = Math.floor(source / 0x100000000);
                low  = source & 0xffffffff;
                view.set([0xcf, high >> 24, high >> 16, high >>  8, high,
                                low  >> 24, low  >> 16, low  >>  8, low], offset);
                offset += 9;
            }
        }
    } else { // --- double ---
        // THX!! @edvakf
        // http://javascript.g.hatena.ne.jp/edvakf/20101128/1291000731
        sign = source < 0;
        if (sign) {
            source *= -1;
        }

        // add offset 1023 to ensure positive
        exp  = ((Math.log(source) / Math.LN2) + 1023) | 0;

        // shift 52 - (exp - 1023) bits to make integer part exactly 53 bits,
        // then throw away trash less than decimal point
        frac = source * Math.pow(2, 52 + 1023 - exp);

        //  S+-Exp(11)--++-----------------Fraction(52bits)-----------------------+
        //  ||          ||                                                        |
        //  v+----------++--------------------------------------------------------+
        //  00000000|00000000|00000000|00000000|00000000|00000000|00000000|00000000
        //  6      5    55  4        4        3        2        1        8        0
        //  3      6    21  8        0        2        4        6
        //
        //  +----------high(32bits)-----------+ +----------low(32bits)------------+
        //  |                                 | |                                 |
        //  +---------------------------------+ +---------------------------------+
        //  3      2    21  1        8        0
        //  1      4    09  6
        low  = frac & 0xffffffff;
        if (sign) {
            exp |= 0x800;
        }
        high = ((frac / 0x100000000) & 0xfffff) | (exp << 20);

        view.set([0xcb, high >> 24, high >> 16, high >>  8, high,
                        low  >> 24, low  >> 16, low  >>  8, low], offset);
        offset += 9;
    }
    return offset;
}

function _rawPackString(view, offset, bufferSize, source) {
    var ary = UTF8["encode"](ByteArray["fromString"](source));
    var size = ary.length;

    if (size < 32) {                    // fix raw
        view[offset++] = 0xa0 + size;
    } else if (size < 0x10000) {        // raw 16
        view.set([0xda, size >>  8, size], offset);
        offset += 3;
    } else if (size < 0x100000000) {    // raw 32
        view.set([0xdb, size >> 24, size >> 16, size >>  8, size], offset);
        offset += 5;
    }
    view.set(ary, offset);
    offset += ary.length;

    return offset;
}

// ---------------------------------------------------------
function MessagePack_unpack(view) { // @arg Uint8Array:
                                    // @ret source:
                                    // @desc: MessagePack.unpack
    _idx = -1;
    return _rawDecode(view);
}

function _rawDecode(view) {
    var size, num = 0,
        sign, exp, frac,
        obj, key, ary,
        type = view[++_idx];

    if (type >= 0xe0) {             // Negative FixNum (111x xxxx) (-32 ~ -1)
        return type - 0x100;
    }
    if (type < 0xc0) {
        if (type < 0x80) {          // Positive FixNum (0xxx xxxx) (0 ~ 127)
            return type;
        }
        if (type < 0x90) {          // FixMap   (1000 xxxx)
            num  = type - 0x80;
            type = 0x80;
        } else if (type < 0xa0) {   // FixArray (1001 xxxx)
            num  = type - 0x90;
            type = 0x90;
        } else if (type < 0xc0) {   // FixRaw   (101x xxxx)
            num  = type - 0xa0;
            type = 0xa0;
        }
    }
    switch (type) {
    case 0xc0:  return null;
    case 0xc2:  return false;
    case 0xc3:  return true;
    case 0xca:  // float
                num  = view[++_idx] * 0x1000000 + (view[++_idx] << 16) +
                                                  (view[++_idx] <<  8) + view[++_idx];
                sign =  num > 0x7fffffff;    //  1bit
                exp  = (num >> 23) & 0xff;   //  8bits
                frac =  num & 0x7fffff;      // 23bits
                if (!num || num === 0x80000000) { // 0.0 or -0.0
                    return 0;
                }
                if (exp === 0xff) { // NaN or Infinity
                    return frac ? NaN : Infinity;
                }
                return (sign ? -1 : 1) *
                            (frac | 0x800000) * Math.pow(2, exp - 127 - 23); // 127: bias
    case 0xcb:  // double
                num  = view[++_idx] * 0x1000000 + (view[++_idx] << 16) +
                                                  (view[++_idx] <<  8) + view[++_idx];
                sign =  num > 0x7fffffff;    //  1bit
                exp  = (num >> 20) & 0x7ff;  // 11bits
                frac =  num & 0xfffff;       // 52bits - 32bits (high word)
                if (!num || num === 0x80000000) { // 0.0 or -0.0
                    _idx += 4;
                    return 0;
                }
                if (exp === 0x7ff) { // NaN or Infinity
                    _idx += 4;
                    return frac ? NaN : Infinity;
                }
                num =  view[++_idx] * 0x1000000 + (view[++_idx] << 16) +
                                                  (view[++_idx] <<  8) + view[++_idx];
                return (sign ? -1 : 1) *
                            ((frac | 0x100000) * Math.pow(2, exp - 1023 - 20) // 1023: bias
                             + num * Math.pow(2, exp - 1023 - 52));
    // 0xcf: uint64, 0xce: uint32, 0xcd: uint16, 0xcc: uint8
    case 0xcf:  num =  view[++_idx] * 0x1000000 + (view[++_idx] << 16) +
                                                  (view[++_idx] <<  8) + view[++_idx];
                return num * 0x100000000 +
                       view[++_idx] * 0x1000000 + (view[++_idx] << 16) +
                                                  (view[++_idx] <<  8) + view[++_idx];
    case 0xce:  num += view[++_idx] * 0x1000000 + (view[++_idx] << 16);
    case 0xcd:  num += view[++_idx] << 8;
    case 0xcc:  return num + view[++_idx];
    // 0xd3: int64, 0xd2: int32, 0xd1: int16, 0xd0: int8
    case 0xd3:  num =  view[++_idx];
                if (num & 0x80) { // sign -> avoid overflow
                    return ((num          ^ 0xff) * 0x100000000000000 +
                            (view[++_idx] ^ 0xff) *   0x1000000000000 +
                            (view[++_idx] ^ 0xff) *     0x10000000000 +
                            (view[++_idx] ^ 0xff) *       0x100000000 +
                            (view[++_idx] ^ 0xff) *         0x1000000 +
                            (view[++_idx] ^ 0xff) *           0x10000 +
                            (view[++_idx] ^ 0xff) *             0x100 +
                            (view[++_idx] ^ 0xff) + 1) * -1;
                }
                return num          * 0x100000000000000 +
                       view[++_idx] *   0x1000000000000 +
                       view[++_idx] *     0x10000000000 +
                       view[++_idx] *       0x100000000 +
                       view[++_idx] *         0x1000000 +
                       view[++_idx] *           0x10000 +
                       view[++_idx] *             0x100 +
                       view[++_idx];
    case 0xd2:  num =  view[++_idx] * 0x1000000 + (view[++_idx] << 16) +
                      (view[++_idx] << 8) + view[++_idx];
                return num < 0x80000000 ? num : num - 0x100000000; // 0x80000000 * 2
    case 0xd1:  num = (view[++_idx] << 8) + view[++_idx];
                return num < 0x8000 ? num : num - 0x10000; // 0x8000 * 2
    case 0xd0:  num =  view[++_idx];
                return num < 0x80 ? num : num - 0x100; // 0x80 * 2
    // 0xdb: raw32, 0xda: raw16, 0xa0: raw ( string )
    case 0xdb:  num +=  view[++_idx] * 0x1000000 + (view[++_idx] << 16);
    case 0xda:  num += (view[++_idx] << 8)       +  view[++_idx];
    case 0xa0:  _idx += num;
                return _decodeUTF8(view, _idx - num + 1, num);

    // 0xdf: map32, 0xde: map16, 0x80: map
    case 0xdf:  num +=  view[++_idx] * 0x1000000 + (view[++_idx] << 16);
    case 0xde:  num += (view[++_idx] << 8)       +  view[++_idx];
    case 0x80:  obj = {};
                while (num--) {
                    // make key/value pair
                    size = view[++_idx] - 0xa0;
                    key  = _decodeUTF8(view, _idx + 1, size);
                    _idx += size;
                    obj[key] = _rawDecode(view);
                }
                return obj;
    // 0xdd: array32, 0xdc: array16, 0x90: array
    case 0xdd:  num +=  view[++_idx] * 0x1000000 + (view[++_idx] << 16);
    case 0xdc:  num += (view[++_idx] << 8)       +  view[++_idx];
    case 0x90:  ary = [];
                while (num--) {
                    ary.push( _rawDecode(view) );
                }
                return ary;
    }
    throw new TypeError("UNKNOWN_TYPE");
}

function _decodeUTF8(view, offset, size) {
    return ByteArray["toString"]( UTF8["decode"]( view.subarray(offset, offset + size) ) );
}

// --- export ----------------------------------------------
//{@node
if (_inNode) {
    module["exports"] = MessagePack;
}
//}@node
if (global["MessagePack"]) {
    global["MessagePack_"] = MessagePack; // already exsists
} else {
    global["MessagePack"]  = MessagePack;
}

})((this || 0).self || global);

