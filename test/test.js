new Test().add([
        testMessagePack_pack,
        testMessagePack_unpack,
        testPositiveFixNum,
        testNegativeFixNum,
        testTypes,
    ]).run(function(err, test) {
        if (1) {
            err || test.worker(function(err, test) {
                if (!err && typeof MessagePack_ !== "undefined") {
                    var name = Test.swap(MessagePack, MessagePack_);

                    new Test(test).run(function(err, test) {
                        Test.undo(name);
                    });
                }
            });
        }
    });

function testMessagePack_pack(next) {

    var source = { a: [1,2,3, { b: 4, c: "hoge" }, "abc"] };
    var result = MessagePack.pack(source);
    var compare = [
            129, 161, 97, 149, 1, 2, 3, 130,
            161, 98, 4, 161, 99, 164, 104,
            111, 103, 101, 163, 97, 98, 99
        ];

    if (Array.prototype.slice.call(result).join() === compare.join()) {
        console.log("testMessagePack_pack ok");
        next && next.pass();
    } else {
        console.error("testMessagePack_pack ng");
        next && next.miss();
    }
}

function testMessagePack_unpack(next) {

    var source = { a: [1,2,3, { b: 4, c: "hoge" }, "abc"] };
    var packed = MessagePack.pack(source);
    var result = MessagePack.unpack(packed);

    if (JSON.stringify(Array.prototype.slice.call(source)) === JSON.stringify(Array.prototype.slice.call(result))) {
        console.log("testMessagePack_unpack ok");
        next && next.pass();
    } else {
        console.error("testMessagePack_unpack ng");
        next && next.miss();
    }
}

/*
var hex = function(ary) {
    return uu.array.dump(ary, "0x", ", 0x");
};
 */

// --- FixNum uint and int ---
function testPositiveFixNum(next) {
    var source = {
            0: [0, [0x00]],
            1: [1, [0x01]],
            31: [31, [0x1f]],
            32: [32, [0x20]],
            33: [33, [0x21]],
            126: [126, [0x7e]],
            127: [127, [0x7f]],
            128: [128, [0xcc, 0x80]],
            129: [129, [0xcc, 0x81]],
            254: [254, [0xcc, 0xfe]],
            255: [255, [0xcc, 0xff]],
            256: [256, [0xcd, 0x1, 0x0]],
            257: [257, [0xcd, 0x1, 0x1]],
            65534: [65534, [0xcd, 0xff, 0xfe]],
            65535: [65535, [0xcd, 0xff, 0xff]],
            65536: [65536, [0xcd, 0xff, 0xff]],
            65537: [65537, [0xce, 0x0, 0x1, 0x0, 0x1]],
        };
    source[0x0ffffffff] = [0x0ffffffff, [0xce, 0xff, 0xff, 0xff, 0xff]];
    source[0x100000000] = [0x100000000, [0xcf, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00]];
    source[0x10000000000] = [0x10000000000, [0xcf, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]];
    source[0x1000000000000] = [0x1000000000000, [0xcf, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]];
    source[0x1fffffffffffff] = [0x1fffffffffffff, [0xcf, 0x00, 0x1f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]];
    source[0x20000000000000] = [0x20000000000000, [0xcf, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]];
    source[0x40000000000000] = [0x40000000000000, [0xcf, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]];
    source[0x80000000000000] = [0x80000000000000, []]; // Accuracy problems. IEEE754
    source[0x7fffffffffffffff] = [0x7fffffffffffffff, []]; // Accuracy problems. IEEE754

    var pack = {
            0: MessagePack.pack(source[0][0]),
            1: MessagePack.pack(source[1][0]),
            31: MessagePack.pack(source[31][0]),
            32: MessagePack.pack(source[32][0]),
            33: MessagePack.pack(source[33][0]),
            126: MessagePack.pack(source[126][0]),
            127: MessagePack.pack(source[127][0]),
            128: MessagePack.pack(source[128][0]),
            129: MessagePack.pack(source[129][0]),
            254: MessagePack.pack(source[254][0]),
            255: MessagePack.pack(source[255][0]),
            256: MessagePack.pack(source[256][0]),
            257: MessagePack.pack(source[257][0]),
            65534: MessagePack.pack(source[65534][0]),
            65535: MessagePack.pack(source[65535][0]),
            65536: MessagePack.pack(source[65536][0]),
            65537: MessagePack.pack(source[65537][0]),
        };
    pack[0x0ffffffff] = MessagePack.pack(source[0x0ffffffff][0]);
    pack[0x100000000] = MessagePack.pack(source[0x100000000][0]);
    pack[0x10000000000] = MessagePack.pack(source[0x10000000000][0]);
    pack[0x1000000000000] = MessagePack.pack(source[0x1000000000000][0]);
    pack[0x1fffffffffffff] = MessagePack.pack(source[0x1fffffffffffff][0]);
    pack[0x20000000000000] = MessagePack.pack(source[0x20000000000000][0]);
    pack[0x40000000000000] = MessagePack.pack(source[0x40000000000000][0]);
    pack[0x80000000000000] = MessagePack.pack(source[0x80000000000000][0]);
    pack[0x7fffffffffffffff] = MessagePack.pack(source[0x7fffffffffffffff][0]);

    var result = {
            // FixNum
            0: MessagePack.unpack(pack[0]),
            1: MessagePack.unpack(pack[1]),
            31: MessagePack.unpack(pack[31]),
            // Uint8
            32: MessagePack.unpack(pack[32]),
            33: MessagePack.unpack(pack[33]),
            126: MessagePack.unpack(pack[126]),
            127: MessagePack.unpack(pack[127]),
            128: MessagePack.unpack(pack[128]),
            129: MessagePack.unpack(pack[129]),
            254: MessagePack.unpack(pack[254]),
            255: MessagePack.unpack(pack[255]),
            // Uint16
            256: MessagePack.unpack(pack[256]),
            257: MessagePack.unpack(pack[257]),
            65534: MessagePack.unpack(pack[65534]),
            65535: MessagePack.unpack(pack[65535]),
            // Uint32
            65536: MessagePack.unpack(pack[65536]),
            65537: MessagePack.unpack(pack[65537]),
    };
    result[0x0ffffffff] = MessagePack.unpack(pack[0x0ffffffff]);
    // Uint64
    result[0x100000000] = MessagePack.unpack(pack[0x100000000]);
    result[0x10000000000] = MessagePack.unpack(pack[0x10000000000]);
    result[0x1000000000000] = MessagePack.unpack(pack[0x1000000000000]);
    result[0x1fffffffffffff] = MessagePack.unpack(pack[0x1fffffffffffff]);
    result[0x20000000000000] = MessagePack.unpack(pack[0x20000000000000]);
    result[0x40000000000000] = MessagePack.unpack(pack[0x40000000000000]);
    result[0x80000000000000] = MessagePack.unpack(pack[0x80000000000000]);
    result[0x7fffffffffffffff] = MessagePack.unpack(pack[0x7fffffffffffffff]);

    var ok = true;

    for (var key in source) {
        if (source[key][0] !== result[key]) {
            ok = false;
            break;
        }
        if (source[key][1].join() !== Array.prototype.slice.call(pack[key]).join()) {
            ok = false;
            break;
        }
    }
    if (result) {
        console.log("testPositiveFixNum ok");
        next && next.pass();
    } else {
        console.error("testPositiveFixNum ng");
        next && next.miss();
    }
}

