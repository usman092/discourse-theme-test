const overrideText = () => {
  I18n.translations.en.js.topic.create_long = "Ask a new Question";
  I18n.translations.en.js.topic.create = "New Question";
  I18n.translations.en.js.composer.create_topic = "Submit Question";
};

export default {
  name: "text-initializer",
  initialize() {
    overrideText();
  },
};
