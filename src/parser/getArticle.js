/*
 * parser -> extract metadata from given link or html
 * @ndaidong
*/

import cheerio from 'cheerio';
import sanitize from 'sanitize-html';
import read from 'es6-readability';

import debug from 'debug';
var error = debug('artparser:error');
var info = debug('artparser:info');

import {
  config
} from '../config';

var {
  htmlRules
} = config;

var extractByClass = (input) => {

  info('Extracting by class name...');

  let {
    content,
    html
  } = input;

  if (content) {
    info('Content is already. Cancel extracting by class.');
    return Promise.resolve(input);
  }

  let $ = cheerio.load(html);

  if ($) {

    let classes = [
      '.post-content noscript',
      '.post-body',
      '.post-content',
      '.article-body',
      '.article-content',
      '.entry-inner',
      '.post',
      'article'
    ];

    for (let i = 0; i < classes.length; i++) {
      let c = $(classes[i]);
      if (c) {
        content = c.html();
        if (content) {
          input.content = content;
          break;
        }
      }
    }
  }

  info('Finish extracting by class name.');
  info(`Content length: ${content.length}`);

  return Promise.resolve(input);
};

var extractWithReadability = (input) => {

  return new Promise((resolve) => {
    info('Extracting using es6-readability...');

    let {
      content,
      html
    } = input;

    read(html).then((a) => {
      info('Finish extracting using es6-readability.');
      if (a && a.content) {
        info('Content extracted with es6-readability.');
        content = a.content;
      }
      return resolve({
        content,
        html
      });
    }).catch((err) => {
      error('Failed while extracting using es6-readability.');
      error(err);
      return resolve(input);
    });
  });
};

var normalize = (input) => {

  info('Normalizing article content...');

  let {
    content
  } = input;

  if (content) {
    let s = sanitize(content, htmlRules);
    let $ = cheerio.load(s, {
      normalizeWhitespace: true,
      decodeEntities: true
    });

    $('a').attr('target', '_blank');
    input.content = $.html();
  }

  return Promise.resolve(input.content);
};

export var getArticle = (html) => {
  return new Promise((resolve, reject) => {
    info('Start extracting article from HTML');
    extractWithReadability({
      html,
      content: ''
    })
    .then(extractByClass)
    .then(normalize)
    .then((pureContent) => {
      info('Finish extracting article from HTML');
      return resolve(pureContent);
    })
    .catch((err) => {
      error('Something wrong when extracting article from HTML');
      error(err);
      return reject(err);
    });
  });
};

