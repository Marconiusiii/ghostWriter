(function () {
  const writerInput = document.getElementById("writerInput");
  const indentationMode = document.getElementById("indentationMode");
  const indentButton = document.getElementById("indentButton");
  const outdentButton = document.getElementById("outdentButton");
  const renderButton = document.getElementById("renderButton");
  const spookinessToggle = document.getElementById("spookinessToggle");
  const downloadMarkdownButton = document.getElementById("downloadMarkdown");
  const downloadTextButton = document.getElementById("downloadText");
  const downloadHtmlButton = document.getElementById("downloadHtml");
  const renderedOutput = document.getElementById("renderedOutput");
  const renderedOutputRegion = document.getElementById("renderedOutputRegion");
  const statusMessage = document.getElementById("statusMessage");
  const copyrightYear = document.getElementById("copyrightYear");

  let ghostPasses = 0;
  let savedSelectionStart = 0;
  let savedSelectionEnd = 0;

  function isSpookinessOn() {
    return !spookinessToggle || spookinessToggle.checked;
  }

  function playRenderSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const vibratoOscillator = audioContext.createOscillator();
    const vibratoGain = audioContext.createGain();
    const now = audioContext.currentTime;
    const duration = 0.6 + Math.random() * 0.45;
    const baseFrequency = 190 + Math.random() * 340;
    const wobbleOne = 220 + Math.random() * 520;
    const wobbleTwo = 150 + Math.random() * 320;
    const wobbleThree = 180 + Math.random() * 460;
    const vibratoRate = 4.2 + Math.random() * 5.4;
    const vibratoDepth = 8 + Math.random() * 22;
    const attackLevel = 0.02 + Math.random() * 0.035;
    const decayLevel = 0.008 + Math.random() * 0.018;

    oscillator.type = "sine";
    vibratoOscillator.type = Math.random() > 0.5 ? "sine" : "triangle";

    oscillator.frequency.setValueAtTime(baseFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(120, wobbleOne), now + duration * 0.24);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(110, wobbleTwo), now + duration * 0.57);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(120, wobbleThree), now + duration * 0.84);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(attackLevel, now + duration * 0.08);
    gainNode.gain.exponentialRampToValueAtTime(decayLevel, now + duration * 0.58);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    vibratoOscillator.frequency.setValueAtTime(vibratoRate, now);
    vibratoGain.gain.setValueAtTime(vibratoDepth, now);
    vibratoGain.gain.linearRampToValueAtTime(vibratoDepth * 0.65, now + duration);

    vibratoOscillator.connect(vibratoGain);
    vibratoGain.connect(oscillator.frequency);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(now);
    vibratoOscillator.start(now);
    oscillator.stop(now + duration);
    vibratoOscillator.stop(now + duration);

    oscillator.addEventListener("ended", function () {
      audioContext.close();
    });
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function countIndent(line) {
    const match = line.match(/^[ \t]*/);
    if (!match) {
      return 0;
    }

    return match[0].replace(/\t/g, "  ").length;
  }

  function isBlankLine(line) {
    return !line.trim();
  }

  function isHorizontalRule(line) {
    return /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line);
  }

  function splitTableRow(line) {
    const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
    return trimmed.split("|").map(function (cell) {
      return cell.trim();
    });
  }

  function isTableDivider(line) {
    const cells = splitTableRow(line);

    if (!cells.length) {
      return false;
    }

    return cells.every(function (cell) {
      return /^:?-{3,}:?$/.test(cell);
    });
  }

  function isListLine(line) {
    return /^([ \t]*)([-*]|\d+\.)\s+/.test(line);
  }

  function isBlockquoteLine(line) {
    return /^[ \t]*>\s?/.test(line);
  }

  function isFencedCodeStart(line) {
    return /^[ \t]*```/.test(line);
  }

  function isTableStart(lines, index, baseIndent) {
    if (index + 1 >= lines.length) {
      return false;
    }

    const currentLine = lines[index];
    const nextLine = lines[index + 1];

    if (countIndent(currentLine) !== baseIndent || countIndent(nextLine) !== baseIndent) {
      return false;
    }

    return currentLine.includes("|") && isTableDivider(nextLine);
  }

  function isBlockStart(line, baseIndent) {
    if (isBlankLine(line)) {
      return true;
    }

    const indent = countIndent(line);
    if (indent < baseIndent) {
      return true;
    }

    const trimmed = line.trim();

    return (
      indent === baseIndent &&
      (
        /^#{1,6}\s+/.test(trimmed) ||
        isHorizontalRule(line) ||
        isListLine(line) ||
        isBlockquoteLine(line) ||
        isFencedCodeStart(line)
      )
    );
  }

  function parseInlineMarkdown(text) {
    const codePlaceholders = [];
    let parsed = escapeHtml(text).replace(/`([^`]+)`/g, function (match, content) {
      const placeholder = "%%CODE" + codePlaceholders.length + "%%";
      codePlaceholders.push("<code>" + content + "</code>");
      return placeholder;
    });

    parsed = parsed.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">');
    parsed = parsed.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
    parsed = parsed.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    parsed = parsed.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    parsed = parsed.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    parsed = parsed.replace(/_([^_]+)_/g, "<em>$1</em>");
    parsed = parsed.replace(/~~([^~]+)~~/g, "<del>$1</del>");

    codePlaceholders.forEach(function (markup, index) {
      parsed = parsed.replace("%%CODE" + index + "%%", markup);
    });

    return parsed;
  }

  function parseParagraph(lines, startIndex, baseIndent) {
    const parts = [];
    let index = startIndex;

    while (index < lines.length) {
      const line = lines[index];
      if (isBlankLine(line)) {
        break;
      }

      const indent = countIndent(line);
      if (indent < baseIndent) {
        break;
      }

      if (index !== startIndex && isBlockStart(line, baseIndent)) {
        break;
      }

      parts.push(parseInlineMarkdown(line.trim()));
      index += 1;
    }

    return {
      html: "<p>" + parts.join(" ") + "</p>",
      nextIndex: index
    };
  }

  function parseFencedCodeBlock(lines, startIndex, baseIndent) {
    const openingLine = lines[startIndex].trim();
    const language = openingLine.replace(/^```/, "").trim();
    const codeLines = [];
    let index = startIndex + 1;

    while (index < lines.length && !/^[ \t]*```/.test(lines[index])) {
      codeLines.push(lines[index]);
      index += 1;
    }

    if (index < lines.length) {
      index += 1;
    }

    const className = language ? ' class="language-' + escapeHtml(language) + '"' : "";

    return {
      html: "<pre><code" + className + ">" + escapeHtml(codeLines.join("\n")) + "</code></pre>",
      nextIndex: index
    };
  }

  function parseBlockquote(lines, startIndex, baseIndent) {
    const quoteLines = [];
    let index = startIndex;

    while (index < lines.length) {
      const line = lines[index];
      if (isBlankLine(line)) {
        quoteLines.push("");
        index += 1;
        continue;
      }

      if (countIndent(line) < baseIndent || !isBlockquoteLine(line)) {
        break;
      }

      quoteLines.push(line.replace(/^[ \t]*>\s?/, ""));
      index += 1;
    }

    return {
      html: "<blockquote>" + parseBlocks(quoteLines, 0, 0).html + "</blockquote>",
      nextIndex: index
    };
  }

  function parseTable(lines, startIndex, baseIndent) {
    const headerCells = splitTableRow(lines[startIndex]);
    const alignmentCells = splitTableRow(lines[startIndex + 1]);
    const alignments = alignmentCells.map(function (cell) {
      if (/^:-+:$/.test(cell)) {
        return "center";
      }
      if (/^-+:$/.test(cell)) {
        return "right";
      }
      if (/^:-+$/.test(cell)) {
        return "left";
      }
      return "";
    });

    const thead = "<thead><tr>" + headerCells.map(function (cell, index) {
      const style = alignments[index] ? ' style="text-align:' + alignments[index] + '"' : "";
      return "<th" + style + ">" + parseInlineMarkdown(cell) + "</th>";
    }).join("") + "</tr></thead>";

    const bodyRows = [];
    let index = startIndex + 2;

    while (index < lines.length) {
      const line = lines[index];
      if (isBlankLine(line) || countIndent(line) !== baseIndent || !line.includes("|")) {
        break;
      }

      const cells = splitTableRow(line);
      bodyRows.push("<tr>" + cells.map(function (cell, cellIndex) {
        const style = alignments[cellIndex] ? ' style="text-align:' + alignments[cellIndex] + '"' : "";
        return "<td" + style + ">" + parseInlineMarkdown(cell) + "</td>";
      }).join("") + "</tr>");
      index += 1;
    }

    return {
      html: "<table>" + thead + "<tbody>" + bodyRows.join("") + "</tbody></table>",
      nextIndex: index
    };
  }

  function parseList(lines, startIndex, baseIndent) {
    const match = lines[startIndex].slice(lines[startIndex].search(/\S|$/)).match(/^([-*])\s+|^(\d+)\.\s+/);
    const listTag = match && match[1] ? "ul" : "ol";
    const items = [];
    let index = startIndex;

    while (index < lines.length) {
      const line = lines[index];
      const indent = countIndent(line);

      if (isBlankLine(line) || indent < baseIndent) {
        break;
      }

      const trimmed = line.trim();
      const itemMatch = listTag === "ul"
        ? trimmed.match(/^([-*])\s+(.*)$/)
        : trimmed.match(/^(\d+)\.\s+(.*)$/);

      if (!itemMatch || indent !== baseIndent) {
        break;
      }

      const itemBody = [];
      const firstLineContent = itemMatch[2];

      if (firstLineContent.trim()) {
        itemBody.push(parseInlineMarkdown(firstLineContent.trim()));
      }

      index += 1;

      while (index < lines.length) {
        const nextLine = lines[index];
        if (isBlankLine(nextLine)) {
          index += 1;
          break;
        }

        const nextIndent = countIndent(nextLine);
        if (nextIndent <= baseIndent) {
          break;
        }

        const nested = parseBlocks(lines, index, nextIndent);
        itemBody.push(nested.html);
        index = nested.nextIndex;
      }

      items.push("<li>" + itemBody.join("") + "</li>");
    }

    return {
      html: "<" + listTag + ">" + items.join("") + "</" + listTag + ">",
      nextIndex: index
    };
  }

  function parseBlocks(lines, startIndex, baseIndent) {
    const fragments = [];
    let index = startIndex;

    while (index < lines.length) {
      const line = lines[index];

      if (isBlankLine(line)) {
        index += 1;
        continue;
      }

      const indent = countIndent(line);
      const trimmed = line.trim();

      if (indent < baseIndent) {
        break;
      }

      if (indent > baseIndent) {
        const nested = parseBlocks(lines, index, indent);
        fragments.push(nested.html);
        index = nested.nextIndex;
        continue;
      }

      if (/^#{1,6}\s+/.test(trimmed)) {
        const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        const level = headingMatch[1].length;
        fragments.push("<h" + level + ">" + parseInlineMarkdown(headingMatch[2]) + "</h" + level + ">");
        index += 1;
        continue;
      }

      if (isHorizontalRule(line)) {
        fragments.push("<hr>");
        index += 1;
        continue;
      }

      if (isFencedCodeStart(line)) {
        const fencedCode = parseFencedCodeBlock(lines, index, baseIndent);
        fragments.push(fencedCode.html);
        index = fencedCode.nextIndex;
        continue;
      }

      if (isBlockquoteLine(line)) {
        const blockquote = parseBlockquote(lines, index, baseIndent);
        fragments.push(blockquote.html);
        index = blockquote.nextIndex;
        continue;
      }

      if (isTableStart(lines, index, baseIndent)) {
        const table = parseTable(lines, index, baseIndent);
        fragments.push(table.html);
        index = table.nextIndex;
        continue;
      }

      if (isListLine(line)) {
        const list = parseList(lines, index, baseIndent);
        fragments.push(list.html);
        index = list.nextIndex;
        continue;
      }

      const paragraph = parseParagraph(lines, index, baseIndent);
      fragments.push(paragraph.html);
      index = paragraph.nextIndex;
    }

    return {
      html: fragments.join(""),
      nextIndex: index
    };
  }

  function markdownToHtml(markdown) {
    const source = markdown || "";
    if (!source.trim()) {
      return "<p>Your rendered output will appear here.</p>";
    }

    if (window.marked && typeof window.marked.parse === "function") {
      return window.marked.parse(source, {
        gfm: true,
        breaks: false,
        headerIds: false,
        mangle: false
      });
    }

    const lines = source.replace(/\r\n/g, "\n").split("\n");
    const parsed = parseBlocks(lines, 0, 0).html;
    return parsed || "<p>Your rendered output will appear here.</p>";
  }

  function createDriftMarkup(html) {
    let driftIndex = 0;

    return html.replace(/(^|>)([^<]+)(?=<|$)/g, function (match, prefix, text) {
      const pieces = text.split(/(\s+)/);
      const wrappedText = pieces.map(function (piece) {
        if (!piece.trim()) {
          return piece;
        }

        const driftX = ((Math.random() * 1.6) - 0.8).toFixed(2) + "rem";
        const driftY = ((Math.random() * 1.2) - 0.6).toFixed(2) + "rem";
        const driftRotate = ((Math.random() * 4) - 2).toFixed(2) + "deg";
        const markup = '<span class="drift-word" style="--drift-index:' +
          driftIndex +
          ";--drift-x:" +
          driftX +
          ";--drift-y:" +
          driftY +
          ";--drift-rotate:" +
          driftRotate +
          ';">' +
          piece +
          "</span>";
        driftIndex += 1;
        return markup;
      }).join("");

      return prefix + wrappedText;
    });
  }

  function extractWords(text) {
    return text.match(/\b[\w']+\b/g) || [];
  }

  function chooseIndex(length) {
    return Math.floor(Math.random() * length);
  }

  function transposeWords(words) {
    if (words.length < 4) {
      return words;
    }

    const index = Math.max(1, Math.min(words.length - 2, chooseIndex(words.length)));
    const temp = words[index];
    words[index] = words[index + 1];
    words[index + 1] = temp;
    return words;
  }

  function duplicateWord(words) {
    if (!words.length) {
      return words;
    }

    const index = chooseIndex(words.length);
    words.splice(index, 0, words[index]);
    return words;
  }

  function addGhostWord(words) {
    const sourceWord = words.find(function (word) {
      return word.length > 3;
    });

    if (!sourceWord) {
      return words;
    }

    const ghostWords = ["perhaps", "still", "quietly", sourceWord.toLowerCase()];
    const insertAt = Math.min(words.length, Math.max(1, chooseIndex(words.length)));
    words.splice(insertAt, 0, ghostWords[chooseIndex(ghostWords.length)]);
    return words;
  }

  function tokenizeText(text) {
    return text.match(/\b[\w']+\b|[^\w\s]+|\s+/g) || [];
  }

  function rebuildText(originalText, newWords) {
    const tokens = tokenizeText(originalText);
    const rebuilt = [];
    let wordIndex = 0;

    tokens.forEach(function (token) {
      if (/^\b[\w']+\b$/.test(token)) {
        if (wordIndex < newWords.length) {
          rebuilt.push(newWords[wordIndex]);
          wordIndex += 1;
        }
      } else {
        rebuilt.push(token);
      }
    });

    while (wordIndex < newWords.length) {
      const lastToken = rebuilt[rebuilt.length - 1];
      if (lastToken && !/\s+/.test(lastToken)) {
        rebuilt.push(" ");
      }
      rebuilt.push(newWords[wordIndex]);
      wordIndex += 1;
    }

    return rebuilt.join("");
  }

  function hauntText(sourceText) {
    const words = extractWords(sourceText);
    if (words.length < 6) {
      return sourceText;
    }

    const interactionLevel = ghostPasses + 1;
    const intensity = Math.min(4, Math.floor(interactionLevel / 3) + Math.floor(words.length / 140));
    let hauntedWords = words.slice();
    let hasChanged = false;

    if (interactionLevel < 3) {
      if (words.length > 10 && Math.random() < 0.35) {
        hauntedWords = duplicateWord(hauntedWords);
      } else {
        hauntedWords = transposeWords(hauntedWords);
      }
      hasChanged = true;
    } else if (Math.random() < Math.min(0.35 + interactionLevel * 0.06, 0.85)) {
      hauntedWords = transposeWords(hauntedWords);
      hasChanged = true;
    }

    if (intensity > 1 && Math.random() < 0.35) {
      hauntedWords = duplicateWord(hauntedWords);
      hasChanged = true;
    }

    if (intensity > 2 && Math.random() < 0.22) {
      hauntedWords = addGhostWord(hauntedWords);
      hasChanged = true;
    }

    if (intensity > 3 && Math.random() < 0.28) {
      hauntedWords = transposeWords(hauntedWords);
      hasChanged = true;
    }

    if (!hasChanged) {
      hauntedWords = transposeWords(hauntedWords);
    }

    return rebuildText(sourceText, hauntedWords);
  }

  function setStatus(message) {
    if (!statusMessage) {
      return;
    }

    statusMessage.textContent = "";
    window.setTimeout(function () {
      statusMessage.textContent = message;
    }, 25);
  }

  function updateRenderedOutput(renderedHtml, shouldAnimate) {
    renderedOutput.classList.remove("is-shifting");

    if (!shouldAnimate) {
      renderedOutput.innerHTML = renderedHtml;
      return;
    }

    renderedOutput.innerHTML = createDriftMarkup(renderedHtml);

    window.requestAnimationFrame(function () {
      renderedOutput.classList.add("is-shifting");
      window.setTimeout(function () {
        renderedOutput.classList.remove("is-shifting");
        renderedOutput.innerHTML = renderedHtml;
      }, 950);
    });
  }

  function saveSelectionRange() {
    savedSelectionStart = writerInput.selectionStart;
    savedSelectionEnd = writerInput.selectionEnd;
  }

  function setSelectionRange(start, end) {
    writerInput.selectionStart = start;
    writerInput.selectionEnd = end;
    savedSelectionStart = start;
    savedSelectionEnd = end;
  }

  function getIndentUnit() {
    if (!indentationMode) {
      return "  ";
    }

    if (indentationMode.value === "tab") {
      return "\t";
    }

    if (indentationMode.value === "spaces-4") {
      return "    ";
    }

    return "  ";
  }

  function getSelectedLineRange() {
    const value = writerInput.value;
    const start = savedSelectionStart;
    const end = savedSelectionEnd;
    const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    let lineEnd = value.indexOf("\n", end);

    if (lineEnd === -1) {
      lineEnd = value.length;
    }

    return {
      start: lineStart,
      end: lineEnd
    };
  }

  function calculateIndentLevel(line) {
    const unit = getIndentUnit();
    if (unit === "\t") {
      const tabMatch = line.match(/^\t*/);
      return tabMatch ? tabMatch[0].length : 0;
    }

    return Math.floor(countIndent(line) / unit.length);
  }

  function removeOneIndentLevel(line) {
    const unit = getIndentUnit();

    if (unit === "\t") {
      return line.replace(/^\t/, "");
    }

    const unitPattern = new RegExp("^" + unit.replace(/ /g, "\\s"));
    if (unitPattern.test(line)) {
      return line.replace(unitPattern, "");
    }

    return line.replace(/^[ \t]{1,4}/, "");
  }

  function applyIndentation(direction, options) {
    const settings = options || {};
    const value = writerInput.value;
    const range = getSelectedLineRange();
    const selectedBlock = value.slice(range.start, range.end);
    const lines = selectedBlock.split("\n");
    let levelAnnouncement = 0;
    const indentUnit = getIndentUnit();
    const hadSelection = savedSelectionStart !== savedSelectionEnd;
    const originalStart = savedSelectionStart;
    const originalEnd = savedSelectionEnd;
    const lineOffset = Math.max(0, originalStart - range.start);
    let removedFromFirstLine = 0;

    const nextLines = lines.map(function (line, index) {
      if (direction === "indent") {
        const updatedLine = indentUnit + line;
        levelAnnouncement = Math.max(levelAnnouncement, calculateIndentLevel(updatedLine));
        return updatedLine;
      }

      const updatedLine = removeOneIndentLevel(line);
      if (index === 0) {
        removedFromFirstLine = line.length - updatedLine.length;
      }
      levelAnnouncement = Math.max(levelAnnouncement, calculateIndentLevel(updatedLine));
      return updatedLine;
    });

    const nextBlock = nextLines.join("\n");
    writerInput.value = value.slice(0, range.start) + nextBlock + value.slice(range.end);

    if (settings.preserveSelection) {
      setSelectionRange(range.start, range.start + nextBlock.length);
    } else if (hadSelection) {
      const startDelta = direction === "indent"
        ? indentUnit.length
        : -Math.min(lineOffset, removedFromFirstLine);
      const endDelta = nextBlock.length - selectedBlock.length;
      const nextStart = Math.max(range.start, originalStart + startDelta);
      const nextEnd = Math.max(nextStart, originalEnd + endDelta);
      setSelectionRange(nextStart, nextEnd);
    } else {
      const nextCaret = direction === "indent"
        ? originalStart + indentUnit.length
        : Math.max(range.start, originalStart - Math.min(lineOffset, removedFromFirstLine));
      setSelectionRange(nextCaret, nextCaret);
    }

    if (direction === "indent") {
      setStatus("Text indented " + String(levelAnnouncement) + " level" + (levelAnnouncement === 1 ? "." : "s."));
    } else {
      setStatus("Text outdented to level " + String(levelAnnouncement) + ".");
    }
  }

  function handleIndentationShortcuts(event) {
    const usesModifier = event.ctrlKey || event.metaKey;
    if (!usesModifier || event.altKey) {
      return;
    }

    if (event.key === "]") {
      event.preventDefault();
      saveSelectionRange();
      applyIndentation("indent", { preserveSelection: false });
      return;
    }

    if (event.key === "[") {
      event.preventDefault();
      saveSelectionRange();
      applyIndentation("outdent", { preserveSelection: false });
    }
  }

  function renderDraft(allowSpookyChanges) {
    const sourceText = writerInput.value;
    const shouldSpook = allowSpookyChanges && isSpookinessOn();
    const nextText = shouldSpook ? hauntText(sourceText) : sourceText;
    const previewChanged = nextText !== sourceText;
    const renderedHtml = markdownToHtml(nextText);

    updateRenderedOutput(renderedHtml, shouldSpook);

    if (previewChanged) {
      writerInput.value = nextText;
      ghostPasses += 1;
      setStatus("Rendered output updated.");
    } else {
      setStatus("Rendered output updated.");
    }
  }

  function handleMarkdownListContinuation(event) {
    if (event.key !== "Enter") {
      return;
    }

    const selectionStart = writerInput.selectionStart;
    const selectionEnd = writerInput.selectionEnd;

    if (selectionStart !== selectionEnd) {
      return;
    }

    const value = writerInput.value;
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const lineEndIndex = value.indexOf("\n", selectionStart);
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
    const currentLine = value.slice(lineStart, lineEnd);
    const beforeCursor = value.slice(0, selectionStart);
    const afterCursor = value.slice(selectionEnd);
    const unorderedMatch = currentLine.match(/^([ \t]*)([-*])(\s+)(.*)$/);
    const orderedMatch = currentLine.match(/^([ \t]*)(\d+)\.(\s+)(.*)$/);
    let nextValue = value;
    let caretPosition = selectionStart;

    if (!unorderedMatch && !orderedMatch) {
      return;
    }

    event.preventDefault();

    if (unorderedMatch) {
      const indent = unorderedMatch[1];
      const marker = unorderedMatch[2];
      const spacing = unorderedMatch[3];
      const content = unorderedMatch[4];

      if (!content.trim()) {
        nextValue = value.slice(0, lineStart) + value.slice(lineEnd);
        caretPosition = lineStart;
      } else {
        const nextPrefix = "\n" + indent + marker + spacing;
        nextValue = beforeCursor + nextPrefix + afterCursor;
        caretPosition = selectionStart + nextPrefix.length;
      }
    }

    if (orderedMatch) {
      const indent = orderedMatch[1];
      const number = Number(orderedMatch[2]);
      const spacing = orderedMatch[3];
      const content = orderedMatch[4];

      if (!content.trim()) {
        nextValue = value.slice(0, lineStart) + value.slice(lineEnd);
        caretPosition = lineStart;
      } else {
        const nextPrefix = "\n" + indent + String(number + 1) + "." + spacing;
        nextValue = beforeCursor + nextPrefix + afterCursor;
        caretPosition = selectionStart + nextPrefix.length;
      }
    }

    writerInput.value = nextValue;
    writerInput.selectionStart = caretPosition;
    writerInput.selectionEnd = caretPosition;
  }

  function saveFile(filename, text, type) {
    const blob = new Blob([text], { type: type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  }

  function buildHtmlDocument(title, bodyContent) {
    return [
      "<!DOCTYPE html>",
      '<html lang="en">',
      "<head>",
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      "<title>" + escapeHtml(title) + "</title>",
      "</head>",
      "<body>",
      "<main>",
      bodyContent,
      "</main>",
      "</body>",
      "</html>"
    ].join("\n");
  }

  renderButton.addEventListener("click", function () {
    playRenderSound();
    renderDraft(true);
    if (renderedOutputRegion) {
      renderedOutputRegion.focus();
    }
  });

  writerInput.addEventListener("keydown", handleMarkdownListContinuation);
  writerInput.addEventListener("keydown", handleIndentationShortcuts);
  writerInput.addEventListener("select", saveSelectionRange);
  writerInput.addEventListener("keyup", saveSelectionRange);
  writerInput.addEventListener("click", saveSelectionRange);

  indentButton.addEventListener("click", function () {
    applyIndentation("indent", { preserveSelection: true });
  });

  outdentButton.addEventListener("click", function () {
    applyIndentation("outdent", { preserveSelection: true });
  });

  writerInput.addEventListener("blur", function () {
    saveSelectionRange();
  });

  if (spookinessToggle) {
    spookinessToggle.addEventListener("change", function () {
      setStatus(spookinessToggle.checked ? "Spookiness on." : "Spookiness off.");
    });
  }

  downloadMarkdownButton.addEventListener("click", function () {
    saveFile("ghost-writer-note.md", writerInput.value, "text/markdown;charset=utf-8");
    setStatus("Downloaded markdown file.");
  });

  downloadTextButton.addEventListener("click", function () {
    saveFile("ghost-writer-note.txt", writerInput.value, "text/plain;charset=utf-8");
    setStatus("Downloaded text file.");
  });

  downloadHtmlButton.addEventListener("click", function () {
    const renderedHtml = markdownToHtml(writerInput.value);
    const htmlDocument = buildHtmlDocument("Ghost Writer Export", renderedHtml);
    saveFile("ghost-writer-note.html", htmlDocument, "text/html;charset=utf-8");
    setStatus("Downloaded HTML file.");
  });

  if (copyrightYear) {
    copyrightYear.textContent = String(new Date().getFullYear());
  }

  saveSelectionRange();
  renderDraft(false);
})();
