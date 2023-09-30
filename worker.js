importScripts("polygolf.js");

// `postMessage` can't serialize `Language` object, so we only send names
postMessage({ languages: languages.map(language => language.name) });

function findLanguage(languageName) {
  return languages.find(language => language.name == languageName);
}

onmessage = (event) => {
  const data = event.data;

  let compilationResults;
  try {
    compilationResults = compile(data.source, data.options, ...data.generatedLanguages.map(findLanguage));
    const objectiveFunc = getObjectiveFunc(data.options);
    for (const compilationResult of compilationResults) {
      const result = compilationResult.result;
      if (typeof result === 'string') {
        compilationResult.length = objectiveFunc(result);
        compilationResult.extension = findLanguage(compilationResult.language).extension;
      } else {
        compilationResult.length = 'Error';
        // `postMessage` serializes `PolygolfError` as `Error`, so we store its `source` property in `compilationResult`
        compilationResult.location = result.source;
      }
    }
  } catch (e) {
    compilationResults = [{ result: e }];
  }

  data.results = compilationResults;

  postMessage(data);
};