function testNegativeFixNum(next) {
    var source = {
            "-0": [0, [0x00]],
            "-1": [-1, [0xff]],
            "-31": [-31, [0xe1]],
            "-32": [-32, [0xe0]],
            "-33": [-33, [0xd0, 0xdf]],
            "-64": [-64, [0xd0, 0xc0]],
            "-126": [-126, [0xd0, 0x82]],
            "-127": [-127, [0xd0, 0x81]],
            "-128": [-128, [0xd1, 0xff, 0x80]],
            "-129": [-129, [0xd1, 0xff, 0x7f]],
            "-254": [-254, [0xd1, 0xff, 0x02]],
            "-255": [-255, [0xd1, 0xff, 0x01]],
            "-256": [-256, [0xd1, 0xff, 0x00]],
            "-257": [-257, [0xd1, 0xfe, 0xff]],
            "-32767": [-32767, [0xd1, 0x80, 0x01]],
            "-32768": [-32768, [0xd2, 0xff, 0xff, 0x80, 0x00]],
            "-32769": [-32769, [0xd2, 0xff, 0xff, 0x7f, 0xff]],
            "-65534": [-65534, [0xd2, 0xff, 0xff, 0x00, 0x02]],
            "-65535": [-65535, [0xd2, 0xff, 0xff, 0x00, 0x01]],
            "-65536": [-65536, [0xd2, 0xff, 0xff, 0x00, 0x00]],
            "-65537": [-65537, [0xd2, 0xff, 0xfe, 0xff, 0xff]],
            "-1048576": [-1048576, [0xd2, 0xff, 0xf0, 0x00, 0x00]],
            "-2147483646": [-2147483646, [0xd2, 0x80, 0x00, 0x00, 0x02]],
            "-2147483647": [-2147483647, [0xd2, 0x80, 0x00, 0x00, 0x01]],
            "-2147483648": [-2147483648, [0xd3, 0xff, 0xff, 0xff, 0xff, 0x80, 0x00, 0x00, 0x00]],
            "-549755813888": [-549755813888, [0xd3, 0xff, 0xff, 0xff, 0x80, 0x00, 0x00, 0x00, 0x00]],
            "-4294967293": [-4294967293, [0xd3, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x03]],
            "-4294967294": [-4294967294, [0xd3, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x02]],
            "-4294967295": [-4294967295, [0xd3, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x01]],
            "-4294967296": [-4294967296, [0xd3, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00]],
            "-4294967297": [-4294967297, [0xd3, 0xff, 0xff, 0xff, 0xfe, 0xff, 0xff, 0xff, 0xff]],
            "-0x1fffffffffffff": [-0x1fffffffffffff, [0xd3, 0xff, 0xe0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]],
            "-0x20000000000000": [-0x20000000000000, [0xd3, 0xff, 0xe0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]],
            "-0x40000000000000": [-0x40000000000000, [0xd3, 0xff, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]],
        };

    var pack = {
            "-0": MessagePack.pack(source["-0"][0]),
            "-1": MessagePack.pack(source["-1"][0]),
            "-31": MessagePack.pack(source["-31"][0]),
            "-32": MessagePack.pack(source["-32"][0]),
            "-33": MessagePack.pack(source["-33"][0]),
            "-64": MessagePack.pack(source["-64"][0]),
            "-126": MessagePack.pack(source["-126"][0]),
            "-127": MessagePack.pack(source["-127"][0]),
            "-128": MessagePack.pack(source["-128"][0]),
            "-129": MessagePack.pack(source["-129"][0]),
            "-254": MessagePack.pack(source["-254"][0]),
            "-255": MessagePack.pack(source["-255"][0]),
            "-256": MessagePack.pack(source["-256"][0]),
            "-257": MessagePack.pack(source["-257"][0]),
            "-32767": MessagePack.pack(source["-32767"][0]),
            "-32768": MessagePack.pack(source["-32768"][0]),
            "-32769": MessagePack.pack(source["-32769"][0]),
            "-65534": MessagePack.pack(source["-65534"][0]),
            "-65535": MessagePack.pack(source["-65535"][0]),
            "-65536": MessagePack.pack(source["-65536"][0]),
            "-65537": MessagePack.pack(source["-65537"][0]),
            "-1048576": MessagePack.pack(source["-1048576"][0]),
            "-2147483646": MessagePack.pack(source["-2147483646"][0]),
            "-2147483647": MessagePack.pack(source["-2147483647"][0]),
            "-2147483648": MessagePack.pack(source["-2147483648"][0]),
            "-549755813888": MessagePack.pack(source["-549755813888"][0]),
            "-4294967293": MessagePack.pack(source["-4294967293"][0]),
            "-4294967294": MessagePack.pack(source["-4294967294"][0]),
            "-4294967295": MessagePack.pack(source["-4294967295"][0]),
            "-4294967296": MessagePack.pack(source["-4294967296"][0]),
            "-4294967297": MessagePack.pack(source["-4294967297"][0]),
            "-0x1fffffffffffff": MessagePack.pack(source["-0x1fffffffffffff"][0]),
            "-0x20000000000000": MessagePack.pack(source["-0x20000000000000"][0]),
            "-0x40000000000000": MessagePack.pack(source["-0x40000000000000"][0]),
        };

    var result = {
            "-0": MessagePack.unpack(pack["-0"]),
            "-1": MessagePack.unpack(pack["-1"]),
            "-31": MessagePack.unpack(pack["-31"]),
            "-32": MessagePack.unpack(pack["-32"]),
            "-33": MessagePack.unpack(pack["-33"]),
            "-64": MessagePack.unpack(pack["-64"]),
            "-126": MessagePack.unpack(pack["-126"]),
            "-127": MessagePack.unpack(pack["-127"]),
            "-128": MessagePack.unpack(pack["-128"]),
            "-129": MessagePack.unpack(pack["-129"]),
            "-254": MessagePack.unpack(pack["-254"]),
            "-255": MessagePack.unpack(pack["-255"]),
            "-256": MessagePack.unpack(pack["-256"]),
            "-257": MessagePack.unpack(pack["-257"]),
            "-32767": MessagePack.unpack(pack["-32767"]),
            "-32768": MessagePack.unpack(pack["-32768"]),
            "-32769": MessagePack.unpack(pack["-32769"]),
            "-65534": MessagePack.unpack(pack["-65534"]),
            "-65535": MessagePack.unpack(pack["-65535"]),
            "-65536": MessagePack.unpack(pack["-65536"]),
            "-65537": MessagePack.unpack(pack["-65537"]),
            "-1048576": MessagePack.unpack(pack["-1048576"]),
            "-2147483646": MessagePack.unpack(pack["-2147483646"]),
            "-2147483647": MessagePack.unpack(pack["-2147483647"]),
            "-2147483648": MessagePack.unpack(pack["-2147483648"]),
            "-549755813888": MessagePack.unpack(pack["-549755813888"]),
            "-4294967293": MessagePack.unpack(pack["-4294967293"]),
            "-4294967294": MessagePack.unpack(pack["-4294967294"]),
            "-4294967295": MessagePack.unpack(pack["-4294967295"]),
            "-4294967296": MessagePack.unpack(pack["-4294967296"]),
            "-4294967297": MessagePack.unpack(pack["-4294967297"]),
            "-0x1fffffffffffff": MessagePack.unpack(pack["-0x1fffffffffffff"]),
            "-0x20000000000000": MessagePack.unpack(pack["-0x20000000000000"]),
            "-0x40000000000000": MessagePack.unpack(pack["-0x40000000000000"]),
    };

    var ok = true;

    for (var key in source) {
        if (source[key][0] !== result[key]) {
            ok = false;
            break;
        }
        if (source[key][1].join() !== Array.prototype.slice.call(pack[key]).join()) {
            ok = false;
            break;
        }
    }
    if (result) {
        console.log("testNegativeFixNum ok");
        next && next.pass();
    } else {
        console.error("testNegativeFixNum ng");
        next && next.miss();
    }
}

