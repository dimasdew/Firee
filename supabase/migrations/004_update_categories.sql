-- Migration: Replace old categories with Web3-focused categories
-- Old: Beverage, Electronics, Fashion, Food (+ any others)
-- New: Smart Contracts, DApp Templates, UI Kits, Tools & Scripts

-- Delete old categories (cascade will remove FK references)
DELETE FROM categories;

-- Insert new categories
INSERT INTO categories (name, slug) VALUES
  ('Smart Contracts', 'smart-contracts'),
  ('DApp Templates', 'dapp-templates'),
  ('UI Kits', 'ui-kits'),
  ('Tools & Scripts', 'tools-scripts');
