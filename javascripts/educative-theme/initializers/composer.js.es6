import { withPluginApi } from "discourse/lib/plugin-api";

const getComposerContent = (urlQueryParams) => {
  const educativeUrl = 'https://educative.io/collection/';
  const authorId = urlQueryParams.get('authorId');
  const collectionId = urlQueryParams.get('collectionId');
  const pageId = urlQueryParams.get('pageId');
  let content = '';

  if (authorId && collectionId) {
    content = `\n\n\n\n[CourseLink](${educativeUrl}/collection/${authorId}/${collectionId})\n`;
    if (pageId) {
      content = `${content}[LessonLink](${educativeUrl}/collection/page/${authorId}/${collectionId}/${pageId})\n`;
    }
  }
  return content;
}

const getQueryParamsForComposer = (url) => {
  const retVal = { openEditor: false };
  if (!url) {
    return retVal;
  }
  const splitUrl = url.split("?");
  if (splitUrl.length > 1) {
    const urlQueryParams = new URLSearchParams(splitUrl[splitUrl.length - 1]);
    if (urlQueryParams.get("openEditor")?.toLowerCase() === "true") {
      retVal.openEditor = true;
      const courseTag = urlQueryParams.get("courseTag");
      if (courseTag) {
        retVal.courseTag = courseTag;
      }
      const urlParts = splitUrl[0].split("/");
      if (urlParts && urlParts.length > 0) {
        retVal.lessonTag = urlParts[urlParts.length - 1];
      }
      console.log("getting composer content");
      retVal.content = getComposerContent(urlQueryParams);
      console.log("content is ", retVal.content);
    }
  }

  retVal.openEditor = retVal.openEditor && retVal.courseTag && retVal.lessonTag;

  return retVal;
}

const initializeCreateTopic = (api) => {
  const uri = document?.documentURI ?? window?.location?.href;
  const { openEditor, courseTag, lessonTag, content } = getQueryParamsForComposer(uri);
  if (openEditor && lessonTag && courseTag) {
    api.modifyClass("model:composer", {
      open(opts) {
        if (!opts) opts = {};
        let categoryObj = this.site.categories.findBy("name", "Courses");
        if (!categoryObj) {
          // This is to fill category when testing on staging.
          categoryObj = this.site.categories.findBy("name", "COURSES");
        }
        const id = categoryObj ? categoryObj.id : 0;
        if (!opts.categoryId) {
          opts.categoryId = id;
        }
        return this._super(...arguments);
      },
    });
    const container = Discourse.__container__;
    const Composer = require("discourse/models/composer").default;
    if (container) {
      const composerController = container.lookup("controller:composer");
      if (composerController) {
        composerController.open({
          action: Composer.CREATE_TOPIC,
          draftKey: Composer.DRAFT,
          topicTags: [lessonTag, courseTag],
          topicBody: content,
        });
      }
    }
  }
}

export default {
  name: "composer-initializer",
  initialize() {
    withPluginApi("0.8.7", (api) => {
      initializeCreateTopic(api);
    });
  },
};
