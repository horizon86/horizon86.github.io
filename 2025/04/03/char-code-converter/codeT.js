function convClick(btnElement) {
    // 1. 找到最近的表单组
    const formGroup = btnElement.closest('.form-group');
    if (!formGroup) return;

    // 2. 获取输入框和类型
    const input = formGroup.querySelector('.form-input');
    const outputBoxes = {
        'srcChar': ['ucode', 'u8'],
        'ucode': ['srcChar', 'u8'],
        'u8': ['srcChar', 'ucode']
    };

    // 3. 执行转换
    try {
        const value = input.value.trim();
        if (!value) return;

        if (input.id === 'srcChar') {
            // 汉字 → Unicode + UTF-8
            let unicodeResult = '';
            let utf8Result = '';

            for (const char of value) {
                const codePoint = char.codePointAt(0);
                const utf8Code = unicode2u8(codePoint);

                unicodeResult += codePoint.toString(16).padStart(4, '0') + ' ';
                utf8Result += utf8Code.toString(16).padStart(2, '0').match(/.{2}/g).join(' ') + ' ';
            }

            document.getElementById('ucode').value = unicodeResult.trim();
            document.getElementById('u8').value = utf8Result.trim();

        } else {
            // Unicode/UTF-8 → 其他格式
            const hexValue = value.startsWith('0x') ? value : '0x' + value.replace(/\s+/g, '');
            const numValue = parseInt(hexValue, 16);

            if (isNaN(numValue)) throw new Error('无效的十六进制值');

            if (input.id === 'ucode') {
                // Unicode → 汉字 + UTF-8
                const char = String.fromCodePoint(numValue);
                const utf8 = unicode2u8(numValue);

                document.getElementById('srcChar').value = char;
                document.getElementById('u8').value = utf8.toString(16).padStart(2, '0').match(/.{2}/g).join(' ');
            } else if (input.id === 'u8') {
                // UTF-8 → 汉字 + Unicode
                const codePoint = u82unicode(numValue);

                document.getElementById('srcChar').value = String.fromCodePoint(codePoint);
                document.getElementById('ucode').value = codePoint.toString(16).padStart(4, '0');
            }
        }
    } catch (error) {
        console.error('转换错误:', error);
        alert('转换失败: ' + error.message);
    }
}

// 以下辅助函数保持不变
function src2unicode(str) {
    return str.codePointAt(0);
}

function u82unicode(str = 0x0) {
    if (str < 0x80) {
        return str;
    } else if (str <= 0Xdfbf && str >= 0xc080) {
        return (str & 0x1f00) >>> 2 | str & 0x3f;
    } else if (str <= 0xefbfbf && str >= 0xe08080) {
        return (str & 0xf0000) >>> 4 | (str & 0x3f00) >>> 2 | (str & 0x3f);
    } else if (str <= 0xf7bfbfbf && str >= 0xf0808080) {
        return (str & 0x7000000) >>> 6 | (str & 0x3f0000) >>> 4 | (str & 0x3f00) >>> 2 | (str & 0x3f);
    } else {
        throw new TypeError("Not a valid UTF-8 code");
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
    return UTF8 >>> 0;
}

// 添加回车键支持
document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const btn = this.nextElementSibling;
                if (btn && btn.classList.contains('convert-btn')) {
                    btn.click();
                }
            }
        });
    });
});