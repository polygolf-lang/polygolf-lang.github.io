let worker;
let languages;
let editor;

window.onload = () => {
  window.onkeydown = e => (e.ctrlKey || e.metaKey) && e.key == 'Enter'
    ? generate()
    : undefined;

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.size !== 0) {
    history.replaceState({}, null, window.location.origin + window.location.pathname);
  }

  function configureSource() {
    const parent = document.getElementById('sourceDiv');
    const value = urlParams.get("source") ?? localStorage.getItem('source') ?? getFibonacci();
    const onChange = (newText) => {
      localStorage.setItem('source', newText);
    };
    editor = CodeMirror.initEditor(parent, value, getTheme(), onChange);
  }

  function configureSelect(selectName) {
    const select = document.getElementById(selectName + 'Select');
    const value = urlParams.get(selectName) ?? localStorage.getItem(selectName);
    if (value !== null) {
      select.value = value;
    }
    select.onchange = () => {
      localStorage.setItem(selectName, select.value);
    };
  }

  function configureCheckBox(checkBoxName) {
    const checkBox = document.getElementById(checkBoxName + 'CheckBox');
    const value = urlParams.get(checkBoxName) ?? localStorage.getItem(checkBoxName);
    if (value !== null) {
      checkBox.checked = value === 'true';
    }
    checkBox.onchange = () => {
      localStorage.setItem(checkBoxName, checkBox.checked);
    };
  }

  function configureTextArea(textAreaName) {
    const textArea = document.getElementById(textAreaName);
    const height = localStorage.getItem(textAreaName + 'Height');
    if (height !== null) {
      textArea.style.height = height;
    }
    new ResizeObserver(entries => {
      for (let entry of entries) {
        localStorage.setItem(entry.target.id + 'Height', entry.target.offsetHeight + 'px');
      }
    }).observe(textArea);
  }

  function configureTheme() {
    const themeSelect = document.getElementById('themeSelect');
    themeSelect.value = getTheme();
    themeSelect.onchange = () => {
      const theme = themeSelect.value;
      localStorage.setItem('theme', theme);
      setTheme(theme);
      editor.setTheme(theme);
    };
  }

  configureSource();
  configureSelect('objective');
  configureCheckBox('getAllVariants');
  configureTextArea('result');
  configureTheme();

  worker = new Worker("worker.js");

  worker.onmessage = (e) => {
    languages = e.data.languages;

    const languageSelect = document.getElementById('languageSelect');
    for (const language of languages) {
      languageSelect.add(new Option(language));
    }

    configureSelect('language');

    if (urlParams.get('compile') === 'true') {
      generate();
    }

    worker.onmessage = (e) => {
      renderTabs(e.data);
    };
  }  
}

function getTheme() {
  return localStorage.getItem('theme') ??
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
}

setTheme(getTheme());


function getSource() {
  return editor.state.doc.toString();
}

function getObjective() {
  return document.getElementById('objectiveSelect').value;
}

function getIsAllVariants() {
  return document.getElementById('getAllVariantsCheckBox').checked;
}

function getLanguageName() {
  return document.getElementById('languageSelect').value;
}

function generate() {
  const generateButton = document.getElementById('generate');
  generateButton.disabled = true;
  generateButton.textContent = 'Generating...';

  const source = getSource();

  const options = {
    level: 'full',
    objective: getObjective(),
    getAllVariants: getIsAllVariants(),
    codepointRange: [1, Infinity],
    restrictFrontend: true,
    skipTypecheck: false,
    skipPlugins: []
  };

  const languageName = getLanguageName();
  const generatedLanguages = languageName === 'all' ? languages : [languageName];

  worker.postMessage({ source, options, generatedLanguages });
}

let lastCompilationResults;

let lastRenderedCompilationResult;

function renderTabs(results) {

  console.log(results);
  lastCompilationResults = results;

  const resultTabs = document.getElementById('resultTabs');
  resultTabs.innerHTML = '';

  const languagesResults = groupBy(results.results, x => x.language);

  languagesResults.forEach(languageResults => {
    languageResults.forEach((languageResult, index) => {
      languageResult.index = index;
      languageResult.hasVariants = languageResults.length > 1;
    });
  });

  const languageResults = languagesResults.get(lastRenderedCompilationResult?.language) ?? languagesResults.values().next().value;
  const renderedCompilationResult = languageResults[lastRenderedCompilationResult?.index] ?? languageResults[0];

  for (const compilationResult of results.results) {
    const shouldActivate = renderedCompilationResult === compilationResult;
    const li = document.createElement('li');
    li.className = 'nav-item';

    const button = document.createElement('button');
    button.className = 'nav-link';
    if (shouldActivate) {
      button.classList.add('active');
    }
    button.textContent = compilationResult.language;
    if (compilationResult.hasVariants) {
      button.innerHTML += `<sub>${compilationResult.index + 1}</sub>`;
    }
    if (compilationResult.length !== undefined) {
      button.innerHTML += ` <sup>${compilationResult.length}</sup>`;
    }
    button.type = 'button';
    button.setAttribute('data-bs-toggle', 'tab');

    button.addEventListener('shown.bs.tab', () => renderResult(compilationResult));
    if (shouldActivate) {
      renderResult(compilationResult);
    }

    li.appendChild(button);
    resultTabs.appendChild(li);
  }

  const generateButton = document.getElementById('generate');
  generateButton.disabled = false;
  generateButton.textContent = 'Generate';
}