function testTypes(next) {
    var source = {
            "nil": [null, [0xc0]],
            "true": [true, [0xc3]],
            "false": [false, [0xc2]],
            "118.625": [118.625, [203, 192, 93, 168, 0, 0, 0, 0, 0]],
            "123.456": [123.456, [0xcb, 0x40, 0x5e, 0xdd, 0x2f, 0x1a, 0x9f, 0xbe, 0x77]],
            "-123.456": [-123.456, [0xcb, 0xc0, 0x5e, 0xdd, 0x2f, 0x1a, 0x9f, 0xbe, 0x77]],
            "0.1": [0.1, [0xcb, 0x3f, 0xb9, 0x99, 0x99, 0x99, 0x99, 0x99, 0x9a]],
            "-0.1": [-0.1, [0xcb, 0xbf, 0xb9, 0x99, 0x99, 0x99, 0x99, 0x99, 0x9a]],
            "1.11": [1.11, [0xcb, 0xbf, 0xf1, 0xc2, 0x8f, 0x5c, 0x28, 0xf5, 0xc3]],
            "-1.11": [-1.11, [0xcb, 0xbf, 0xf1, 0xc2, 0x8f, 0x5c, 0x28, 0xf5, 0xc3]],
            "3.14159565358979": [3.14159565358979, [0xcb, 0x40, 0x09, 0x21, 0xfc, 0xe6, 0xeb, 0x64, 0x22]],
            "-3.14159565358979": [-3.14159565358979, [0xcb, 0xc0, 0x09, 0x21, 0xfc, 0xe6, 0xeb, 0x64, 0x22]],
            "": ["", [0xa0]],
            "abc": ["abc", [0xa3, 0x61, 0x62, 0x63]],
            "あいう": ["あいう", [0xa9, 0xe3, 0x81, 0x82, 0xe3, 0x81, 0x84, 0xe3, 0x81, 0x86]],
            "カルビx3, ハラミx2, ブタバラ, T-BORNx500g, ライス大盛りで": ["カルビx3, ハラミx2, ブタバラ, T-BORNx500g, ライス大盛りで", [218, 0, 55, 194, 171, 195, 171, 195, 147, 120, 51, 44, 32, 195, 143, 195, 169, 195, 159, 120, 50, 44, 32, 195, 150, 194, 191, 195, 144, 195, 169, 44, 32, 84, 45, 66, 79, 82, 78, 120, 53, 48, 48, 103, 44, 32, 195, 169, 194, 164, 194, 185, 39, 195, 155, 194, 138, 103]],
            "{}": [{}, [0x80]],
            "{ 'abc': [123] }": [{ 'abc': [123] }, [0x81, 0xa3, 0x61, 0x62, 0x63, 0x91, 0x7b]],
            "{ abc: [123, 456], a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, l: 13, m: 14, n: 15, o: 16, p: 17 }": [{ abc: [123, 456], a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, l: 13, m: 14, n: 15, o: 16, p: 17 }, [222, 0, 17, 163, 97, 98, 99, 146, 123, 205, 1, 200, 161, 97, 1, 161, 98, 2, 161, 99, 3, 161, 100, 4, 161, 101, 5, 161, 102, 6, 161, 103, 7, 161, 104, 8, 161, 105, 9, 161, 106, 10, 161, 107, 11, 161, 108, 13, 161, 109, 14, 161, 110, 15, 161, 111, 16, 161, 112, 17]],
            "[]": [[], [0x90]],
            "[123]": [[123], [0x91, 0x7b]],
            "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 'hoge']": [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 'hoge'], [220, 0, 17, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 164, 104, 111, 103, 101]],
            "{ a: ['b', 1, 0.123, { c: {}, d: null }, -1.11] }": [{ a: ['b', 1, 0.123, { c: {}, d: null }, -1.11] }, [129, 161, 97, 149, 161, 98, 1, 203, 63, 191, 124, 237, 145, 104, 114, 176, 130, 161, 99, 128, 161, 100, 192, 203, 191, 241, 194, 143, 92, 40, 245, 195]],
        };

    var pack = {
            "nil":      MessagePack.pack(source["nil"][0]),
            "true":     MessagePack.pack(source["true"][0]),
            "false":    MessagePack.pack(source["false"][0]),
            "118.625":  MessagePack.pack(source["118.625"][0]),
            "123.456":  MessagePack.pack(source["123.456"][0]),
            "-123.456": MessagePack.pack(source["-123.456"][0]),
            "0.1":      MessagePack.pack(source["0.1"][0]),
            "-0.1":     MessagePack.pack(source["-0.1"][0]),
            "1.11":     MessagePack.pack(source["1.11"][0]),
            "-1.11":    MessagePack.pack(source["-1.11"][0]),
            "3.14159565358979":
                        MessagePack.pack(source["3.14159565358979"][0]),
            "-3.14159565358979":
                        MessagePack.pack(source["-3.14159565358979"][0]),
            "":         MessagePack.pack(source[""][0]),
            "abc":      MessagePack.pack(source["abc"][0]),
            "あいう":   MessagePack.pack(source["あいう"][0]),
            "カルビx3, ハラミx2, ブタバラ, T-BORNx500g, ライス大盛りで":
                        MessagePack.pack(source["カルビx3, ハラミx2, ブタバラ, T-BORNx500g, ライス大盛りで"][0]),
            "{}":       MessagePack.pack(source["{}"][0]),
            "{ 'abc': [123] }":
                        MessagePack.pack(source["{ 'abc': [123] }"][0]),
            "{ abc: [123, 456], a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, l: 13, m: 14, n: 15, o: 16, p: 17 }":
                        MessagePack.pack(source["{ abc: [123, 456], a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, l: 13, m: 14, n: 15, o: 16, p: 17 }"][0]),
            "[]":       MessagePack.pack(source["[]"][0]),
            "[123]":    MessagePack.pack(source["[123]"][0]),
            "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 'hoge']":
                        MessagePack.pack(source["[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 'hoge']"][0]),
            "{ a: ['b', 1, 0.123, { c: {}, d: null }, -1.11] }":
                        MessagePack.pack(source["{ a: ['b', 1, 0.123, { c: {}, d: null }, -1.11] }"][0]),
        };

    var result = {
            "nil":      MessagePack.unpack(pack["nil"]),
            "true":     MessagePack.unpack(pack["true"]),
            "false":    MessagePack.unpack(pack["false"]),
            "118.625":  MessagePack.unpack(pack["118.625"]),
            "123.456":  MessagePack.unpack(pack["123.456"]),
            "-123.456": MessagePack.unpack(pack["-123.456"]),
            "0.1":      MessagePack.unpack(pack["0.1"]),
            "-0.1":     MessagePack.unpack(pack["-0.1"]),
            "1.11":     MessagePack.unpack(pack["1.11"]),
            "-1.11":    MessagePack.unpack(pack["-1.11"]),
            "3.14159565358979":
                        MessagePack.unpack(pack["3.14159565358979"]),
            "-3.14159565358979":
                        MessagePack.unpack(pack["-3.14159565358979"]),
            "":         MessagePack.unpack(pack[""]),
            "abc":      MessagePack.unpack(pack["abc"]),
            "あいう":   MessagePack.unpack(pack["あいう"]),
            "カルビx3, ハラミx2, ブタバラ, T-BORNx500g, ライス大盛りで":
                        MessagePack.unpack(pack["カルビx3, ハラミx2, ブタバラ, T-BORNx500g, ライス大盛りで"]),
            "{}":       MessagePack.unpack(pack["{}"]),
            "{ 'abc': [123] }":
                        MessagePack.unpack(pack["{ 'abc': [123] }"]),
            "{ abc: [123, 456], a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, l: 13, m: 14, n: 15, o: 16, p: 17 }":
                        MessagePack.unpack(pack["{ abc: [123, 456], a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, l: 13, m: 14, n: 15, o: 16, p: 17 }"]),
            "[]":       MessagePack.unpack(pack["[]"]),
            "[123]":    MessagePack.unpack(pack["[123]"]),
            "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 'hoge']":
                        MessagePack.unpack(pack["[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 'hoge']"]),
            "{ a: ['b', 1, 0.123, { c: {}, d: null }, -1.11] }":
                        MessagePack.unpack(pack["{ a: ['b', 1, 0.123, { c: {}, d: null }, -1.11] }"]),
    };

    var ok = true;

    for (var key in source) {
        if (source[key][0] !== result[key]) {
            ok = false;
            break;
        }
        if (source[key][1]) {
            if (source[key][1].join() !== Array.prototype.slice.call(pack[key]).join()) {
                ok = false;
                break;
            }
        }
    }
    if (result) {
        console.log("testNegativeFixNum ok");
        next && next.pass();
    } else {
        console.error("testNegativeFixNum ng");
        next && next.miss();
    }
}

