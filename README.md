# Heyzine PDF Downloader

Extensao do Chrome que mostra um botao **Baixar PDF** em paginas da Heyzine quando encontra um catalogo carregado por `heyzine.load(...)`.

## Como instalar

1. Abra `chrome://extensions/`.
2. Ative **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactacao**.
4. Selecione esta pasta: `C:\Users\Isaac\Desktop\Heyzine Downloader`.

## Como usar

1. Abra a pagina do catalogo na Heyzine.
2. Quando a extensao detectar o PDF, ela mostra o botao **Baixar PDF** no canto inferior direito.
3. Clique no botao e escolha onde salvar o arquivo.

## Detalhe tecnico

A extensao procura URLs no formato:

```js
heyzine.load('https://cdnc.heyzine.com/files/uploaded/arquivo.pdf', flipbookcfg)
```

O detector tambem procura URLs de PDF em atributos da pagina, recursos carregados e variantes com barras escapadas.
# Heyzine-Downloader-Extension
