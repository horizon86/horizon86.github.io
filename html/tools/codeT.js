function convClick(obj) {
	console.log(obj.id);
	if(obj.id == "btnsrcChar") {
		let rets = "";
		let u8rets = "";
		let str = djcform.srcChar.value;
		for(let ch of str) {
			let uc = src2unicode(ch);
			let st = uc.toString(16);
			let u8t = unicode2u8(uc).toString(16);
			if (st.length % 2) {
				st = "0" + st;
			}
			if(u8t.length % 2) {
				u8t = "0" + u8t;
			}
			rets = rets + st + " ";
			u8rets = u8rets + u8t + " ";
		}
		djcform.ucode.value = rets;
		djcform.u8.value = u8rets;
	}
	
	if(obj.id == "btnucode") {
		let ucodestr = djcform.ucode.value;
		if(!ucodestr.startsWith("0x")) {
			ucodestr = "0x" + ucodestr;
		}
		
		let ucodeNum = parseInt(ucodestr,16);
		djcform.srcChar.value = unicode2src(ucodeNum);
		let u8st = unicode2u8(ucodeNum).toString(16);
		if(u8st.length%2) u8st = "0" + u8st;
		djcform.u8.value = u8st;
	}
	
	if(obj.id == "btnu8") {
		let u8str = djcform.u8.value;
		if(!u8str.startsWith("0x")) {
			u8str = "0x" + u8str;
		}
		
		let u8Num = parseInt(u8str,16);
		let unc = u82unicode(u8Num);
		djcform.ucode.value = unc.toString(16);
		djcform.srcChar.value = String.fromCodePoint(unc);
	}
}

function encode(x) {

	let cp = typeof x === "string" ? x.codePointAt(0) : Math.floor(x);
	if (typeof cp !== "number" || cp < 0 || cp > 0x10FFFF) {
		throw new TypeError("Invalid Code Point!");
	}

	let UTF32LE, UTF32BE, UTF16LE, UTF16BE, UTF8;

	if (cp > 0xFFFF) {
		UTF32LE = combine(0, cp << 8 >>> 24, cp << 16 >>> 24, cp & 0xFF);
	} else {
		UTF32LE = combine(0, 0, cp >>> 8, cp & 0xFF);
	}
	UTF32BE = convertBOM(UTF32LE);

	if (cp > 0xFFFF) {
		let c = cp - 0x10000;
		let sh = (c >>> 10) + 0xD800;
		let sl = (c & 0xFFF) + 0xDC00;
		UTF16LE = combine(sh >>> 8, sh & 0xFF, sl >>> 8, sl & 0xFF);
	} else {
		UTF16LE = combine(cp >>> 8, cp & 0xFF);
	}
	UTF16BE = convertBOM(UTF16LE);

	if (cp < 0x80) {
		UTF8 = combine(cp);
	} else if (cp < 0x800) {
		UTF8 = combine((cp >>> 6) | 0xC0, cp & 0x3F | 0x80);
	} else if (cp < 0x10000) {
		UTF8 = combine(
			(cp >>> 12) | 0xE0,
			((cp & 0xFC0) >>> 6) | 0x80,
			cp & 0x3F | 0x80,
		);
	} else {
		UTF8 = combine(
			(cp >>> 18) | 0xF0,
			((cp & 0x3F000) >>> 12) | 0x80,
			((cp & 0xFC0) >>> 6) | 0x80, cp & 0x3F | 0x80,
		);
	}

	return {
		UTF32LE,
		UTF32BE,
		UTF16LE,
		UTF16BE,
		UTF8
	};
}

function combine() {
	return [...arguments].map(function(n) {
		let hex = n.toString(16).toUpperCase();
		return n < 0x10 ? ("0" + hex) : hex;
	}).join(" ");
}

function convertBOM(str) {
	return str.replace(/(\w\w) (\w\w)/g, "$2 $1");
}

function src2unicode(str) { //字符串转数字，每个字符最多4字节，肯定能放下
	return str.codePointAt(0);
}

function u82unicode(str = 0x0) { //utf-8 Number 转Unicode Number
	if (str < 0x80) {
		return str;
	} else if (str <= 0Xdfbf && str >= 0xc080) {
		return (str & 0x1f00) >>> 2 | str & 0x3f;
	} else if (str <= 0xefbfbf && str >= 0xe08080) {
		return (str & 0xf0000) >>> 4 | (str & 0x3f00) >>> 2 | (str & 0x3f);
	} else if (str <= 0xf7bfbfbf && str >= 0xf0808080) {
		return (str & 0x7000000) >>> 6 | (str & 0x3f0000) >>> 4 | (str & 0x3f00) >>> 2 | (str & 0x3f);
	} else {
		throw new TypeError("Not a utf-8 code");
	}
}

function unicode2src(unicodePoint) {
	return String.fromCodePoint(unicodePoint);
}

function unicode2u8(cp) {
	let UTF8;
	if (cp < 0x80) {
		UTF8 = cp;
	} else if (cp < 0x800) {
		UTF8 = ((cp >>> 6) | 0xC0) << 8 | cp & 0x3F | 0x80;
	} else if (cp < 0x10000) {
		UTF8 = ((cp >>> 12) | 0xE0) << 16 |
			(((cp & 0xFC0) >>> 6) | 0x80) << 8 |
			(cp & 0x3F | 0x80);
	} else {
		UTF8 = ((cp >>> 18) | 0xF0) << 24 |
			(((cp & 0x3F000) >>> 12) | 0x80) << 16 |
			(((cp & 0xFC0) >>> 6) | 0x80) << 8 |
			(cp & 0x3F | 0x80);
	}
	return UTF8 >>> 0 ;
}


// https://zhuanlan.zhihu.com/p/51202412
