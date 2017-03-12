module Utf8 {
    export function encode(str: string): Uint8Array {
        let buf: number[] = [];
        let i;
        let result;
        for (i = 0; i < str.length; i++) {
            let ch = str.charCodeAt(i);
            if (ch < 0x80) {
                buf.push(ch);
            }
            else if (0x80 <= ch && ch < 0x800) {
                buf.push((ch >>> 6) & 0x1f | 0xc0);
                buf.push(ch & 0x3f | 0x80);
            }
            else if (0x800 <= ch && ch < 0x10000) {
                buf.push((ch >>> 12) & 0x0f | 0xf0);
                buf.push((ch >>> 6) & 0x3f | 0x80);
                buf.push(ch & 0x3f | 0x80);
            }
            else if (0x10000 <= ch && ch < 0x110000) {
                buf.push((ch >>> 18) & 0x07 | 0xf8);
                buf.push((ch >>> 12) & 0x3f | 0x80);
                buf.push((ch >>> 6) & 0x3f | 0x80);
                buf.push(ch & 0x3f | 0x80);
            }
            result = new Uint8Array(buf);
        }
        return result;
    }
    export function decode(data: any): string {
        let reader = Stream.Reader(data);
        let str = '';
        let cont = function() {
            let ch = reader.uint8();
            if (0x80 !== (ch & 0xc0)) {
                throw 'Invalid UTF-8';
            }
            return ch & 0x3f;
        }
        let c = String.fromCharCode;
        while (!reader.end()) {
            let ch = reader.uint8();
            if (0 === (ch & 0x80)) {
                str += c(ch);
            }
            else if (0xc0 === (ch & 0xe0)) {
                let ch1 = cont();
                str += c(((ch & 0x1f) << 6) | ch1);
            }
            else if (0xe0 === (ch & 0xf0)) {
                let ch1 = cont();
                let ch2 = cont();
                str += c(((ch & 0x0f) << 12) | (ch1 << 6) | ch2);
            }
            else if (0xf0 === (ch & 0xf8)) {
                let ch1 = cont();
                let ch2 = cont();
                let ch3 = cont();
                str += c(((ch & 0x07) << 18) | (ch1 << 12) | (ch2 << 6) | ch3);
            }
        }
        return str;
    }
}