// ─── Category Router Map ─────────────────────────────────────────────────────
// Maps a category key (from activeCategory state) → its dedicated page component
// This allows App.jsx to render the correct elite page dynamically
import { RealEstatePage } from './RealEstatePage';
import { PropertiesPage } from './PropertiesPage';
import { BikeAccessoriesPage } from './BikeAccessoriesPage';
import { CarAccessoriesPage } from './CarAccessoriesPage';
import { OrganicGroceriesPage } from './OrganicGroceriesPage';
import { CategoryPage } from '../CategoryPage'; // fallback

export const CATEGORY_ROUTER = {
  'real-estate': RealEstatePage,
  'properties': PropertiesPage,
  'bike-accessories': BikeAccessoriesPage,
  'car-accessories': CarAccessoriesPage,
  'organic-groceries': OrganicGroceriesPage,
};

// Resolve the correct page component for a given category key
// Falls back to the generic CategoryPage if the key is unknown
export function resolveCategoryPage(categoryKey) {
  return CATEGORY_ROUTER[categoryKey] || CategoryPage;
}
