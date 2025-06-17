from django import template

register = template.Library()

@register.filter
def room_image(tema: str) -> str:
    """Return image filename for given room theme."""
    image_mapping = {
        'alcatraz': 'alcatraz.jpg',
        'lab': 'lab.png',
        'tomb': 'tomb.jpg',
        'egyptska_hrobka': 'tomb.jpg',
        'laborator': 'lab.png',
        'vezeni_alcatraz': 'alcatraz.jpg',
    }
    return image_mapping.get(tema.lower(), 'example.png')
