window.onload = () => {
  const languageSelect = document.getElementById('languageSelect')
  for (const language of languages) {
    languageSelect.add(new Option(language.name));
  }

  configureLocalStorage();
}

function getTheme() {
  return localStorage.getItem('theme') ??
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
}

setTheme(getTheme());

function configureLocalStorage() {
  {
    const source = document.getElementById('source');
    source.value = localStorage.getItem('source') ?? getFibonacci();
    source.oninput = () => {
      localStorage.setItem('source', source.value);
    };
  }

  for (const selectName of ['language', 'objective']) {
    const select = document.getElementById(selectName + 'Select');
    const value = localStorage.getItem(selectName);
    if (value !== null) {
      select.value = value;
    }
    select.onchange = () => {
      localStorage.setItem(selectName, select.value);
    };
  }

  {
    const checkBox = document.getElementById('getAllVariantsCheckBox');
    const value = localStorage.getItem('getAllVariants');
    if (value !== null) {
      checkBox.checked = value === 'true';
    }
    checkBox.onchange = () => {
      localStorage.setItem('getAllVariants', checkBox.checked);
    };
  }

  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      localStorage.setItem(entry.target.id + 'Height', entry.target.offsetHeight + 'px');
    }
  });
  for (const textareaName of ['source', 'result']) {
    const textArea = document.getElementById(textareaName);
    const height = localStorage.getItem(textareaName + 'Height');
    if (height !== null) {
      textArea.style.height = height;
    }
    resizeObserver.observe(textArea);
  }

  {
    const themeSelect = document.getElementById('themeSelect');
    themeSelect.value = getTheme();
    themeSelect.onchange = () => {
      const theme = themeSelect.value;
      localStorage.setItem('theme', theme);
      setTheme(theme);
    };
  }
}

var lastCompilation;

function generate() {
  const generateButton = document.getElementById('generate');
  generateButton.disabled = true;
  generateButton.textContent = 'Generating...';

  const source = document.getElementById('source').value;

  const options = {
    level: 'full',
    objective: document.getElementById('objectiveSelect').value,
    getAllVariants: document.getElementById('getAllVariantsCheckBox').checked
  };

  const languageName = document.getElementById('languageSelect').value;
  const generatedLanguages = languageName === 'all'
    ? languages
    : [languages.find(x => x.name == languageName)];

  // Forces browser to redraw generateButton
  // TODO: use Web Workers?
  setTimeout(() => {
    const results = compile(source, options, ...generatedLanguages);
    lastCompilation = { results, source };

    console.log(results);
    renderTabs();

    generateButton.disabled = false;
    generateButton.textContent = 'Generate';
  }, 1);
}

function renderTabs() {
  const resultTabs = document.getElementById('resultTabs');
  resultTabs.innerHTML = '';

  let first = true;

  for (const compilationResult of lastCompilation.results) {
    const language = compilationResult.language;
    const result = compilationResult.result;

    const li = document.createElement('li');
    li.className = 'nav-item';

    const button = document.createElement('button');
    button.className = 'nav-link';
    if (first)
      button.classList.add('active');
    button.textContent = language;
    button.innerHTML += ` <sup>${typeof result === 'string' ? result.length : 'Error'}</sup>`;
    button.type = 'button';
    button.setAttribute('data-bs-toggle', 'tab');

    button.addEventListener('shown.bs.tab', () => renderResult(compilationResult));
    if (first)
      renderResult(compilationResult);

    li.appendChild(button);
    resultTabs.appendChild(li);

    first = false;
  }
}

function renderResult(compilationResult) {
  let result = compilationResult.result;
  // TODO: show warnings and history
  // const warnings = compilationResult.warnings; // Error[]
  // const history = compilationResult.history; // [number, string][]

  if (compilationResult.warnings.length !== 0) {
    console.log(compilationResult.warnings);
  }

  if (typeof result !== 'string') { // PolygolfError
    let output = result.toString();
    const location = result.source;
    if (location !== null) {
      const startLine = location.line === 0 ? 0 : location.line - 2;
      output += "\n\n" +
        lastCompilation.source
          .split("\n")
          .slice(startLine, location.line)
          .map((x, i) => `${startLine + i + 1}`.padStart(3, " ") + " " + x)
          .join("\n") +
        "\n" +
        " ".repeat(location.column + 3) +
        "^";
    }
    result = output;
  }

  document.getElementById('result').value = result;
}

function setSource(value) {
  const source = document.getElementById('source');
  source.value = value;
  source.oninput();
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

function download() {
  if (!lastCompilation) {
    console.log('Nothing to download');
    return;
  }

  const compilationResults = lastCompilation.results
    .filter(compilationResult => typeof compilationResult.result === 'string');
  if (compilationResults.length === 0) {
    console.log('Nothing to download');
    return;
  }

  const zip = new JSZip();
  zip.file('!source.polygolf', lastCompilation.source);
  groupBy(compilationResults, x => x.language).forEach((results, languageName) => {
    const language = languages.find(x => x.name == languageName);
    results.forEach((compilationResult, idx) => {
      const name = `${languageName}${results.length === 1 ? '' : " #" + (idx + 1)}.${language.extension}`;
      zip.file(name, compilationResult.result);
    });
  });

  zip.generateAsync({ type: "blob", compression: "DEFLATE" })
    .then(blob => saveAs(blob, "PolyGolf.zip"));
}

function getFibonacci() {
  return `$a:0..832040 <- 0;
$b:0..1346269 <- 1;
for $i 0 31 {
  println_int $a;
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
for $i 0 12 {
  println (.. "On the " (list_get $ordinals $i)
    " day of Christmas\\nMy true love sent to me");
  for $j (11 - $i) 12 {
    println (list_get $days $j);
  };
};`;
}

function getCodeGolfTemplate() {
  return `% Printing
println "Hello, World!";

% Looping
for $i 0 10 {
  println_int $i;
};

% Accessing arguments
for_argv $arg 1000 {
  println $arg;
};`;
}
