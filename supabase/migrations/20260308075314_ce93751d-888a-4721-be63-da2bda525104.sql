-- Update all existing communities to Yucatán
UPDATE communities SET state = 'Yucatán' WHERE state IS NULL;

-- Update all existing events to México, Yucatán
UPDATE events SET country = 'México', state = 'Yucatán' WHERE country IS NULL;