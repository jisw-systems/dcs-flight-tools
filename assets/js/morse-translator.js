document.addEventListener('DOMContentLoaded', function () {
  var codes = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
    I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
    Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
    Y: '-.--', Z: '--..',
    0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....',
    6: '-....', 7: '--...', 8: '---..', 9: '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
    '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
    ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', _: '..--.-',
    '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
  };
  var characters = Object.keys(codes).reduce(function (result, character) {
    result[codes[character]] = character;
    return result;
  }, {});

  function normalizeText(value) {
    return value.toUpperCase()
      .replace(/Ñ/g, 'N')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function encodeText(value) {
    var unsupported = new Set();
    var words = normalizeText(value).trim().split(/\s+/);
    if (words.length === 1 && words[0] === '') return { output: '', unsupported: [] };
    var output = words.map(function (word) {
      return Array.from(word).map(function (character) {
        if (codes[character]) return codes[character];
        unsupported.add(character);
        return '?';
      }).join(' ');
    }).join(' / ');
    return { output: output, unsupported: Array.from(unsupported) };
  }

  function decodeMorse(value) {
    var normalized = value.replace(/[·]/g, '.').replace(/[−–—]/g, '-').trim();
    if (!normalized) return { output: '', invalid: [], hasInvalidCharacters: false };
    if (/[^.\-/\s]/.test(normalized)) {
      return { output: '', invalid: [], hasInvalidCharacters: true };
    }

    var invalid = new Set();
    var words = normalized.split(/\s*\/\s*/).map(function (word) {
      return word.trim().split(/\s+/).filter(Boolean).map(function (code) {
        if (characters[code]) return characters[code];
        invalid.add(code);
        return '?';
      }).join('');
    });
    return { output: words.join(' '), invalid: Array.from(invalid), hasInvalidCharacters: false };
  }

  var textInput = document.getElementById('morse-text-input');
  var textOutput = document.getElementById('morse-text-output');
  var codeInput = document.getElementById('morse-code-input');
  var codeOutput = document.getElementById('morse-code-output');
  var textStatus = document.querySelector('[data-status-for="morse-text-input"]');
  var codeStatus = document.querySelector('[data-status-for="morse-code-input"]');

  function setStatus(element, message, isError) {
    element.textContent = message;
    element.classList.toggle('is-error', isError);
  }

  function updateTextTranslation() {
    var result = encodeText(textInput.value);
    textOutput.value = result.output;
    setStatus(textStatus, result.unsupported.length
      ? 'Unsupported characters replaced with ?: ' + result.unsupported.join(' ')
      : '', result.unsupported.length > 0);
  }

  function updateMorseTranslation() {
    var result = decodeMorse(codeInput.value);
    codeOutput.value = result.output;
    if (result.hasInvalidCharacters) {
      setStatus(codeStatus, 'Use only dots, dashes, spaces between letters, and / between words.', true);
    } else if (result.invalid.length) {
      setStatus(codeStatus, 'Unknown Morse sequence' + (result.invalid.length > 1 ? 's' : '') + ' replaced with ?: ' + result.invalid.join(', '), true);
    } else {
      setStatus(codeStatus, '', false);
    }
  }

  textInput.addEventListener('input', updateTextTranslation);
  codeInput.addEventListener('input', updateMorseTranslation);

  document.querySelectorAll('[data-symbol]').forEach(function (button) {
    button.addEventListener('click', function () {
      var start = codeInput.selectionStart;
      var end = codeInput.selectionEnd;
      codeInput.value = codeInput.value.slice(0, start) + button.getAttribute('data-symbol') + codeInput.value.slice(end);
      var caret = start + 1;
      codeInput.focus();
      codeInput.setSelectionRange(caret, caret);
      codeInput.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });

  document.querySelectorAll('[data-clear]').forEach(function (button) {
    button.addEventListener('click', function () {
      var input = document.getElementById(button.getAttribute('data-clear'));
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    });
  });

  document.querySelectorAll('[data-copy]').forEach(function (button) {
    button.addEventListener('click', function () {
      var output = document.getElementById(button.getAttribute('data-copy'));
      var status = button.closest('.morse-card').querySelector('.morse-status');
      if (!output.value) {
        setStatus(status, 'There is nothing to copy yet.', true);
        return;
      }
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        setStatus(status, 'Clipboard access is unavailable. Select and copy the output manually.', true);
        return;
      }
      navigator.clipboard.writeText(output.value).then(function () {
        setStatus(status, 'Copied to clipboard.', false);
      }).catch(function (error) {
        console.error('Unable to copy Morse translator output.', error);
        setStatus(status, 'Copy failed. Select and copy the output manually.', true);
      });
    });
  });
});
