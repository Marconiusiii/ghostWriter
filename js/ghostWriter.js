(function () {
  const writerInput = document.getElementById("writerInput");
  const indentationMode = document.getElementById("indentationMode");
  const indentButton = document.getElementById("indentButton");
  const outdentButton = document.getElementById("outdentButton");
  const renderButton = document.getElementById("renderButton");
  const spookinessToggle = document.getElementById("spookinessToggle");
  const exampleButtons = document.querySelectorAll(".example-button");
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
    const spooky = isSpookinessOn();
    const duration = spooky
      ? 1.05 + Math.random() * 0.75
      : 0.78 + Math.random() * 0.38;
    const baseFrequency = spooky
      ? 170 + Math.random() * 300
      : 210 + Math.random() * 320;
    const wobbleOne = spooky
      ? 300 + Math.random() * 560
      : 260 + Math.random() * 420;
    const wobbleTwo = spooky
      ? 120 + Math.random() * 260
      : 180 + Math.random() * 260;
    const wobbleThree = spooky
      ? 260 + Math.random() * 500
      : 220 + Math.random() * 360;
    const finalLift = spooky
      ? 340 + Math.random() * 420
      : 290 + Math.random() * 280;
    const vibratoRate = spooky
      ? 3.1 + Math.random() * 4.6
      : 5.2 + Math.random() * 4.8;
    const vibratoDepth = spooky
      ? 16 + Math.random() * 34
      : 18 + Math.random() * 26;
    const attackLevel = spooky
      ? 0.045 + Math.random() * 0.05
      : 0.034 + Math.random() * 0.04;
    const decayLevel = spooky
      ? 0.02 + Math.random() * 0.028
      : 0.014 + Math.random() * 0.018;

    oscillator.type = "sine";
    vibratoOscillator.type = Math.random() > 0.5 ? "sine" : "triangle";

    oscillator.frequency.setValueAtTime(baseFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(120, wobbleOne), now + duration * (spooky ? 0.2 : 0.22));
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(110, wobbleTwo), now + duration * (spooky ? 0.48 : 0.52));
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(120, wobbleThree), now + duration * (spooky ? 0.76 : 0.78));
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(150, finalLift), now + duration * (spooky ? 0.96 : 0.92));

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(attackLevel, now + duration * (spooky ? 0.09 : 0.07));
    gainNode.gain.exponentialRampToValueAtTime(decayLevel, now + duration * (spooky ? 0.68 : 0.6));
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    vibratoOscillator.frequency.setValueAtTime(vibratoRate, now);
    vibratoGain.gain.setValueAtTime(vibratoDepth, now);
    vibratoGain.gain.linearRampToValueAtTime(vibratoDepth * (spooky ? 0.8 : 0.82), now + duration * 0.5);
    vibratoGain.gain.linearRampToValueAtTime(vibratoDepth * (spooky ? 0.5 : 0.68), now + duration);

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

    return "<p>Markdown parser unavailable.</p>";
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

  function insertExample(exampleText, announcement) {
    const normalizedExample = exampleText.replace(/\\n/g, "\n");
    const value = writerInput.value;
    const start = savedSelectionStart;
    const end = savedSelectionEnd;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const leadingBreak = !before.length || before.endsWith("\n\n")
      ? ""
      : before.endsWith("\n") ? "\n" : "\n\n";
    const trailingBreak = !after.length || after.startsWith("\n\n")
      ? ""
      : after.startsWith("\n") ? "\n" : "\n\n";
    const insertedText = leadingBreak + normalizedExample + trailingBreak;
    const nextValue = before + insertedText + after;
    const nextCaret = before.length + insertedText.length;

    writerInput.value = nextValue;
    setSelectionRange(nextCaret, nextCaret);
    setStatus(announcement);
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
    const lineStart = start === 0 ? 0 : value.lastIndexOf("\n", start - 1) + 1;
    const lastSelectedPosition = end > start ? end - 1 : end;
    let lineEnd = value.indexOf("\n", lastSelectedPosition);

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
    }
  }

  function isInsideFencedCode(position) {
    const precedingLines = writerInput.value.slice(0, position).split("\n");
    precedingLines.pop();
    let fence = null;

    for (const line of precedingLines) {
      const match = line.match(/^[ \t]*(`{3,}|~{3,})(.*)$/);
      if (!match) {
        continue;
      }

      const marker = match[1];
      const remainder = match[2];
      if (fence) {
        if (marker[0] === fence[0] && marker.length >= fence.length && !remainder.trim()) {
          fence = null;
        }
      } else if (marker[0] !== "`" || !remainder.includes("`")) {
        fence = marker;
      }
    }

    return fence !== null;
  }

  function handleMarkdownListContinuation(event) {
    if (event.key !== "Enter") {
      return;
    }

    const selectionStart = writerInput.selectionStart;
    const selectionEnd = writerInput.selectionEnd;

    if (selectionStart !== selectionEnd || isInsideFencedCode(selectionStart)) {
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

  function exportFragment(markdown, preserveCode) {
    const template = document.createElement("template");
    if (markdown.trim() && preserveCode && window.marked) {
      const renderer = new window.marked.Renderer();
      renderer.code = function (text) {
        return "<pre><code>" + escapeHtml(text) + "</code></pre>\n";
      };
      template.innerHTML = window.marked.parse(markdown, {
        gfm: true, breaks: false, headerIds: false, mangle: false, renderer: renderer
      });
    } else {
      template.innerHTML = markdown.trim() ? markdownToHtml(markdown) : "";
    }
    return template;
  }

  function plainTextFromMarkdown(markdown) {
    const template = exportFragment(markdown, true);
    const ignoredTags = new Set(["SCRIPT", "STYLE", "TEMPLATE"]);
    const blockTags = new Set(["P", "DIV", "SECTION", "ARTICLE", "ASIDE", "HEADER", "FOOTER", "MAIN", "FIGURE", "FIGCAPTION", "DETAILS", "SUMMARY", "DL", "DT", "DD"]);

    function isBlock(node) {
      return node && node.nodeType === 1 && (blockTags.has(node.tagName) || /^(H[1-6]|UL|OL|LI|PRE|TABLE|BLOCKQUOTE|HR)$/.test(node.tagName));
    }

    function children(node) {
      return Array.from(node.childNodes).map(function (child) {
        if (child.nodeType === 3 && !child.textContent.trim() &&
            (isBlock(child.previousSibling) || isBlock(child.nextSibling))) {
          return "";
        }
        return render(child);
      }).join("");
    }

    function renderList(node) {
      let number = Number(node.getAttribute("start")) || 1;
      return Array.from(node.children).filter(function (item) {
        return item.tagName === "LI";
      }).map(function (item) {
        if (item.hasAttribute("value")) {
          number = Number(item.getAttribute("value"));
        }
        const prefix = node.tagName === "OL" ? String(number++) + ". " : "- ";
        const content = children(item).replace(/^\n+|\n+$/g, "");
        return prefix + content.split("\n").join("\n" + " ".repeat(prefix.length));
      }).join("\n") + "\n\n";
    }

    function renderTable(node) {
      const rows = Array.from(node.rows).map(function (row) {
        return Array.from(row.cells).map(function (cell) {
          return children(cell).trim().replace(/\n+/g, " / ");
        });
      });
      const widths = [];
      rows.forEach(function (row) {
        row.forEach(function (cell, index) {
          widths[index] = Math.max(widths[index] || 0, cell.length);
        });
      });
      return rows.map(function (row) {
        return widths.map(function (width, index) {
          return (row[index] || "").padEnd(width);
        }).join("  ").trimEnd();
      }).join("\n") + "\n\n";
    }

    function render(node) {
      if (node.nodeType === 3) {
        return node.textContent.replace(/\s+/g, " ");
      }
      if (node.nodeType !== 1 || ignoredTags.has(node.tagName)) {
        return "";
      }
      const tag = node.tagName;
      if (tag === "PRE") {
        return node.textContent + "\n\n";
      }
      if (tag === "CODE") {
        return node.textContent;
      }
      if (tag === "BR") {
        return "\n";
      }
      if (tag === "IMG") {
        const description = node.getAttribute("alt");
        return description ? "Image: " + description : "";
      }
      if (tag === "INPUT" && node.getAttribute("type") === "checkbox") {
        return node.hasAttribute("checked") ? "Completed: " : "Not completed: ";
      }
      if (tag === "UL" || tag === "OL") {
        return "\n" + renderList(node);
      }
      if (tag === "TABLE") {
        return renderTable(node);
      }
      if (tag === "HR") {
        return "\n\n";
      }
      const content = children(node);
      if (tag === "A") {
        const destination = node.getAttribute("href");
        return destination && destination !== content ? content + " (" + destination + ")" : content;
      }
      if (/^H[1-6]$/.test(tag)) {
        return content.trim() + "\n\n";
      }
      if (tag === "BLOCKQUOTE") {
        return content.trim().split("\n").map(function (line) {
          return "> " + line;
        }).join("\n") + "\n\n";
      }
      if (blockTags.has(tag)) {
        return content + "\n\n";
      }
      return content;
    }

    // Ignore parser whitespace between blocks, but keep literal code untouched.
    const output = Array.from(template.content.childNodes).map(function (node) {
      if (node.nodeType === 3 && !node.textContent.trim()) {
        return "";
      }
      const text = render(node);
      return node.tagName === "UL" || node.tagName === "OL" ? text.slice(1) : text;
    }).join("");
    if (output.endsWith("\n\n")) {
      return output.slice(0, -1);
    }
    return output && !output.endsWith("\n") ? output + "\n" : output;
  }

  function addHtmlContents(template) {
    const root = template.content;
    const openingTitle = root.firstElementChild && root.firstElementChild.tagName === "H1"
      ? root.firstElementChild : null;
    const headings = Array.from(root.querySelectorAll("h1, h2, h3, h4, h5, h6")).filter(function (heading) {
      return heading !== openingTitle && heading.textContent.trim();
    });
    if (!headings.length) {
      return;
    }

    const idOwners = new Map();
    root.querySelectorAll("[id]").forEach(function (element) {
      if (!idOwners.has(element.id)) {
        idOwners.set(element.id, element);
      }
    });
    const usedIds = new Set(idOwners.keys());
    const disclosure = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "Table of contents";
    disclosure.appendChild(summary);
    const list = document.createElement("ul");
    disclosure.appendChild(list);
    const stack = [{ level: 0, list: list, item: null }];
    let identifier = 0;

    headings.forEach(function (heading) {
      // Preserve authored anchors, including links already pointing to them.
      if (!heading.id || idOwners.get(heading.id) !== heading) {
        let id;
        do {
          id = "ghostwriter-heading-" + String(++identifier);
        } while (usedIds.has(id));
        heading.id = id;
        usedIds.add(id);
      }
      const level = Number(heading.tagName.slice(1));
      while (stack.length > 1 && level <= stack[stack.length - 1].level) {
        stack.pop();
      }
      const parent = stack[stack.length - 1];
      let targetList = parent.list;
      if (parent.item) {
        targetList = document.createElement("ul");
        parent.item.appendChild(targetList);
        parent.list = targetList;
        parent.item = null;
      }
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#" + encodeURIComponent(heading.id);
      link.textContent = heading.textContent.trim();
      item.appendChild(link);
      targetList.appendChild(item);
      stack.push({ level: level, list: targetList, item: item });
    });

    if (openingTitle) {
      openingTitle.after(disclosure);
    } else {
      root.prepend(disclosure);
    }
  }

  function htmlExportStyles() {
    return `
:root { color-scheme: light dark; --page: #f5f0e8; --text: #1f1b18; --muted: #534a42; --accent: #23433a; --soft: #d7e4dd; --link: #0d4f8f; --border: #6b6258; --code: #ece4d6; --focus: #a83b12; }
@media (prefers-color-scheme: dark) {
  :root { --page: #13100f; --text: #f2ebe1; --muted: #d1c4b8; --accent: #b7d7c9; --soft: #2b342f; --link: #8dc2ff; --border: #8e8378; --code: #312926; --focus: #f28d49; }
}
* { box-sizing: border-box; }
body { margin: 0; padding: 2rem 1rem; font-family: -apple-system, system-ui, Georgia, serif; line-height: 1.6; color: var(--text); background: var(--page); overflow-wrap: break-word; }
main { max-width: 42rem; margin: 0 auto; }
h1, h2, h3, h4, h5, h6 { color: var(--accent); line-height: 1.25; margin: 1.5em 0 0.5em; }
h1 { font-size: 1.8rem; } h2 { font-size: 1.5rem; } h3 { font-size: 1.3rem; } h4 { font-size: 1.15rem; } h5, h6 { font-size: 1rem; }
p, li { margin: 0 0 0.85em; }
a { color: var(--link); }
img { max-width: 100%; height: auto; }
code { font-family: ui-monospace, Menlo, monospace; font-size: 0.92em; padding: 0.1em 0.3em; border-radius: 0.25em; background: var(--code); }
pre { padding: 0.9em 1em; border-radius: 0.6em; background: var(--code); overflow-x: auto; }
pre code { padding: 0; background: none; }
blockquote { margin: 0 0 1em; padding-left: 1em; border-left: 0.25em solid var(--border); color: var(--muted); }
hr { border: 0; border-top: 1px solid var(--border); margin: 1.5em 0; }
.table-scroll { max-width: 100%; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; margin: 1em 0; }
th, td { padding: 0.5em 0.7em; border: 1px solid var(--border); text-align: left; }
th { background: var(--soft); }
summary { cursor: pointer; color: var(--accent); }
:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
`;
  }

  function buildHtmlDocument(title, markdown, options) {
    const template = exportFragment(markdown);
    if (options.contents) {
      addHtmlContents(template);
    }
    if (options.styled) {
      template.content.querySelectorAll("table").forEach(function (table) {
        const wrapper = document.createElement("div");
        wrapper.className = "table-scroll";
        table.replaceWith(wrapper);
        wrapper.appendChild(table);
      });
    }
    return [
      "<!DOCTYPE html>",
      '<html lang="en">',
      "<head>",
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      "<title>" + escapeHtml(title) + "</title>",
      options.styled ? "<style>" + htmlExportStyles() + "</style>" : "",
      "</head>",
      "<body>",
      "<main>",
      template.innerHTML,
      "</main>",
      "</body>",
      "</html>"
    ].join("\n");
  }

  renderButton.addEventListener("click", function () {
    renderDraft(true);
    if (renderedOutputRegion) {
      renderedOutputRegion.focus();
    }
    try {
      playRenderSound();
    } catch (error) {
      console.warn("Render sound unavailable.", error);
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

  exampleButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      insertExample(button.dataset.example || "", button.dataset.announcement || "Example added.");
    });
  });

  downloadMarkdownButton.addEventListener("click", function () {
    saveFile("ghost-writer-note.md", writerInput.value, "text/markdown;charset=utf-8");
    setStatus("Downloaded markdown file.");
  });

  downloadTextButton.addEventListener("click", function () {
    saveFile("ghost-writer-note.txt", plainTextFromMarkdown(writerInput.value), "text/plain;charset=utf-8");
    setStatus("Downloaded text file.");
  });

  downloadHtmlButton.addEventListener("click", function () {
    const htmlDocument = buildHtmlDocument("Ghost Writer Export", writerInput.value, {
      styled: document.getElementById("styledHtml").checked,
      contents: document.getElementById("htmlContents").checked
    });
    saveFile("ghost-writer-note.html", htmlDocument, "text/html;charset=utf-8");
    setStatus("Downloaded HTML file.");
  });

  if (copyrightYear) {
    copyrightYear.textContent = String(new Date().getFullYear());
  }

  saveSelectionRange();
  renderDraft(false);
})();
