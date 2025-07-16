import { CONTENTFUL_CONFIG } from './config.js';

const cache = new Map();

/**
 * Constructs a Contentful API URL for a given content type.
 * @param {string} contentType - The Contentful content type ID.
 * @returns {string}
 */
function buildContentfulUrl(contentType) {
  return `${CONTENTFUL_CONFIG.baseUrl}/spaces/${CONTENTFUL_CONFIG.spaceId}/environments/${CONTENTFUL_CONFIG.environment}/entries?access_token=${CONTENTFUL_CONFIG.accessToken}&content_type=${contentType}&include=2`;
}

/**
 * Generic fetcher for any content type from Contentful.
 * Returns both items and includes (assets, links, etc.)
 * Uses in-memory cache to avoid duplicate requests.
 * 
 * @param {string} contentType - Contentful content type ID.
 * @returns {Promise<{ items: any[], includes: Object }>}
 */
export async function fetchEntries(contentType) {
  if (cache.has(contentType)) return cache.get(contentType);

  const url = buildContentfulUrl(contentType);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const result = {
      items: data.items || [],
      includes: data.includes || {}
    };

    cache.set(contentType, result);
    return result;
  } catch (error) {
    console.error(`❌ Failed to fetch content type "${contentType}":`, error);
    return { items: [], includes: {} };
  }
}

/**
 * Fetches hero image assets.
 * Assumes content type ID is 'assets'.
 */
export async function fetchHeroAssets() {
  return await fetchEntries('assets');
}

/**
 * Fetches success stories.
 * Assumes content type ID is 'successStory'.
 */
export async function fetchSuccessStories() {
  return await fetchEntries('successStory');
}

/**
 * Fetches partners (e.g. logos and links).
 * Assumes content type ID is 'partner'.
 */
export async function fetchPartners() {
  return await fetchEntries('partner');
}
