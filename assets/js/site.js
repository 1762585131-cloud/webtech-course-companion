/* ==========================================================================
   Webtech course companion
   Small, dependency-free enhancements. Everything essential is in the HTML.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------------ */
  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.getElementById("site-nav");

    if (!toggle || !nav) {
      return;
    }

    var toggleText = toggle.querySelector("[data-nav-text]");
    var main = document.getElementById("main");
    var footer = document.querySelector(".site-footer");
    var mobileQuery = window.matchMedia("(max-width: 900px)");
    var lastFocused = null;

    function focusableHeaderItems() {
      return Array.prototype.slice
        .call(document.querySelectorAll(".site-header a[href], .site-header button:not([disabled])"))
        .filter(function (element) {
          return element.getClientRects().length > 0;
        });
    }

    function closeNavigation(returnFocus) {
      if (!document.body.classList.contains("nav-open")) {
        return;
      }

      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      if (toggleText) {
        toggleText.textContent = "Menu";
      }
      if (main) {
        main.inert = false;
      }
      if (footer) {
        footer.inert = false;
      }

      if (returnFocus && lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    function openNavigation() {
      lastFocused = document.activeElement;
      document.body.classList.add("nav-open");
      toggle.setAttribute("aria-expanded", "true");
      if (toggleText) {
        toggleText.textContent = "Close";
      }
      if (main) {
        main.inert = true;
      }
      if (footer) {
        footer.inert = true;
      }

      window.setTimeout(function () {
        var firstLink = nav.querySelector(".site-nav-list a");
        if (firstLink && document.body.classList.contains("nav-open")) {
          firstLink.focus();
        }
      }, 60);
    }

    toggle.addEventListener("click", function () {
      if (document.body.classList.contains("nav-open")) {
        closeNavigation(true);
      } else {
        openNavigation();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (!document.body.classList.contains("nav-open")) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeNavigation(true);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      var items = focusableHeaderItems();
      if (!items.length) {
        return;
      }

      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    nav.addEventListener("click", function (event) {
      var link = event.target.closest("a");
      if (!link || !mobileQuery.matches || !document.body.classList.contains("nav-open")) {
        return;
      }

      closeNavigation(false);

      var href = link.getAttribute("href") || "";
      if (href.charAt(0) === "#" && href.length > 1) {
        var target = document.getElementById(href.slice(1));
        if (target) {
          window.requestAnimationFrame(function () {
            var hadTabIndex = target.hasAttribute("tabindex");
            if (!hadTabIndex) {
              target.setAttribute("tabindex", "-1");
            }
            target.focus({ preventScroll: false });
            if (!hadTabIndex) {
              target.addEventListener(
                "blur",
                function () {
                  target.removeAttribute("tabindex");
                },
                { once: true }
              );
            }
          });
        }
      }
    });

    mobileQuery.addEventListener("change", function (event) {
      if (!event.matches) {
        closeNavigation(false);
      }
    });
  }

  /* ------------------------------------------------------------------------
     Homepage: request lifecycle tabs
     ------------------------------------------------------------------------ */
  function initLifecycle() {
    var lifecycle = document.querySelector("[data-lifecycle]");
    if (!lifecycle) {
      return;
    }

    var stages = {
      address: {
        kicker: "Layer 01 / The ask",
        title: "Every page starts as an address.",
        copy: "The browser parses the protocol, host, path, and query. That tells it what to ask for, from whom, and over which scheme.",
        code: "https://yourname.site/work?ref=course"
      },
      dns: {
        kicker: "Layer 02 / The lookup",
        title: "A name becomes a location.",
        copy: "DNS resolvers translate the domain into an IP address. A stale record or a typo here sends every later layer to the wrong place.",
        code: "yourname.site \u2192 203.0.113.42"
      },
      server: {
        kicker: "Layer 03 / The answer",
        title: "The server responds in status codes.",
        copy: "The request reaches the host; the response carries a status, headers, and files. A 404, a 301, and a 500 are three different stories.",
        code: "200 OK \u00b7 content-type: text/html"
      },
      pixels: {
        kicker: "Layer 04 / The render",
        title: "The browser builds the page.",
        copy: "It parses HTML into the DOM, applies CSS, runs JavaScript, then lays out and paints. A rendering bug is not a server bug.",
        code: "DOM \u2192 CSSOM \u2192 layout \u2192 paint"
      }
    };

    var tabs = Array.prototype.slice.call(lifecycle.querySelectorAll('[role="tab"]'));
    var panel = lifecycle.querySelector('[role="tabpanel"]');
    var kicker = lifecycle.querySelector("[data-stage-kicker]");
    var title = lifecycle.querySelector("[data-stage-title]");
    var copy = lifecycle.querySelector("[data-stage-copy]");
    var code = lifecycle.querySelector("[data-stage-code]");

    if (!tabs.length || !panel || !kicker || !title || !copy || !code) {
      return;
    }

    function activateTab(tab, focusTab) {
      var stage = stages[tab.getAttribute("data-stage")];
      if (!stage) {
        return;
      }

      tabs.forEach(function (item) {
        var selected = item === tab;
        item.setAttribute("aria-selected", selected ? "true" : "false");
        item.tabIndex = selected ? 0 : -1;
      });

      panel.setAttribute("aria-labelledby", tab.id);
      kicker.textContent = stage.kicker;
      title.textContent = stage.title;
      copy.textContent = stage.copy;
      code.textContent = stage.code;

      if (!reduceMotion.matches) {
        panel.classList.remove("is-changing");
        void panel.offsetWidth;
        panel.classList.add("is-changing");
      }

      if (focusTab) {
        tab.focus();
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activateTab(tab, false);
      });

      tab.addEventListener("keydown", function (event) {
        var index = tabs.indexOf(tab);
        var nextIndex = null;

        if (event.key === "ArrowDown" || event.key === "ArrowRight") {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = tabs.length - 1;
        }

        if (nextIndex !== null) {
          event.preventDefault();
          activateTab(tabs[nextIndex], true);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     Curriculum: filter modules
     ------------------------------------------------------------------------ */
  function initModuleFilter() {
    var filterBar = document.querySelector("[data-module-filter]");
    if (!filterBar) {
      return;
    }

    var buttons = Array.prototype.slice.call(filterBar.querySelectorAll("[data-filter]"));
    var modules = Array.prototype.slice.call(document.querySelectorAll("[data-module-list] > .module"));
    var count = document.querySelector("[data-filter-count]");

    if (!buttons.length || !modules.length) {
      return;
    }

    function applyFilter(track) {
      var visible = 0;

      buttons.forEach(function (button) {
        button.setAttribute("aria-pressed", button.getAttribute("data-filter") === track ? "true" : "false");
      });

      modules.forEach(function (module) {
        var matches = track === "all" || module.getAttribute("data-track") === track;
        module.hidden = !matches;
        if (matches) {
          visible += 1;
        }
      });

      if (count) {
        if (track === "all") {
          count.textContent = "Showing all " + visible + " modules";
        } else {
          count.textContent = "Showing " + visible + (visible === 1 ? " module" : " modules");
        }
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        applyFilter(button.getAttribute("data-filter"));
      });
    });
  }

  /* ------------------------------------------------------------------------
     Project page: saved build tracker
     ------------------------------------------------------------------------ */
  function initTracker() {
    var tracker = document.querySelector("[data-project-tracker]");
    if (!tracker) {
      return;
    }

    var key = "webtech-project-tracker-v1";
    var boxes = Array.prototype.slice.call(tracker.querySelectorAll("[data-tracker-item]"));
    var count = tracker.querySelector("[data-tracker-count]");
    var bar = tracker.querySelector("[data-tracker-bar]");
    var progress = tracker.querySelector("[data-tracker-progress]");
    var reset = tracker.querySelector("[data-tracker-reset]");

    if (!boxes.length) {
      return;
    }

    function readSaved() {
      try {
        var saved = JSON.parse(window.localStorage.getItem(key) || "[]");
        return Array.isArray(saved) ? saved : [];
      } catch (error) {
        return [];
      }
    }

    function save() {
      var checked = boxes
        .filter(function (box) {
          return box.checked;
        })
        .map(function (box) {
          return box.value;
        });

      try {
        window.localStorage.setItem(key, JSON.stringify(checked));
      } catch (error) {
        /* Storage may be disabled; the checklist still works for this visit. */
      }

      updateProgress();
    }

    function updateProgress() {
      var done = boxes.filter(function (box) {
        return box.checked;
      }).length;
      var total = boxes.length;
      var percentage = Math.round((done / total) * 100);

      if (count) {
        count.textContent = String(done);
      }
      if (bar) {
        bar.style.width = percentage + "%";
      }
      if (progress) {
        progress.setAttribute("aria-valuenow", String(done));
        progress.setAttribute("aria-valuetext", done + " of " + total + " requirements complete");
      }
    }

    var saved = readSaved();
    boxes.forEach(function (box) {
      box.checked = saved.indexOf(box.value) !== -1;
      box.addEventListener("change", save);
    });

    if (reset) {
      reset.addEventListener("click", function () {
        boxes.forEach(function (box) {
          box.checked = false;
        });
        save();
      });
    }

    updateProgress();
  }

  /* ------------------------------------------------------------------------
     Code review page: interactive review lab
     ------------------------------------------------------------------------ */
  function initReviewLab() {
    var lab = document.querySelector("[data-lab]");
    if (!lab) {
      return;
    }

    var cases = [
      {
        id: "nav",
        file: "nav.html",
        title: "The clickable nav",
        prompt: "Give me a simple, compact navigation bar for a three-page portfolio.",
        code: [
          '<div class="nav">',
          '  <div class="logo" onclick="location.href=\'/\'">',
          "    Northstar",
          "  </div>",
          '  <div class="nav-links">',
          '    <div onclick="location.href=\'/work\'">Work</div>',
          '    <div onclick="location.href=\'/about\'">About</div>',
          '    <div onclick="location.href=\'/contact\'">Contact</div>',
          "  </div>",
          "</div>"
        ],
        options: [
          {
            text: "These navigation items should be links inside a <nav>, not divs with onclick.",
            correct: true,
            explanation:
              "Anchors and nav carry navigation meaning, keyboard access, focus behaviour, context menus, and assistive-technology support for free."
          },
          {
            text: "A div with an onclick handler cannot be reached or activated with a keyboard by default.",
            correct: true,
            explanation:
              "Without tabindex and key handling it is invisible to keyboard users. Native links avoid the problem entirely."
          },
          {
            text: "The class names 'nav' and 'logo' are invalid because those words are reserved by HTML.",
            correct: false,
            explanation:
              "Class names are yours to choose. There is no reserved 'nav' or 'logo' class."
          },
          {
            text: "Screen-reader users would benefit from a nav landmark and a current-page state.",
            correct: true,
            explanation:
              "A <nav> landmark exposes the navigation region; aria-current=\"page\" identifies the active link in the set."
          }
        ],
        takeaway:
          "If it navigates, make it a link. Native elements come with keyboard support, focus, context menus, and assistive-technology semantics for free."
      },
      {
        id: "greeting",
        file: "greet.js",
        title: "The friendly greeting",
        prompt: "Read a display name from the URL and greet the visitor.",
        code: [
          'const name = new URLSearchParams(location.search).get("name");',
          'const greeting = document.querySelector("#greeting");',
          "",
          'greeting.innerHTML = "Hello, " + name;'
        ],
        options: [
          {
            text: "A query-string value is user-controlled; passing it to innerHTML can inject markup or script.",
            correct: true,
            explanation:
              "The name may contain HTML. Putting it into innerHTML makes the browser parse and execute it as part of the page."
          },
          {
            text: "Using textContent would insert the name as text and remove this HTML injection path.",
            correct: true,
            explanation:
              "textContent treats the value as characters, not markup. That is the safer sink when the intended output is plain text."
          },
          {
            text: "URLSearchParams is asynchronous, so this code needs an await before reading the name.",
            correct: false,
            explanation:
              "URLSearchParams is synchronous. The getter returns the value immediately; no await belongs here."
          },
          {
            text: "This code is vulnerable to SQL injection.",
            correct: false,
            explanation:
              "There is no database or SQL in this snippet. The relevant flaw is client-side script injection, not SQL injection."
          }
        ],
        takeaway:
          "Treat every value you did not create as hostile. Use textContent when you mean text, and avoid constructing HTML from raw input."
      },
      {
        id: "cards",
        file: "cards.css",
        title: "The fixed-width cards",
        prompt: "Make a three-card services layout that also works on mobile.",
        code: [
          ".cards {",
          "  width: 1100px;",
          "  display: flex;",
          "  gap: 24px;",
          "}",
          "",
          ".card {",
          "  width: 33.33%;",
          "  padding: 24px;",
          "}"
        ],
        options: [
          {
            text: "A fixed 1100px width causes horizontal overflow on narrow screens.",
            correct: true,
            explanation:
              "At 360px the container is still 1100px wide. Fluid sizing or a max-width is needed before any breakpoint."
          },
          {
            text: "The row cannot wrap because flex-wrap is not set.",
            correct: true,
            explanation:
              "Flex items stay on one line by default. Without wrapping, the cards cannot stack or reflow on a smaller screen."
          },
          {
            text: "Three 33.33% cards plus gaps exceed 100%, causing overflow even on wide screens.",
            correct: true,
            explanation:
              "Percentages calculate from the container, then the gaps are added on top. Use flex: 1, grid tracks, or a width calculation."
          },
          {
            text: "The code needs JavaScript before it can respond to the screen width.",
            correct: false,
            explanation:
              "Responsive layout is a CSS concern. JavaScript is not required to make a layout adapt to the viewport."
          }
        ],
        takeaway:
          "Responsive layout is not a media query added at the end. Start fluid: max-width, flexible tracks, wrapping, and room for content to breathe."
      }
    ];

    var form = lab.querySelector("[data-review-form]");
    var fieldset = form ? form.querySelector("fieldset") : null;
    var optionsContainer = lab.querySelector("[data-review-options]");
    var submitButton = lab.querySelector("[data-review-submit]");
    var nextButton = lab.querySelector("[data-review-next]");
    var feedback = lab.querySelector("[data-review-feedback]");
    var score = lab.querySelector("[data-lab-score]");
    var counter = lab.querySelector("[data-lab-counter]");
    var caseTitle = lab.querySelector("[data-lab-title]");
    var caseFile = lab.querySelector("[data-lab-file]");
    var casePrompt = lab.querySelector("[data-lab-prompt]");
    var codeBlock = lab.querySelector("[data-lab-code]");
    var codePre = codeBlock ? codeBlock.closest("pre") : null;

    if (
      !form ||
      !fieldset ||
      !optionsContainer ||
      !submitButton ||
      !nextButton ||
      !feedback ||
      !score ||
      !counter ||
      !caseTitle ||
      !caseFile ||
      !casePrompt ||
      !codeBlock
    ) {
      return;
    }

    var currentCase = 0;
    var results = new Map();
    var totalIssues = cases.reduce(function (total, item) {
      return (
        total +
        item.options.filter(function (option) {
          return option.correct;
        }).length
      );
    }, 0);

    caseTitle.tabIndex = -1;

    function pad(number) {
      return String(number).padStart(2, "0");
    }

    function updateScore() {
      var found = 0;
      results.forEach(function (result) {
        found += result.caught;
      });
      score.textContent = found + " of " + totalIssues + " issues found";
    }

    function renderCode(item) {
      codeBlock.replaceChildren();

      item.code.forEach(function (line, index) {
        var row = document.createElement("span");
        row.className = "code-line";

        var lineNumber = document.createElement("span");
        lineNumber.className = "line-number";
        lineNumber.setAttribute("aria-hidden", "true");
        lineNumber.textContent = pad(index + 1);

        var lineCode = document.createElement("span");
        lineCode.className = "line-code";
        lineCode.textContent = line.length ? line : " ";

        row.append(lineNumber, lineCode);
        codeBlock.append(row);
      });

      if (codePre) {
        codePre.setAttribute("aria-label", "AI-generated code from " + item.file + ", ready for review");
      }
    }

    function renderOptions(item) {
      optionsContainer.replaceChildren();

      item.options.forEach(function (option, index) {
        var label = document.createElement("label");
        label.className = "review-option";

        var input = document.createElement("input");
        input.type = "checkbox";
        input.name = "review-comment";
        input.value = String(index);

        var box = document.createElement("span");
        box.className = "review-option-box";
        box.setAttribute("aria-hidden", "true");

        var text = document.createElement("span");
        text.className = "review-option-text";
        text.textContent = option.text;

        label.append(input, box, text);
        optionsContainer.append(label);
      });
    }

    function renderCase(index) {
      var item = cases[index];

      currentCase = index;
      counter.textContent = pad(index + 1);
      caseTitle.textContent = "Case " + pad(index + 1) + " \u2014 " + item.title;
      caseFile.textContent = "AI-generated / " + item.file;
      casePrompt.textContent = item.prompt;

      renderCode(item);
      renderOptions(item);
      form.reset();
      fieldset.disabled = false;
      submitButton.hidden = false;
      submitButton.disabled = true;
      nextButton.hidden = true;
      feedback.hidden = true;
      feedback.replaceChildren();
      updateScore();
    }

    function feedbackItem(kind, option) {
      var item = document.createElement("li");
      item.className = "feedback-item";

      var mark = document.createElement("span");
      mark.className = "feedback-mark";
      mark.setAttribute("aria-hidden", "true");

      var copy = document.createElement("span");
      var status = document.createElement("strong");
      var why = document.createElement("span");
      why.className = "feedback-why";

      if (kind === "caught") {
        mark.textContent = "\u2713";
        status.textContent = "Caught. ";
      } else if (kind === "missed") {
        mark.textContent = "!";
        mark.classList.add("feedback-mark--miss");
        status.textContent = "Missed. ";
      } else {
        mark.textContent = "\u00d7";
        mark.classList.add("feedback-mark--false");
        status.textContent = "False alarm. ";
      }

      copy.append(status, document.createTextNode(option.text));
      why.textContent = option.explanation;
      copy.append(why);
      item.append(mark, copy);

      return item;
    }

    function gradeCurrentCase() {
      var item = cases[currentCase];
      if (results.has(item.id)) {
        return;
      }

      var selected = new Set(
        Array.prototype.slice
          .call(optionsContainer.querySelectorAll("input:checked"))
          .map(function (input) {
            return Number(input.value);
          })
      );

      var correctIndexes = [];
      var falseAlarms = [];

      item.options.forEach(function (option, index) {
        if (option.correct) {
          correctIndexes.push(index);
        } else if (selected.has(index)) {
          falseAlarms.push(index);
        }
      });

      var caught = correctIndexes.filter(function (index) {
        return selected.has(index);
      });
      var missed = correctIndexes.filter(function (index) {
        return !selected.has(index);
      });

      results.set(item.id, {
        caught: caught.length,
        missed: missed.length,
        falseAlarms: falseAlarms.length
      });

      var labels = Array.prototype.slice.call(optionsContainer.querySelectorAll(".review-option"));
      labels.forEach(function (label, index) {
        var option = item.options[index];
        if (option.correct && selected.has(index)) {
          label.classList.add("is-correct");
        } else if (option.correct) {
          label.classList.add("is-missed");
        } else if (selected.has(index)) {
          label.classList.add("is-wrong");
        }
      });

      fieldset.disabled = true;
      submitButton.hidden = true;

      var title = document.createElement("h3");
      title.className = "feedback-title";
      title.tabIndex = -1;

      var falseAlarmText =
        falseAlarms.length > 0 ? ", " + falseAlarms.length + " false alarm" + (falseAlarms.length === 1 ? "" : "s") : "";

      if (caught.length === correctIndexes.length && falseAlarms.length === 0) {
        title.textContent = "Clean review \u2014 all " + correctIndexes.length + " issues found.";
      } else {
        title.textContent =
          caught.length +
          " of " +
          correctIndexes.length +
          " issues found" +
          (missed.length ? ", " + missed.length + " missed" : "") +
          falseAlarmText +
          ".";
      }

      feedback.replaceChildren();
      feedback.append(title);

      var list = document.createElement("ul");
      list.className = "feedback-list";

      correctIndexes.forEach(function (index) {
        var option = item.options[index];
        list.append(feedbackItem(selected.has(index) ? "caught" : "missed", option));
      });

      falseAlarms.forEach(function (index) {
        list.append(feedbackItem("false", item.options[index]));
      });

      feedback.append(list);

      var takeaway = document.createElement("p");
      takeaway.className = "feedback-takeaway";
      takeaway.textContent = item.takeaway;
      feedback.append(takeaway);

      var isLast = currentCase === cases.length - 1;

      if (isLast) {
        var finalFound = 0;
        results.forEach(function (result) {
          finalFound += result.caught;
        });
        var summary = document.createElement("p");
        summary.className = "feedback-takeaway";
        summary.textContent =
          "Lab complete \u2014 " +
          finalFound +
          " of " +
          totalIssues +
          " valid issues found across three cases. The score is not the point; the questions are.";
        feedback.append(summary);
        nextButton.textContent = "Restart lab \u2192";
      } else {
        nextButton.textContent = "Next case \u2192";
      }

      updateScore();
      feedback.hidden = false;
      nextButton.hidden = false;
      title.focus({ preventScroll: false });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (submitButton.disabled) {
        return;
      }
      gradeCurrentCase();
    });

    optionsContainer.addEventListener("change", function () {
      submitButton.disabled = optionsContainer.querySelectorAll("input:checked").length === 0;
    });

    nextButton.addEventListener("click", function () {
      if (currentCase === cases.length - 1) {
        results.clear();
        renderCase(0);
        caseTitle.focus({ preventScroll: false });
        return;
      }

      renderCase(currentCase + 1);
      caseTitle.focus({ preventScroll: false });
    });

    renderCase(0);
  }

  /* ------------------------------------------------------------------------
     Field guide: glossary search
     ------------------------------------------------------------------------ */
  function initGlossarySearch() {
    var glossary = document.querySelector("[data-glossary]");
    var search = document.querySelector("[data-glossary-search]");
    if (!glossary || !search) {
      return;
    }

    var terms = Array.prototype.slice.call(glossary.querySelectorAll(".term"));
    var status = document.querySelector("[data-glossary-status]");
    var clear = document.querySelector("[data-glossary-clear]");
    var empty = document.querySelector("[data-glossary-empty]");
    var emptyQuery = document.querySelector("[data-glossary-query]");
    var total = terms.length;

    function applySearch() {
      var query = search.value.trim();
      var needle = query.toLowerCase();
      var visible = 0;

      terms.forEach(function (term) {
        var matches = needle === "" || term.textContent.toLowerCase().indexOf(needle) !== -1;
        term.hidden = !matches;
        if (matches) {
          visible += 1;
        }
      });

      if (status) {
        if (query) {
          status.textContent =
            "Showing " + visible + " of " + total + " terms for \u201c" + query + "\u201d.";
        } else {
          status.textContent = "Showing all " + total + " terms.";
        }
      }

      if (clear) {
        clear.hidden = query === "";
      }

      if (empty) {
        empty.hidden = visible !== 0;
      }

      if (emptyQuery) {
        emptyQuery.textContent = query;
      }
    }

    search.addEventListener("input", applySearch);

    search.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && search.value !== "") {
        search.value = "";
        applySearch();
      }
    });

    if (clear) {
      clear.addEventListener("click", function () {
        search.value = "";
        applySearch();
        search.focus();
      });
    }

    applySearch();
  }

  initNavigation();
  initLifecycle();
  initModuleFilter();
  initTracker();
  initReviewLab();
  initGlossarySearch();
})();