function renderResult(compilationResult) {
  // TODO: show warnings and history in a dedicated control

  // const history = compilationResult.history; // [number, string][]

  let result = compilationResult.result;
  if (typeof result === 'string') {
    lastRenderedCompilationResult = compilationResult;
  } else {
    let output = result.toString();

    if (compilationResult.language === "Fatal error") { // Fatal error
      const stack = result.stack;
      if (stack != null) {
        output += '\n\n' + stack;
      }
    } else { // language error
      const location = compilationResult.location;
      if (location != null) {
        const startLine = location.line === 0 ? 0 : location.line - 2;
        output += '\n\n' +
          lastCompilationResults.source
            .split('\n')
            .slice(startLine, location.line)
            .map((x, i) => `${startLine + i + 1}`.padStart(3, ' ') + ' ' + x)
            .join('\n') +
          '\n' +
          ' '.repeat(location.column + 3) +
          '^';
      }
    }

    result = output;
  }

  const warnings = compilationResult.warnings; // Error[]
  if (warnings != null && warnings.length !== 0) {
    result += "\n\nWarnings:\n" + warnings.map((x) => x.message).join("\n")
  }

  document.getElementById('result').value = result;
}

function setSource(value) {
  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: value }
  });
}

function groupBy(sequence, keyFn) {
  const map = new Map();
  for (const item of sequence) {
    const key = keyFn(item);
    if (!map.has(key)) {
      map.set(key, [item]);
    } else {
      map.get(key).push(item);
    }
  }
  return map;
}

function copyLink() {
  navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?source=${encodeURIComponent(getSource())}&language=${getLanguageName()}&objective=${getObjective()}&getAllVariants=${getIsAllVariants()}&compile=true`);
}

function download() {
  if (!lastCompilationResults) {
    console.log('Nothing to download');
    return;
  }

  const compilationResults = lastCompilationResults.results
    .filter(compilationResult => typeof compilationResult.result === 'string');
  if (compilationResults.length === 0) {
    console.log('Nothing to download');
    return;
  }

  const zip = new JSZip();
  zip.file('!source.polygolf', lastCompilationResults.source);
  for (const compilationResult of compilationResults) {
    const name = `${compilationResult.language}${compilationResult.hasVariants ? ' #' + (compilationResult.index + 1) : ''}.${compilationResult.extension}`;
    zip.file(name, compilationResult.result);
  }

  zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
    .then(blob => saveAs(blob, 'PolyGolf.zip'));
}

function getFibonacci() {
  return `$a:0..832040 <- 0;
$b:0..1346269 <- 1;
for $i 31 {
  println $a;
  { % temp variable
    $t:0..1346269 <- ($a + $b):0..1346269;
    $a <- $b:0..832040;
    $b <- $t;
  / % arithmetic trick
    $b <- ($b + $a):0..1346269;
    $a <- ($b - $a):0..832040;
  }
};`;
}

function getChristmas() {
  return `$ordinals <- (list
  "First" "Second" "Third" "Fourth" "Fifth" "Sixth"
  "Seventh" "Eighth" "Ninth" "Tenth" "Eleventh" "Twelfth"
);
$days <- (list
  "Twelve Drummers Drumming," "Eleven Pipers Piping," "Ten Lords-a-Leaping,"
  "Nine Ladies Dancing," "Eight Maids-a-Milking," "Seven Swans-a-Swimming,"
  "Six Geese-a-Laying," "Five Gold Rings," "Four Calling Birds,"
  "Three French Hens," "Two Turtle Doves, and" "A Partridge in a Pear Tree.\\n"
);
for $i 12 {
  println (.. "On the " ($ordinals @ $i)
    " day of Christmas\\nMy true love sent to me");
  for $j (11 - $i) 12 {
    println ($days @ $j);
  };
};`;
}

function getCodeGolfTemplate() {
  return `% Printing
println "Hello, World!";

% Looping
for $i 10 {
  println $i;
};

% Accessing arguments
for_argv $arg 1000 {
  println $arg;
};`;
}
