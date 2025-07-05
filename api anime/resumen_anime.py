import json

with open('anime_data.json', encoding='utf-8') as f:
    d = json.load(f)
    with open('resumen_anime.txt', 'w', encoding='utf-8') as out:
        out.write(f'Total: {len(d)}\n')
        out.write('Etiquetas:\n')
        for key in d[0].keys():
            out.write(f'- {key}\n')