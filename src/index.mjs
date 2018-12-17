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

/**
 * Determine if the anchor tag should be prefetched.
 * A filter can be a RegExp, Function, or Array of both.
 *   - Function receives `node.href, node` arguments
 *   - RegExp receives `node.href` only (the full URL)
 * @param  {Element}  node    The anchor (<a>) tag.
 * @param  {Mixed}    filter  The custom filter(s)
 * @return {Boolean}          If true, then it should be ignored
 */
function isIgnored(node, filter) {
  return Array.isArray(filter)
    ? filter.some(x => isIgnored(node, x))
    : (filter.test || filter).call(filter, node.href, node);
}

function toQuery(options) {
  const origins = options.origins || [location.hostname];
  return function () {
    Array.from((options.el || document).querySelectorAll('a'), link => {
      if (link._ran) return;
      let rect = link.getBoundingClientRect();
      // Prefetch if link is _partially_ visible
      if (rect.top < window.innerHeight && rect.bottom >= 0) {
        link._ran = true;
        if (!origins.length || origins.includes(link.hostname)) {
          // If there are any filters, the link must not match any of them
          isIgnored(link, options.ignores || []) || prefetch(link.href, options.priority);
        }
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
 * @param {Array} options.origins - The allowed origins; pass `true` or `[]` for all
 * @param {Array|RegExp|Function} options.ignores - Custom filter(s) that run after origin checks
 */
export function listen(options) {
  const toCheck = toQuery(options || {});
  addEventListener('scroll', toCheck, { passive:true });
  toCheck(); // initial visible set
}

export { prefetch }
