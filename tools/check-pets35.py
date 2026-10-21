"""Validate generated asset metadata without altering any image pixels."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
pets = json.loads((root / 'pet-collection-35.json').read_text(encoding='utf-8'))
assert len(pets) == 19 and len({p['id'] for p in pets}) == 19
for pet in pets:
    path = root / 'assets' / 'pets' / (pet['id'] + '-v1.png')
    with Image.open(path) as image:
        assert image.mode == 'RGBA', path
        assert image.width >= 512 and image.height >= 512, path
        alpha = image.getchannel('A')
        assert alpha.getextrema() == (0, 255), path
        # Ignore barely visible generator fringe when checking the silhouette.
        left, top, right, bottom = alpha.point(lambda value: 255 if value >= 128 else 0).getbbox()
        assert left > 0 and top > 0 and right < image.width and bottom < image.height, path
print('PASS: 19 unique RGBA PNG assets, real transparency and uncropped silhouettes.')
