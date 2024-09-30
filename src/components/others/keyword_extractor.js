const keywordExtractor = require("keyword-extractor");

const KeywordExtractor = (content) =>
    keywordExtractor
        .extract(content, {
            language: "english",
            remove_digits: true,
            return_changed_case: true,
            remove_duplicates: true,
        })
        .slice(0, 10);

module.exports = KeywordExtractor;
