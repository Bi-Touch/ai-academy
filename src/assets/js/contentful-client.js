// contentful-client.js
import { CONTENTFUL_CONFIG } from './config.js';

/**
 * Generic fetcher for any content type from Contentful.
 * Returns both items and includes (assets, links, etc.)
 */
export async function fetchEntries(contentType) {
  const url = `${CONTENTFUL_CONFIG.baseUrl}/spaces/${CONTENTFUL_CONFIG.spaceId}/environments/${CONTENTFUL_CONFIG.environment}/entries?access_token=${CONTENTFUL_CONFIG.accessToken}&content_type=${contentType}&include=2`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    return {
      items: data.items || [],
      includes: data.includes || {}
    };
  } catch (error) {
    console.error(`❌ Failed to fetch content type "${contentType}":`, error);
    return { items: [], includes: {} };
  }
}

/**
 * Fetches hero section data from Contentful.
 * Assumes content type 'assets' has a field 'image' (Asset) and 'heroImage' (title)
 */
export async function fetchHeroAssets() {
  const url = `${CONTENTFUL_CONFIG.baseUrl}/spaces/${CONTENTFUL_CONFIG.spaceId}/environments/${CONTENTFUL_CONFIG.environment}/entries?access_token=${CONTENTFUL_CONFIG.accessToken}&content_type=assets&include=2`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    return {
      items: data.items || [],
      assets: data.includes?.Asset || []
    };
  } catch (err) {
    console.error('❌ Error fetching hero image content:', err);
    return { items: [], assets: [] };
  }
}

/**
 * Fetches success stories specifically.
 */
export async function fetchSuccessStories() {
  const url = `${CONTENTFUL_CONFIG.baseUrl}/spaces/${CONTENTFUL_CONFIG.spaceId}/environments/${CONTENTFUL_CONFIG.environment}/entries?access_token=${CONTENTFUL_CONFIG.accessToken}&content_type=successStory&include=2`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    return {
      items: data.items || [],
      includes: data.includes || {}
    };
  } catch (err) {
    console.error('❌ Error fetching success stories:', err);
    return { items: [], includes: {} };
  }
}

/**
 * ✅ Fetches partner entries (logos + links)
 */
export async function fetchPartners() {
  const url = `${CONTENTFUL_CONFIG.baseUrl}/spaces/${CONTENTFUL_CONFIG.spaceId}/environments/${CONTENTFUL_CONFIG.environment}/entries?access_token=${CONTENTFUL_CONFIG.accessToken}&content_type=partner&include=2`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    return {
      items: data.items || [],
      includes: data.includes || {}
    };
  } catch (err) {
    console.error('❌ Error fetching partners:', err);
    return { items: [], includes: {} };
  }
}