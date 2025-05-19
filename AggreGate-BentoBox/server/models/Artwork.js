const { Schema } = require('mongoose');

const artworkSchema = new Schema({
  title: {
    type: [String],
    required: true,
  },
  artworkId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  image: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  completeness: {
    type: Number,
  },
  country: {
    type: [String],
  },
  dataProvider: {
    type: [String],
  },  dcCreator: {
    type: [String],
  },
  dcDescription: {
    type: [String],
  },
  dcDescriptionLangAware: {
    def: {
      type: [String],
    },
    en: {
      type: [String],
    },
  },
  dcLanguage: {
    type: [String],
  },
  dcLanguageLangAware: {
    def: {
      type: [String],
    },
  },
  dcTitleLangAware: {
    def: {
      type: [String],
    },
    en: {
      type: [String],
    },
  },
  edmConcept: {
    type: [String],
  },
  edmConceptLabel: {
    type: [
      {
        def: {
          type: String,
        },
      },
    ],
  },
  edmConceptPrefLabelLangAware: {
    de: {
      type: [String],
    },
    fi: {
      type: [String],
    },
    ru: {
      type: [String],
    },
    pt: {
      type: [String],
    },
    bg: {
      type: [String],
    },
    lt: {
      type: [String],
    },
    lv: {
      type: [String],
    },
    hr: {
      type: [String],
    },
    fr: {
      type: [String],
    },
    hu: {
      type: [String],
    },
    sk: {
      type: [String],
    },
    sl: {
      type: [String],
    },
    ga: {
      type: [String],
    },
    ca: {
      type: [String],
    },
    sv: {
      type: [String],
    },
    el: {
      type: [String],
    },
    en: {
      type: [String],
    },
    it: {
      type: [String],
    },
    es: {
      type: [String],
    },
    et: {
      type: [String],
    },
    cs: {
      type: [String],
    },
    pl: {
      type: [String],
    },
    ro: {
      type: [String],
    },
    da: {
      type: [String],
    },
    nl: {
      type: [String],
    },
  },
  edmDatasetName: {
    type: [String],
  },
  edmIsShownAt: {
    type: [String],
  },
  edmPreview: {
    type: [String],
  },
  europeanaCollectionName: {
    type: [String],
  },
  europeanaCompleteness: {
    type: Number,
  },
  guid: {
    type: String,
  },
  id: {
    type: String,
  },
  index: {
    type: Number,
  },
  language: {
    type: [String],
  },
  link: {
    type: String,
  },
  previewNoDistribute: {
    type: Boolean,
  },
  provider: {
    type: [String],
  },
  rights: {
    type: [String],
  },
  score: {
    type: Number,
  },
  timestamp: {
    type: Date,
  },
  timestamp_created: {
    type: String,
  },
  timestamp_created_epoch: {
    type: Number,
  },
  timestamp_update: {
    type: String,
  },
  timestamp_update_epoch: {
    type: Number,
  },
  ugc: {
    type: [Boolean],
  },
});

module.exports = artworkSchema;