/*

"Unofficial Objects": "",
    "Math": function() {
        var data = Math;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is hash", void 0, hex(pack)];
    },
    "Date": function() {
        var data = new Date;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is hash", void 0, hex(pack)];
    },
    "Function": function() {
        var data = function hoge() {};
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is hash", void 0, hex(pack)];
    },
    "RegExp": function() {
        var data = /^aaa/;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is hash", void 0, hex(pack)];
    },

"Compatibility (http://github.com/MessagePack/MessagePack/blob/master/test/cases_gen.rb)": "",
    "[cc 00] 0 uint8": function() {
        var data = unescape('%cc%00');
        var result = [0xcc, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", 0, hex(result)];
    },
    "[cd 00 00] 0 uint16": function() {
        var data = unescape('%cd%00%00');
        var result = [0xcd, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", 0, hex(result)];
    },
    "[ce 00 00 00 00] 0 uint32": function() {
        var data = unescape('%ce%00%00%00%00');
        var result = [0xce, 0x00, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", 0, hex(result)];
    },
    "[cf 00 00 00 00 00 00 00 00] 0 uint64": function() {
        var data = unescape('%cf%00%00%00%00%00%00%00%00');
        var result = [0xcf, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", 0, hex(result)];
    },
    "[d0 00] 0 int8": function() {
        var data = unescape('%d0%00');
        var result = [0xd0, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", 0, hex(result)];
    },
    "[d1 00 00] 0 int16": function() {
        var data = unescape('%d1%00%00');
        var result = [0xd1, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", 0, hex(result)];
    },
    "[d2 00 00 00 00] 0 int32": function() {
        var data = unescape('%d2%00%00%00%00');
        var result = [0xd2, 0x00, 0x00, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", 0, hex(result)];
    },
    "[d3 00 00 00 00 00 00 00 00 ] 0 int64": function() {
        var data = unescape('%d3%00%00%00%00%00%00%00%00');
        var result = [0xd3, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", 0, hex(result)];
    },
    "[7f] 127 Positive FixNum": function() {
        var data = unescape('%7f');
        var result = [0x7f];
        var rv = MessagePack.unpack(data);

        return [rv, "==", 127, hex(result)];
    },
    "[cc 7f] 127 uint8": function() {
        var data = unescape('%cc%7f');
        var result = [0xcc, 0x7f];
        var rv = MessagePack.unpack(data);

        return [rv, "==", 127, hex(result)];
    },
    "[cd 00 ff] 255 uint16": function() {
        var data = unescape('%cd%00%ff');
        var result = [0xcd, 0x00, 0xff];
        var rv = MessagePack.unpack(data);

        return [rv, "==", 255, hex(result)];
    },
    "[ce 00 00 ff ff] 65535 uint32": function() {
        var data = unescape('%ce%00%00%ff%ff');
        var result = [0xce, 0x00, 0x00, 0xff, 0xff];
        var rv = MessagePack.unpack(data);

        return [rv, "==", 65535, hex(result)];
    },
    "[cf 00 00 00 00 ff ff ff ff] 4294967295 uint64": function() {
        var data = unescape('%cf%00%00%00%00%ff%ff%ff%ff');
        var result = [0xcf, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff];
        var rv = MessagePack.unpack(data);

        return [rv, "==", 4294967295, hex(result)];
    },
    "[e0] -32 Negative FixNum": function() {
        var data = unescape('%e0');
        var result = [0xe0];
        var rv = MessagePack.unpack(data);

        return [rv, "==", -32, hex(result)];
    },
    "[d0 e0] -32 int8": function() {
        var data = unescape('%d0%e0');
        var result = [0xd0, 0xe0];
        var rv = MessagePack.unpack(data);

        return [rv, "==", -32, hex(result)];
    },
    "[d1 ff 80] -128 int16": function() {
        var data = unescape('%d1%ff%80');
        var result = [0xd1, 0xff, 0x80];
        var rv = MessagePack.unpack(data);

        return [rv, "==", -128, hex(result)];
    },
    "[d2 ff ff 80 00] -32768 int32": function() {
        var data = unescape('%d2%ff%ff%80%00');
        var result = [0xd2, 0xff, 0xff, 0x80, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", -32768, hex(result)];
    },
    "[d3 ff ff ff ff 80 00 00 00] -2147483648 int64": function() {
        var data = unescape('%d3%ff%ff%ff%ff%80%00%00%00');
        var result = [0xd3, 0xff, 0xff, 0xff, 0xff, 0x80, 0x00, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", -2147483648, hex(result)];
    },
    "[d3 ff ff ff ff 80 00 00 00] -2147483648 int64": function() {
        var data = unescape('%d3%ff%ff%ff%ff%80%00%00%00');
        var result = [0xd3, 0xff, 0xff, 0xff, 0xff, 0x80, 0x00, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", -2147483648, hex(result)];
    },
    "[ca 00 00 00 00] 0.0 float": function() {
        var data = unescape('%ca%00%00%00%00');
        var result = [0xca, 0x00, 0x00, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", 0.0, hex(result)];
    },
    "[cb 00 00 00 00 00 00 00 00] 0.0 double": function() {
        var data = unescape('%cb%00%00%00%00%00%00%00%00');
        var result = [0xca, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", 0.0, hex(result)];
    },
    "[ca 80 00 00 00] -0.0 float": function() {
        var data = unescape('%ca%80%00%00%00');
        var result = [0xca, 0x80, 0x00, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", -0.0, hex(result)];
    },
    "[cb 80 00 00 00 00 00 00 00] -0.0 double": function() {
        var data = unescape('%cb%80%00%00%00%00%00%00%00');
        var result = [0xca, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", -0.0, hex(result)];
    },
    "[cb 3f f0 00 00 00 00 00 00] 1.0 double": function() {
        var data = unescape('%cb%3f%f0%00%00%00%00%00%00');
        var result = [0xcb, 0x3f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", 1.0, hex(result)];
    },
    "[cb bf f0 00 00 00 00 00 00] -1.0 double": function() {
        var data = unescape('%cb%bf%f0%00%00%00%00%00%00');
        var result = [0xcb, 0xbf, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", -1.0, hex(result)];
    },

    '[a1 61] "a" FixRaw': function() {
        var data = unescape('%a1%61');
        var result = [0xa1, 0x61];
        var rv = MessagePack.unpack(data);

        return [rv, "==", "a", hex(result)];
    },
    '[da 00 01 61] "a" raw 16': function() {
        var data = unescape('%da%00%01%61');
        var result = [0xda, 0x00, 0x01, 0x61];
        var rv = MessagePack.unpack(data);

        return [rv, "==", "a", hex(result)];
    },
    '[db 00 00 00 01 61] "a" raw 32': function() {
        var data = unescape('%db%00%00%00%01%61');
        var result = [0xdb, 0x00, 0x00, 0x00, 0x01, 0x61];
        var rv = MessagePack.unpack(data);

        return [rv, "==", "a", hex(result)];
    },

    '[a0] "" FixRaw': function() {
        var data = unescape('%a0');
        var result = [0xa0];
        var rv = MessagePack.unpack(data);

        return [rv, "==", "", hex(result)];
    },
    '[da 00 00] "" raw 16': function() {
        var data = unescape('%da%00%00');
        var result = [0xda, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", "", hex(result)];
    },
    '[db 00 00 00 00] "" raw 32': function() {
        var data = unescape('%db%00%00%00%00');
        var result = [0xdb, 0x00, 0x00, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", "", hex(result)];
    },

    '[91 00] [0] FixArray': function() {
        var data = unescape('%91%00');
        var result = [0x91, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", [0], hex(result)];
    },
    '[dc 00 01 00] [0] array 16': function() {
        var data = unescape('%dc%00%01%00');
        var result = [0xdc, 0x00, 0x01, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", [0], hex(result)];
    },
    '[dd 00 00 00 01 00] [0] array 32': function() {
        var data = unescape('%dd%00%00%00%01%00');
        var result = [0xdd, 0x00, 0x00, 0x00, 0x01, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", [0], hex(result)];
    },

    '[80] {} FixMap': function() {
        var data = unescape('%80');
        var result = [0x80];
        var rv = MessagePack.unpack(data);

        return [rv, "==", {}, hex(result)];
    },
    '[de 00 00] {} map 16': function() {
        var data = unescape('%de%00%00');
        var result = [0xde, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", {}, hex(result)];
    },
    '[df 00 00 00 00] {} map 32': function() {
        var data = unescape('%df%00%00%00%00');
        var result = [0xdf, 0x00, 0x00, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "==", {}, hex(result)];
    },

    '[81 a1 61 61] {"a"=>97} FixMap': function() {
        var data = unescape('%81%a1%61%61');
        var result = [0x81, 0xa1, 0x61, 0x61];
        var rv = MessagePack.unpack(data);

        return [rv, "==", { a: 97 }, hex(result)];
    },
    '[de 00 01 a1 61 61] {"a"=>97} map 16': function() {
        var data = unescape('%de%00%01%a1%61%61');
        var result = [0xde, 0x00, 0x01, 0xa1, 0x61, 0x61];
        var rv = MessagePack.unpack(data);

        return [rv, "==", { a: 97 }, hex(result)];
    },
    '[df 00 00 00 01 a1 61 61] {"a"=>97} map 32': function() {
        var data = unescape('%df%00%00%00%01%a1%61%61');
        var result = [0xdf, 0x00, 0x00, 0x00, 0x01, 0xa1, 0x61, 0x61];
        var rv = MessagePack.unpack(data);

        return [rv, "==", { a: 97 }, hex(result)];
    },

    '[91 90] [[]]': function() {
        var data = unescape('%91%90');
        var result = [0x91, 0x90];
        var rv = MessagePack.unpack(data);

        return [rv, "==", [[]], hex(result)];
    },
    '[91 91 a1 61] [["a"]]': function() {
        var data = unescape('%91%91%a1%61');
        var result = [0x91, 0x91, 0xa1, 0x61];
        var rv = MessagePack.unpack(data);

        return [rv, "==", [["a"]], hex(result)];
    },
"NaN or Infinity": "",
    '[ca 7f bf ff ff] NaN float': function() {
        var data = unescape('%ca%7F%BF%FF%FF');
        var result = [0xca, 0x7f, 0xbf, 0xff, 0xff];
        var rv = MessagePack.unpack(data);

        return [rv, "is NaN", void 0, hex(result)];
    },
    '[cb ff f7 ff ff ff ff ff ff] NaN double': function() {
        var data = unescape('%cb%ff%f7%ff%ff%ff%ff%ff%ff');
        var result = [0xcb, 0xff, 0xf7, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff];
        var rv = MessagePack.unpack(data);

        return [rv, "is NaN", void 0, hex(result)];
    },
    '[ca ff 80 00 00] Infinity float': function() {
        var data = unescape('%ca%ff%80%00%00');
        var result = [0xca, 0xff, 0x80, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "is Infinity", void 0, hex(result)];
    },
    '[cb ff f0 00 00 00 00 00 00] Infinity double': function() {
        var data = unescape('%cb%ff%f0%00%00%00%00%00%00');
        var result = [0xcb, 0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        var rv = MessagePack.unpack(data);

        return [rv, "is Infinity", void 0, hex(result)];
    },
    'Number(NaN) -> [0xcb, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]': function() {
        var pack = MessagePack.pack(NaN);
        var rv = MessagePack.unpack(pack);

        return [rv, "is NaN", void 0, hex(pack)];
    },
    'Number(Infinity) -> [0xcb, 0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]': function() {
        var pack = MessagePack.pack(Infinity);
        var rv = MessagePack.unpack(pack);

        return [rv, "is Infinity", void 0, hex(pack)];
    },
"More": "",
    'Number(0.250223099719733) -> []': function() {
        var data = 0.250223099719733;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },

    'Number(0.3425064110197127) -> []': function() {
        var data = 0.3425064110197127;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(-0.5991213528905064) -> []': function() {
        var data = -0.5991213528905064;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },

    'Number(-0.008100000073710001) -> []': function() {
        var data = -0.008100000073710001;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(0.07290000066339) -> []': function() {
        var data = 0.07290000066339;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },

    'Number(0.06480000058968001) -> []': function() {
        var data = 0.06480000058968001;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(0.05670000051597) -> []': function() {
        var data = 0.05670000051597;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(0.1) -> []': function() {
        var data = 0.1;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(0.01) -> []': function() {
        var data = 0.01;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(0.001) -> []': function() {
        var data = 0.01;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },

"Random Number": "",
    'Number(Math.random(a)) ': function() {
        var data = Math.random();
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(Math.random(b))': function() {
        var data = Math.random();
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(Math.random(c))': function() {
        var data = Math.random();
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(Math.random(d))': function() {
        var data = Math.random();
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(Math.random(e))': function() {
        var data = Math.random();
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(Math.random(f))': function() {
        var data = Math.random();
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(Math.random(g))': function() {
        var data = Math.random();
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(Math.random(h))': function() {
        var data = Math.random();
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(Math.random(a) * 2) ': function() {
        var data = Math.random() * 2;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(Math.random(b) * 2)': function() {
        var data = Math.random() * 2;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(Math.random(c) * 2)': function() {
        var data = Math.random() * 2;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(Math.random(d) * 2)': function() {
        var data = Math.random() * 2;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(Math.random(e) * 2)': function() {
        var data = Math.random() * 2;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(Math.random(f) * 2)': function() {
        var data = Math.random() * 2;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(Math.random(g) * 2)': function() {
        var data = Math.random() * 2;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(Math.random(h) * 2)': function() {
        var data = Math.random() * 2;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },

    'Number(-Math.random(a)) ': function() {
        var data = -Math.random();
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(-Math.random(b))': function() {
        var data = -Math.random();
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(-Math.random(c))': function() {
        var data = -Math.random();
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(-Math.random(d))': function() {
        var data = -Math.random();
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(-Math.random(e))': function() {
        var data = -Math.random();
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(-Math.random(f))': function() {
        var data = -Math.random();
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(-Math.random(g))': function() {
        var data = -Math.random();
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(-Math.random(h))': function() {
        var data = -Math.random();
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(-Math.random(a) * 2) ': function() {
        var data = -Math.random() * 2;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(-Math.random(b) * 2)': function() {
        var data = -Math.random() * 2;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(-Math.random(c) * 2)': function() {
        var data = -Math.random() * 2;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(-Math.random(d) * 2)': function() {
        var data = -Math.random() * 2;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(-Math.random(e) * 2)': function() {
        var data = -Math.random() * 2;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(-Math.random(f) * 2)': function() {
        var data = -Math.random() * 2;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(-Math.random(g) * 2)': function() {
        var data = -Math.random() * 2;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
    'Number(-Math.random(h) * 2)': function() {
        var data = -Math.random() * 2;
        var pack = MessagePack.pack(data);
        var rv = MessagePack.unpack(pack);

        return [rv, "is", data, hex(pack)];
    },
"Cyclic Reference Error": "",
    "Hash": function() {
        var ary = [];
        var hash = {
            ary: ary
        };
        ary[0] = hash;

        var pack = MessagePack.pack(hash);
        var rv;

        if (pack === false) {
            return [rv, "is false"];
        } else {
            rv = MessagePack.unpack(pack);
            return [rv, "==", 0, hex(pack)];
        }
    }
 */



