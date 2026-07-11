(function () {
  const BUTTON_ID = "heyzine-pdf-downloader-button";
  const PDF_URL_PATTERNS = [
    /heyzine\.load\s*\(\s*['"`]((?:https?:)?\\?\/\\?\/[^'"`]+?\.pdf(?:\?[^'"`]*)?)['"`]/i,
    /(?:https?:)?\\?\/\\?\/[^'"`<>\s]+?heyzine[^'"`<>\s]+?\.pdf(?:\?[^'"`<>\s]*)?/i,
    /(?:https?:)?\\?\/\\?\/[^'"`<>\s]+?\/files\/uploaded\/[^'"`<>\s]+?\.pdf(?:\?[^'"`<>\s]*)?/i
  ];
  const SCAN_INTERVAL_MS = 1000;
  const SCAN_TIMEOUT_MS = 60000;

  let currentPdfUrl = null;
  let observer = null;
  let scanTimer = null;

  function getMessage(key, fallback) {
    if (typeof chrome === "undefined" || !chrome.i18n || typeof chrome.i18n.getMessage !== "function") {
      return fallback;
    }

    return chrome.i18n.getMessage(key) || fallback;
  }

  function normalizeUrl(url) {
    if (!url) {
      return null;
    }

    const textarea = document.createElement("textarea");
    textarea.innerHTML = url;

    let normalized = textarea.value
      .replace(/\\\//g, "/")
      .replace(/\\u002f/gi, "/")
      .replace(/&amp;/g, "&")
      .trim();

    if (normalized.startsWith("//")) {
      normalized = `${window.location.protocol}${normalized}`;
    }

    try {
      const parsed = new URL(normalized, window.location.href);
      return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : null;
    } catch (_error) {
      return null;
    }
  }

  function findPdfInText(text) {
    if (!text) {
      return null;
    }

    for (const pattern of PDF_URL_PATTERNS) {
      const match = text.match(pattern);
      const url = normalizeUrl(match && (match[1] || match[0]));
      if (url) {
        return url;
      }
    }

    return null;
  }

  function getAttributeTexts() {
    const selector = [
      "a[href]",
      "iframe[src]",
      "embed[src]",
      "object[data]",
      "source[src]",
      "[data-pdf]",
      "[data-url]",
      "[data-src]",
      "[data-file]"
    ].join(",");

    return Array.from(document.querySelectorAll(selector), (element) => {
      return [
        element.getAttribute("href"),
        element.getAttribute("src"),
        element.getAttribute("data"),
        element.getAttribute("data-pdf"),
        element.getAttribute("data-url"),
        element.getAttribute("data-src"),
        element.getAttribute("data-file")
      ].filter(Boolean).join(" ");
    });
  }

  function getPerformanceUrls() {
    if (typeof performance === "undefined" || typeof performance.getEntriesByType !== "function") {
      return [];
    }

    return performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter(Boolean);
  }

  function findPdfUrl() {
    const texts = [
      ...Array.from(document.scripts, (script) => `${script.src || ""} ${script.textContent || ""}`),
      ...getAttributeTexts(),
      ...getPerformanceUrls(),
      document.documentElement.innerHTML
    ];

    for (const text of texts) {
      const url = findPdfInText(text);
      if (url) {
        return url;
      }
    }

    return null;
  }

  function filenameFromUrl(url) {
    try {
      const parsed = new URL(url);
      const name = parsed.pathname.split("/").filter(Boolean).pop();
      return name && name.toLowerCase().endsWith(".pdf") ? name : "catalogo-heyzine.pdf";
    } catch (_error) {
      return "catalogo-heyzine.pdf";
    }
  }

  function setButtonState(button, state) {
    if (state === "loading") {
      button.textContent = getMessage("buttonLoading", "Downloading...");
      button.disabled = true;
      return;
    }

    if (state === "error") {
      button.textContent = getMessage("buttonError", "Download failed");
      button.disabled = false;
      window.setTimeout(() => {
        button.textContent = getMessage("buttonReady", "Download PDF");
      }, 1800);
      return;
    }

    button.textContent = getMessage("buttonReady", "Download PDF");
    button.disabled = false;
  }

  function ensureButton() {
    if (!currentPdfUrl || document.getElementById(BUTTON_ID)) {
      return;
    }

    const button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    button.textContent = getMessage("buttonReady", "Download PDF");
    button.title = getMessage("buttonTitle", "Download the original catalog PDF");

    Object.assign(button.style, {
      position: "fixed",
      right: "18px",
      bottom: "18px",
      zIndex: "2147483647",
      padding: "11px 15px",
      border: "0",
      borderRadius: "8px",
      background: "#0f172a",
      color: "#ffffff",
      font: "600 14px/1.2 Arial, sans-serif",
      boxShadow: "0 8px 22px rgba(15, 23, 42, 0.28)",
      cursor: "pointer"
    });

    button.addEventListener("mouseenter", () => {
      if (!button.disabled) {
        button.style.background = "#1f2937";
      }
    });

    button.addEventListener("mouseleave", () => {
      button.style.background = "#0f172a";
    });

    button.addEventListener("click", () => {
      setButtonState(button, "loading");

      chrome.runtime.sendMessage(
        {
          type: "download-pdf",
          url: currentPdfUrl,
          filename: filenameFromUrl(currentPdfUrl)
        },
        (response) => {
          if (chrome.runtime.lastError || !response || !response.ok) {
            console.error("Heyzine PDF Downloader:", chrome.runtime.lastError || response);
            setButtonState(button, "error");
            return;
          }

          setButtonState(button, "ready");
        }
      );
    });

    document.documentElement.appendChild(button);
  }

  function refresh() {
    const foundUrl = findPdfUrl();
    if (foundUrl) {
      currentPdfUrl = foundUrl;
      ensureButton();
    }
  }

  function startObserver() {
    observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true
    });

    scanTimer = window.setInterval(refresh, SCAN_INTERVAL_MS);

    window.setTimeout(() => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      if (scanTimer) {
        window.clearInterval(scanTimer);
        scanTimer = null;
      }
    }, SCAN_TIMEOUT_MS);
  }

  refresh();
  startObserver();
})();
