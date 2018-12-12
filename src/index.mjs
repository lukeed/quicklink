/**
 * Copyright 2018 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
**/

import prefetch from './prefetch.mjs';

function toQuery(parent, priority) {
  return function () {
    Array.from(parent.querySelectorAll('a'), link => {
      if (link._seen) return;
      let rect = link.getBoundingClientRect();
      // Prefetch if link is _partially_ visible
      if (rect.top < window.innerHeight && rect.bottom >= 0) {
        link._seen = !!prefetch(link.href, priority);
      }
    });
  };
}

/**
 * Prefetch an array of URLs if the user's effective
 * connection type and data-saver preferences suggests
 * it would be useful. By default, looks at in-viewport
 * links for `document`. Can also work off a supplied
 * DOM element or static array of URLs.
 * @param {Object} options - Configuration options for quicklink
 * @param {Object} options.el - DOM element to prefetch in-viewport links of
 * @param {Boolean} options.priority - Attempt higher priority fetch (low or high)
 */
export function listen(options) {
  options = options || {};
  const toCheck = toQuery(options.el || document, options.priority);
  addEventListener('scroll', toCheck, { passive:true });
  toCheck(); // initial visible set
}

export { prefetch }
