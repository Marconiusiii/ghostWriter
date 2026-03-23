(function () {
  const writerInput = document.getElementById("writerInput");
  const renderButton = document.getElementById("renderButton");
  const downloadMarkdownButton = document.getElementById("downloadMarkdown");
  const downloadTextButton = document.getElementById("downloadText");
  const renderedOutput = document.getElementById("renderedOutput");
  const statusMessage = document.getElementById("statusMessage");
  const helpButton = document.getElementById("helpButton");
  const markdownHelp = document.getElementById("markdownHelp");

  let ghostPasses = 0;
  let isRenderingFromBlur = false;
  let suppressBlurRender = false;

  function playRenderSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const now = audioContext.currentTime;
    const baseFrequency = 260 + Math.random() * 180;
    const wobbleOne = baseFrequency + 120 + Math.random() * 140;
    const wobbleTwo = baseFrequency - 80 + Math.random() * 60;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(baseFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(140, wobbleOne), now + 0.18);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(120, wobbleTwo), now + 0.42);
    oscillator.frequency.exponentialRampToValueAtTime(baseFrequency + 40, now + 0.7);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.04, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.02, now + 0.36);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.75);
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

  function parseInlineMarkdown(text) {
    const escaped = escapeHtml(text);

    return escaped
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
  }

  function convertParagraph(lines, startIndex) {
    const collected = [];
    let currentIndex = startIndex;

    while (currentIndex < lines.length) {
      const line = lines[currentIndex];

      if (
        !line.trim() ||
        /^#{1,6}\s/.test(line) ||
        /^[-*]\s+/.test(line) ||
        /^\d+\.\s+/.test(line)
      ) {
        break;
      }

      collected.push(parseInlineMarkdown(line.trim()));
      currentIndex += 1;
    }

    return {
      html: "<p>" + collected.join(" ") + "</p>",
      nextIndex: currentIndex
    };
  }

  function markdownToHtml(markdown) {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");
    const fragments = [];

    for (let index = 0; index < lines.length; ) {
      const line = lines[index];
      const trimmed = line.trim();

      if (!trimmed) {
        index += 1;
        continue;
      }

      const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        fragments.push(
          "<h" + level + ">" + parseInlineMarkdown(headingMatch[2]) + "</h" + level + ">"
        );
        index += 1;
        continue;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        const items = [];
        while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
          items.push("<li>" + parseInlineMarkdown(lines[index].trim().replace(/^[-*]\s+/, "")) + "</li>");
          index += 1;
        }
        fragments.push("<ul>" + items.join("") + "</ul>");
        continue;
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        const items = [];
        while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
          items.push("<li>" + parseInlineMarkdown(lines[index].trim().replace(/^\d+\.\s+/, "")) + "</li>");
          index += 1;
        }
        fragments.push("<ol>" + items.join("") + "</ol>");
        continue;
      }

      const paragraph = convertParagraph(lines, index);
      fragments.push(paragraph.html);
      index = paragraph.nextIndex;
    }

    if (!fragments.length) {
      return "<p>Your rendered output will appear here.</p>";
    }

    return fragments.join("");
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

    if (Math.random() < Math.min(0.2 + interactionLevel * 0.06, 0.75)) {
      hauntedWords = transposeWords(hauntedWords);
    }

    if (intensity > 1 && Math.random() < 0.35) {
      hauntedWords = duplicateWord(hauntedWords);
    }

    if (intensity > 2 && Math.random() < 0.22) {
      hauntedWords = addGhostWord(hauntedWords);
    }

    if (intensity > 3 && Math.random() < 0.28) {
      hauntedWords = transposeWords(hauntedWords);
    }

    return rebuildText(sourceText, hauntedWords);
  }

  function setStatus(message) {
    if (statusMessage) {
      statusMessage.textContent = "";
      window.setTimeout(function () {
        statusMessage.textContent = message;
      }, 25);
    }
  }

  function renderDraft(shouldHaunt) {
    const sourceText = writerInput.value;
    const nextText = shouldHaunt ? hauntText(sourceText) : sourceText;
    const previewChanged = nextText !== sourceText;

    renderedOutput.innerHTML = markdownToHtml(nextText);

    if (previewChanged) {
      writerInput.value = nextText;
      ghostPasses += 1;
      setStatus("Rendered output updated.");
    } else if (isRenderingFromBlur) {
      setStatus("Rendered output updated after leaving the editor.");
    } else {
      setStatus("Rendered output updated.");
    }
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

  renderButton.addEventListener("click", function () {
    isRenderingFromBlur = false;
    playRenderSound();
    renderDraft(true);
    renderedOutput.focus();
  });

  renderButton.addEventListener("mousedown", function () {
    suppressBlurRender = true;
  });

  writerInput.addEventListener("blur", function () {
    if (suppressBlurRender) {
      suppressBlurRender = false;
      return;
    }

    isRenderingFromBlur = true;
    window.setTimeout(function () {
      if (document.activeElement === renderButton) {
        isRenderingFromBlur = false;
        return;
      }

      if (document.activeElement !== writerInput) {
        renderDraft(true);
      }
      isRenderingFromBlur = false;
    }, 120);
  });

  downloadMarkdownButton.addEventListener("click", function () {
    saveFile("ghost-writer-note.md", writerInput.value, "text/markdown;charset=utf-8");
    setStatus("Downloaded markdown file.");
  });

  downloadTextButton.addEventListener("click", function () {
    saveFile("ghost-writer-note.txt", writerInput.value, "text/plain;charset=utf-8");
    setStatus("Downloaded text file.");
  });

  helpButton.addEventListener("click", function () {
    if (typeof markdownHelp.showModal === "function") {
      markdownHelp.showModal();
    }
  });

  markdownHelp.addEventListener("click", function (event) {
    const bounds = markdownHelp.getBoundingClientRect();
    const clickedOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickedOutside) {
      markdownHelp.close();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && markdownHelp.open) {
      markdownHelp.close();
      helpButton.focus();
    }
  });

  renderDraft(false);
})();
