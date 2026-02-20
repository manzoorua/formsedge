-- Set initial yearly pricing values for subscription tiers
-- Pro yearly: $240/year ($20/month equivalent - 31% savings from $29/month)
-- Enterprise yearly: $499.92/year ($41.66/month equivalent - 17% savings from $49.99/month)

UPDATE subscription_tiers 
SET price_yearly = 0 
WHERE name = 'free';

UPDATE subscription_tiers 
SET price_yearly = 24000 
WHERE name = 'pro';

UPDATE subscription_tiers 
SET price_yearly = 49992 
WHERE name = 'enterprise';